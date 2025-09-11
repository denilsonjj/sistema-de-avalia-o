import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Avatar from '../Avatar/Avatar'; // Certifique-se que o caminho está correto
import styles from './TeamGoalCard.module.css'; // Supondo que o CSS esteja neste arquivo
import { FaTrashAlt } from "react-icons/fa";

function TeamGoalCard({ goal, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(goal.id);
  };

  // Combina a classe base com a classe de 'arrasto' quando ativa
  const cardClassName = `${styles.goalCard} ${isDragging ? styles.dragging : ''}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cardClassName}
    >
      {/* Bloco de conteúdo principal (título e autor) */}
      <div className={styles.goalContent}>
        <p>{goal.title}</p>
        <small>{goal.author.name}</small>
      </div>
      
      {/* Bloco para agrupar o avatar e as ações */}
      <div className={styles.actionsAndAvatarContainer}>
        <Avatar  name={goal.user.name} src={goal.author.avatarUrl} alt={goal.author.name} className={styles.avatar} />
        
        <button onClick={handleDeleteClick} className={styles.deleteButton} aria-label="Deletar tarefa">
          <FaTrashAlt />
        </button>
      </div>
    </div>
  );
}

export default TeamGoalCard;