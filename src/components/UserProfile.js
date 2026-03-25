import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const UserProfile = ({ user, onUpdate }) => {
    const [formData, setFormData] = useState({
        fullName: user.fullName,
        description: user.description || '',
        avatar: user.avatar || '',
        theme: user.theme || 'light',
        prefs: user.notificationPrefs || { inApp: true, email: false }
    });

    // RF-09.2: Aplicar el tema visual (Claro/Oscuro)
    useEffect(() => {
        const isDark = formData.theme === 'dark';
        document.body.style.backgroundColor = isDark ? '#1a1a1a' : '#f3f4f6';
        document.body.style.color = isDark ? '#ffffff' : '#000000';
    }, [formData.theme]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await apiClient.patch('/auth/me', formData);
            alert("Perfil y Configuración (RF-09) actualizados");
            onUpdate(data.user);
        } catch (error) { alert("Error al actualizar"); }
    };

    return (
        <div style={{ background: formData.theme === 'dark' ? '#333' : 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', maxWidth: '500px', margin: '0 auto' }}>
            <h3>⚙️ Mi Configuración (RF-01.4 / RF-09)</h3>
            <form onSubmit={handleUpdate}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{fontSize: '12px'}}>Nombre Completo:</label>
                    <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={{width: '100%', padding: '8px'}} />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{fontSize: '12px'}}>Tema Visual (RF-09.2):</label>
                    <select value={formData.theme} onChange={e => setFormData({...formData, theme: e.target.value})} style={{width: '100%', padding: '8px'}}>
                        <option value="light">☀️ Claro</option>
                        <option value="dark">🌙 Oscuro</option>
                    </select>
                </div>

                <div style={{ marginBottom: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <label style={{fontSize: '12px'}}>Notificaciones (RF-05.3):</label><br/>
                    <input type="checkbox" checked={formData.prefs.inApp} onChange={e => setFormData({...formData, prefs: {...formData.prefs, inApp: e.target.checked}})} /> In-App
                    <input type="checkbox" checked={formData.prefs.email} onChange={e => setFormData({...formData, prefs: {...formData.prefs, email: e.target.checked}})} style={{marginLeft: '15px'}} /> Email
                </div>

                <button type="submit" style={{width: '100%', background: '#0052cc', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                    Guardar Cambios
                </button>
            </form>
        </div>
    );
};

export default UserProfile;