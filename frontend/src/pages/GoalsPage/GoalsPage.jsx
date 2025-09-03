import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import styles from "./GoalsPage.module.css";
import { FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const MySwal = withReactContent(Swal);

function TaskCard({ goal, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: goal.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={styles.goalCard}>
      <div>
        <p>{goal.title}</p>
        <small>Criado por: {goal.author?.name || "—"}</small>
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
  const [submitting, setSubmitting] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchGoals = async () => {
    if (!user) return;
    const myId = user.userId || user.id || user?.sub;

    const getAuthorId = (goal) => {
      if (!goal) return undefined;
      if (goal.author && (goal.author.id || goal.authorId)) return goal.author.id || goal.authorId;
      if (goal.authorId) return goal.authorId;
      if (goal.author && typeof goal.author === "string") return goal.author;
      if (goal.author && goal.author?.userId) return goal.author.userId;
      return goal.userId || goal.author_id || undefined;
    };

    const fetchAndReturnData = async (url) => {
      try {
        const res = await api.get(url);
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        const status = err?.response?.status;
        // trate 401/403/404 como não-fatais (silencia logs verbosos)
        if (status === 401 || status === 403) {
          console.debug(`Acesso negado em ${url} (status ${status})`);
          return null;
        }
        if (status === 404) {
          console.debug(`Rota não encontrada ${url} (status 404) — ignorando.`);
          return [];
        }
        console.debug(`Erro ao acessar ${url}: ${status || err?.message}`);
        return null;
      }
    };

    try {
      setLoading(true);

      let data = [];

      // PMM tem acesso a /goals (busca centralizada). Outros usam rotas específicas para evitar 403.
      if (user?.role === "PMM") {
        data = (await fetchAndReturnData("/goals")) || [];
      } else {
        const byUser = await fetchAndReturnData(`/goals/user/${myId}`);
        if (byUser && byUser.length) {
          data = byUser;
        } else {
          const byAuthor = await fetchAndReturnData(`/goals/author/${myId}`);
          if (byAuthor && byAuthor.length) {
            data = byAuthor;
          } else {
            // não chamar /goals para evitar 403 se usuário não for PMM
            data = [];
          }
        }
      }

      const myGoals = (Array.isArray(data) ? data : []).filter((g) => {
        const aid = getAuthorId(g);
        return aid && String(aid) === String(myId);
      });

      setColumns({
        PENDENTE: myGoals.filter((g) => g.status === "PENDENTE"),
        EM_ANDAMENTO: myGoals.filter((g) => g.status === "EM_ANDAMENTO"),
        CONCLUIDA: myGoals.filter((g) => g.status === "CONCLUIDA"),
      });
    } catch (error) {
      console.debug("Erro ao buscar metas:", error?.message || error);
      setColumns({ PENDENTE: [], EM_ANDAMENTO: [], CONCLUIDA: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title.trim() || !user) return;
    setSubmitting(true);
    try {
      const assigneeId = user.userId || user.id || user?.sub;
      if (!assigneeId) throw new Error("ID do usuário não disponível.");

      await api.post("/goals", { userId: assigneeId, title });
      setTitle("");
      await fetchGoals();
      MySwal.fire("Criada!", "A meta foi adicionada com sucesso.", "success");
    } catch (error) {
      console.error("Falha ao criar meta", error);
      const serverMessage = error.response?.data?.message || error.message;
      MySwal.fire("Erro!", `Não foi possível criar a meta. ${serverMessage}`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = (goalId) => {
    MySwal.fire({
      title: "Tem certeza?",
      text: "Esta meta será apagada permanentemente!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, apagar!",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/goals/${goalId}`);
          fetchGoals();
          MySwal.fire("Apagada!", "A meta foi removida.", "success");
        } catch (error) {
          console.error("Erro ao deletar a meta:", error);
          MySwal.fire("Erro!", "Não foi possível apagar a meta.", "error");
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

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    const newStatus = overContainer;
    api.put(`/goals/${active.id}/status`, { status: newStatus }).catch((e) => console.debug("status update failed", e));

    setColumns((prev) => {
      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];
      const activeIndex = activeItems.findIndex((item) => item.id === active.id);
      if (activeIndex === -1) return prev;
      const [movedItem] = activeItems.splice(activeIndex, 1);
      movedItem.status = newStatus;
      overItems.push(movedItem);
      return { ...prev, [activeContainer]: activeItems, [overContainer]: overItems };
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
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", width: "100%" }}>
            <TextField
              id="goal-title"
              label="Adicionar nova meta"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="small"
              fullWidth
              inputProps={{ maxLength: 250 }}
            />
            <Button type="submit" variant="contained" color="primary" disabled={submitting}>
              {submitting ? "Salvando..." : "+ Adicionar Meta"}
            </Button>
          </Box>
        </form>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className={styles.board}>
          {Object.entries(columnTitles).map(([status, titleLabel]) => (
            <Column key={status} id={status} title={titleLabel} goals={columns[status] || []} onDelete={handleDeleteGoal} />
          ))}
        </div>
        <DragOverlay>{activeGoal ? <TaskCard goal={activeGoal} onDelete={() => {}} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}

export default GoalsPage;
