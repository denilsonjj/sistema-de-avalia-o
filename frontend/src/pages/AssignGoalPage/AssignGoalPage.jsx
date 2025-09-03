import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

registerLocale('pt-BR', ptBR);

function AssignGoalPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/auth/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        setError('Usuário não encontrado.');
      }
    };
    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, dueDate: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/goals', {
        userId: userId,
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
      });
      navigate(`/equipe/${userId}`);
    } catch (err) {
      setError('Falha ao atribuir a meta.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <Typography variant="body1">Carregando...</Typography>;

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
      <Paper elevation={3} sx={{ padding: '2rem', borderRadius: '8px' }}>
        <Typography variant="h4" gutterBottom align="center">
          Atribuir Nova Meta para {user.name}
        </Typography>
        <Typography variant="body1" gutterBottom align="center">
          Defina um objetivo claro com um prazo, se necessário.
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              id="title"
              name="title"
              label="Título da Meta"
              variant="outlined"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Concluir curso de Power BI"
              required
              fullWidth
            />
            <TextField
              id="description"
              name="description"
              label="Descrição (Opcional)"
              variant="outlined"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalhes sobre a meta, links para cursos, etc."
              multiline
              rows={4}
              fullWidth
            />
            <Box>
              <Typography variant="body2" gutterBottom>
                Prazo Final (Opcional)
              </Typography>
              <DatePicker
                id="dueDate"
                selected={formData.dueDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                placeholderText="Selecione uma data"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </Box>
            {error && (
              <Typography variant="body2" color="error" align="center">
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              fullWidth
              sx={{ padding: '0.75rem', fontWeight: 'bold' }}
            >
              {submitting ? 'Atribuindo...' : 'Atribuir Meta'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default AssignGoalPage;