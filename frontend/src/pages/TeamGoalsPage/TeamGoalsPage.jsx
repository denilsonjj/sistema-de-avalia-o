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
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import Select from "react-select";
import DatePicker from "react-datepicker";
//import { registerLocale } from "react-datepicker";l
import ptBR from "date-fns/locale/pt-BR";
import api from "../../services/api";
import styles from "./TeamGoalsPage.module.css";
import TeamGoalCard from "../../components/Card/TeamGoalCard";
import Card from "../../components/Card/Card";
import { useTheme } from "../../context/ThemeContext";

//registerLocale("pt-BR", ptBR);

const customSelectStyles = (theme) => ({
  control: (provided) => ({
    ...provided,
    backgroundColor: theme === "dark" ? "#1e2129" : "#ffffff",
    borderColor: theme === "dark" ? "#313642" : "#dce1e6",
    minHeight: "46px",
    height: "46px",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: theme === "dark" ? "#e1e1e1" : "#282b34",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: theme === "dark" ? "#1e2129" : "#ffffff",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? theme === "dark"
        ? "#5a7ec7"
        : "#243782"
      : state.isFocused
      ? theme === "dark"
        ? "#313642"
        : "#e8eaf6"
      : "transparent",
    color: state.isSelected
      ? "white"
      : theme === "dark"
      ? "#e1e1e1"
      : "#282b34",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
});

function Column({ id, title, goals }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={styles.column}>
      <h2>{title}</h2>
      <SortableContext items={goals.map((g) => g.id)}>
        <div className={styles.cardList}>
          {goals.map((goal) => (
            <TeamGoalCard key={goal.id} goal={goal} />
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
  const [selectedUser, setSelectedUser] = useState(null);
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
      setColumns({
        PENDENTE: goalsRes.data.filter((g) => g.status === "PENDENTE"),
        EM_ANDAMENTO: goalsRes.data.filter((g) => g.status === "EM_ANDAMENTO"),
        CONCLUIDA: goalsRes.data.filter((g) => g.status === "CONCLUIDA"),
      });
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
      await api.post("/goals", { userId: selectedUser.value, title, dueDate });
      setTitle("");
      setSelectedUser(null);
      setDueDate(null);
      fetchAllData();
    } catch (error) {
      console.error("Erro ao criar a meta:", error);
      alert("Falha ao criar a meta.");
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
    api.put(`/goals/${active.id}/status`, { status: newStatus });
    setColumns((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex(
        (item) => item.id === active.id
      );
      const [movedItem] = activeItems.splice(activeIndex, 1);
      movedItem.status = newStatus;
      overItems.push(movedItem);
      return {
        ...prev,
        [activeContainer]: [...activeItems],
        [overContainer]: [...overItems],
      };
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
      {/* Adicionei 'styles.formCard' para o estilo do CSS funcionar neste Card */}
      <Card className={styles.formCard}>
        <form onSubmit={handleCreateGoal} className={styles.formGrid}>
          <div
            className={styles.formGroup}
            style={{ gridColumn: "1 / span 2" }}
          >
            <label htmlFor="goalTitle">Nova Meta</label>
            <input
              id="goalTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descreva a meta..."
            />
          </div>
          <div className={styles.formGroup}>
  <label>Atribuir para</label>

  {/* Este container será nossa barreira de estilos */}
  <div className={styles.selectResetContainer}> 
    <Select 
      options={users} 
      value={selectedUser} 
      onChange={setSelectedUser} 
      placeholder="Selecione..." 
      styles={customSelectStyles(theme)} 
      menuPortalTarget={document.body} 
    />
  </div>
</div>
          <div className={styles.formGroup}>
            <label>Prazo Final</label>
            <DatePicker
              selected={dueDate}
              onChange={(date) => setDueDate(date)}
              dateFormat="dd/MM/yyyy"
              locale="pt-BR"
              placeholderText="Selecione uma data"
              className={styles.datePickerInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label style={{ visibility: "hidden" }}>Ação</label>
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
