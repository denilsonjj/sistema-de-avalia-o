import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import CompetencyRadarChart from '../../components/charts/CompetencyRadarChart';
import styles from './EvaluationDetailPage.module.css';
import { evaluationFieldsConfig } from '../CreateEvaluationPage/evaluationFields';
import { useAuth } from '../../context/AuthContext';

// Importações do Material-UI
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

// ÍCONES DO FONT AWESOME
import { FaEye, FaEyeSlash, FaPlusCircle, FaTasks } from 'react-icons/fa';

const getFieldLabel = (fieldName) => {
    const fieldConfig = evaluationFieldsConfig.find(
        config => config.scoreKey === fieldName
    );
    return fieldConfig ? fieldConfig.label : fieldName;
};

function EvaluationDetailPage() {
    // TODA A SUA LÓGICA DE ESTADO E FETCH PERMANECE IGUAL
    const { userId, evaluationId } = useParams();
    const [user, setUser] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showOriginalValues, setShowOriginalValues] = useState(false);
    const { user: loggedInUser } = useAuth();
    const isManager = loggedInUser && (loggedInUser.role === 'LIDER' || loggedInUser.role === 'PMM' || loggedInUser.role === 'PMS');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                let currentEval;
                let targetUserId;
                if (evaluationId) {
                    const evalRes = await api.get(`/evaluations/${evaluationId}`);
                    currentEval = evalRes.data;
                    setEvaluation(currentEval);
                    targetUserId = currentEval.userId;
                } else if (userId) {
                    targetUserId = userId;
                    const evalRes = await api.get(`/evaluations/user/${userId}`);
                    if (evalRes.data && evalRes.data.length > 0) {
                        currentEval = evalRes.data[0];
                        setEvaluation(currentEval);
                    }
                }
                if (targetUserId) {
                    const [userRes, goalsRes] = await Promise.all([
                        api.get(`/auth/users/${targetUserId}`),
                        api.get(`/goals/user/${targetUserId}`),
                    ]);
                    setUser(userRes.data);
                    setGoals(goalsRes.data);
                } else if (userId) {
                    const userRes = await api.get(`/auth/users/${userId}`);
                    setUser(userRes.data);
                }
            } catch (err) {
                setError('Não foi possível carregar os dados. A avaliação ou usuário pode não existir.');
                console.error("Erro ao buscar dados:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, evaluationId]);

    if (loading) return <div className={styles.centeredMessage}><p>Carregando relatório...</p></div>;
    if (error) return <div className={styles.centeredMessage}><p className={styles.error}>{error}</p></div>;

    const actionUserId = user?.id || userId;

    const renderEvaluationDetails = () => {
        if (!evaluation) return null;
        const scoreFields = Object.keys(evaluation).filter(key => key.endsWith('_score'));

        return (
            <div className={styles.detailsList}>
                {scoreFields.map(fieldScoreKey => {
                    const score = evaluation[fieldScoreKey];
                    const originalValue = evaluation[fieldScoreKey.replace('_score', '_value')];
                    const progressPercentage = score !== null ? (score / 5) * 100 : 0;

                    return (
                        <div key={fieldScoreKey} className={styles.scoreItem}>
                            <div className={styles.scoreInfo}>
                                <span className={styles.detailLabel}>{getFieldLabel(fieldScoreKey)}</span>
                                <span className={styles.detailValue}>{score !== null ? score.toFixed(1) : 'N/A'}</span>
                            </div>
                            <div className={styles.progressBar}>
                                <div className={styles.progressBarFill} style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                            {isManager && showOriginalValues && originalValue !== null && (
                                <span className={styles.originalValue}>Valor original: {originalValue}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Box>
                    <h1 className={styles.pageTitle}>Relatório de Desempenho</h1>
                    <p className={styles.userName}>{user?.name || 'Usuário não encontrado'}</p>
                </Box>
                {isManager && (
                    <Box className={styles.headerActions}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setShowOriginalValues(!showOriginalValues)}
                            startIcon={showOriginalValues ? <FaEyeSlash /> : <FaEye />}
                        >
                            {showOriginalValues ? 'Ocultar Valores' : 'Ver Valores'}
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            component={Link}
                            to={`/equipe/${actionUserId}/nova-avaliacao`}
                            startIcon={<FaPlusCircle />}
                        >
                            Nova Avaliação
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            color="secondary"
                            component={Link}
                            to={`/equipe/${actionUserId}/atribuir-meta`}
                            startIcon={<FaTasks />}
                        >
                            Atribuir Meta
                        </Button>
                    </Box>
                )}
            </header>

            <main className={styles.mainGrid}>
                {evaluation ? (
                    <>
                        {/* ESTE É O NOVO DIV QUE AGRUPA A COLUNA DA ESQUERDA */}
                        <div className={styles.leftColumn}>
                            {evaluation.finalScore != null && (
                                <div className={`${styles.card} ${styles.keyMetricCard}`}>
                                    <h3 className={styles.cardTitle}>Nota Final</h3>
                                    <div className={styles.metricValue}>{evaluation.finalScore.toFixed(2)}</div>
                                </div>
                            )}
                            <div className={`${styles.card} ${styles.radarCard}`}>
                                <h3 className={styles.cardTitle}>Radar de Competências</h3>
                                <div className={styles.chartContainer}>
                                    <CompetencyRadarChart evaluationData={evaluation} />
                                </div>
                            </div>
                        </div>

                        {/* O card de detalhes agora fica fora do novo div */}
                        <div className={`${styles.card} ${styles.detailsCard}`}>
                            <h3 className={styles.cardTitle}>Detalhes da Avaliação</h3>
                            <div className={styles.cardContent}>
                                {renderEvaluationDetails()}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={`${styles.card} ${styles.fullWidthCard}`}>
                        <p>Nenhuma avaliação encontrada para este usuário.</p>
                    </div>
                )}

                {/* O card de metas permanece como estava, ele já ocupa a linha inteira */}
                <div className={`${styles.card} ${styles.goalsCard}`}>
                    <h3 className={styles.cardTitle}>Plano de Desenvolvimento (Metas)</h3>
                    <div className={styles.cardContent}>
                        {goals.length > 0 ? (
                            goals.map(goal => (
                                <div key={goal.id} className={styles.goalItem}>
                                    <div className={styles.goalInfo}>
                                        <p className={styles.goalTitle}>{goal.title}</p>
                                        <small className={styles.goalAuthor}>Criado por: {goal.author.name}</small>
                                    </div>
                                    <span className={`${styles.statusBadge} ${styles[goal.status.toLowerCase()]}`}>
                                        {goal.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className={styles.emptyStateText}>Nenhuma meta de desenvolvimento definida.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default EvaluationDetailPage;