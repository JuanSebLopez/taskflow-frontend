import React, { useState } from 'react';
import apiClient, { getApiErrorMessage } from '../../api/apiClient';
import ProjectAuditLog from '../../components/ProjectAuditLog';
import { useAuth } from '../../context/AuthContext';
import { getProjectStatusLabel, projectStatusOptions } from '../../utils/enumLabels';
import { getProjectId, getProjectPermissions } from '../../utils/projectPermissions';

const ProjectSettings = ({ onProjectUpdated, project }) => {
  const { user } = useAuth();
  const projectId = getProjectId(project);
  const permissions = getProjectPermissions({ user, project });
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    status: project.status || 'PLANIFICADO',
    startDate: project.startDate ? project.startDate.slice(0, 10) : '',
    estimatedEndDate: project.estimatedEndDate ? project.estimatedEndDate.slice(0, 10) : '',
  });
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback('');
    setIsSaving(true);

    try {
      const { data } = await apiClient.patch(`/projects/${projectId}`, {
        ...formData,
        startDate: formData.startDate || undefined,
        estimatedEndDate: formData.estimatedEndDate || undefined,
      });
      onProjectUpdated(data.project || data);
      setFeedback('Proyecto actualizado correctamente.');
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos actualizar el proyecto.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="project-settings">
      <section className="project-overview-panel project-overview-header">
        <div>
          <span className="eyebrow">Ajustes</span>
          <h2>Configuracion del proyecto</h2>
          <p>Edita datos generales y estado del proyecto seleccionado.</p>
        </div>
        <span className="status-pill">{getProjectStatusLabel(project.status)}</span>
      </section>

      <form className="project-overview-panel project-settings-form" onSubmit={handleSubmit}>
        <div className="profile-form-grid">
          <label>
            Nombre
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>
          <label>
            Estado
            <select name="status" value={formData.status} onChange={handleChange} disabled={project.isArchived}>
              {projectStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Descripcion
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange} />
        </label>

        <div className="profile-form-grid">
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
        <button className="primary-button" type="submit" disabled={isSaving || project.isArchived}>
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      {permissions.canViewAudit && (
        <ProjectAuditLog
          projectId={projectId}
          showFilters
          title="Auditoria del proyecto"
          subtitle="Eventos completos de gestion, tableros y tareas de este proyecto."
        />
      )}
    </section>
  );
};

export default ProjectSettings;
