// backend/controllers/goalController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Criar nova meta
exports.createGoal = async (req, res) => {
  const { userId, title, description, dueDate } = req.body;
  const authorId = req.user.userId; // ID de quem está criando a meta (vem do token)

  try {
    const goal = await prisma.goal.create({
      data: {
        userId: userId, // Para quem a meta é destinada
        authorId: authorId, // Quem criou a meta
        title: title,
        description: description,
        dueDate: dueDate,
      },
    });
    res.status(201).json(goal);
  } catch (error) {
    // Log de erro melhorado para o terminal do backend
    console.error("Erro detalhado ao criar meta:", error);
    res.status(500).json({ message: 'Erro ao criar meta.', error: error.message });
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

// Atualizar status da meta
exports.updateGoalStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updatedGoal = await prisma.goal.update({
            where: { id: id },
            data: { status: status },
        });
        res.status(200).json(updatedGoal);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar status da meta.' });
    }
};

// Deletar meta
exports.deleteGoal = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.goal.delete({ where: { id: id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar meta.' });
    }
}

// Obter todas as metas (apenas para PMM)
exports.getAllGoals = async (req, res) => {
  if (req.user.role !== 'PMM') {
    return res.status(403).json({ message: 'Acesso negado.' });
  }
  try {
    const goals = await prisma.goal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true } },
        user: { select: { name: true } }
      },
    });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar todas as metas.' });
  }
};