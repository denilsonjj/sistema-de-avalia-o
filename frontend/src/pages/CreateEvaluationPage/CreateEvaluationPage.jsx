import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './CreateEvaluationPage.module.css';
import { evaluationFieldsConfig } from './evaluationFields';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField'; 

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

  // RENOMEADO para um nome mais genérico, pois lida com ambos os tipos de input
  const handleValueChange = (fieldName, value) => {
    const fieldValue = value === '' ? null : Number(value);
    setEvaluationData(prev => ({ ...prev, [fieldName]: fieldValue }));
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
      navigate(`/equipe/${userId}`);
    } catch (err) {
      setError('Erro ao criar avaliação. ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const fieldsByCategory = evaluationFieldsConfig.reduce((acc, field) => {
    const { category } = field;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(field);
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <Typography variant="h5" component="h2" gutterBottom>
        Criar Nova Avaliação para {user?.name || '...'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {Object.entries(fieldsByCategory).map(([category, fields]) => (
          <fieldset key={category} className={styles.fieldset}>
            <legend className={styles.legend}>{category}</legend>
            <Box className={styles.fieldsGrid} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 2 }}>
              {fields.map(field => {
                const fieldName = field.valueKey;

                // --- LÓGICA CONDICIONAL PARA ESCOLHER O TIPO DE CAMPO ---
                // Se o input for de nota direta (1 a 5)
                if (field.inputType === 'direct_score') {
                  return (
                    // CAMPO DE SELEÇÃO para notas
                    <FormControl key={fieldName} fullWidth size="small" variant="outlined">
                      <InputLabel id={`label-${fieldName}`}>{field.label}</InputLabel>
                      <Select
                        labelId={`label-${fieldName}`}
                        id={fieldName}
                        value={evaluationData[fieldName] ?? ''}
                        label={field.label}
                        onChange={(e) => handleValueChange(fieldName, e.target.value)}
                      >
                        <MenuItem value=""><em>Selecione a nota</em></MenuItem>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                } else {
                  // Se o input for de valor numérico
                  return (
                    // CAMPO DE NÚMERO para valores de métricas
                    <TextField
                      key={fieldName}
                      fullWidth
                      size="small"
                      variant="outlined"
                      type="number"
                      label={`${field.label} (${field.unit})`} // Mostra a unidade (ex: min, qtd)
                      id={fieldName}
                      value={evaluationData[fieldName] ?? ''}
                      onChange={(e) => handleValueChange(fieldName, e.target.value)}
                    />
                  );
                }
              })}
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