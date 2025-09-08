import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import CompetencyRadarChart from '../../components/charts/CompetencyRadarChart';
import styles from './EvaluationDetailPage.module.css';
import { evaluationFieldsConfig } from '../CreateEvaluationPage/evaluationFields';
import Button from '@mui/material/Button';
import { useAuth } from '../../context/AuthContext'; // Usando o hook corrigido

const getFieldLabel = (fieldName) => {
  const fieldConfig = evaluationFieldsConfig.find(
    config => config.scoreKey === fieldName
  );
  return fieldConfig ? fieldConfig.label : fieldName;
};

function EvaluationDetailPage() {
  const { userId, evaluationId } = useParams();
  const [user, setUser] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOriginalValues, setShowOriginalValues] = useState(false);

  const { user: loggedInUser } = useAuth();
  const isManager = loggedInUser && (loggedInUser.role === 'lider' || loggedInUser.role === 'admin'|| loggedInUser=== 'PMM');

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
        } else if(userId) {
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

  if (loading) return <p>Carregando relatório...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  const actionUserId = user?.id || userId;

  const renderEvaluationDetails = () => {
    if (!evaluation) return null;
    const scoreFields = Object.keys(evaluation).filter(key => key.endsWith('_score'));
    
    return (
      <div className={styles.detailsGrid}>
        {scoreFields.map(fieldScoreKey => {
          const fieldValueKey = fieldScoreKey.replace('_score', '_value');
          const score = evaluation[fieldScoreKey];
          const originalValue = evaluation[fieldValueKey];

          return (
            <div key={fieldScoreKey} className={styles.detailItem}>
              <span className={styles.detailLabel}>{getFieldLabel(fieldScoreKey)}</span>
              <div className={styles.valueContainer}>
                <span className={styles.detailValue}>{score !== null ? score : 'N/A'}</span>
                {isManager && showOriginalValues && originalValue !== null && originalValue !== undefined && (
                  <span className={styles.originalValue}>
                    (Valor: {originalValue})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Relatório de Desempenho</h1>
          <p className={styles.userName}>{user?.name}</p>
        </div>

        {/* --- CORREÇÃO APLICADA AQUI --- */}
        {/* O container dos botões só será renderizado se o usuário for um líder */}
        {isManager && (
          <div className={styles.headerActions}>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => setShowOriginalValues(!showOriginalValues)}
            >
              {showOriginalValues ? 'Ocultar Valores' : 'Ver Valores Originais'}
            </Button>
            <Link to={`/equipe/${actionUserId}/nova-avaliacao`} className={`${styles.actionButton} ${styles.primary}`}>
              + Nova Avaliação
            </Link>
            <Link to={`/equipe/${actionUserId}/atribuir-meta`} className={`${styles.actionButton} ${styles.secondary}`}>
              + Atribuir Meta
            </Link>
          </div>
        )}
      </div>

      <div className={styles.grid}>
        {evaluation ? (
          <>
            {evaluation.finalScore != null && (
              <div className={styles.oeeCard}>
                <div className={styles.oeeValue}>{evaluation.finalScore.toFixed(2)}</div>
                <div className={styles.oeeLabel}>Nota Final da Avaliação</div>
              </div>
            )}
            <div className={`${styles.largeCard} ${styles.radarCard}`}>
              <h3 className={styles.cardTitle}>Radar de Competências</h3>
              <CompetencyRadarChart evaluationData={evaluation} />
            </div>
            <div className={`${styles.largeCard} ${styles.detailsCard}`}>
              <h3 className={styles.cardTitle}>Detalhes da Avaliação</h3>
              {renderEvaluationDetails()}
            </div>
          </>
        ) : (
            <div className={`${styles.largeCard} ${styles.fullWidth}`}>
                <p>Nenhuma avaliação encontrada para este usuário.</p>
            </div>
        )}

        <div className={`${styles.largeCard} ${styles.goalsCard}`}>
          <h3 className={styles.cardTitle}>Plano de Desenvolvimento (Metas)</h3>
          <div className={styles.goalsContainer}>
            {goals.length > 0 ? (
              goals.map(goal => (
                <div key={goal.id} className={`${styles.goalItem} ${styles[goal.status.toLowerCase()]}`}>
                  <p className={styles.goalTitle}>{goal.title}</p>
                  <small>Criado por: {goal.author.name}</small>
                </div>
              ))
            ) : (
              <p>Nenhuma meta de desenvolvimento definida para este usuário.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvaluationDetailPage;