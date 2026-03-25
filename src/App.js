import React, { useState } from 'react';
import Auth from './components/Login';
import KanbanBoard from './components/KanbanBoard';
import CreateProject from './components/CreateProject';
import ProjectList from './components/ProjectList';
import UserProfile from './components/UserProfile';
import AdminPanel from './components/AdminPanel';
import NotificationBell from './components/NotificationBell';
import apiClient from './api/apiClient';

function App() {
  const [user, setUser] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [view, setView] = useState('home'); // 'home', 'profile', 'admin'

  const handleLogout = async () => {
    try { await apiClient.post('/auth/logout'); } catch (e) {}
    localStorage.removeItem('token');
    setUser(null);
    setActiveProjectId('');
    setView('home');
  };

  if (!user) return <Auth onLoginSuccess={setUser} />;

  return (
    <div style={{ minHeight: '100vh', transition: '0.3s' }}>
      {/* NAVEGACIÓN PRINCIPAL */}
      <nav style={{ padding: '15px 25px', background: '#0052cc', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong onClick={() => {setView('home'); setActiveProjectId('');}} style={{cursor:'pointer', fontSize: '1.2rem'}}>TaskFlow PWA</strong>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <NotificationBell />
          
          {user.role === 'ADMIN' && (
            <button onClick={() => setView('admin')} style={{background: '#f39c12', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer'}}>⚙️ Admin</button>
          )}
          
          <span onClick={() => setView('profile')} style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>
            {user.fullName} ({user.role})
          </span>
          
          <button onClick={handleLogout} style={{ background: '#ff4d4f', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Salir</button>
        </div>
      </nav>

      {/* CONTENIDO DINÁMICO */}
      <div style={{ padding: '30px' }}>
        {view === 'profile' && <UserProfile user={user} onUpdate={(u) => { setUser(u); setView('home'); }} />}
        
        {view === 'admin' && <AdminPanel />}
        
        {view === 'home' && (
          !activeProjectId ? (
            <>
              <CreateProject onProjectCreated={setActiveProjectId} />
              <ProjectList onSelectProject={setActiveProjectId} />
            </>
          ) : (
            <>
              <button onClick={() => setActiveProjectId('')} style={{marginBottom: '15px', padding: '8px 15px', cursor: 'pointer'}}>⬅ Volver a Proyectos</button>
              <KanbanBoard projectId={activeProjectId} />
            </>
          )
        )}
      </div>
    </div>
  );
}

export default App;