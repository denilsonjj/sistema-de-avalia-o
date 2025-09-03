import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './CreateEvaluationPage.module.css';
import { evaluationCategories } from './evaluationFields';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

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

  const handleSelectChange = (name, value) => {
    const score = value !== '' && value !== null ? Number(value) : null;
    setEvaluationData(prev => ({ ...prev, [name]: score }));
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
      // feedback simples e redireciona
      navigate(`/equipe/${userId}`);
    } catch (err) {
      setError('Erro ao criar avaliação. ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const scoreOptions = [1, 2, 3, 4, 5];

  return (
    <div className={styles.container}>
      <Typography variant="h5" component="h2" gutterBottom>
        Criar Nova Avaliação para {user?.name || '...'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {Object.entries(evaluationCategories).map(([category, fields]) => (
          <fieldset key={category} className={styles.fieldset}>
            <legend className={styles.legend}>{category}</legend>
            <Box className={styles.fieldsGrid} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 2 }}>
              {fields.map(field => (
                <FormControl key={field.name} fullWidth size="small" variant="outlined" sx={{ mb: 0 }}>
                  <InputLabel id={`label-${field.name}`}>{field.label}</InputLabel>
                  <Select
                    labelId={`label-${field.name}`}
                    id={field.name}
                    value={evaluationData[field.name] ?? ''}
                    label={field.label}
                    onChange={(e) => handleSelectChange(field.name, e.target.value)}
                    renderValue={(v) => (v === '' ? 'Selecione a pontuação' : v)}
                  >
                    <MenuItem value="">
                      <em>Selecione a pontuação</em>
                    </MenuItem>
                    {scoreOptions.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Box>
          </fieldset>
        ))}

        <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Salvar Avaliação'}
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>Cancelar</Button>
        </Box>
      </form>
    </div>
  );
};

export default CreateEvaluationPage;