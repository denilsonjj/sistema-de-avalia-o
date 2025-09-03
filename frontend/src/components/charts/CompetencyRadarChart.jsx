import React from 'react';
import { Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { evaluationCategories } from '../../pages/CreateEvaluationPage/evaluationFields';

const getFieldLabel = (fieldName) => {
  for (const category of Object.values(evaluationCategories)) {
    const field = category.find(f => f.name === fieldName);
    if (field) {
    
      return field.label.split('(')[0].trim();
    }
  }
  return fieldName;
};


const RADAR_CHART_FIELDS = [
  'avaliacaoTecnica_score',
  'avaliacaoComportamental_score',
  'qualidadeExecucaoEWO_score',
  'sugestoesSeguranca_score',
  'quick_score',
  'saturacaoTrabalho_score',
];

function CompetencyRadarChart({ evaluationData }) {
  const chartData = RADAR_CHART_FIELDS.map(fieldName => ({
    subject: getFieldLabel(fieldName),
    score: evaluationData[fieldName] || 0, 
    fullMark: 5,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart cx="70%" cy="50%" outerRadius="75%" data={chartData}>
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: 'var(--color-text)', fontSize: 12 }} 
        />
        <PolarRadiusAxis 
          angle={10} 
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
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
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