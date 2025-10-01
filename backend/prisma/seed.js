// backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o script de seeding a partir do arquivo JSON...');
  const dataPath = path.join(__dirname, 'seed-data.json');

  if (!fs.existsSync(dataPath)) {
    console.log('Arquivo seed-data.json não encontrado. Pulando o seeding de dados.');
    // Popula apenas as linhas de produção se o arquivo de dados não existir
    const lines = [
      'CHASSIS 4', 'CHASSIS1', 'CHASSIS2', 'CHASSIS3', 'CHASSIS5',
      'DECKING DOWN', 'DECKING UP', 'FINAL1', 'FINAL2', 'FINAL3',
      'GLAZING', 'TRIM 0', 'TRIM 1', 'TRIM 2','GOMA','GOMP'
    ];
    for (const lineName of lines) {
      await prisma.productionLine.upsert({
        where: { name: lineName },
        update: {},
        create: { name: lineName },
      });
    }
    console.log('Seeding básico de linhas de produção concluído.');
    return;
  }

  const {
    users,
    evaluations,
    selfAssessments,
    feedbacks,
    goals,
    productionLines,
    dailyOeeResults,
    userProductionLines
  } = JSON.parse(fs.readFileSync(dataPath));

  console.log('Limpando tabelas existentes...');
  // A ordem da limpeza é importante para evitar erros de chave estrangeira
  await prisma.evaluation.deleteMany({});
  await prisma.selfAssessment.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.dailyOeeResult.deleteMany({});
  // Desconectar usuários das linhas de produção antes de apagar
  await prisma.user.updateMany({ data: { productionLines: { set: [] } } });
  await prisma.user.deleteMany({});
  await prisma.productionLine.deleteMany({});

  console.log('Inserindo novos dados...');
  for (const line of productionLines) await prisma.productionLine.create({ data: line });
  for (const user of users) {
      // Cria o usuário sem a relação
      const { productionLines, ...userData } = user;
      await prisma.user.create({ data: userData });
  }

  // Agora, conecta os usuários às suas linhas
  for (const userLineInfo of userProductionLines) {
      if (userLineInfo.productionLines.length > 0) {
          await prisma.user.update({
              where: { id: userLineInfo.id },
              data: {
                  productionLines: {
                      connect: userLineInfo.productionLines.map(line => ({ id: line.id }))
                  }
              }
          });
      }
  }

  // Converte strings de data para objetos Date
  const parseDates = (records) => records.map(rec => ({
      ...rec,
      createdAt: new Date(rec.createdAt),
      updatedAt: new Date(rec.updatedAt),
      dueDate: rec.dueDate ? new Date(rec.dueDate) : null,
      date: rec.date ? new Date(rec.date) : null
  }));

  if (evaluations.length > 0) await prisma.evaluation.createMany({ data: parseDates(evaluations) });
  if (selfAssessments.length > 0) await prisma.selfAssessment.createMany({ data: parseDates(selfAssessments) });
  if (feedbacks.length > 0) await prisma.feedback.createMany({ data: parseDates(feedbacks) });
  if (goals.length > 0) await prisma.goal.createMany({ data: parseDates(goals) });
  if (dailyOeeResults.length > 0) await prisma.dailyOeeResult.createMany({ data: parseDates(dailyOeeResults) });

  console.log('Seeding a partir do JSON concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });