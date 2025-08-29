// frontend/src/pages/GoalsPage/GoalsPage.jsx

import React, { useState, useEffect } from "react";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, useDroppable
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import styles from "./GoalsPage.module.css";
import { FaTrashAlt } from "react-icons/fa";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function TaskCard({ goal, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: goal.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={styles.goalCard}>
      <div>
        <p>{goal.title}</p>
        <small>Criado por: {goal.author.name}</small>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(goal.id);
        }}
        className={styles.deleteButton}
        title="Deletar meta"
      >
        <FaTrashAlt />
      </button>
    </div>
  );
}

function Column({ id, title, goals, onDelete }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={styles.column}>
      <h2>{title}</h2>
      <SortableContext items={goals.map((g) => g.id)}>
        <div className={styles.cardList}>
          {goals.map((goal) => (
            <TaskCard key={goal.id} goal={goal} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function GoalsPage() {
  const { user } = useAuth();
  const [columns, setColumns] = useState({
    PENDENTE: [],
    EM_ANDAMENTO: [],
    CONCLUIDA: [],
  });
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeGoal, setActiveGoal] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchGoals = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/goals/user/${user.userId}`);
      setColumns({
        PENDENTE: res.data.filter((g) => g.status === "PENDENTE"),
        EM_ANDAMENTO: res.data.filter((g) => g.status === "EM_ANDAMENTO"),
        CONCLUIDA: res.data.filter((g) => g.status === "CONCLUIDA"),
      });
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(user) {
        fetchGoals();
    }
  }, [user]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title.trim() || !user) return;
    try {
        await api.post("/goals", { userId: user.userId, title });
        setTitle("");
        fetchGoals();
    } catch (error) {
        console.error("Falha ao criar meta", error);
        MySwal.fire('Erro!', 'Não foi possível criar a meta.', 'error');
    }
  };

  const handleDeleteGoal = (goalId) => {
    MySwal.fire({
      title: 'Tem certeza?',
      text: "Esta meta será apagada permanentemente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, apagar!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/goals/${goalId}`);
          fetchGoals(); // Simplesmente busca os dados novamente para garantir a consistência
          MySwal.fire('Apagada!', 'A meta foi removida.', 'success');
        } catch (error) {
          console.error("Erro ao deletar a meta:", error);
          MySwal.fire('Erro!', 'Não foi possível apagar a meta.', 'error');
        }
      }
    });
  };

  const findContainer = (id) => {
    if (id in columns) return id;
    return Object.keys(columns).find((key) => columns[key].some((item) => item.id === id));
  };

  const onDragStart = (event) => {
    const allGoals = Object.values(columns).flat();
    setActiveGoal(allGoals.find((g) => g.id === event.active.id) || null);
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    setActiveGoal(null);
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id) || over.id;

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return; // Não faz nada se o movimento for inválido ou na mesma coluna
    }

    const newStatus = overContainer;
    api.put(`/goals/${active.id}/status`, { status: newStatus });

    setColumns((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((item) => item.id === active.id);
      const [movedItem] = activeItems.splice(activeIndex, 1);
      
      movedItem.status = newStatus;
      overItems.push(movedItem);

      return { ...prev, [activeContainer]: [...activeItems], [overContainer]: [...overItems] };
    });
  };

  const columnTitles = {
    PENDENTE: "📋 A Fazer",
    EM_ANDAMENTO: "⏳ Em Andamento",
    CONCLUIDA: "✔️ Concluído",
  };

  if (loading) return <p>Carregando metas...</p>;

  return (
    <div>
      <h1 className="titlePage">Plano de Desenvolvimento</h1>
      <div className={styles.formCard}>
        <form onSubmit={handleCreateGoal}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Adicionar uma nova meta..."
          />
          <button type="submit">+ Adicionar Meta</button>
        </form>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className={styles.board}>
          {Object.entries(columnTitles).map(([status, title]) => (
            <Column
              key={status}
              id={status}
              title={title}
              goals={columns[status]}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
        <DragOverlay>
          {activeGoal ? <TaskCard goal={activeGoal} onDelete={() => {}} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default GoalsPage;