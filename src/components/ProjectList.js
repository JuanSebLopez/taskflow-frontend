import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient, { getApiErrorMessage } from '../api/apiClient';
import { getProjectStatusLabel } from '../utils/enumLabels';
import { getProjectId } from '../utils/projectPermissions';

const ProjectList = ({
  eyebrow = 'Workspace',
  title = 'Mis proyectos',
  maxItems,
  onSelectProject,
  onProjectsLoaded,
  selectedProjectId,
  showSearch = true,
}) => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const visibleProjects = useMemo(() => {
    const sortedProjects = [...projects].sort((first, second) => {
      return new Date(second.updatedAt || second.createdAt || 0) - new Date(first.updatedAt || first.createdAt || 0);
    });
    const scopedProjects = maxItems ? sortedProjects.slice(0, maxItems) : sortedProjects;
    const query = searchTerm.trim().toLowerCase();

    if (!query || !showSearch) {
      return scopedProjects;
    }

    return scopedProjects.filter((project) => {
      return project.name?.toLowerCase().includes(query)
        || project.description?.toLowerCase().includes(query)
        || project.owner?.fullName?.toLowerCase().includes(query)
        || project.owner?.email?.toLowerCase().includes(query);
    });
  }, [maxItems, projects, searchTerm, showSearch]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await apiClient.get('/projects');
      setProjects(data);
      onProjectsLoaded?.(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No pudimos cargar los proyectos.'));
    } finally {
      setLoading(false);
    }
  }, [onProjectsLoaded]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <section className="glass-panel project-list-panel">
      <div className="panel-heading rail-heading">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h3>{title}</h3>
        </div>
        <span className="role-pill">{maxItems ? visibleProjects.length : projects.length}</span>
      </div>

      {showSearch && (
        <label className="project-search">
          Buscar proyecto
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nombre, descripcion u owner"
          />
        </label>
      )}

      {loading ? (
        <p className="form-helper">Cargando proyectos...</p>
      ) : (
        <div className="project-list">
          {visibleProjects.length ? visibleProjects.map((project) => {
            const projectId = getProjectId(project);
            const ownerLabel = project.owner?.fullName || project.owner?.email || 'Sin owner visible';

            return (
            <article
              key={projectId}
              className={selectedProjectId === projectId ? 'project-card selected' : 'project-card'}
            >
              <button className="project-select" type="button" onClick={() => onSelectProject(project)}>
                <div>
                  <div className="project-card-header">
                    <strong>{project.name}</strong>
                    <span className="status-pill">{getProjectStatusLabel(project.status)}</span>
                  </div>
                  <p>{project.description || 'Sin descripcion por ahora.'}</p>
                  <span className="project-owner">Owner: {ownerLabel}</span>
                </div>

                <div className="project-meta">
                  <span>Progreso {project.progress || 0}%</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${project.progress || 0}%` }} />
                  </div>
                </div>
              </button>

            </article>
            );
          }) : (
            <section className="rail-empty">
              <strong>{projects.length ? 'Sin resultados' : 'Sin proyectos todavia'}</strong>
              <p>{projects.length ? 'Ajusta la busqueda para encontrar otro proyecto.' : 'Crea el primero para abrir un tablero Kanban automaticamente.'}</p>
            </section>
          )}
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
    </section>
  );
};

export default ProjectList;
