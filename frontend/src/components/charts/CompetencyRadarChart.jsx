import React from 'react';
// Importamos tudo que precisamos, incluindo o Tooltip
import { Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { evaluationFieldsConfig } from '../../pages/CreateEvaluationPage/evaluationFields.js';

const CompetencyRadarChart = ({ evaluationData }) => {
    if (!evaluationData) {
        return <p>Dados insuficientes para gerar o gráfico.</p>;
    }

    // 1. Agrupa os campos por sua categoria
    const fieldsByCategory = evaluationFieldsConfig.reduce((acc, field) => {
        // Consideramos apenas os campos que são métricas (não subjetivos)
        if (field.scoreKey && field.inputType === 'value') {
            const category = field.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(field.scoreKey);
        }
        return acc;
    }, {});

    // 2. Calcula a média das notas para cada categoria
    const data = Object.keys(fieldsByCategory).map(category => {
        const scoreKeys = fieldsByCategory[category];
        let totalScore = 0;
        let validItemsCount = 0;

        scoreKeys.forEach(key => {
            const score = evaluationData[key];
            if (score !== null && score !== undefined) {
                totalScore += score;
                validItemsCount++;
            }
        });

        const averageScore = validItemsCount > 0 ? (totalScore / validItemsCount) : 0;

        return {
            subject: category, // O "assunto" agora é a CATEGORIA
            A: parseFloat(averageScore.toFixed(2)), // A pontuação é a MÉDIA
            fullMark: 5,
        };
    });

    return (
        <ResponsiveContainer width="100%" height={350}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                <Radar name="Média da Categoria" dataKey="A" stroke="#243782" fill="#243782" fillOpacity={0.6} />
                <Legend />
                {/* O Tooltip está aqui, como deveria estar */}
                <Tooltip />
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default CompetencyRadarChart;