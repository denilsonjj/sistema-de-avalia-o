import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card/Card';
import Avatar from '../../components/Avatar/Avatar';
import styles from './ProfilePage.module.css';
import { FaUser, FaEnvelope, FaTools, FaCertificate, FaSave, FaCamera } from 'react-icons/fa';

function ProfilePage() {
  const { user, updateUserAvatar, updateUserData } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    technicalSkills: '',
    certifications: '',
    avatarUrl: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        technicalSkills: user.technicalSkills || '',
        certifications: user.certifications || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification({ type: '', message: '' });
    try {
      const dataToUpdate = {
        name: formData.name,
        technicalSkills: formData.technicalSkills,
        certifications: formData.certifications,
      };
      await api.put('/auth/profile', dataToUpdate);
      
      updateUserData(dataToUpdate);
      
      setNotification({ type: 'success', message: 'Perfil atualizado com sucesso!' });
    } catch (err) {
      setNotification({ type: 'error', message: 'Erro ao atualizar o perfil.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('avatar', file);

    try {
      const res = await api.post('/auth/upload-avatar', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const newAvatarUrl = `${res.data.avatarUrl}?t=${new Date().getTime()}`;
      
      updateUserAvatar(newAvatarUrl);
      
      setNotification({ type: 'success', message: 'Avatar atualizado!' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Falha no upload da imagem.' });
    }
  };
  
  if (!user) {
    return <p className={styles.loading}>Carregando perfil...</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Meu Perfil Profissional</h1>
        <p>Mantenha suas informações e competências sempre atualizadas.</p>
      </div>

      <div className={styles.profileGrid}>
        <div className={styles.leftColumn}>
          <Card>
            <div className={styles.avatarCard}>
              <div className={styles.avatarWrapper}>
                <Avatar name={formData.name} src={formData.avatarUrl} key={formData.avatarUrl} />
                <button
                  className={styles.avatarEditButton}
                  onClick={() => fileInputRef.current.click()}
                  title="Alterar foto de perfil"
                >
                  <FaCamera />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg"
                />
              </div>
              <h2 className={styles.userName}>{formData.name}</h2>
              <p className={styles.userEmail}><FaEnvelope /> {formData.email}</p>
            </div>
          </Card>
        </div>

        <div className={styles.rightColumn}>
          <Card title="Editar Informações">
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name"><FaUser /> Nome Completo</label>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="technicalSkills"><FaTools /> Conhecimentos Técnicos</label>
                <textarea id="technicalSkills" name="technicalSkills" value={formData.technicalSkills} onChange={handleChange} rows="6" placeholder="Ex: CLP Siemens, Redes Profinet, Inversores WEG..." />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="certifications"><FaCertificate /> Cursos e Certificações</label>
                <textarea id="certifications" name="certifications" value={formData.certifications} onChange={handleChange} rows="6" placeholder="Ex: NR-10 (Val: 12/2025), Comandos Elétricos..." />
              </div>

              {notification.message && (
                <p className={`${styles.message} ${styles[notification.type]}`}>
                  {notification.message}
                </p>
              )}

              <button type="submit" className={styles.submitButton} disabled={submitting}>
                <FaSave /> {submitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;