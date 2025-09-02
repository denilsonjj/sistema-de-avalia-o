const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createGoal = async (req, res) => {
  const authorId = req.user?.userId; // ID do token
  if (!authorId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    const { title, description, dueDate, userId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Título é obrigatório.' });
    }

    // se enviar userId (PMM), usa ele, senão usa o usuário do token
    const userToConnect = userId || authorId;

    const goal = await prisma.goal.create({
      data: {
        title: title.trim(),
        description: description || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        // conecta relações obrigatórias no Prisma
        author: { connect: { id: authorId } },
        user: { connect: { id: userToConnect } },
      },
      include: {
        author: { select: { name: true } },
        user: { select: { name: true } },
      },
    });

    return res.status(201).json(goal);
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    return res.status(500).json({ message: 'Erro ao criar meta.', error: error.message || String(error) });
  }
};
// Buscar metas de um usuário
exports.getGoalsForUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const goals = await prisma.goal.findMany({
      // filtra pela relação 'user' para garantir compatibilidade com o schema
      where: { user: { id: userId } },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true } },
        user: { select: { name: true } },
      },
    });
    res.status(200).json(goals);
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
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
    console.error('Erro ao atualizar status da meta:', error);
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
    console.error('Erro ao deletar meta:', error);
    res.status(500).json({ message: 'Erro ao deletar meta.' });
  }
};

// Obter todas as metas (apenas para PMM)
exports.getAllGoals = async (req, res) => {
  if (req.user?.role !== 'PMM') {
    return res.status(403).json({ message: 'Acesso negado.' });
  }
  try {
    const goals = await prisma.goal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true } },
        user: { select: { name: true } },
      },
    });
    res.status(200).json(goals);
  } catch (error) {
    console.error('Erro ao buscar todas as metas:', error);
    res.status(500).json({ message: 'Erro ao buscar todas as metas.' });
  }
};