import React from 'react';
import { Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { evaluationCategories } from '../../pages/CreateEvaluationPage/evaluationFields';

// 1. Helper para encontrar o label de um campo a partir do seu nome técnico
const getFieldLabel = (fieldName) => {
  for (const category of Object.values(evaluationCategories)) {
    const field = category.find(f => f.name === fieldName);
    if (field) {
      // Removemos a parte "(%)" ou "(12 meses)" para deixar o gráfico mais limpo
      return field.label.split('(')[0].trim();
    }
  }
  return fieldName;
};

// 2. Definimos aqui quais campos queremos mostrar no radar.
// Mudar esta lista é a única coisa que você precisa fazer para alterar o gráfico.
const RADAR_CHART_FIELDS = [
  'avaliacaoTecnica_score',
  'avaliacaoComportamental_score',
  'qualidadeExecucaoEWO_score',
  'sugestoesSeguranca_score',
  'quick_score',
  'saturacaoTrabalho_score',
];

function CompetencyRadarChart({ evaluationData }) {
  // 3. O 'chartData' agora é gerado dinamicamente a partir da lista acima
  const chartData = RADAR_CHART_FIELDS.map(fieldName => ({
    subject: getFieldLabel(fieldName),
    score: evaluationData[fieldName] || 0, // Usamos 0 se a nota não existir, para evitar erros
    fullMark: 5,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: 'var(--color-text)', fontSize: 12 }} 
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 5]} 
          tick={false} 
          axisLine={false} 
        />
        <Radar 
          name="Pontuação" 
          dataKey="score" 
          stroke="var(--color-primary)" 
          fill="var(--color-primary)" 
          fillOpacity={0.6} 
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            borderRadius: '8px',
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default CompetencyRadarChart;