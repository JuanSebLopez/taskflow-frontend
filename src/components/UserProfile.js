import React, { useState } from 'react';
import apiClient, { getApiErrorMessage } from '../api/apiClient';

const UserProfile = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    avatar: user.avatar || '',
    description: user.description || '',
  });
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
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
    <section className="glass-panel form-panel profile-panel">
      <div className="panel-heading">
        <span className="eyebrow">Perfil</span>
        <h3>Actualiza tu informacion basica</h3>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          Nombre completo
          <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
        </label>

        <label>
          URL del avatar
          <input name="avatar" type="url" value={formData.avatar} onChange={handleChange} placeholder="https://..." />
        </label>

        <label>
          Descripcion
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange} />
        </label>

        {feedback && <p className="form-helper">{feedback}</p>}
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </section>
  );
};

export default UserProfile;
