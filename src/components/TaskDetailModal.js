import React, { useEffect, useMemo, useState } from 'react';
import apiClient, { getApiErrorMessage } from '../api/apiClient';
import TaskHistory from './TaskHistory';

const getTaskId = (task) => task?.id || task?._id;

const TaskDetailModal = ({ loading = false, onClose, onTaskChanged, projectArchived, task }) => {
  const taskId = getTaskId(task);
  const [comment, setComment] = useState('');
  const [editData, setEditData] = useState({
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'MEDIA',
    type: task.type || 'TASK',
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    estimatedHours: task.estimatedHours || 0,
    labelsText: (task.labels || []).map((label) => label.name).join(', '),
  });
  const [hours, setHours] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');

  useEffect(() => {
    setEditData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'MEDIA',
      type: task.type || 'TASK',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      estimatedHours: task.estimatedHours || 0,
      labelsText: (task.labels || []).map((label) => label.name).join(', '),
    });
  }, [task]);

  const totalHours = useMemo(() => {
    return (task.timeLogs || []).reduce((sum, item) => sum + (item.hours || 0), 0);
  }, [task.timeLogs]);

  const completedSubtasks = useMemo(() => {
    return (task.subtasks || []).filter((item) => item.isCompleted).length;
  }, [task.subtasks]);

  const runTaskAction = async (request, successMessage, reset = () => {}) => {
    setFeedback('');
    setSaving(true);

    try {
      await request();
      reset();
      await onTaskChanged(taskId);
      setFeedback(successMessage);
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos actualizar la tarea.'));
    } finally {
      setSaving(false);
    }
  };

  const buildLabels = () => {
    return editData.labelsText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((name, index) => ({
        name,
        color: ['#2563eb', '#ea580c', '#16a34a', '#7c3aed'][index % 4],
      }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditData((current) => ({ ...current, [name]: value }));
  };

  const handleSaveTask = () => runTaskAction(
    () => apiClient.patch(`/tasks/${taskId}`, {
      title: editData.title,
      description: editData.description,
      priority: editData.priority,
      type: editData.type,
      dueDate: editData.dueDate || undefined,
      estimatedHours: Number(editData.estimatedHours) || 0,
      labels: buildLabels(),
    }),
    'Tarea actualizada.',
    () => setIsEditing(false),
  );

  const handleAddComment = () => runTaskAction(
    () => apiClient.post(`/tasks/${taskId}/comments`, { content: comment }),
    'Comentario agregado.',
    () => setComment(''),
  );

  const handleAddTime = () => runTaskAction(
    () => apiClient.post(`/tasks/${taskId}/time-logs`, { hours: Number(hours), note }),
    'Tiempo registrado.',
    () => {
      setHours('');
      setNote('');
    },
  );

  const handleUploadFiles = () => runTaskAction(
    () => {
      const payload = new FormData();
      files.forEach((file) => payload.append('files', file));
      return apiClient.post(`/tasks/${taskId}/attachments`, payload);
    },
    'Adjuntos cargados.',
    () => setFiles([]),
  );

  const handleDeleteAttachment = (attachmentId) => runTaskAction(
    () => apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`),
    'Adjunto eliminado.',
  );

  const handleAddSubtask = () => runTaskAction(
    () => apiClient.post(`/tasks/${taskId}/subtasks`, { title: subtaskTitle }),
    'Subtarea agregada.',
    () => setSubtaskTitle(''),
  );

  const handleToggleSubtask = (subtask) => runTaskAction(
    () => apiClient.patch(`/tasks/${taskId}/subtasks/${subtask.id || subtask._id}`, { isCompleted: !subtask.isCompleted }),
    subtask.isCompleted ? 'Subtarea reabierta.' : 'Subtarea completada.',
  );

  const handleStartEditSubtask = (subtask) => {
    setEditingSubtaskId(subtask.id || subtask._id);
    setEditingSubtaskTitle(subtask.title || '');
  };

  const handleSaveSubtask = (subtask) => runTaskAction(
    () => apiClient.patch(`/tasks/${taskId}/subtasks/${subtask.id || subtask._id}`, { title: editingSubtaskTitle }),
    'Subtarea actualizada.',
    () => {
      setEditingSubtaskId(null);
      setEditingSubtaskTitle('');
    },
  );

  const handleDeleteSubtask = (subtask) => runTaskAction(
    () => apiClient.delete(`/tasks/${taskId}/subtasks/${subtask.id || subtask._id}`),
    'Subtarea eliminada.',
  );

  return (
    <div className="modal-backdrop task-detail-backdrop" role="presentation" onClick={onClose}>
      <section
        className="task-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="task-detail-header">
          <div>
            <span className="eyebrow">{task.type}</span>
            {loading && <p className="form-helper">Cargando detalle completo...</p>}
            {isEditing ? (
              <div className="task-edit-header">
                <label>
                  Titulo
                  <input name="title" value={editData.title} onChange={handleEditChange} />
                </label>
                <label>
                  Descripcion
                  <textarea name="description" rows="3" value={editData.description} onChange={handleEditChange} />
                </label>
              </div>
            ) : (
              <>
                <h2 id="task-detail-title">{task.title}</h2>
                <p>{task.description || 'Sin descripcion.'}</p>
              </>
            )}
          </div>
          <div className="task-detail-header-actions">
            {!projectArchived && (
              <button className="ghost-button compact-action" type="button" onClick={() => setIsEditing((value) => !value)}>
                {isEditing ? 'Cancelar edicion' : 'Editar'}
              </button>
            )}
            <button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar detalle">
              x
            </button>
          </div>
        </header>

        {isEditing && (
          <section className="task-detail-section task-edit-panel">
            <div className="task-edit-grid">
              <label>
                Tipo
                <select name="type" value={editData.type} onChange={handleEditChange}>
                  <option value="TASK">Task</option>
                  <option value="FEATURE">Feature</option>
                  <option value="BUG">Bug</option>
                  <option value="IMPROVEMENT">Improvement</option>
                </select>
              </label>
              <label>
                Prioridad
                <select name="priority" value={editData.priority} onChange={handleEditChange}>
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </label>
              <label>
                Fecha limite
                <input name="dueDate" type="date" value={editData.dueDate} onChange={handleEditChange} />
              </label>
              <label>
                Horas estimadas
                <input name="estimatedHours" type="number" min="0" value={editData.estimatedHours} onChange={handleEditChange} />
              </label>
            </div>
            <label>
              Etiquetas
              <input name="labelsText" value={editData.labelsText} onChange={handleEditChange} placeholder="frontend, urgente" />
            </label>
            <button className="primary-button compact-action" type="button" onClick={handleSaveTask} disabled={saving || !editData.title.trim()}>
              Guardar cambios
            </button>
          </section>
        )}

        <div className="task-detail-meta">
          <article>
            <span>Prioridad</span>
            <strong>{task.priority}</strong>
          </article>
          <article>
            <span>Fecha limite</span>
            <strong>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin limite'}</strong>
          </article>
          <article>
            <span>Estimado</span>
            <strong>{task.estimatedHours || 0}h</strong>
          </article>
          <article>
            <span>Subtareas</span>
            <strong>{completedSubtasks}/{task.subtasks?.length || 0}</strong>
          </article>
          <article>
            <span>Tiempo</span>
            <strong>{totalHours.toFixed(1)}h</strong>
          </article>
        </div>

        <div className="task-detail-grid">
          <div className="task-detail-main">
            <section className="task-detail-section">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Checklist</span>
                  <h3>Subtareas</h3>
                </div>
                <span className="role-pill">{completedSubtasks}/{task.subtasks?.length || 0}</span>
              </div>

              <div className="subtask-progress" aria-label="Progreso de subtareas">
                <span style={{ width: `${task.subtaskProgress || 0}%` }} />
              </div>

              <div className="subtask-list">
                {task.subtasks?.length ? task.subtasks.map((subtask) => {
                  const subtaskId = subtask.id || subtask._id;
                  const isEditingSubtask = editingSubtaskId === subtaskId;

                  return (
                    <article className={`subtask-item ${subtask.isCompleted ? 'is-completed' : ''}`} key={subtaskId}>
                      <label className="subtask-check">
                        <input
                          type="checkbox"
                          checked={Boolean(subtask.isCompleted)}
                          onChange={() => handleToggleSubtask(subtask)}
                          disabled={saving || projectArchived}
                        />
                        {isEditingSubtask ? (
                          <input
                            value={editingSubtaskTitle}
                            onChange={(event) => setEditingSubtaskTitle(event.target.value)}
                            aria-label="Titulo de subtarea"
                          />
                        ) : (
                          <span>{subtask.title}</span>
                        )}
                      </label>

                      {!projectArchived && (
                        <div className="subtask-actions">
                          {isEditingSubtask ? (
                            <>
                              <button
                                className="ghost-button compact-action"
                                type="button"
                                onClick={() => handleSaveSubtask(subtask)}
                                disabled={saving || !editingSubtaskTitle.trim()}
                              >
                                Guardar
                              </button>
                              <button
                                className="ghost-button compact-action"
                                type="button"
                                onClick={() => {
                                  setEditingSubtaskId(null);
                                  setEditingSubtaskTitle('');
                                }}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="ghost-button compact-action" type="button" onClick={() => handleStartEditSubtask(subtask)} disabled={saving}>
                                Editar
                              </button>
                              <button className="ghost-button compact-action danger-action" type="button" onClick={() => handleDeleteSubtask(subtask)} disabled={saving}>
                                Quitar
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </article>
                  );
                }) : <p className="form-helper">Aun no hay subtareas.</p>}
              </div>

              {!projectArchived && (
                <div className="subtask-create">
                  <label>
                    Nueva subtarea
                    <input value={subtaskTitle} onChange={(event) => setSubtaskTitle(event.target.value)} placeholder="Ej. Revisar criterios de aceptacion" />
                  </label>
                  <button className="secondary-button compact-action" type="button" onClick={handleAddSubtask} disabled={saving || !subtaskTitle.trim()}>
                    Agregar
                  </button>
                </div>
              )}
            </section>

            <section className="task-detail-section task-discussion">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Discusion</span>
                <h3>Comentarios</h3>
              </div>
              <span className="role-pill">{task.comments?.length || 0}</span>
            </div>

            <div className="task-comments-list">
              {task.comments?.length ? task.comments.map((item) => (
                <article className="comment-item" key={item.id || item._id || item.createdAt}>
                  <strong>{item.author?.fullName || item.authorName || 'Comentario'}</strong>
                  <p>{item.content}</p>
                  <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</span>
                </article>
              )) : <p className="form-helper">Aun no hay comentarios.</p>}
            </div>

            {!projectArchived && (
              <label>
                Nuevo comentario
                <textarea
                  rows="4"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Agrega contexto, decisiones o bloqueos..."
                />
              </label>
            )}

            {!projectArchived && (
              <button className="secondary-button compact-action" type="button" onClick={handleAddComment} disabled={!comment.trim() || saving}>
                Comentar
              </button>
            )}
            </section>
          </div>

          <aside className="task-detail-side">
            <section className="task-detail-section">
              <span className="eyebrow">Tiempo</span>
              <h3>Registrar horas</h3>
              <div className="task-time-form">
                <label>
                  Horas
                  <input type="number" min="0" step="0.5" value={hours} onChange={(event) => setHours(event.target.value)} />
                </label>
                <label>
                  Nota
                  <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Opcional" />
                </label>
              </div>
              <button className="secondary-button compact-action" type="button" onClick={handleAddTime} disabled={!hours || saving || projectArchived}>
                Guardar tiempo
              </button>
            </section>

            <section className="task-detail-section">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Archivos</span>
                  <h3>Adjuntos</h3>
                </div>
                <span className="role-pill">{task.attachments?.length || 0}</span>
              </div>

              <div className="attachment-list">
                {task.attachments?.length ? task.attachments.map((attachment) => (
                  <article key={attachment.id || attachment._id} className="attachment-item">
                    <div>
                      <strong>{attachment.originalName}</strong>
                      <span>{attachment.size ? `${Math.round(attachment.size / 1024)} KB` : ''}</span>
                    </div>
                    <button
                      className="ghost-button compact-action danger-action"
                      type="button"
                      onClick={() => handleDeleteAttachment(attachment.id || attachment._id)}
                      disabled={saving || projectArchived}
                    >
                      Quitar
                    </button>
                  </article>
                )) : <p className="form-helper">Sin adjuntos.</p>}
              </div>

              {!projectArchived && (
                <label>
                  Adjuntar archivos
                  <input type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} />
                </label>
              )}
              {!projectArchived && (
                <button className="secondary-button compact-action" type="button" onClick={handleUploadFiles} disabled={!files.length || saving}>
                  Subir adjuntos
                </button>
              )}
            </section>

            <section className="task-detail-section">
              <span className="eyebrow">Historial</span>
              <h3>Actividad de la tarea</h3>
              <TaskHistory task={task} />
            </section>
          </aside>
        </div>

        {feedback && <p className="form-helper">{feedback}</p>}
      </section>
    </div>
  );
};

export default TaskDetailModal;
