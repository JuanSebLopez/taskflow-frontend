import React, { useState } from 'react';
import apiClient, { getApiErrorMessage } from '../api/apiClient';

const CreateTask = ({ columnId, onCancel, onTaskCreated, projectId, boardId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'TASK',
    priority: 'MEDIA',
    estimatedHours: '',
    dueDate: '',
    labelsText: '',
  });
  const [feedback, setFeedback] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const buildLabels = () => {
    return formData.labelsText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((name, index) => ({
        name,
        color: ['#2563eb', '#ea580c', '#16a34a', '#7c3aed'][index % 4],
      }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback('');

    try {
      await apiClient.post('/tasks', {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined,
        dueDate: formData.dueDate || undefined,
        labels: buildLabels(),
        project: projectId,
        board: boardId,
        columnId,
      });

      setFormData({
        title: '',
        description: '',
        type: 'TASK',
        priority: 'MEDIA',
        estimatedHours: '',
        dueDate: '',
        labelsText: '',
      });
      onTaskCreated();
      onCancel?.();
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos crear la tarea.'));
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label>
        Titulo
        <input
          name="title"
          type="text"
          placeholder="Titulo de la tarea"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Descripcion
        <textarea
          name="description"
          rows="4"
          placeholder="Descripcion breve"
          value={formData.description}
          onChange={handleChange}
        />
      </label>

      <div className="field-row compact-row">
        <label>
          Tipo
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="TASK">Task</option>
            <option value="FEATURE">Feature</option>
            <option value="BUG">Bug</option>
            <option value="IMPROVEMENT">Improvement</option>
          </select>
        </label>

        <label>
          Prioridad
          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="URGENTE">Urgente</option>
          </select>
        </label>
      </div>

      <div className="field-row compact-row">
        <label>
          Horas estimadas
          <input name="estimatedHours" type="number" min="0" value={formData.estimatedHours} onChange={handleChange} />
        </label>

        <label>
          Fecha limite
          <input name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />
        </label>
      </div>

      <label>
        Labels (separadas por coma)
        <input
          name="labelsText"
          type="text"
          value={formData.labelsText}
          onChange={handleChange}
          placeholder="backend, urgente"
        />
      </label>

      {feedback && <p className="form-error">{feedback}</p>}
      <div className="task-modal-actions">
        {onCancel && (
          <button className="ghost-button" type="button" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button className="primary-button" type="submit">Crear tarea</button>
      </div>
    </form>
  );
};

export default CreateTask;
