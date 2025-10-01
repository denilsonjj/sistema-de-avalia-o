// backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o script de seeding a partir do arquivo JSON...');
  const dataPath = path.join(__dirname, 'seed-data.json');
  
  if (!fs.existsSync(dataPath)) {
    console.log('Arquivo seed-data.json não encontrado. Seeding básico de linhas de produção...');
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
    console.log('Seeding básico concluído.');
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
  await prisma.evaluation.deleteMany({});
  await prisma.selfAssessment.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.dailyOeeResult.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.productionLine.deleteMany({});

  console.log('Inserindo novos dados...');
  if (productionLines.length > 0) await prisma.productionLine.createMany({ data: productionLines });
  
  for (const user of users) {
      const { productionLines, ...userData } = user;
      await prisma.user.create({ data: userData });
  }
  
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

  // Funções específicas para converter datas de cada modelo
  const mapEvaluations = (records) => records.map(rec => ({ ...rec, createdAt: new Date(rec.createdAt), updatedAt: new Date(rec.updatedAt) }));
  const mapSelfAssessments = (records) => records.map(rec => ({ ...rec, createdAt: new Date(rec.createdAt), updatedAt: new Date(rec.updatedAt) }));
  const mapFeedbacks = (records) => records.map(rec => ({ ...rec, createdAt: new Date(rec.createdAt) }));
  const mapGoals = (records) => records.map(rec => ({ ...rec, createdAt: new Date(rec.createdAt), dueDate: rec.dueDate ? new Date(rec.dueDate) : null }));
  const mapOeeResults = (records) => records.map(rec => ({ ...rec, date: new Date(rec.date) }));
  
  // Usando as funções corretas para cada createMany
  if (evaluations.length > 0) await prisma.evaluation.createMany({ data: mapEvaluations(evaluations) });
  if (selfAssessments.length > 0) await prisma.selfAssessment.createMany({ data: mapSelfAssessments(selfAssessments) });
  if (feedbacks.length > 0) await prisma.feedback.createMany({ data: mapFeedbacks(feedbacks) });
  if (goals.length > 0) await prisma.goal.createMany({ data: mapGoals(goals) });
  if (dailyOeeResults.length > 0) await prisma.dailyOeeResult.createMany({ data: mapOeeResults(dailyOeeResults) });

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