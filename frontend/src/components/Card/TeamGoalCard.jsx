import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Avatar from '../Avatar/Avatar'; 
import styles from '../../pages/GoalsPage/GoalsPage.module.css'
function TeamGoalCard({ goal }) {
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
      </div>
    </div>
  );
}

export default TeamGoalCard;