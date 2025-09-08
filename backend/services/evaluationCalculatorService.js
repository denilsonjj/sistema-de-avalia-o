function getScoreFromRanges(value, ranges) {
    if (value === null || value === undefined) return null;
    if (value >= ranges[4]) return 5;
    if (value >= ranges[3]) return 4;
    if (value >= ranges[2]) return 3;
    if (value >= ranges[1]) return 2;
    return 1;
  }
  
  // Função auxiliar para calcular pontuação baseada em faixas (onde menor valor é melhor)
  function getScoreFromRangesInverted(value, ranges) {
    if (value === null || value === undefined) return null;
    if (value <= ranges[4]) return 5;
    if (value <= ranges[3]) return 4;
    if (value <= ranges[2]) return 3;
    if (value <= ranges[1]) return 2;
    return 1;
  }
  
  // Lógica de cálculo para cada item da avaliação
  const calculators = {
    quick_score: (value) => getScoreFromRanges(value, [0, 2, 4, 8, 10]), // Ex: 10+ = 5 pontos
    standard_score: (value) => getScoreFromRanges(value, [0, 0, 1, 2, 3]), // Ex: 3+ = 5 pontos
  
    qtdGeralManutencao_score: (value) => getScoreFromRangesInverted(value, [Infinity, 7, 5, 2, 0]), // Ex: 0 = 5 pontos
  
    quebraMaior30minTurno_score: (value) => getScoreFromRangesInverted(value, [Infinity, 33, 27, 20, 10]), // Ex: 0-10 = 5 pontos
    mttrTurno_score: (value) => getScoreFromRangesInverted(value, [Infinity, 30, 26, 18, 10]), // Ex: <10 = 5 pontos
  
    qualidadeExecucaoEWO_score: (value) => getScoreFromRanges(value, [0, 30, 50, 70, 90]), // Ex: 90%+ = 5 pontos
    tempoAberturaEWO_score: (value) => getScoreFromRangesInverted(value, [Infinity, 20, 14, 8, 3]), // Ex: 1-3 = 5 pontos
  
    opeGeral_score: (value) => getScoreFromRanges(value, [0, 88, 90, 93, 95]), // Ex: >95% = 5 pontos
    nonOpeBreak_score: (value) => getScoreFromRangesInverted(value, [Infinity, 2.5, 2, 1.5, 0.5]), // Ex: <0.5% = 5 pontos
  
    absenteismo_score: (value) => getScoreFromRangesInverted(value, [Infinity, 11, 7, 5, 1]), // Ex: 1 ou 0 = 5 pontos
    saturacaoTrabalho_score: (value) => getScoreFromRanges(value, [0, 70, 78, 83, 90]), // Ex: >90% = 5 pontos
  
    sugestoesSeguranca_score: (value) => getScoreFromRanges(value, [1, 6, 9, 14, 20]), // Ex: 20+ = 5 pontos
    cartoesRecebidos_score: (value) => getScoreFromRangesInverted(value, [Infinity, 4, 3, 2, 0]), // Ex: 0 = 5 pontos
    zeroAcidenteTurno_score: (value) => getScoreFromRangesInverted(value, [Infinity, 4, 3, 2, 0]), // Ex: 0 = 5 pontos
    condicoesAbertasArea_score: (value) => getScoreFromRangesInverted(value, [Infinity, 8, 6, 4, 1]), // Ex: 1 = 5 pontos
  
    atendimentoUTE_score: (value) => getScoreFromRanges(value, [0, 1, 2, 3, 4]), // Ex: 4+ = 5 pontos
    backlogManutencao_score: (value) => getScoreFromRangesInverted(value, [Infinity, 1000, 700, 400, 200]), // Ex: <200 = 5 pontos
    qualidadeLancamentosSAP_score: (value) => getScoreFromRanges(value, [0, 40, 50, 70, 90]), // Ex: 90%+ = 5 pontos
  
    // Para itens subjetivos, a pontuação é o próprio valor inserido
    avaliacaoTecnica_score: (value) => value,
    avaliacaoComportamental_score: (value) => value,
  };
  
 
  const evaluationWeights = {
      quick_score: 1, standard_score: 0.5, qtdGeralManutencao_score: 0.5,
      quebraMaior30minTurno_score: 1.5, mttrTurno_score: 1, qualidadeExecucaoEWO_score: 0.5,
      tempoAberturaEWO_score: 0.5, opeGeral_score: 0.5, nonOpeBreak_score: 0.5,
      absenteismo_score: 2, saturacaoTrabalho_score: 1.5, sugestoesSeguranca_score: 1,
      cartoesRecebidos_score: 1, zeroAcidenteTurno_score: 1.5, condicoesAbertasArea_score: 0.5,
      atendimentoUTE_score: 1, avaliacaoTecnica_score: 1.5, backlogManutencao_score: 1,
      avaliacaoComportamental_score: 2, qualidadeLancamentosSAP_score: 0.5,
  };
  

  exports.calculateEvaluationScores = (rawData) => {
    const calculatedScores = {};
  
    // Calcula a pontuação (1-5) para cada item
    for (const key in rawData) {
      if (key.endsWith('_value')) {
        const scoreKey = key.replace('_value', '_score');
        if (calculators[scoreKey]) {
          calculatedScores[scoreKey] = calculators[scoreKey](rawData[key]);
        }
      }
    }
  
    // Calcula a nota final ponderada
    let totalScore = 0;
    let totalWeight = 0;
  
    for (const key in calculatedScores) {
      if (evaluationWeights[key] && calculatedScores[key] !== null && calculatedScores[key] !== undefined) {
        totalScore += calculatedScores[key] * evaluationWeights[key];
        totalWeight += evaluationWeights[key];
      }
    }
  
    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  
    return {
      ...calculatedScores,
      finalScore,
    };
  };