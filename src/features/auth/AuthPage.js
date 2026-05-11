import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { getApiErrorMessage } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  token: '',
};

const authCopy = {
  login: {
    eyebrow: 'Acceso seguro',
    title: 'Entra a tu tablero TaskFlow',
    description: 'Continua gestionando proyectos, tareas, notificaciones y reportes de tu equipo.',
    button: 'Entrar',
    helper: 'Usa una cuenta verificada para iniciar sesion.',
  },
  register: {
    eyebrow: 'Nueva cuenta',
    title: 'Crea tu usuario de trabajo',
    description: 'Registra tus datos y confirma tu correo para activar el acceso.',
    button: 'Crear cuenta',
    helper: 'Despues del registro necesitaras el token enviado por correo.',
  },
  verify: {
    eyebrow: 'Verificacion',
    title: 'Activa tu cuenta',
    description: 'Confirma tu correo y entra directo a tu espacio de trabajo.',
    button: 'Verificar y entrar',
    helper: 'Usa el token recibido al registrar tu cuenta o solicita uno nuevo.',
  },
};

const AuthPage = ({ mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyEmail, sessionMessage } = useAuth();
  const [formData, setFormData] = useState({ ...initialForm, email: location.state?.email || '' });
  const [feedback, setFeedback] = useState(location.state?.message || sessionMessage || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copy = authCopy[mode];
  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isVerify = mode === 'verify';

  const destination = useMemo(() => {
    return location.state?.from?.pathname || '/app';
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setFeedback('');

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
        navigate(destination, { replace: true });
        return;
      }

      if (isRegister) {
        const response = await authApi.register({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        });

        navigate('/verify-email', {
          replace: true,
          state: {
            message: response.message || 'Cuenta creada. Verifica tu correo para iniciar sesion.',
            email: formData.email,
          },
        });
        return;
      }

      await verifyEmail({
        email: formData.email,
        token: formData.token,
      });
      navigate('/app', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No pudimos completar la solicitud.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setFeedback('');

    try {
      const response = await authApi.resendVerification(formData.email || location.state?.email);
      setFeedback(response.message || 'Enviamos un nuevo token de verificacion.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No pudimos reenviar el token.'));
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-layout">
        <div className="auth-brand-panel">
          <span className="eyebrow">TaskFlow MVP</span>
          <h1>Organiza el trabajo del equipo sin perder el contexto.</h1>
          <p>
            Proyectos, tableros Kanban y tareas avanzan juntos en un espacio claro para planear, ejecutar y revisar.
          </p>
          <div className="auth-feature-grid" aria-label="Capacidades de autenticacion">
            <span>Proyectos</span>
            <span>Tableros</span>
            <span>Tareas</span>
            <span>Reportes</span>
          </div>
        </div>

        <section className="auth-panel glass-panel">
          <div>
            <span className="eyebrow">{copy.eyebrow}</span>
            <h2>{copy.title}</h2>
            <p className="muted">{copy.description}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
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
                placeholder="admin.demo@taskflow.local"
                required
              />
            </label>

            {!isVerify && (
              <label>
                Contrasena
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="TaskFlow123"
                  required
                  minLength={isRegister ? 6 : undefined}
                />
              </label>
            )}

            {isVerify && (
              <label>
                Token de verificacion
                <input
                  name="token"
                  type="text"
                  value={formData.token}
                  onChange={handleChange}
                  placeholder="Codigo enviado por correo"
                  required
                />
              </label>
            )}

            {feedback && <p className="form-helper auth-message">{feedback}</p>}
            {error && <p className="form-error auth-message">{error}</p>}

            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : copy.button}
            </button>
          </form>

          <div className="auth-links">
            {isLogin && <Link to="/register">Crear cuenta</Link>}
            {isRegister && <Link to="/login">Ya tengo cuenta</Link>}
            {!isVerify && <Link to="/verify-email">Verificar correo</Link>}
            {isVerify && (
              <>
                <Link to="/login">Volver al login</Link>
                <button className="link-button" type="button" onClick={handleResend}>
                  Reenviar token
                </button>
              </>
            )}
          </div>

          <p className="auth-helper">{copy.helper}</p>
        </section>
      </section>
    </main>
  );
};

export default AuthPage;
