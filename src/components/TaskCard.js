import React, { useMemo, useState } from 'react';
import apiClient, { getApiErrorMessage } from '../api/apiClient';
import TaskHistory from './TaskHistory';

const TaskCard = ({ task, columns, projectArchived, onTaskUpdated }) => {
  const [nextColumnId, setNextColumnId] = useState(task.columnId);
  const [comment, setComment] = useState('');
  const [hours, setHours] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [feedback, setFeedback] = useState('');

  const totalHours = useMemo(() => {
    return (task.timeLogs || []).reduce((sum, item) => sum + (item.hours || 0), 0);
  }, [task.timeLogs]);

  const overdue = task.dueDate && new Date(task.dueDate) < new Date() && !columns.find((column) => column._id === task.columnId)?.title.toLowerCase().includes('complet');
  const completedSubtasks = (task.subtasks || []).filter((item) => item.isCompleted).length;

  const runAction = async (request) => {
    setFeedback('');

    try {
      await request();
      setComment('');
      setHours('');
      onTaskUpdated();
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos ejecutar la accion.'));
    }
  };

  return (
    <article className={overdue ? 'task-card task-overdue' : 'task-card'}>
      <div className="task-topline">
        <span className="task-type">{task.type}</span>
        <span className="status-pill priority-pill">{task.priority}</span>
      </div>

      <h4>{task.title}</h4>
      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-meta-grid">
        <span>Responsables: {task.assignees?.length || 0}</span>
        <span>Subtareas: {completedSubtasks}/{task.subtasks?.length || 0}</span>
        <span>Tiempo: {totalHours.toFixed(1)}h</span>
        <span>Fecha: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin limite'}</span>
      </div>

      {!!task.labels?.length && (
        <div className="label-row">
          {task.labels.map((label) => (
            <span key={`${task._id}-${label.name}`} className="task-label" style={{ backgroundColor: label.color }}>
              {label.name}
            </span>
          ))}
        </div>
      )}

      {!projectArchived && (
        <div className="task-actions-stack">
          <div className="field-row compact-row">
            <label>
              Mover a
              <select value={nextColumnId} onChange={(event) => setNextColumnId(event.target.value)}>
                {columns.map((column) => (
                  <option key={column._id} value={column._id}>{column.title}</option>
                ))}
              </select>
            </label>
            <button
              className="secondary-button"
              type="button"
              onClick={() => runAction(() => apiClient.post(`/tasks/${task._id}/move`, { toColumnId: nextColumnId }))}
              disabled={nextColumnId === task.columnId}
            >
              Mover
            </button>
          </div>

          <div className="field-row compact-row">
            <label>
              Registrar horas
              <input type="number" min="0" step="0.5" value={hours} onChange={(event) => setHours(event.target.value)} />
            </label>
            <button
              className="secondary-button"
              type="button"
              onClick={() => runAction(() => apiClient.post(`/tasks/${task._id}/time-logs`, { hours: Number(hours) }))}
              disabled={!hours}
            >
              Guardar
            </button>
          </div>

          <label>
            Nuevo comentario
            <textarea rows="2" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Escribe una nota rapida" />
          </label>
          <div className="task-button-row">
            <button
              className="secondary-button"
              type="button"
              onClick={() => runAction(() => apiClient.post(`/tasks/${task._id}/comments`, { content: comment }))}
              disabled={!comment.trim()}
            >
              Comentar
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => runAction(() => apiClient.post(`/tasks/${task._id}/clone`, {}))}
            >
              Clonar
            </button>
          </div>
        </div>
      )}

      {!!task.comments?.length && (
        <div className="comment-list">
          {task.comments.slice(-2).map((item) => (
            <article key={item._id || item.createdAt} className="comment-item">
              <strong>{item.authorName || 'Comentario'}</strong>
              <p>{item.content}</p>
            </article>
          ))}
        </div>
      )}

      <button className="ghost-button history-toggle" type="button" onClick={() => setShowHistory((value) => !value)}>
        {showHistory ? 'Ocultar historial' : 'Ver historial'}
      </button>

      {showHistory && <TaskHistory task={task} />}
      {feedback && <p className="form-error">{feedback}</p>}
    </article>
  );
};

export default TaskCard;
