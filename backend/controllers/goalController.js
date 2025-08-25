const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Criar nova meta
exports.createGoal = async (req, res) => {
  const { userId, title, description, dueDate } = req.body;
  const authorId = req.user.userId; 

  try {
    const goal = await prisma.goal.create({
      data: { userId, authorId, title, description, dueDate },
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar meta.' });
  }
};

// Buscar metas de um usuário
exports.getGoalsForUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar metas.' });
  }
};

exports.updateGoalStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 
    try {
        const updatedGoal = await prisma.goal.update({
            where: { id },
            data: { status },
        });
        res.status(200).json(updatedGoal);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar status da meta.' });
    }
};

// deletar meta
exports.deleteGoal = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.goal.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar meta.' });
    }
}