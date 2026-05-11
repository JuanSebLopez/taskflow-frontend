import React, { useMemo, useState } from 'react';
import CreateProject from '../../components/CreateProject';
import { getProjectStatusLabel, projectStatusOptions } from '../../utils/enumLabels';
import { getProjectId } from '../../utils/projectPermissions';

const WorkspaceHome = ({ projects, projectStats, onProjectCreated, onSelectProject }) => {
  const [projectQuery, setProjectQuery] = useState('');
  const [filterType, setFilterType] = useState('name');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortMode, setSortMode] = useState('recent');

  const allProjects = useMemo(() => {
    const sortedProjects = [...projects];

    if (sortMode === 'progress') {
      sortedProjects.sort((first, second) => (second.progress || 0) - (first.progress || 0));
      return sortedProjects;
    }

    return sortedProjects.sort((first, second) => {
      return new Date(second.updatedAt || second.createdAt || 0) - new Date(first.updatedAt || first.createdAt || 0);
    });
  }, [projects, sortMode]);

  const filteredProjects = useMemo(() => {
    const query = projectQuery.trim().toLowerCase();

    return allProjects.filter((project) => {
      if (filterType === 'status') {
        return !statusFilter || project.status === statusFilter;
      }

      if (!query) {
        return true;
      }

      if (filterType === 'owner') {
        return project.owner?.fullName?.toLowerCase().includes(query)
          || project.owner?.email?.toLowerCase().includes(query);
      }

      return project.name?.toLowerCase().includes(query);
    });
  }, [allProjects, filterType, projectQuery, statusFilter]);

  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
    setProjectQuery('');
    setStatusFilter('');
  };

  const averageProgress = useMemo(() => {
    if (!projects.length) {
      return 0;
    }

    const totalProgress = projects.reduce((sum, project) => sum + (project.progress || 0), 0);
    return Math.round(totalProgress / projects.length);
  }, [projects]);

  return (
    <section className="home-dashboard">
      <section className="home-section dashboard-overview">
        <div>
          <span className="eyebrow">Resumen general</span>
          <h2>Actividad del workspace</h2>
          <p>Una vista rapida del estado general antes de entrar al detalle de un proyecto.</p>
        </div>

        <div className="home-metrics">
          <article>
            <strong>{projectStats.total}</strong>
            <span>Proyectos</span>
          </article>
          <article>
            <strong>{projectStats.active}</strong>
            <span>Activos</span>
          </article>
          <article>
            <strong>{projectStats.completed}</strong>
            <span>Completados</span>
          </article>
          <article>
            <strong>{averageProgress}%</strong>
            <span>Progreso promedio</span>
          </article>
        </div>
      </section>

      <section className="home-grid">
        <section className="home-section recent-projects-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Directorio</span>
              <h3>Todos los proyectos</h3>
            </div>
          </div>

          <div className="directory-filters">
            {filterType === 'status' ? (
              <label>
                Estado
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="">Todos</option>
                  {projectStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="project-search home-project-search">
                Buscar
                <input
                  type="search"
                  value={projectQuery}
                  onChange={(event) => setProjectQuery(event.target.value)}
                  placeholder={filterType === 'owner' ? 'Nombre o correo del owner' : 'Nombre del proyecto'}
                />
              </label>
            )}

            <label>
              Filtrar por
              <select value={filterType} onChange={handleFilterTypeChange}>
                <option value="name">Nombre de proyecto</option>
                <option value="owner">Owner</option>
                <option value="status">Estado</option>
              </select>
            </label>

            <label>
              Orden
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                <option value="recent">Recientes</option>
                <option value="progress">Progreso</option>
              </select>
            </label>
          </div>

          <div className="recent-project-list">
            {filteredProjects.length ? filteredProjects.map((project) => {
              const ownerLabel = project.owner?.fullName || project.owner?.email || 'Sin owner visible';

              return (
                <button
                  key={getProjectId(project)}
                  className="recent-project-card"
                  type="button"
                  onClick={() => onSelectProject(project)}
                >
                  <div>
                    <strong>{project.name}</strong>
                    <p>{project.description || 'Sin descripcion.'}</p>
                    <span className="project-owner">Owner: {ownerLabel}</span>
                  </div>
                  <span className="status-pill">{getProjectStatusLabel(project.status)}</span>
                  <div className="project-meta">
                    <span>Progreso {project.progress || 0}%</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${project.progress || 0}%` }} />
                    </div>
                  </div>
                </button>
              );
            }) : (
              <section className="rail-empty">
                <strong>{projects.length ? 'Sin resultados' : 'Sin proyectos'}</strong>
                <p>{projects.length ? 'Ajusta la busqueda para encontrar otro proyecto.' : 'Crea un proyecto para empezar a ver actividad aqui.'}</p>
              </section>
            )}
          </div>
        </section>

        <CreateProject onProjectCreated={onProjectCreated} />
      </section>
    </section>
  );
};

export default WorkspaceHome;
