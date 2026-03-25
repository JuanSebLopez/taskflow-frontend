import React, { useState } from 'react';
import apiClient from '../api/apiClient';

const Auth = ({ onLoginSuccess }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        // RF-01.1 y RF-01.2: Registro y Login
        const endpoint = isRegister ? '/auth/register' : '/auth/login';
        
        try {
            const { data } = await apiClient.post(endpoint, formData);
            localStorage.setItem('token', data.token); // Guardar JWT para RF-01.2
            onLoginSuccess(data.user);
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Error en la operación"));
        }
    };

    // RF-01.4: Actualización de Perfil
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const { data } = await apiClient.patch('/auth/me', { fullName: formData.fullName });
            alert("Perfil actualizado correctamente");
            onLoginSuccess(data.user);
            setIsEditingProfile(false);
        } catch (error) {
            alert("No se pudo actualizar el perfil");
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#0052cc', marginBottom: '20px' }}>
                {isRegister ? 'RF-01.1: Registro' : 'RF-01.2: Acceso'}
            </h2>
            
            <form onSubmit={handleSubmit}>
                {(isRegister || isEditingProfile) && (
                    <div style={{ marginBottom: '15px' }}>
                        <label>Nombre Completo (RF-01.4):</label>
                        <input 
                            type="text" 
                            required 
                            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                        />
                    </div>
                )}

                {!isEditingProfile && (
                    <>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Correo Electrónico:</label>
                            <input 
                                type="email" 
                                required 
                                style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label>Contraseña (mín. 6 caracteres):</label>
                            <input 
                                type="password" 
                                required 
                                style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </>
                )}

                <button type="submit" style={{ width: '100%', padding: '12px', background: '#0052cc', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {isRegister ? 'CREAR CUENTA' : 'ENTRAR'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px' }}>
                <span 
                    onClick={() => setIsRegister(!isRegister)} 
                    style={{ color: '#0052cc', cursor: 'pointer', fontSize: '14px' }}
                >
                    {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
                </span>
            </p>
        </div>
    );
};

export default Auth;