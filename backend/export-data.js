
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando exportação de dados do SQLite...');

  // Ler dados de todas as tabelas importantes
  const users = await prisma.user.findMany();
  const evaluations = await prisma.evaluation.findMany();
  const selfAssessments = await prisma.selfAssessment.findMany();
  const feedbacks = await prisma.feedback.findMany();
  const goals = await prisma.goal.findMany();
  const productionLines = await prisma.productionLine.findMany();
  const dailyOeeResults = await prisma.dailyOeeResult.findMany();

  // Precisamos exportar a relação de linhas de produção dos usuários
  const userProductionLines = await prisma.user.findMany({
    select: {
      id: true,
      productionLines: {
        select: {
          id: true,
        },
      },
    },
  });

  const data = {
    users,
    evaluations,
    selfAssessments,
    feedbacks,
    goals,
    productionLines,
    dailyOeeResults,
    userProductionLines, // Adicionamos a relação aqui
  };

  const outputPath = path.join(__dirname, 'prisma', 'seed-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

  console.log(`Dados exportados com sucesso para ${outputPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });