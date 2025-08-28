import React from 'react';
import styles from './Avatar.module.css';

const getInitials = (name = '') => {
  const nameParts = name.split(' ');
  if (nameParts.length > 1) {
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  }
  return name ? name.substring(0, 2).toUpperCase() : '';
};


function Avatar({ name, src }) {
  if (src) {
    
    return <img src={src} alt={`Foto de ${name}`} className={styles.avatarImage} />;
  }

 
  return (
    <div className={styles.avatar}>
      {getInitials(name)}
    </div>
  );
}

export default Avatar;