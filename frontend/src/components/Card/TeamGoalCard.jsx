import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Avatar from '../Avatar/Avatar';
import styles from '../../pages/GoalsPage/GoalsPage.module.css';
import { FaTrashAlt } from "react-icons/fa";

// 1. Receba a prop 'onDelete' vinda do componente pai
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
    opacity: isDragging ? 0.5 : 1,
  };

  // 2. Crie a função que será chamada no clique do ícone
  const handleDeleteClick = (e) => {
    // Impede que o clique acione o evento de arrastar do card
    e.stopPropagation();
    // Chama a função do pai, passando o ID da meta a ser excluída
    onDelete(goal.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.goalCard}
    >
      <div className={styles.goalContent}>
        <p>{goal.title}</p>
        <small>Criado por: {goal.author.name}</small>
      </div>
      <div className={styles.avatarContainer}>
        <Avatar name={goal.user.name} />
        {/* 3. Transforme o ícone em um botão clicável */}
        <button onClick={handleDeleteClick} className={styles.deleteButton}>
          <FaTrashAlt />
        </button>
      </div>
    </div>
  );
}

export default TeamGoalCard;