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
import { SortableContext } from "@dnd-kit/sortable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Importe o CSS do DatePicker
import ptBR from "date-fns/locale/pt-BR";
import api from "../../services/api";
import styles from "./TeamGoalsPage.module.css";
import TeamGoalCard from "../../components/Card/TeamGoalCard";
import Card from "../../components/Card/Card";
import { useTheme } from "../../context/ThemeContext";
import TextField from "@mui/material/TextField";
import { FormControl, Select, InputLabel, MenuItem } from "@mui/material";

//         Receba a prop aqui V
function Column({ id, title, goals, onDeleteGoal }) { 
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={styles.column}>
      <h2>{title}</h2>
      <SortableContext items={goals.map((g) => g.id)}>
        <div className={styles.cardList}>
          {goals.map((goal) => (
            <TeamGoalCard
              key={goal.id}
              goal={goal}
              onDelete={onDeleteGoal} // <-- REPASSE A PROP AQUI
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function TeamGoalsPage() {
  const { theme } = useTheme();
  const [columns, setColumns] = useState({
    PENDENTE: [],
    EM_ANDAMENTO: [],
    CONCLUIDA: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeGoal, setActiveGoal] = useState(null);
  const [users, setUsers] = useState([]);
  
  // --- MUDANÇA 1: Estado inicial do selectedUser ---
  const [selectedUser, setSelectedUser] = useState(""); // Usar string vazia é melhor para o Select da MUI
  
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchAllData = async () => {
    try {
      const [goalsRes, usersRes] = await Promise.all([
        api.get("/goals"),
        api.get("/auth/users"),
      ]);
  
      const allGoals = goalsRes.data;
  
      // ====================================================================
      // SOLUÇÃO: Limpa os dados, garantindo que cada ID seja único
      // Isso preserva a regra de negócio (mostrar todas as metas),
      // mas corrige o bug do drag-and-drop.
      const uniqueGoals = Array.from(new Map(allGoals.map(goal => [goal.id, goal])).values());
  
      if (allGoals.length !== uniqueGoals.length) {
          console.warn("AVISO: Foram removidas metas com IDs duplicados que vieram da API /goals.");
      }
      // ====================================================================
  
      // Agora, use a lista limpa ('uniqueGoals') para popular as colunas
      setColumns({
        PENDENTE: uniqueGoals.filter((g) => g.status === "PENDENTE"),
        EM_ANDAMENTO: uniqueGoals.filter((g) => g.status === "EM_ANDAMENTO"),
        CONCLUIDA: uniqueGoals.filter((g) => g.status === "CONCLUIDA"),
      });
  
      // O resto da sua função continua igual...
      const userOptions = usersRes.data.map((user) => ({
        value: user.id,
        label: user.name,
      }));
      setUsers(userOptions);
    } catch (error) {
      console.error("Erro ao buscar dados da equipe:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedUser) {
      alert("Por favor, preencha o título e selecione um responsável.");
      return;
    }
    try {
      // --- MUDANÇA 2: Correção no envio do ID do usuário ---
      await api.post("/goals", { userId: selectedUser, title, dueDate });
      
      setTitle("");
      setSelectedUser(""); // Limpa para string vazia
      setDueDate(null);
      fetchAllData();
    } catch (error) {
      console.error("Erro ao criar a meta:", error);
      alert("Falha ao criar a meta.");
    }
  };
  const handleDeleteGoal = async (goalIdToDelete) => {
    // Usar uma confirmação previne exclusões acidentais
    if (!window.confirm("Tem certeza que deseja excluir esta meta?")) {
      return;
    }
  
    try {
      // 1. Chama a API para deletar a meta no servidor
      await api.delete(`/goals/${goalIdToDelete}`);
  
      // 2. Atualiza o estado da UI para remover o card imediatamente
      setColumns(prevColumns => {
        const newColumns = {};
        for (const columnKey in prevColumns) {
          // Para cada coluna, cria um novo array filtrando para fora a meta que foi excluída
          newColumns[columnKey] = prevColumns[columnKey].filter(
            (goal) => goal.id !== goalIdToDelete
          );
        }
        return newColumns;
      });
  
    } catch (error) {
      console.error("Erro ao excluir a meta:", error);
      alert("Não foi possível excluir a meta. Tente novamente.");
    }
  };

  const findContainer = (id) =>
    id in columns
      ? id
      : Object.keys(columns).find((key) =>
          columns[key].some((item) => item.id === id)
        );

  const onDragStart = (event) => {
    const allGoals = Object.values(columns).flat();
    setActiveGoal(allGoals.find((g) => g.id === event.active.id));
  };
  
  const onDragEnd = (event) => {
    const { active, over } = event;
    setActiveGoal(null);
    if (!over) return;
  
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id) || over.id;
  
    if (!activeContainer || !overContainer || activeContainer === overContainer)
      return;
  
    const newStatus = overContainer;
  
    setColumns((prev) => {
      // Copia os arrays das colunas
      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];
  
      const activeIndex = activeItems.findIndex((item) => item.id === active.id);
      if (activeIndex === -1) return prev;
  
      // Remove o item da coluna de origem (sem mutar o array original)
      const [movedItem] = activeItems.splice(activeIndex, 1);
  
      // Cria uma cópia do item com o novo status
      const updatedItem = { ...movedItem, status: newStatus };
  
      // Adiciona na coluna de destino (sem mutar)
      const newOverItems = [...overItems, updatedItem];
  
      return {
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: newOverItems,
      };
    });
  

    api.put(`/goals/${active.id}/status`, { status: newStatus }).catch((err) => {
      console.error("Falha ao atualizar o status da meta:", err);
      fetchAllData(); // Reverte se falhar
    });
  };
  

  const columnTitles = {
    PENDENTE: "📋 A Fazer",
    EM_ANDAMENTO: "⏳ Em Andamento",
    CONCLUIDA: "✔️ Concluído",
  };

  if (loading) return <p>Carregando metas da equipe...</p>;

  return (
    <div className={styles.container}>
      <h1>Plano de Desenvolvimento da Equipe</h1>
      <Card className={styles.formCard}>
        <form onSubmit={handleCreateGoal} className={styles.formGrid}>
          <TextField
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            label="Escreva sua Meta"
            variant="outlined"
          />
          <FormControl fullWidth>
            <InputLabel id="user-select-label">Atribuir para</InputLabel>
            <Select
              labelId="user-select-label"
              value={selectedUser}
              label="Atribuir para"
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {users.map(user => (
                <MenuItem key={user.value} value={user.value}>
                  {user.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className={styles.formGroup}>
            <DatePicker
              selected={dueDate}
              onChange={(date) => setDueDate(date)}
              dateFormat="dd/MM/yyyy"
              locale={ptBR}
              placeholderText="Selecione o prazo"
              className={styles.datePickerInput}
            />
          </div>
          <div className={styles.formGroup}>
            <button type="submit" className={styles.submitButton}>
              + Adicionar
            </button>
          </div>
        </form>
      </Card>

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
              goals={columns[status] || []}
              onDeleteGoal={handleDeleteGoal}
            />
          ))}
        </div>
        <DragOverlay>
          {activeGoal ? <TeamGoalCard goal={activeGoal} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default TeamGoalsPage;