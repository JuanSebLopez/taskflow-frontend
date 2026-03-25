import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import apiClient from './api/apiClient';
import Auth from './components/Login';
import CreateProject from './components/CreateProject';
import KanbanBoard from './components/KanbanBoard';
import ProjectList from './components/ProjectList';
import UserProfile from './components/UserProfile';

const initialSession = {
  user: null,
  ready: false,
};

function App() {
  const [session, setSession] = useState(initialSession);
  const [activeView, setActiveView] = useState('workspace');
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectRefreshToken, setProjectRefreshToken] = useState(0);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setSession({ user: null, ready: true });
        return;
      }

      try {
        const { data } = await apiClient.get('/auth/me');
        setSession({ user: data.user, ready: true });
      } catch (error) {
        localStorage.removeItem('token');
        setSession({ user: null, ready: true });
        setAuthError('La sesion habia expirado. Inicia sesion nuevamente.');
      }
    };

    bootstrap();
  }, []);

  const workspaceTitle = useMemo(() => {
    if (!selectedProject) {
      return 'Selecciona un proyecto para empezar a mover tareas.';
    }

    return selectedProject.description || 'Tablero Kanban listo para trabajar con tu equipo.';
  }, [selectedProject]);

  const handleAuthSuccess = (payload) => {
    localStorage.setItem('token', payload.token);
    setSession({ user: payload.user, ready: true });
    setAuthError('');
  };

  const handleUserUpdated = (updatedUser) => {
    setSession((current) => ({ ...current, user: updatedUser }));
    setActiveView('workspace');
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // No hacemos nada si el token ya no es valido.
    }

    localStorage.removeItem('token');
    setSession({ user: null, ready: true });
    setSelectedProject(null);
    setActiveView('workspace');
  };

  const handleProjectCreated = (project) => {
    setSelectedProject(project);
    setProjectRefreshToken((value) => value + 1);
  };

  const handleProjectArchived = (projectId) => {
    if (selectedProject?._id === projectId) {
      setSelectedProject((current) => (current ? { ...current, isArchived: true, status: 'ARCHIVADO' } : current));
    }
    setProjectRefreshToken((value) => value + 1);
  };

  if (!session.ready) {
    return (
      <main className="app-shell loading-shell">
        <section className="glass-panel loading-panel">
          <span className="eyebrow">TaskFlow</span>
          <h1>Preparando tu espacio de trabajo...</h1>
          <p>Estamos validando la sesion y conectando el frontend con el backend.</p>
        </section>
      </main>
    );
  }

  if (!session.user) {
    return <Auth onAuthSuccess={handleAuthSuccess} message={authError} />;
  }

  return (
    <main className="app-shell">
      <section className="app-layout">
        <aside className="sidebar glass-panel">
          <div>
            <span className="eyebrow">TaskFlow MVP</span>
            <h1>Backend y frontend hablando el mismo idioma.</h1>
            <p className="muted">Autenticacion, proyectos, tablero y tareas listos para demo.</p>
          </div>

          <div className="profile-card">
            <div>
              <strong>{session.user.fullName}</strong>
              <p>{session.user.email}</p>
            </div>
            <span className="role-pill">{session.user.role}</span>
          </div>

          <nav className="sidebar-nav">
            <button
              className={activeView === 'workspace' ? 'nav-button active' : 'nav-button'}
              onClick={() => setActiveView('workspace')}
            >
              Espacio de trabajo
            </button>
            <button
              className={activeView === 'profile' ? 'nav-button active' : 'nav-button'}
              onClick={() => setActiveView('profile')}
            >
              Mi perfil
            </button>
            <button className="nav-button nav-button-danger" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </nav>

          <CreateProject onProjectCreated={handleProjectCreated} />
        </aside>

        <section className="content-area">
          <header className="workspace-header glass-panel">
            <div>
              <span className="eyebrow">Vista activa</span>
              <h2>{activeView === 'profile' ? 'Configuracion de perfil' : selectedProject?.name || 'Panel de proyectos'}</h2>
              <p>{activeView === 'profile' ? 'Actualiza tus datos basicos visibles en la aplicacion.' : workspaceTitle}</p>
            </div>
          </header>

          {activeView === 'profile' ? (
            <UserProfile user={session.user} onUpdate={handleUserUpdated} />
          ) : (
            <div className="workspace-grid">
              <ProjectList
                key={projectRefreshToken}
                selectedProjectId={selectedProject?._id}
                onSelectProject={setSelectedProject}
                onProjectArchived={handleProjectArchived}
              />

              <div className="workspace-main">
                {selectedProject ? (
                  <KanbanBoard project={selectedProject} onProjectUpdated={setSelectedProject} />
                ) : (
                  <section className="glass-panel empty-state">
                    <span className="eyebrow">Siguiente paso</span>
                    <h3>Crea o selecciona un proyecto.</h3>
                    <p>
                      Apenas elijas un proyecto, aqui veras el tablero Kanban, filtros, metricas y acciones sobre
                      tareas conectadas al backend.
                    </p>
                  </section>
                )}
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
