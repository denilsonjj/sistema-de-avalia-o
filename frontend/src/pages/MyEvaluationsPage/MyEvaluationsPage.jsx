import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './MyEvaluationsPage.module.css';

const MyEvaluationsPage = () => {
  const { userId: userIdFromParams } = useParams();
  const { user: loggedInUser } = useAuth();

  const [evaluations, setEvaluations] = useState([]);
  const [evaluatedUser, setEvaluatedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Determina qual ID de usuário usar para a busca.
    const targetUserId = userIdFromParams || loggedInUser?.id;

    // **ESTA É A CORREÇÃO PRINCIPAL**
    // Se ainda não temos um ID (pode acontecer enquanto o usuário logado carrega),
    // nós simplesmente esperamos, mantendo a tela de "Carregando...".
    if (!targetUserId) {
      setIsLoading(true);
      return;
    }

    const fetchEvaluationsAndUser = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Busca as avaliações do usuário alvo.
        const evalResponse = await api.get(`/evaluations/user/${targetUserId}`);
        setEvaluations(evalResponse.data);

        // Se estivermos vendo o perfil de outra pessoa, busca os dados dela.
        // Senão, usa os dados do usuário já logado.
        if (userIdFromParams) {
          const userResponse = await api.get(`/auth/users/${userIdFromParams}`);
          setEvaluatedUser(userResponse.data);
        } else {
          setEvaluatedUser(loggedInUser);
        }

      } catch (err) {
        console.error("Erro detalhado ao buscar dados:", err);
        setError('Falha ao carregar os dados. A avaliação ou usuário pode não existir.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluationsAndUser();

  }, [userIdFromParams, loggedInUser]);

  if (isLoading) {
    return <p>Carregando avaliações...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  // Define o título da página dinamicamente
  const pageTitle = userIdFromParams ? `Avaliações de ${evaluatedUser?.name}` : 'Minhas Avaliações';

  return (
    <div className={styles.container}>
      <h1>{pageTitle}</h1>
      {evaluations.length > 0 ? (
        <ul className={styles.evaluationList}>
          {evaluations.map((evaluation) => {
            // Verifica se o usuário logado é um gerente/líder
            const isManager = loggedInUser?.role === 'lider' || loggedInUser?.role === 'admin';

            // Conteúdo interno do item da lista (para não repetir o código)
            const itemContent = (
              <>
                <div className={styles.evaluationInfo}>
                  <span className={styles.date}>
                    {new Date(evaluation.createdAt).toLocaleDateString()}
                  </span>
                  <span className={styles.evaluationTitle}>
                    Avaliação de Desempenho
                  </span>
                </div>
                <div className={styles.scoreWrapper}>
                  <span className={styles.scoreLabel}>Nota Final</span>
                  <span className={styles.score}>
                    {evaluation.finalScore?.toFixed(2) ?? 'N/A'}
                  </span>
                </div>
              </>
            );

            return (
              <li key={evaluation.id} className={styles.evaluationItem}>
                {isManager ? (
                  // Se for LÍDER, renderiza o Link clicável
                  <Link to={`/evaluations/${evaluation.id}`} className={styles.evaluationLink}>
                    {itemContent}
                  </Link>
                ) : (
                  // Se for TÉCNICO, renderiza uma div NÃO clicável
                  <div className={styles.evaluationLink}> {/* Usamos a mesma classe para o estilo */}
                    {itemContent}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>Nenhuma avaliação registrada para este usuário.</p>
      )}
    </div>
  );
};
 export default MyEvaluationsPage;