import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import CompetencyRadarChart from '../../components/charts/CompetencyRadarChart';
import styles from './EvaluationDetailPage.module.css';
import { evaluationCategories } from '../CreateEvaluationPage/evaluationFields';

const getFieldLabel = (fieldName) => {
  for (const category in evaluationCategories) {
    const field = evaluationCategories[category].find(f => f.name === fieldName);
    if (field) return field.label;
  }
  return fieldName;
};

function EvaluationDetailPage() {
  // Agora pegamos tanto userId quanto evaluationId dos parâmetros da URL
  const { userId, evaluationId } = useParams();
  const [user, setUser] = useState(null);
  const [evaluation, setEvaluation] = useState(null); // Estado para uma única avaliação
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        let currentEval;
        let targetUserId;

        if (evaluationId) {
          // Cenário 1: Carrega pela ID da avaliação
          const evalRes = await api.get(`/evaluations/${evaluationId}`);
          currentEval = evalRes.data;
          setEvaluation(currentEval);
          targetUserId = currentEval.userId; // Pega o ID do usuário a partir da avaliação
        } else if (userId) {
          // Cenário 2: Carrega as avaliações do usuário e pega a mais recente
          targetUserId = userId;
          const evalRes = await api.get(`/evaluations/user/${userId}`);
          if (evalRes.data && evalRes.data.length > 0) {
            currentEval = evalRes.data[0];
            setEvaluation(currentEval);
          }
        }

        // Se encontramos um usuário, busca os dados dele e suas metas
        if (targetUserId) {
          const [userRes, goalsRes] = await Promise.all([
            api.get(`/auth/users/${targetUserId}`),
            api.get(`/goals/user/${targetUserId}`),
          ]);
          setUser(userRes.data);
          setGoals(goalsRes.data);
        } else {
           // Se não há targetUserId (usuário sem avaliação clicado via /equipe/:userId)
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

  // O ID do usuário para os botões de ação
  const actionUserId = user?.id || userId;

  const renderEvaluationDetails = () => {
    if (!evaluation) return null;
    const scoreFields = Object.keys(evaluation).filter(key => key.endsWith('_score'));
    return (
      <div className={styles.detailsGrid}>
        {scoreFields.map(field => (
          <div key={field} className={styles.detailItem}>
            <span className={styles.detailLabel}>{getFieldLabel(field)}</span>
            <span className={styles.detailValue}>{evaluation[field] !== null ? evaluation[field] : 'N/A'}</span>
          </div>
        ))}
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
        <div className={styles.headerActions}>
          <Link to={`/equipe/${actionUserId}/nova-avaliacao`} className={`${styles.actionButton} ${styles.primary}`}>
            + Nova Avaliação
          </Link>
          <Link to={`/equipe/${actionUserId}/atribuir-meta`} className={`${styles.actionButton} ${styles.secondary}`}>
            + Atribuir Meta
          </Link>
        </div>
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