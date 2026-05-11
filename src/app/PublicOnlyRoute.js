import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, ready } = useAuth();

  if (!ready) {
    return (
      <main className="auth-shell">
        <section className="glass-panel loading-panel">
          <span className="eyebrow">TaskFlow</span>
          <h1>Validando sesion...</h1>
          <p>Un momento mientras revisamos tus credenciales guardadas.</p>
        </section>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
