import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient, { getApiErrorMessage } from '../api/apiClient';
import ColumnManager from './ColumnManager';
import CreateTask from './CreateTask';
import ProjectDashboard from './ProjectDashboard';
import TaskCard from './TaskCard';
import TaskDetailModal from './TaskDetailModal';
import TaskFilters from './TaskFilters';
import { projectStatusOptions } from '../utils/enumLabels';
import { getProjectId, getProjectPermissions } from '../utils/projectPermissions';
import { useAuth } from '../context/AuthContext';

const initialFilters = {
  search: '',
  searchBy: 'title',
  priority: '',
  type: '',
};

const getBoardId = (board) => board?.id || board?._id;
const getColumnId = (column) => column?.id || column?._id;
const getTaskId = (task) => task?.id || task?._id;

const KanbanBoard = ({ boardId, project, onBoardLoaded, onProjectUpdated }) => {
  const { user } = useAuth();
  const projectId = getProjectId(project);
  const permissions = getProjectPermissions({ user, project });
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [inviteEmail, setInviteEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [draggingTaskId, setDraggingTaskId] = useState('');
  const [dropColumnId, setDropColumnId] = useState('');
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
  const [isTaskDetailLoading, setIsTaskDetailLoading] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadBoardData = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
      setFeedback('');
    }

    try {
      const [boardResponse, taskResponse] = await Promise.all([
        apiClient.get(`/boards/project/${projectId}`),
        apiClient.get(`/tasks?projectId=${projectId}${boardId ? `&boardId=${boardId}` : ''}`),
      ]);

      const selectedBoard = boardId
        ? boardResponse.data.find((item) => getBoardId(item) === boardId)
        : boardResponse.data[0];

      setBoard(selectedBoard || null);
      onBoardLoaded?.(selectedBoard || null);
      setTasks(taskResponse.data);
      return { board: selectedBoard || null, tasks: taskResponse.data };
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos cargar el tablero del proyecto.'));
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, [boardId, onBoardLoaded, projectId]);

  useEffect(() => {
    loadBoardData({ silent: false });
  }, [loadBoardData]);

  const refreshBoardData = useCallback(() => {
    return loadBoardData({ silent: true });
  }, [loadBoardData]);

  const handleBoardChanged = (updatedBoard) => {
    setBoard(updatedBoard);
    onBoardLoaded?.(updatedBoard);
    refreshBoardData();
  };

  const handleTaskDetailChanged = async (taskId) => {
    const [taskResponse] = await Promise.all([
      apiClient.get(`/tasks/${taskId}`),
      refreshBoardData(),
    ]);
    const updatedTask = taskResponse.data.task || taskResponse.data;

    if (updatedTask) {
      setSelectedTask(updatedTask);
    }
  };

  const handleOpenTaskDetails = async (task) => {
    const taskId = getTaskId(task);
    setSelectedTask(task);
    setIsTaskDetailLoading(true);
    setFeedback('');

    try {
      const { data } = await apiClient.get(`/tasks/${taskId}`);
      setSelectedTask(data.task || data);
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos cargar el detalle de la tarea.'));
    } finally {
      setIsTaskDetailLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const query = filters.search.trim().toLowerCase();
      const matchesSearch = !query
        || (filters.searchBy === 'assignee'
          ? task.assignees?.some((assignee) => `${assignee.fullName || ''} ${assignee.email || ''}`.toLowerCase().includes(query))
          : filters.searchBy === 'label'
            ? task.labels?.some((label) => label.name?.toLowerCase().includes(query))
            : task.title.toLowerCase().includes(query));
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

  const handleTaskDrop = async (columnId) => {
    const task = tasks.find((item) => getTaskId(item) === draggingTaskId);
    setDropColumnId('');

    if (!task || task.columnId === columnId || project.isArchived) {
      setDraggingTaskId('');
      return;
    }

    try {
      await apiClient.post(`/tasks/${getTaskId(task)}/move`, { toColumnId: columnId });
      setFeedback('Tarea movida correctamente.');
      await refreshBoardData();
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos mover la tarea.'));
    } finally {
      setDraggingTaskId('');
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

  if (isInitialLoading) {
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

      <section className="glass-panel board-workbench">
        <div className="board-workbench-header">
          <div>
            <span className="eyebrow">Tareas</span>
            <h3>Trabajo del tablero</h3>
          </div>
          {isRefreshing && <span className="role-pill">Actualizando...</span>}
          <div className="board-workbench-actions">
            {permissions.canManageBoard && (
              <button
                className="ghost-button compact-action"
                type="button"
                onClick={() => setIsColumnManagerOpen((value) => !value)}
              >
                Columnas
              </button>
            )}
            <button
              className="primary-button compact-action"
              type="button"
              onClick={() => setIsTaskModalOpen(true)}
              disabled={project.isArchived}
            >
              + Nueva tarea
            </button>
          </div>
        </div>

        <TaskFilters filters={filters} setFilters={setFilters} />

        {isColumnManagerOpen && permissions.canManageBoard && (
          <ColumnManager
            board={board}
            tasks={tasks}
            onBoardChanged={handleBoardChanged}
            onClose={() => setIsColumnManagerOpen(false)}
          />
        )}
      </section>

      {feedback && <p className="form-helper board-feedback">{feedback}</p>}

      <section className="board-columns">
        {board.columns.map((column) => {
          const columnId = getColumnId(column);
          const columnTasks = filteredTasks.filter((task) => task.columnId === columnId);
          const isWipExceeded = column.wipLimit > 0 && columnTasks.length > column.wipLimit;

          return (
            <article
              key={columnId}
              className={[
                isWipExceeded ? 'kanban-column column-alert' : 'kanban-column',
                dropColumnId === columnId ? 'column-drop-target' : '',
              ].filter(Boolean).join(' ')}
              onDragOver={(event) => {
                event.preventDefault();
                setDropColumnId(columnId);
              }}
              onDragLeave={() => setDropColumnId('')}
              onDrop={() => handleTaskDrop(columnId)}
            >
              <header className="column-header">
                <div>
                  <strong>{column.title}</strong>
                  <span>{columnTasks.length} tareas</span>
                </div>
                <span className="role-pill">WIP {column.wipLimit || 'Sin limite'}</span>
              </header>

              <div className="task-stack">
                {columnTasks.length ? (
                  columnTasks.map((task) => (
                    <div
                      key={getTaskId(task)}
                      draggable={!project.isArchived}
                      onDragStart={() => setDraggingTaskId(getTaskId(task))}
                    >
                      <TaskCard
                        task={task}
                        columns={board.columns}
                        onOpenDetails={handleOpenTaskDetails}
                        projectArchived={project.isArchived}
                        onTaskUpdated={refreshBoardData}
                      />
                    </div>
                  ))
                ) : (
                  <p className="empty-column">{draggingTaskId ? 'Suelta aqui para mover la tarea.' : 'Sin tareas en esta columna.'}</p>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {isTaskModalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsTaskModalOpen(false)}>
          <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="create-task-title" onClick={(event) => event.stopPropagation()}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Nueva tarea</span>
                <h3 id="create-task-title">Crear tarea</h3>
              </div>
              <button className="icon-button" type="button" onClick={() => setIsTaskModalOpen(false)} aria-label="Cerrar modal">
                x
              </button>
            </div>
            <CreateTask
              projectId={projectId}
              boardId={getBoardId(board)}
              columnId={getColumnId(board.columns[0])}
              onCancel={() => setIsTaskModalOpen(false)}
              onTaskCreated={refreshBoardData}
            />
          </section>
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          loading={isTaskDetailLoading}
          projectArchived={project.isArchived}
          onClose={() => setSelectedTask(null)}
          onTaskChanged={handleTaskDetailChanged}
        />
      )}
    </section>
  );
};

export default KanbanBoard;
