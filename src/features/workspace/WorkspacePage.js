import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import apiClient, { getApiErrorMessage } from '../../api/apiClient';
import AdminPanel from '../../components/AdminPanel';
import KanbanBoard from '../../components/KanbanBoard';
import NotificationBell from '../../components/NotificationBell';
import UserProfile from '../../components/UserProfile';
import { useAuth } from '../../context/AuthContext';
import { getProjectStatusLabel, getRoleLabel } from '../../utils/enumLabels';
import { getProjectId } from '../../utils/projectPermissions';
import ProjectOverview from '../projects/ProjectOverview';
import ProjectSettings from '../projects/ProjectSettings';
import WorkspaceHome from './WorkspaceHome';

const WorkspacePage = ({ section = 'workspace' }) => {
  const { user, logout, updateUser } = useAuth();
  const { boardId, projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [projectRefreshToken, setProjectRefreshToken] = useState(0);
  const [activeMenu, setActiveMenu] = useState(null);
  const [projectLoadError, setProjectLoadError] = useState('');

  const userInitials = useMemo(() => {
    return user.fullName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user.fullName]);

  const projectStats = useMemo(() => {
    return {
      total: projects.length,
      active: projects.filter((project) => !project.isArchived).length,
      completed: projects.filter((project) => project.status === 'COMPLETADO').length,
      archived: projects.filter((project) => project.isArchived || project.status === 'ARCHIVADO').length,
    };
  }, [projects]);

  const workspaceTitle = useMemo(() => {
    if (projectLoadError) {
      return projectLoadError;
    }

    if (!selectedProject) {
      return 'Selecciona un proyecto para revisar su tablero, avance y tareas.';
    }

    return selectedProject.description || 'Tablero Kanban listo para trabajar con tu equipo.';
  }, [projectLoadError, selectedProject]);

  const selectedProjectMeta = useMemo(() => {
    if (!selectedProject) {
      return [];
    }

    return [
      { label: 'Estado', value: getProjectStatusLabel(selectedProject.status) || 'Sin estado' },
      { label: 'Progreso', value: `${selectedProject.progress || 0}%` },
      { label: 'Miembros', value: selectedProject.memberCount ?? selectedProject.members?.length ?? 0 },
      {
        label: 'Fin estimado',
        value: selectedProject.estimatedEndDate
          ? new Date(selectedProject.estimatedEndDate).toLocaleDateString()
          : 'Sin fecha',
      },
    ];
  }, [selectedProject]);

  const isSettingsRoute = location.pathname.endsWith('/settings');

  const breadcrumbItems = useMemo(() => {
    if (section === 'admin') {
      return [{ label: 'Administracion' }];
    }

    if (section === 'profile') {
      return [{ label: 'Perfil' }];
    }

    if (!projectId || !selectedProject) {
      return [{ label: 'Proyectos', to: '/app' }];
    }

    if (boardId) {
      return [
        { label: 'Proyectos', to: '/app' },
        { label: selectedProject.name, to: `/app/projects/${projectId}` },
        { label: 'Tableros' },
        { label: selectedBoard?.name || 'Tablero' },
      ];
    }

    if (isSettingsRoute) {
      return [
        { label: 'Proyectos', to: '/app' },
        { label: selectedProject.name, to: `/app/projects/${projectId}` },
        { label: 'Ajustes' },
      ];
    }

    return [
      { label: 'Proyectos', to: '/app' },
      { label: selectedProject.name },
    ];
  }, [boardId, isSettingsRoute, projectId, section, selectedBoard?.name, selectedProject]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data } = await apiClient.get('/projects');
        setProjects(data);
      } catch (error) {
        setProjectLoadError(getApiErrorMessage(error, 'No pudimos cargar los proyectos.'));
      }
    };

    loadProjects();
  }, [projectRefreshToken]);

  useEffect(() => {
    const loadProjectFromRoute = async () => {
      if (!projectId) {
        setSelectedProject(null);
        setProjectLoadError('');
        return;
      }

      if (getProjectId(selectedProject) === projectId) {
        return;
      }

      const projectFromList = projects.find((project) => getProjectId(project) === projectId);

      if (projectFromList) {
        setSelectedProject(projectFromList);
        setProjectLoadError('');
        return;
      }

      try {
        const { data } = await apiClient.get(`/projects/${projectId}`);
        setSelectedProject(data.project || data);
        setProjectLoadError('');
      } catch (error) {
        setSelectedProject(null);
        setProjectLoadError(getApiErrorMessage(error, 'No pudimos cargar el proyecto seleccionado.'));
      }
    };

    loadProjectFromRoute();
  }, [projectId, projects, selectedProject]);

  useEffect(() => {
    if (!boardId) {
      setSelectedBoard(null);
    }
  }, [boardId]);

  const handleUserUpdated = (updatedUser) => {
    updateUser(updatedUser);
  };

  const handleLogout = async () => {
    await logout();
    setSelectedProject(null);
    navigate('/login', { replace: true });
  };

  const goHome = () => {
    setActiveMenu(null);
    navigate('/app');
  };

  const openProfile = () => {
    setActiveMenu(null);
    navigate('/app/profile');
  };

  const openAdmin = () => {
    setActiveMenu(null);
    navigate('/app/admin');
  };

  const handleProjectSelected = (project) => {
    setSelectedProject(project);
    navigate(`/app/projects/${getProjectId(project)}`);
  };

  const handleProjectCreated = (project) => {
    setSelectedProject(project);
    setProjectRefreshToken((value) => value + 1);
    navigate(`/app/projects/${getProjectId(project)}`);
  };

  const handleBoardLoaded = useCallback((board) => {
    setSelectedBoard(board || null);
  }, []);

  if (section === 'admin' && user.role !== 'ADMIN') {
    return <Navigate to="/app" replace />;
  }

  return (
    <main className="app-shell workspace-shell">
      <header className="app-topbar">
        <button className="brand-lockup brand-button" type="button" onClick={goHome}>
          <span className="brand-mark">TF</span>
          <div>
            <strong>TaskFlow</strong>
            <span>Gestion de proyectos</span>
          </div>
        </button>

        <div className="topbar-context">
          {section === 'admin' ? 'Administracion del sistema' : section === 'profile' ? 'Perfil de usuario' : boardId ? 'Tablero' : projectId ? 'Proyecto' : 'Home'}
        </div>

        <div className="topbar-actions">
          <NotificationBell
            isOpen={activeMenu === 'notifications'}
            onToggle={() => setActiveMenu((current) => (current === 'notifications' ? null : 'notifications'))}
          />
          <div className="profile-menu">
            <button
              className="user-menu"
              type="button"
              onClick={() => setActiveMenu((current) => (current === 'profile' ? null : 'profile'))}
              aria-expanded={activeMenu === 'profile'}
            >
              <span className="avatar-chip">{userInitials}</span>
              <div>
                <strong>{user.fullName}</strong>
                <span>{getRoleLabel(user.role)}</span>
              </div>
            </button>
            {activeMenu === 'profile' && (
              <div className="profile-dropdown">
                <button type="button" onClick={goHome}>Home</button>
                <button type="button" onClick={openProfile}>Mi perfil</button>
                {user.role === 'ADMIN' && <button type="button" onClick={openAdmin}>Panel admin</button>}
                <button className="danger-menu-item" type="button" onClick={handleLogout}>Cerrar sesion</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className={section === 'workspace' && !projectId ? 'workspace-hero simple-hero' : 'workspace-hero'}>
        <div>
          <nav className="context-breadcrumb" aria-label="Ruta actual">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={`${item.label}-${index}`}>
                {index > 0 && <span className="breadcrumb-separator">/</span>}
                {item.to ? (
                  <button type="button" onClick={() => navigate(item.to)}>
                    {item.label}
                  </button>
                ) : (
                  <span>{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
          <h1>
            {section === 'admin'
              ? 'Panel de administracion'
              : section === 'profile'
                ? 'Gestiona tu perfil de usuario'
                : selectedProject?.name || 'Vista general del workspace'}
          </h1>
          <p>
            {section === 'admin'
              ? 'Gestiona usuarios, roles y parametros globales disponibles para administradores.'
              : section === 'profile'
                ? 'Actualiza tus datos visibles, preferencias y configuracion personal.'
                : workspaceTitle}
          </p>
        </div>

        {section === 'workspace' && projectId && selectedProject && (
          <div className="hero-context-panel">
            <div className="workspace-summary project-summary">
              {selectedProjectMeta.map((item) => (
                <article key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
            {!boardId && !isSettingsRoute && (
              <button
                className="hero-action-button"
                type="button"
                onClick={() => navigate(`/app/projects/${projectId}/settings`)}
              >
                Ajustes
              </button>
            )}
          </div>
        )}
      </section>

      {section === 'admin' ? (
        <section className="workspace-content admin-content">
          <AdminPanel />
        </section>
      ) : section === 'profile' ? (
        <section className="profile-route-content">
          <UserProfile user={user} onUpdate={handleUserUpdated} />
        </section>
      ) : (
        <section className="workspace-content">
          <section className="workspace-main">
            {selectedProject && boardId ? (
              <KanbanBoard
                project={selectedProject}
                boardId={boardId}
                onBoardLoaded={handleBoardLoaded}
                onProjectUpdated={setSelectedProject}
              />
            ) : selectedProject && isSettingsRoute ? (
              <ProjectSettings project={selectedProject} onProjectUpdated={setSelectedProject} />
            ) : selectedProject ? (
              <ProjectOverview project={selectedProject} />
            ) : (
              <WorkspaceHome
                projects={projects}
                projectStats={projectStats}
                onProjectCreated={handleProjectCreated}
                onSelectProject={handleProjectSelected}
              />
            )}
          </section>
        </section>
      )}
    </main>
  );
};

export default WorkspacePage;
