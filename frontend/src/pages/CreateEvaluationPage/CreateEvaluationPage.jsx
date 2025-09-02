import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './CreateEvaluationPage.module.css';
import { evaluationCategories } from './evaluationFields'; 

const CreateEvaluationPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [evaluationData, setEvaluationData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/auth/users/${userId}`);
        setUser(response.data);
      } catch (err) {
        setError('Falha ao carregar dados do usuário.');
      }
    };
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const score = value ? parseInt(value, 10) : null;
    setEvaluationData(prev => ({
      ...prev,
      [name]: score
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const dataToSend = Object.entries(evaluationData).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    try {
      await api.post(`/evaluations/user/${userId}`, dataToSend);
      alert('Avaliação criada com sucesso!');
      navigate(`/equipe/${userId}`);
    } catch (err) {
      setError('Erro ao criar avaliação. ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Criar Nova Avaliação para {user?.name || '...'}</h2>
      {error && <p className={styles.error}>{error}</p>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {Object.entries(evaluationCategories).map(([category, fields]) => (
          <fieldset key={category} className={styles.fieldset}>
            <legend className={styles.legend}>{category}</legend>
            <div className={styles.fieldsGrid}>
              {fields.map(field => (
                <div key={field.name} className={styles.formGroup}>
                  <label htmlFor={field.name}>{field.label}</label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={evaluationData[field.name] || ''}
                    onChange={handleInputChange}
                    className={styles.selectInput}
                  >
                    <option value="">Selecione a pontuação</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              ))}
            </div>
          </fieldset>
        ))}

        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading ? 'Salvando...' : 'Salvar Avaliação'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvaluationPage;