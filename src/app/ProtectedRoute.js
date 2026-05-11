import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
