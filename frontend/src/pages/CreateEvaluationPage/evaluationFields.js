export const evaluationCategories = {
    "PROJETOS": [
      { name: "quick_score", label: "Quick Kaizen (12 meses)" },
      { name: "standard_score", label: "Standard Kaizen (12 meses)" },
    ],
    "NOTAS": [
      { name: "qtdGeralManutencao_score", label: "Qtd Geral Manutenção" },
    ],
    "QUEBRA DE MÁQUINA": [
      { name: "quebraMaior30minTurno_score", label: "Quebra > 30min (Turno, 12 meses)" },
      { name: "mttrTurno_score", label: "MTTR (Turno, 12 meses)" },
    ],
    "ANÁLISE DE QUEBRA": [
      { name: "qualidadeExecucaoEWO_score", label: "Qualidade Execução EWO (%)" },
      { name: "tempoAberturaEWO_score", label: "EWO abertas após 24hrs" },
    ],
    "EFICIÊNCIA MONTAGEM": [
      { name: "opeGeral_score", label: "OPE Geral Montagem (%)" },
      { name: "nonOpeBreak_score", label: "NON OPE BREAK (Turno, %)" },
    ],
    "ASSIDUIDADE": [
      { name: "absenteismo_score", label: "Absenteísmo (dias/ano)" },
      { name: "saturacaoTrabalho_score", label: "Saturação de Trabalho (SAP, %)" },
    ],
    "SEGURANÇA": [
      { name: "sugestoesSeguranca_score", label: "Sugestões de Segurança (12 meses)" },
      { name: "cartoesRecebidos_score", label: "Cartões de Segurança Recebidos" },
      { name: "zeroAcidenteTurno_score", label: "Zero Acidente no Turno" },
      { name: "condicoesAbertasArea_score", label: "Condições de Segurança Abertas" },
    ],
    "ENTREGA": [
      { name: "atendimentoUTE_score", label: "Atendimento UTE" },
      { name: "avaliacaoTecnica_score", label: "Avaliação Técnica (Liderança)" },
      { name: "backlogManutencao_score", label: "Backlog de Manutenção (horas)" },
      { name: "avaliacaoComportamental_score", label: "Avaliação Comportamental (Liderança)" },
      { name: "qualidadeLancamentosSAP_score", label: "Qualidade Lançamentos SAP (%)" },
    ]
  };