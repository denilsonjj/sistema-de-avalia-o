// Agora este arquivo é o nosso "mapa" completo da avaliação.
// A propriedade 'inputType' define se o formulário mostrará um campo de valor ou de nota direta.

export const evaluationFieldsConfig = [
  // PROJETOS
  { category: "PROJETOS", valueKey: "quick_value", scoreKey: "quick_score", label: "Quick Kaizen (12 meses)", unit: "qtd", inputType: 'value' },
  { category: "PROJETOS", valueKey: "standard_value", scoreKey: "standard_score", label: "Standard Kaizen (12 meses)", unit: "qtd", inputType: 'value' },
  
  // NOTAS
  { category: "NOTAS", valueKey: "qtdGeralManutencao_value", scoreKey: "qtdGeralManutencao_score", label: "Notas de Manutenção Abertas", unit: "qtd", inputType: 'value' },
  
  // QUEBRA DE MÁQUINA
  { category: "QUEBRA DE MÁQUINA", valueKey: "quebraMaior30minTurno_value", scoreKey: "quebraMaior30minTurno_score", label: "Quebras > 30min (Turno)", unit: "qtd", inputType: 'value' },
  { category: "QUEBRA DE MÁQUINA", valueKey: "mttrTurno_value", scoreKey: "mttrTurno_score", label: "MTTR (Turno)", unit: "min", inputType: 'value' },

  // ANÁLISE DE QUEBRA
  { category: "ANÁLISE DE QUEBRA", valueKey: "qualidadeExecucaoEWO_value", scoreKey: "qualidadeExecucaoEWO_score", label: "Qualidade Execução EWO", unit: "%", inputType: 'value' },
  { category: "ANÁLISE DE QUEBRA", valueKey: "tempoAberturaEWO_value", scoreKey: "tempoAberturaEWO_score", label: "EWO abertas após 24hrs", unit: "qtd", inputType: 'value' },

  // EFICIÊNCIA MONTAGEM
  { category: "EFICIÊNCIA MONTAGEM", valueKey: "opeGeral_value", scoreKey: "opeGeral_score", label: "OPE Geral Montagem", unit: "%", inputType: 'value' },
  { category: "EFICIÊNCIA MONTAGEM", valueKey: "nonOpeBreak_value", scoreKey: "nonOpeBreak_score", label: "NON OPE BREAK (Turno)", unit: "%", inputType: 'value' },

  // ASSIDUIDADE
  { category: "ASSIDUIDADE", valueKey: "absenteismo_value", scoreKey: "absenteismo_score", label: "Absenteísmo (dias/ano)", unit: "dias", inputType: 'value' },
  { category: "ASSIDUIDADE", valueKey: "saturacaoTrabalho_value", scoreKey: "saturacaoTrabalho_score", label: "Saturação de Trabalho (SAP)", unit: "%", inputType: 'value' },

  // SEGURANÇA
  { category: "SEGURANÇA", valueKey: "sugestoesSeguranca_value", scoreKey: "sugestoesSeguranca_score", label: "Sugestões de Segurança", unit: "qtd", inputType: 'value' },
  { category: "SEGURANÇA", valueKey: "cartoesRecebidos_value", scoreKey: "cartoesRecebidos_score", label: "Cartões de Segurança Recebidos", unit: "qtd", inputType: 'value' },
  { category: "SEGURANÇA", valueKey: "zeroAcidenteTurno_value", scoreKey: "zeroAcidenteTurno_score", label: "Acidentes no Turno", unit: "qtd", inputType: 'value' },
  { category: "SEGURANÇA", valueKey: "condicoesAbertasArea_value", scoreKey: "condicoesAbertasArea_score", label: "Condições de Seg. Abertas", unit: "qtd", inputType: 'value' },

  // ENTREGA
  { category: "ENTREGA", valueKey: "atendimentoUTE_value", scoreKey: "atendimentoUTE_score", label: "Atendimento UTE", unit: "qtd", inputType: 'value' },
  { category: "ENTREGA", valueKey: "backlogManutencao_value", scoreKey: "backlogManutencao_score", label: "Backlog de Manutenção", unit: "horas", inputType: 'value' },
  { category: "ENTREGA", valueKey: "qualidadeLancamentosSAP_value", scoreKey: "qualidadeLancamentosSAP_score", label: "Qualidade Lançamentos SAP", unit: "%", inputType: 'value' },

  // AVALIAÇÕES SUBJETIVAS
  { category: "AVALIAÇÃO DA LIDERANÇA", valueKey: "avaliacaoTecnica_score", scoreKey: "avaliacaoTecnica_score", label: "Avaliação Técnica", unit: "nota", inputType: 'direct_score' },
  { category: "AVALIAÇÃO DA LIDERANÇA", valueKey: "avaliacaoComportamental_score", scoreKey: "avaliacaoComportamental_score", label: "Avaliação Comportamental", unit: "nota", inputType: 'direct_score' },
];