const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createFeedback = async (req, res) => {
  const { recipientId, content } = req.body;
  const authorId = req.user.userId; 

  try {
    const feedback = await prisma.feedback.create({
      data: {
        recipientId,
        authorId,
        content,
      },
    });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar feedback.', error: error.message });
  }
};

exports.getFeedbacksForUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true, 
            name: true,
          },
        },
      },
    });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar feedbacks.', error: error.message });
  }
};

exports.deleteFeedback = async (req, res) => {
  const { id } = req.params; 
  const loggedInUserId = req.user.userId; 

  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id: id },
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback não encontrado.' });
    }
    if (feedback.authorId !== loggedInUserId) {
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para deletar este feedback.' });
    }
    await prisma.feedback.delete({
      where: { id: id },
    });
    res.status(204).send();

  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar feedback.', error: error.message });
  }
};