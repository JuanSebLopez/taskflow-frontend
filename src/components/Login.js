import React, { useMemo, useState } from 'react';
import apiClient, { getApiErrorMessage } from '../api/apiClient';

const emptyForm = {
  fullName: '',
  email: '',
  password: '',
};

const Auth = ({ onAuthSuccess, message }) => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(message || '');

  const title = useMemo(() => {
    return mode === 'register' ? 'Crea tu cuenta y entra al flujo de trabajo.' : 'Inicia sesion para abrir tu tablero.';
  }, [mode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
      const payload = mode === 'register'
        ? formData
        : { email: formData.email, password: formData.password };

      const { data } = await apiClient.post(endpoint, payload);
      onAuthSuccess(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No pudimos completar la autenticacion.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel glass-panel">
        <div>
          <span className="eyebrow">TaskFlow Frontend</span>
          <h1>{title}</h1>
          <p className="muted">
            Este MVP consume el backend real para login, proyectos, tablero Kanban y gestion de tareas.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              Nombre completo
              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Sebastian Quintero"
                required
              />
            </label>
          )}

          <label>
            Correo electronico
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="sebas@taskflow.local"
              required
            />
          </label>

          <label>
            Contrasena
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimo 6 caracteres"
              required
            />
          </label>

          {(error || message) && <p className="form-error">{error || message}</p>}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Procesando...' : mode === 'register' ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>

        <button
          className="ghost-button"
          type="button"
          onClick={() => {
            setMode((current) => (current === 'login' ? 'register' : 'login'));
            setError('');
          }}
        >
          {mode === 'register' ? 'Ya tienes cuenta? Inicia sesion' : 'No tienes cuenta? Registrate aqui'}
        </button>
      </section>
    </main>
  );
};

export default Auth;
