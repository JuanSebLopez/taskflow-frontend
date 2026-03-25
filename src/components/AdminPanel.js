import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [config, setConfig] = useState({ platformName: 'TaskFlow', passwordPolicy: '6+ chars' });

    useEffect(() => {
        // RF-09.1: Cargar usuarios para gestión
        const loadUsers = async () => {
            const { data } = await apiClient.get('/admin/users');
            setUsers(data);
        };
        loadUsers();
    }, []);

    const handleUserStatus = async (userId, status) => {
        // RF-09.1: Desactivar/Activar cuentas
        await apiClient.patch(`/admin/users/${userId}`, { active: status });
        alert("Estado de cuenta actualizado");
    };

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px' }}>
            <h2>🛡️ Panel de Administración (RF-09)</h2>
            
            <section>
                <h4>RF-09.3: Parámetros Globales</h4>
                <input type="text" value={config.platformName} onChange={e => setConfig({...config, platformName: e.target.value})} placeholder="Nombre Plataforma" />
                <button onClick={() => alert("Configuración Global Guardada")}>Guardar</button>
            </section>

            <section style={{ marginTop: '20px' }}>
                <h4>RF-09.1: Gestión de Usuarios</h4>
                <table style={{ width: '100%', fontSize: '12px' }}>
                    <thead><tr style={{background:'#eee'}}><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id}>
                                <td>{u.fullName}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                                <td>
                                    <button onClick={() => handleUserStatus(u._id, !u.active)}>
                                        {u.active ? '🚫 Desactivar' : '✅ Activar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default AdminPanel;