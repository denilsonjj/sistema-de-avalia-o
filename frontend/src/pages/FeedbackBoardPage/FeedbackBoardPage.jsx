import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import Avatar from '../../components/Avatar/Avatar';
import styles from './FeedbackBoardPage.module.css';
import { FaQuoteLeft, FaPaperPlane, FaTrashAlt } from 'react-icons/fa';

// 1. Importações necessárias para o modal
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// 2. Instância do SweetAlert (criada fora do componente para melhor performance)
const MySwal = withReactContent(Swal);

function FeedbackBoardPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    api.get('/auth/users').then(res => {
      const sortedUsers = res.data.sort((a, b) => a.name.localeCompare(b.name));
      setUsers(sortedUsers);
    });
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setLoadingFeedbacks(true);
      api.get(`/feedbacks/user/${selectedUser.id}`)
        .then(res => setFeedbacks(res.data))
        .finally(() => setLoadingFeedbacks(false));
    }
  }, [selectedUser]);

  const handleUserSelect = (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedback.trim() || !selectedUser) return;
    setIsSubmitting(true);

    try {
      await api.post('/feedbacks', {
        recipientId: selectedUser.id,
        content: newFeedback,
      });

      const res = await api.get(`/feedbacks/user/${selectedUser.id}`);
      setFeedbacks(res.data);
      setNewFeedback('');
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      alert("Não foi possível enviar o feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Função de deletar que CHAMA o modal
  const handleDeleteFeedback = (feedbackId) => {
    MySwal.fire({
      title: 'Você tem certeza?',
      text: "Este feedback será apagado permanentemente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, apagar!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      
      if (result.isConfirmed) {
        try { 
          await api.delete(`/feedbacks/${feedbackId}`);
          setFeedbacks(currentFeedbacks =>
            currentFeedbacks.filter(feedback => feedback.id !== feedbackId)
          );
          MySwal.fire(
            'Apagado!',
            'O feedback foi removido.',
            'success'
          );
        } catch (error) {
          
          console.error("Erro ao deletar feedback:", error);
          MySwal.fire(
            'Erro!',
            'Não foi possível apagar o feedback.',
            'error'
          );
        }
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.userListPanel}>
        <Card title="Equipe">
          <div className={styles.userList}>
            {users.map(user => (
              <div
                key={user.id}
                className={`${styles.userItem} ${selectedUser?.id === user.id ? styles.selected : ''}`}
                onClick={() => handleUserSelect(user.id)}
              >
                <Avatar name={user.name} />
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userRole}>{user.role}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className={styles.feedbackArea}>
        {selectedUser ? (
          <>
            <h2>Feedbacks para <span className={styles.highlight}>{selectedUser.name}</span></h2>
            <div className={styles.feedbackList}>
              {loadingFeedbacks ? <p>Carregando feedbacks...</p> : feedbacks.map(fb => (
                <div key={fb.id} className={styles.feedbackCard}>
                  <div className={styles.feedbackHeader}>
                    <FaQuoteLeft />
                    
                    {/* 4. Botão que ACIONA a função de deletar (sempre visível) */}
                    <button 
                      onClick={() => handleDeleteFeedback(fb.id)} 
                      className={styles.deleteButton}
                      title="Apagar feedback"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                  <p className={styles.feedbackContent}>"{fb.content}"</p>
                  <div className={styles.feedbackFooter}>
                    <div className={styles.feedbackAuthorInfo}>
                      <Avatar name={fb.author.name} />
                      <div>
                        <strong>{fb.author.name}</strong>
                        <small>{new Date(fb.createdAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {feedbacks.length === <strong>0</strong> && !loadingFeedbacks && <p>Nenhum feedback registrado para este usuário.</p>}
            </div>
              <form onSubmit={handleSubmitFeedback} className={styles.form}>
                <textarea
                  value={newFeedback}
                  onChange={e => setNewFeedback(e.target.value)}
                  placeholder="Escreva um novo feedback construtivo..."
                  rows={<strong>4</strong>}
                  disabled={isSubmitting}
                />
                <button type="submit" disabled={isSubmitting || !newFeedback.trim()}>
                  <FaPaperPlane /> {isSubmitting ? 'Enviando...' : 'Adicionar Feedback'}
                </button>
              </form>
          </>
        ) : (
          <div className={styles.placeholder}>
            <p>Selecione um membro da equipe para começar.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedbackBoardPage;