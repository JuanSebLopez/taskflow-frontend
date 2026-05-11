import React, { useState } from 'react';
import apiClient, { getApiErrorMessage } from '../api/apiClient';

const CreateProject = ({ onProjectCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    estimatedEndDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback('');

    try {
      const { data } = await apiClient.post('/projects', {
        ...formData,
        startDate: formData.startDate || undefined,
        estimatedEndDate: formData.estimatedEndDate || undefined,
      });
      setFormData({ name: '', description: '', startDate: '', estimatedEndDate: '' });
      setFeedback('Proyecto creado correctamente.');
      onProjectCreated(data.project || data);
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos crear el proyecto.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="glass-panel form-panel compact-panel">
      <div className="panel-heading">
        <span className="eyebrow">Proyectos</span>
        <h3>Nuevo proyecto</h3>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          Nombre
          <input name="name" type="text" value={formData.name} onChange={handleChange} required />
        </label>

        <label>
          Descripcion
          <textarea name="description" rows="3" value={formData.description} onChange={handleChange} />
        </label>

        <div className="field-row">
          <label>
            Inicio
            <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
          </label>

          <label>
            Fin estimado
            <input name="estimatedEndDate" type="date" value={formData.estimatedEndDate} onChange={handleChange} />
          </label>
        </div>

        {feedback && <p className="form-helper">{feedback}</p>}

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear proyecto'}
        </button>
      </form>
    </section>
  );
};

export default CreateProject;
