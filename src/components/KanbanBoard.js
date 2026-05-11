import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient, { getApiErrorMessage } from '../api/apiClient';
import CreateTask from './CreateTask';
import ProjectDashboard from './ProjectDashboard';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';
import { projectStatusOptions } from '../utils/enumLabels';
import { getProjectId } from '../utils/projectPermissions';

const initialFilters = {
  search: '',
  priority: '',
  type: '',
};

const KanbanBoard = ({ boardId, project, onBoardLoaded, onProjectUpdated }) => {
  const projectId = getProjectId(project);
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [inviteEmail, setInviteEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBoardData = useCallback(async () => {
    setLoading(true);
    setFeedback('');

    try {
      const [boardResponse, taskResponse] = await Promise.all([
        apiClient.get(`/boards/project/${projectId}`),
        apiClient.get(`/tasks?projectId=${projectId}${boardId ? `&boardId=${boardId}` : ''}`),
      ]);

      const selectedBoard = boardId
        ? boardResponse.data.find((item) => (item.id || item._id) === boardId)
        : boardResponse.data[0];

      setBoard(selectedBoard || null);
      onBoardLoaded?.(selectedBoard || null);
      setTasks(taskResponse.data);
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos cargar el tablero del proyecto.'));
    } finally {
      setLoading(false);
    }
  }, [boardId, onBoardLoaded, projectId]);

  useEffect(() => {
    loadBoardData();
  }, [loadBoardData]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = !filters.search
        || task.title.toLowerCase().includes(filters.search.toLowerCase())
        || task.description?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesPriority = !filters.priority || task.priority === filters.priority;
      const matchesType = !filters.type || task.type === filters.type;
      return matchesSearch && matchesPriority && matchesType;
    });
  }, [filters, tasks]);

  const handleInviteMember = async (event) => {
    event.preventDefault();
    setFeedback('');

    try {
      await apiClient.post(`/projects/${projectId}/members`, { email: inviteEmail });
      setInviteEmail('');
      setFeedback('Miembro agregado al proyecto.');
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos agregar al miembro.'));
    }
  };

  const handleStatusChange = async (event) => {
    const nextStatus = event.target.value;

    try {
      const { data } = await apiClient.patch(`/projects/${projectId}`, { status: nextStatus });
      onProjectUpdated(data.project || data);
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos actualizar el estado del proyecto.'));
    }
  };

  if (loading) {
    return (
      <section className="glass-panel empty-state">
        <h3>Cargando tablero...</h3>
        <p>Estamos trayendo columnas, tareas y metricas del proyecto seleccionado.</p>
      </section>
    );
  }

  if (!board) {
    return (
      <section className="glass-panel empty-state">
        <h3>No hay tablero disponible.</h3>
        <p>Este proyecto no devolvio un tablero por defecto desde el backend.</p>
      </section>
    );
  }

  return (
    <section className="workspace-board">
      <section className="glass-panel board-topbar">
        <div>
          <span className="eyebrow">Tablero</span>
          <h3>{board.name}</h3>
          <p>{project.name}</p>
        </div>

        <div className="board-actions">
          <label>
            Estado
            <select value={project.status} onChange={handleStatusChange} disabled={project.isArchived}>
              {projectStatusOptions
                .filter((option) => option.value !== 'ARCHIVADO')
                .map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
          </label>

          <form className="invite-form" onSubmit={handleInviteMember}>
            <input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="Invitar por correo"
              disabled={project.isArchived}
            />
            <button className="secondary-button" type="submit" disabled={!inviteEmail || project.isArchived}>
              Agregar
            </button>
          </form>
        </div>
      </section>

      <ProjectDashboard board={board} tasks={tasks} />
      <TaskFilters filters={filters} setFilters={setFilters} />
      {feedback && <p className="form-helper board-feedback">{feedback}</p>}

      <section className="board-columns">
        {board.columns.map((column, index) => {
          const columnTasks = filteredTasks.filter((task) => task.columnId === column._id);
          const isWipExceeded = column.wipLimit > 0 && columnTasks.length > column.wipLimit;

          return (
            <article key={column._id} className={isWipExceeded ? 'kanban-column column-alert' : 'kanban-column'}>
              <header className="column-header">
                <div>
                  <strong>{column.title}</strong>
                  <span>{columnTasks.length} tareas</span>
                </div>
                <span className="role-pill">WIP {column.wipLimit || 'Sin limite'}</span>
              </header>

              {index === 0 && !project.isArchived && (
                <CreateTask
                  projectId={projectId}
                  boardId={board._id}
                  columnId={column._id}
                  onTaskCreated={loadBoardData}
                />
              )}

              <div className="task-stack">
                {columnTasks.length ? (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      columns={board.columns}
                      projectArchived={project.isArchived}
                      onTaskUpdated={loadBoardData}
                    />
                  ))
                ) : (
                  <p className="empty-column">Sin tareas en esta columna.</p>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </section>
  );
};

export default KanbanBoard;
