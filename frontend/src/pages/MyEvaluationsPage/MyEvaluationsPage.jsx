import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card/Card';
import styles from './MyEvaluationsPage.module.css';

// 1. Importações necessárias para o modal
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// 2. Instância do SweetAlert (criada fora do componente para melhor performance)
const MySwal = withReactContent(Swal);

function MyEvaluationsPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchEvaluations = async () => {
      try {
        const response = await api.get(`/evaluations/user/${user.userId}`);
        setEvaluations(response.data);
      } catch (err) {
        setError('Falha ao buscar suas avaliações.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [user]);

  // 3. Função de deletar ATUALIZADA com o modal
  const handleDelete = (evaluationId) => {
    MySwal.fire({
      title: 'Tem certeza?',
      text: 'Esta avaliação será excluída permanentemente!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/evaluations/${evaluationId}`);
          // Atualiza a lista na tela sem precisar recarregar
          setEvaluations(prev => prev.filter(ev => ev.id !== evaluationId));

          MySwal.fire(
            'Excluída!',
            'A avaliação foi removida com sucesso.',
            'success'
          );
        } catch (err) {
          console.error("Erro ao excluir avaliação:", err);
          MySwal.fire(
            'Erro!',
            'Não foi possível excluir a avaliação.',
            'error'
          );
        }
      }
    });
  };

  if (loading) {
    return <p>Carregando suas avaliações...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <h1>Meu Histórico de Avaliações</h1>
      <p>Acompanhe sua evolução e os feedbacks recebidos.</p>

      <div className={styles.evaluationList}>
        {evaluations.length > 0 ? (
          evaluations.map(evaluation => (
            <Card 
              key={evaluation.id} 
              title={`Avaliação de ${new Date(evaluation.createdAt).toLocaleDateString()}`}
            >
              <div className={styles.cardActions}>
                {/* O botão agora chama a nova função handleDelete */}
                <button onClick={() => handleDelete(evaluation.id)} className={styles.deleteButton}>Excluir</button>
              </div>

              <div className={styles.grid}>
                <div>
                  <h4>Avaliação Individual</h4>
                  <p><strong>Conhecimento Técnico:</strong> {evaluation.technicalKnowledge_notes}</p>
                  <p><strong>Certificações:</strong> {evaluation.certifications_notes}</p>
                </div>
                <div>
                  <h4>Avaliação de Desempenho</h4>
                  <p><strong>Qualidade do Serviço (Nota):</strong> {evaluation.serviceQuality_score}</p>
                  <p><strong>Iniciativa (Nota):</strong> {evaluation.problemSolvingInitiative_score}</p>
                </div>
                  <div>
                  <h4>Avaliação Comportamental</h4>
                  <p><strong>Trabalho em Equipe (Nota):</strong> {evaluation.teamwork_score}</p>
                  <p><strong>Comprometimento (Nota):</strong> {evaluation.commitment_score}</p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card title="Nenhuma avaliação encontrada">
            <p style={{textAlign:'center'}}>Você ainda não possui avaliações registradas.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default MyEvaluationsPage;