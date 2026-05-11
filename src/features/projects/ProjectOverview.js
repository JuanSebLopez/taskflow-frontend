import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { getApiErrorMessage } from '../../api/apiClient';
import ProjectAuditLog from '../../components/ProjectAuditLog';
import { getProjectId } from '../../utils/projectPermissions';

const getBoardId = (board) => board?.id || board?._id;

const ProjectOverview = ({ project, view = 'overview' }) => {
  const navigate = useNavigate();
  const projectId = getProjectId(project);
  const isBoardsView = view === 'boards';
  const [boards, setBoards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [boardQuery, setBoardQuery] = useState('');
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);

  const loadProjectWorkspace = useCallback(async () => {
    setLoading(true);
    setFeedback('');

    try {
      const [boardsResponse, tasksResponse] = await Promise.all([
        apiClient.get(`/boards/project/${projectId}`),
        apiClient.get(`/tasks?projectId=${projectId}`),
      ]);

      setBoards(boardsResponse.data);
      setTasks(tasksResponse.data);
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos cargar el resumen del proyecto.'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProjectWorkspace();
  }, [loadProjectWorkspace]);

  const summary = useMemo(() => {
    const completedColumnIds = new Set();
    boards.forEach((board) => {
      board.columns
        ?.filter((column) => column.title.toLowerCase().includes('complet'))
        .forEach((column) => completedColumnIds.add(column._id || column.id));
    });

    const completed = tasks.filter((task) => completedColumnIds.has(task.columnId)).length;
    const overdue = tasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date()).length;

    return {
      boards: boards.length,
      tasks: tasks.length,
      completed,
      overdue,
    };
  }, [boards, tasks]);

  const filteredBoards = useMemo(() => {
    const query = boardQuery.trim().toLowerCase();

    if (!query) {
      return boards;
    }

    return boards.filter((board) => board.name?.toLowerCase().includes(query));
  }, [boardQuery, boards]);

  const previewBoards = useMemo(() => {
    return [...boards]
      .sort((first, second) => new Date(second.updatedAt || second.createdAt || 0) - new Date(first.updatedAt || first.createdAt || 0))
      .slice(0, 3);
  }, [boards]);

  const handleCreateBoard = async (event) => {
    event.preventDefault();
    setFeedback('');
    setIsCreatingBoard(true);

    try {
      await apiClient.post(`/boards/project/${projectId}`, { name: newBoardName });
      setNewBoardName('');
      setIsCreateBoardOpen(false);
      await loadProjectWorkspace();
      setFeedback('Tablero creado correctamente.');
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos crear el tablero.'));
    } finally {
      setIsCreatingBoard(false);
    }
  };

  if (loading) {
    return (
      <section className="project-overview-panel">
        <p className="form-helper">Cargando resumen del proyecto...</p>
      </section>
    );
  }

  const renderBoardCard = (board, variant = 'default') => {
    const boardId = getBoardId(board);
    const boardTasks = tasks.filter((task) => task.board === boardId || task.boardId === boardId);

    return (
      <button
        key={boardId}
        className={variant === 'preview' ? 'board-summary-card board-preview-card' : 'board-summary-card'}
        type="button"
        onClick={() => navigate(`/app/projects/${projectId}/boards/${boardId}`)}
      >
        <div>
          <strong>{board.name}</strong>
          <p>{board.isDefault ? 'Tablero principal' : 'Tablero del proyecto'}</p>
        </div>
        <span className="role-pill">{board.columns?.length || 0} columnas</span>
        <div className="board-card-meta">
          <span>{boardTasks.length} tareas</span>
          <span>{board.createdAt ? new Date(board.createdAt).toLocaleDateString() : 'Sin fecha'}</span>
        </div>
      </button>
    );
  };

  if (!isBoardsView) {
    return (
      <section className="project-overview">
        <section className="project-overview-grid">
          <article>
            <strong>{summary.boards}</strong>
            <span>Tableros</span>
          </article>
          <article>
            <strong>{summary.tasks}</strong>
            <span>Tareas</span>
          </article>
          <article>
            <strong>{summary.completed}</strong>
            <span>Completadas</span>
          </article>
          <article>
            <strong>{summary.overdue}</strong>
            <span>Vencidas</span>
          </article>
        </section>

        <section className="project-overview-split">
          <ProjectAuditLog
            compact
            limit={5}
            projectId={projectId}
            title="Actividad reciente"
            subtitle="Ultimos movimientos del proyecto."
          />

          <section className="project-overview-panel boards-preview">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Tableros</span>
                <h3>Tableros recientes</h3>
                <p>Accede rapidamente a los espacios de trabajo del proyecto.</p>
              </div>
              <button
                className="primary-button compact-action"
                type="button"
                onClick={() => navigate(`/app/projects/${projectId}/boards`)}
              >
                Ver tableros
              </button>
            </div>

            <div className="board-preview-list">
              {previewBoards.length ? previewBoards.map((board) => renderBoardCard(board, 'preview')) : (
                <section className="rail-empty">
                  <strong>Sin tableros</strong>
                  <p>Crea un tablero para empezar a organizar tareas.</p>
                </section>
              )}
            </div>
          </section>
        </section>
      </section>
    );
  }

  return (
    <section className="project-overview">
      <section className="project-overview-panel boards-directory">
        <div className="panel-heading boards-heading">
          <div>
            <span className="eyebrow">Tableros</span>
            <h3>Espacios de trabajo del proyecto</h3>
          </div>
          <button
            className="primary-button compact-action"
            type="button"
            onClick={() => setIsCreateBoardOpen((value) => !value)}
            disabled={project.isArchived}
          >
            {isCreateBoardOpen ? 'Cancelar' : 'Nuevo tablero'}
          </button>
        </div>

        {isCreateBoardOpen && (
          <form className="inline-create-board" onSubmit={handleCreateBoard}>
            <label>
              Nombre del tablero
              <input
                value={newBoardName}
                onChange={(event) => setNewBoardName(event.target.value)}
                placeholder="Sprint actual, Backend, QA..."
                required
              />
            </label>
            <button className="primary-button" type="submit" disabled={isCreatingBoard}>
              {isCreatingBoard ? 'Creando...' : 'Crear'}
            </button>
          </form>
        )}

        <div className="board-directory-tools">
          <label>
            Buscar tablero
            <input
              type="search"
              value={boardQuery}
              onChange={(event) => setBoardQuery(event.target.value)}
              placeholder="Nombre del tablero"
            />
          </label>
          <span className="role-pill">{filteredBoards.length} visibles</span>
        </div>

        {feedback && <p className="form-helper">{feedback}</p>}

        <div className="board-card-grid">
          {filteredBoards.length ? filteredBoards.map((board) => renderBoardCard(board)) : (
            <section className="rail-empty">
              <strong>Sin resultados</strong>
              <p>Ajusta la busqueda o crea un nuevo tablero.</p>
            </section>
          )}
        </div>
      </section>
    </section>
  );
};

export default ProjectOverview;
