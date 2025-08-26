const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { calculatePerformance} = require('./productionDbService');

const prisma = new PrismaClient();
const shiftMap = { 1: 2, 2: 3, 3: 1 };

const updateOeeData = async () => {
    console.log('--- Iniciando tarefa agendada: Atualização de dados de OPE ---');
    
    const allLines = await prisma.productionLine.findMany();
    if (allLines.length === 0) {
        console.log('Nenhuma linha de produção encontrada para processar.');
        return;
    }

    const newOpeResults = [];
    let hasFailed = false;

    await prisma.stagingOeeResult.deleteMany({});
    console.log('Tabela de staging limpa.');


    for (const line of allLines) {
        for (const shift of [1, 2, 3]) {
            const lineDesc = line.name;
            const shiftId = shiftMap[shift];
            try {
                const performanceResult = await calculatePerformance(lineDesc, shiftId);
                const performance = performanceResult.performance || 0;

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                newOpeResults.push({
                    date: today,
                    lineDesc,
                    shift,
                    performance,
                    oee: performance
                });
            } catch (error) {
                console.error(`!!! FALHA CRÍTICA ao processar dados para ${lineDesc} - Turno ${shift}:`, error.message);
                hasFailed = true; 
                break;
            }
        }
        if (hasFailed) break; 
    }

    if (!hasFailed && newOpeResults.length > 0) {
        try {
            console.log(`Todos os ${newOpeResults.length} registros foram calculados. Iniciando transação...`);
            
            
            await prisma.stagingOeeResult.createMany({
                data: newOpeResults
            });

            await prisma.$transaction(async (tx) => {
                await tx.dailyOeeResult.deleteMany({}); 
                const stagingData = await tx.stagingOeeResult.findMany(); 
                await tx.dailyOeeResult.createMany({ data: stagingData }); 
            });

            console.log('*** SUCESSO: Tabela DailyOeeResult foi atualizada atomicamente. ***');
        } catch (transactionError) {
            console.error('!!! ERRO na transação do banco de dados:', transactionError);
        }
    } else if (hasFailed) {
        console.log('--- Tarefa agendada abortada devido a erros. A tabela principal não foi alterada. ---');
    } else {
        console.log('Nenhum novo dado de OEE para atualizar.');
    }

    console.log('--- Tarefa agendada finalizada ---');
};

/*
const startScheduler = () => {
   cron.schedule('*30 * * * * *', updateOeeData, {
       scheduled: true
  });
};*/


const startScheduler = () => {
    cron.schedule('35 9 * * *', updateOeeData, {
        scheduled: true,
        timezone: "America/Sao_Paulo"
    });
    console.log('Agendador de tarefas iniciado. A tarefa rodará todos os dias às 09:35.');
};
module.exports = { startScheduler };