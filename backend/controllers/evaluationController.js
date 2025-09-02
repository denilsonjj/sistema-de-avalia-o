const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Objeto com os pesos de cada item da avaliação
const evaluationWeights = {
  quick_score: 1,
  standard_score: 0.5,
  qtdGeralManutencao_score: 0.5,
  quebraMaior30minTurno_score: 1.5,
  mttrTurno_score: 1,
  qualidadeExecucaoEWO_score: 0.5,
  tempoAberturaEWO_score: 0.5,
  opeGeral_score: 0.5,
  nonOpeBreak_score: 0.5,
  absenteismo_score: 2,
  saturacaoTrabalho_score: 1.5,
  sugestoesSeguranca_score: 1,
  cartoesRecebidos_score: 1,
  zeroAcidenteTurno_score: 1.5,
  condicoesAbertasArea_score: 0.5,
  atendimentoUTE_score: 1,
  avaliacaoTecnica_score: 1.5,
  backlogManutencao_score: 1,
  avaliacaoComportamental_score: 2,
  qualidadeLancamentosSAP_score: 0.5,
};

// Função para calcular a nota final ponderada
const calculateFinalScore = (data) => {
  let totalScore = 0;
  let totalWeight = 0;

  for (const key in data) {
    if (evaluationWeights[key] && data[key] !== null && data[key] !== undefined) {
      totalScore += data[key] * evaluationWeights[key];
      totalWeight += evaluationWeights[key];
    }
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
};

exports.createEvaluation = async (req, res) => {
  const { userId } = req.params;
  const data = req.body;

  try {
    const finalScore = calculateFinalScore(data);
    const evaluationData = {
      userId: userId,
      ...data,
      finalScore: finalScore,
    };

    const evaluation = await prisma.evaluation.create({
      data: evaluationData,
    });
    res.status(201).json(evaluation);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar avaliação.', error: error.message });
  }
};

exports.updateEvaluation = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const finalScore = calculateFinalScore(data);
    const evaluationData = {
      ...data,
      finalScore: finalScore,
    };

    const updatedEvaluation = await prisma.evaluation.update({
      where: { id: id },
      data: evaluationData,
    });
    res.status(200).json(updatedEvaluation);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar avaliação.', error: error.message });
  }      
};

exports.getEvaluationsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const evaluations = await prisma.evaluation.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar avaliações.' });
  }
};

// Obter estatísticas do sistema
exports.getSystemStats = async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const evaluationCount = await prisma.evaluation.count();
    
    // O cálculo de OEE foi removido daqui pois não se aplica mais da mesma forma.
    // Pode ser recalculado de outra forma se necessário.

    res.status(200).json({
      userCount,
      evaluationCount,
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao calcular estatísticas.', error: error.message });
  }
};

// BUSCAR UMA AVALIAÇÃO ESPECÍFICA POR ID
exports.getEvaluationById = async (req, res) => {
  const { id } = req.params;
  try {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: id },
    });
    if (!evaluation) {
      return res.status(404).json({ message: 'Avaliação não encontrada.' });
    }
    res.status(200).json(evaluation);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar avaliação.', error: error.message });
  }
};

// EXCLUIR UMA AVALIAÇÃO
exports.deleteEvaluation = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.evaluation.delete({
      where: { id: id },
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Avaliação não encontrada.' });
    }
    res.status(500).json({ message: 'Erro ao excluir avaliação.', error: error.message });
  }
};