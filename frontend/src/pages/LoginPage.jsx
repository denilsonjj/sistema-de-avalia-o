import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';
import TextField from '@mui/material/TextField'

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      login(response.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível conectar ao servidor.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Sistema de Gestão e Avaliação</h2>
        <form className={styles.form} onSubmit={handleSubmit}>

          <TextField className='input'
           fullWidth 
           margin='normal'
           id="outlined-basic" label="Email" variant="outlined"
           value={email} 
           onChange={e=> setEmail(e.target.value)} />

          <TextField fullWidth
          margin='normal'
          id="outlined-basic" label="Senha" variant="outlined"
          value={password}
          onChange={e => setPassword(e.target.value)}
          />  
          {error && <p className={styles.errorText}>{error}</p>}
          <button type="submit">
            Entrar
          </button>
        </form>
        <p className={styles.registerLink}>
          Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;