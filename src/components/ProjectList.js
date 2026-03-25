import React, { useEffect, useState } from 'react';
import apiClient, { getApiErrorMessage } from '../api/apiClient';

const ProjectList = ({ onSelectProject, onProjectArchived, selectedProjectId }) => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await apiClient.get('/projects');
      setProjects(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No pudimos cargar los proyectos.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleArchive = async (projectId) => {
    try {
      await apiClient.post(`/projects/${projectId}/archive`);
      await loadProjects();
      onProjectArchived(projectId);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No pudimos archivar el proyecto.'));
    }
  };

  return (
    <section className="glass-panel project-list-panel">
      <div className="panel-heading">
        <span className="eyebrow">Workspace</span>
        <h3>Mis proyectos</h3>
      </div>

      {loading ? (
        <p className="form-helper">Cargando proyectos...</p>
      ) : (
        <div className="project-list">
          {projects.map((project) => (
            <article
              key={project._id}
              className={selectedProjectId === project._id ? 'project-card selected' : 'project-card'}
            >
              <button className="project-select" type="button" onClick={() => onSelectProject(project)}>
                <div>
                  <div className="project-card-header">
                    <strong>{project.name}</strong>
                    <span className="status-pill">{project.status}</span>
                  </div>
                  <p>{project.description || 'Sin descripcion por ahora.'}</p>
                </div>

                <div className="project-meta">
                  <span>Progreso {project.progress || 0}%</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${project.progress || 0}%` }} />
                  </div>
                </div>
              </button>

              {!project.isArchived && (
                <button className="ghost-button danger-text" type="button" onClick={() => handleArchive(project._id)}>
                  Archivar
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
    </section>
  );
};

export default ProjectList;
