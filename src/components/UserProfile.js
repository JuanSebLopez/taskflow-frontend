import React, { useMemo, useState } from 'react';
import apiClient, { getApiErrorMessage } from '../api/apiClient';
import { getRoleLabel } from '../utils/enumLabels';

const notificationLabels = {
  projectMemberAdded: 'Invitaciones a proyectos',
  projectArchived: 'Proyectos archivados',
  taskAssigned: 'Tareas asignadas',
  taskMoved: 'Cambios de estado',
  taskCommented: 'Comentarios en tareas',
};

const defaultNotificationPreferences = {
  inApp: {
    projectMemberAdded: true,
    projectArchived: true,
    taskAssigned: true,
    taskMoved: true,
    taskCommented: true,
  },
  email: {
    projectMemberAdded: false,
    projectArchived: false,
    taskAssigned: false,
    taskMoved: false,
    taskCommented: false,
  },
};

const UserProfile = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    avatarUrl: user.avatarUrl || '',
    bio: user.bio || '',
    theme: user.theme || 'LIGHT',
    notificationPreferences: {
      inApp: {
        ...defaultNotificationPreferences.inApp,
        ...(user.notificationPreferences?.inApp || {}),
      },
      email: {
        ...defaultNotificationPreferences.email,
        ...(user.notificationPreferences?.email || {}),
      },
    },
  });
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initials = useMemo(() => {
    return formData.fullName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [formData.fullName]);

  const completedProfileItems = useMemo(() => {
    return [formData.fullName, formData.avatarUrl, formData.bio, formData.theme].filter(Boolean).length;
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handlePreferenceChange = (channel, key) => {
    setFormData((current) => ({
      ...current,
      notificationPreferences: {
        ...current.notificationPreferences,
        [channel]: {
          ...current.notificationPreferences[channel],
          [key]: !current.notificationPreferences[channel][key],
        },
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback('');
    setIsSubmitting(true);

    try {
      const { data } = await apiClient.patch('/auth/me', formData);
      setFeedback('Perfil actualizado correctamente.');
      onUpdate(data.user);
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos actualizar tu perfil.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="profile-workspace">
      <aside className="profile-summary-card">
        <div className="profile-avatar-preview">
          {formData.avatarUrl ? (
            <img src={formData.avatarUrl} alt={formData.fullName} />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div>
          <h2>{formData.fullName}</h2>
          <p>{user.email}</p>
        </div>

        <div className="profile-badges">
          <span className="role-pill">{getRoleLabel(user.role)}</span>
          <span className={user.isActive ? 'status-pill success-pill' : 'status-pill danger-pill'}>
            {user.isActive ? 'Cuenta activa' : 'Cuenta inactiva'}
          </span>
        </div>

        <div className="profile-info-list">
          <article>
            <span>Ultimo acceso</span>
            <strong>{user.lastAccessAt ? new Date(user.lastAccessAt).toLocaleString() : 'Sin registro'}</strong>
          </article>
          <article>
            <span>Verificacion</span>
            <strong>{user.isEmailVerified ? 'Correo verificado' : 'Pendiente'}</strong>
          </article>
          <article>
            <span>Perfil completo</span>
            <strong>{completedProfileItems}/4</strong>
          </article>
        </div>
      </aside>

      <form className="profile-edit-panel" onSubmit={handleSubmit}>
        <section className="profile-section">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Perfil</span>
              <h3>Informacion basica</h3>
            </div>
          </div>

          <div className="profile-form-grid">
            <label>
              Nombre completo
              <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
            </label>

            <label>
              Tema visual
              <select name="theme" value={formData.theme} onChange={handleChange}>
                <option value="LIGHT">Claro</option>
                <option value="DARK">Oscuro</option>
              </select>
            </label>
          </div>

          <label>
            URL del avatar
            <input name="avatarUrl" type="url" value={formData.avatarUrl} onChange={handleChange} placeholder="https://..." />
          </label>

          <label>
            Descripcion
            <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} placeholder="Rol, enfoque o responsabilidades dentro del equipo" />
          </label>
        </section>

        <section className="profile-section">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Preferencias</span>
              <h3>Notificaciones</h3>
            </div>
          </div>

          <div className="notification-preferences">
            {Object.entries(notificationLabels).map(([key, label]) => (
              <article key={key} className="preference-row">
                <div>
                  <strong>{label}</strong>
                  <span>Controla avisos in-app y por correo para este evento.</span>
                </div>
                <label className="checkbox-control">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.notificationPreferences.inApp[key])}
                    onChange={() => handlePreferenceChange('inApp', key)}
                  />
                  In-app
                </label>
                <label className="checkbox-control">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.notificationPreferences.email[key])}
                    onChange={() => handlePreferenceChange('email', key)}
                  />
                  Email
                </label>
              </article>
            ))}
          </div>
        </section>

        {feedback && <p className="form-helper">{feedback}</p>}
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </section>
  );
};

export default UserProfile;
