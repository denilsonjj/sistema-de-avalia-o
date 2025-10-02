// backend/controllers/oeeController.js - CÓDIGO CORRIGIDO

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ExcelJS = require('exceljs');

exports.getOeeForUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const userWithLines = await prisma.user.findUnique({
            where: { id: userId },
            include: { productionLines: true },
        });

        if (!userWithLines || userWithLines.productionLines.length === 0) {
            return res.status(200).json([]);
        }

        const lineNames = userWithLines.productionLines.map(line => line.name);

        // Lógica aprimorada: busca pela data mais recente disponível
        const latestDateEntry = await prisma.dailyOeeResult.findFirst({
            orderBy: { date: 'desc' }
        });

        if (!latestDateEntry) {
            return res.status(200).json([]);
        }

        const oeeResults = await prisma.dailyOeeResult.findMany({
            where: {
                lineDesc: { in: lineNames },
                date: { equals: latestDateEntry.date } // Usa a data mais recente encontrada
            }
        });

        res.status(200).json(oeeResults);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dados de OEE para o usuário.' });
    }
};

// Busca um resumo do OEE de todas as linhas para o dia mais recente
exports.getOeeOverviewForAllLines = async (req, res) => {
    try {
        let results = [];

        // 1. Tenta buscar os dados do dia de hoje
        const today = new Date();
        const startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);

        results = await prisma.dailyOeeResult.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: today,
                }
            },
        });

        // 2. Se não encontrou nada para hoje, busca pela data mais recente disponível no banco
        if (results.length === 0) {
            console.log("Nenhum dado de OEE para hoje. Buscando a data mais recente disponível...");
            const latestEntry = await prisma.dailyOeeResult.findFirst({
                orderBy: { date: 'desc' }
            });

            if (latestEntry) {
                const latestDate = new Date(latestEntry.date);
                const startOfLatestDate = new Date(latestDate);
                startOfLatestDate.setHours(0, 0, 0, 0);
                const endOfLatestDate = new Date(latestDate);
                endOfLatestDate.setHours(23, 59, 59, 999);

                results = await prisma.dailyOeeResult.findMany({
                    where: {
                        date: {
                            gte: startOfLatestDate,
                            lte: endOfLatestDate,
                        }
                    },
                });
            }
        }

        // O resto da lógica para processar os 'results' continua a mesma
        const overviewByLine = results.reduce((acc, curr) => {
            if (!acc[curr.lineDesc]) {
                acc[curr.lineDesc] = { count: 0, availability: 0, performance: 0, quality: 0 };
            }
            acc[curr.lineDesc].count++;
            acc[curr.lineDesc].availability += curr.availability || 0;
            acc[curr.lineDesc].performance += curr.performance || 0;
            acc[curr.lineDesc].quality += curr.quality || 0;
            return acc;
        }, {});

        const formattedResults = Object.keys(overviewByLine).map(lineName => {
            const data = overviewByLine[lineName];
            const avgAvailability = data.availability / data.count;
            const avgPerformance = data.performance / data.count;
            const avgQuality = data.quality / data.count;
            const oee = (avgAvailability / 100) * (avgPerformance / 100) * (avgQuality / 100);

            return {
                name: lineName,
                Disponibilidade: parseFloat(avgAvailability.toFixed(2)),
                Performance: parseFloat(avgPerformance.toFixed(2)),
                Qualidade: parseFloat(avgQuality.toFixed(2)),
                oee: parseFloat((oee * 100).toFixed(2)),
            };
        }).sort((a, b) => a.name.localeCompare(b.name));

        res.status(200).json(formattedResults);

    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar overview de OEE.', error: error.message });
    }
};

// A função de exportação permanece a mesma
exports.exportOeeOverview = async (req, res) => {
  try {
    const latestDateEntry = await prisma.dailyOeeResult.findFirst({
        orderBy: { date: 'desc' }
    });

    if (!latestDateEntry) {
        return res.status(404).json({ message: "Nenhum dado de OEE encontrado para exportar." });
    }

    const results = await prisma.dailyOeeResult.findMany({
        where: { date: { equals: latestDateEntry.date } },
        orderBy: [{ lineDesc: 'asc' }, { shift: 'asc' }]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('OEE_Planta_Detalhado');

    worksheet.columns = [
      { header: 'Data', key: 'date', width: 20 },
      { header: 'Linha de Produção', key: 'name', width: 30 },
      { header: 'Turno', key: 'shift', width: 10 },
      { header: 'OEE (%)', key: 'oee', width: 15 },
      { header: 'Disponibilidade (%)', key: 'availability', width: 20 },
      { header: 'Performance (%)', key: 'performance', width: 20 },
      { header: 'Qualidade (%)', key: 'quality', width: 15 },
    ];

    results.forEach(line => {
      worksheet.addRow({
          date: new Date(line.date).toLocaleDateString('pt-BR'),
          name: line.lineDesc,
          shift: line.shift,
          oee: line.oee,
          availability: line.availability,
          performance: line.performance,
          quality: line.quality
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Relatorio_OEE_Planta_Detalhado.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res.status(500).json({ message: 'Erro ao exportar relatório de OEE.', error: error.message });
  }
};