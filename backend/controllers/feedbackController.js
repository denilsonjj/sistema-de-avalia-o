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
    res.status(500).json({ message: 'Erro ao criar feedback.' });
  }
};

// Buscar feedbacks para um usuário
exports.getFeedbacksForUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { 
          select: { name: true },
        },
      },
    });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar feedbacks.' });
  }
};