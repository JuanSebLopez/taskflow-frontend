import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [showList, setShowList] = useState(false);

    const fetchNotifications = async () => {
        try {
            const { data } = await apiClient.get('/notifications');
            setNotifications(data);
        } catch (error) { console.error("Error al cargar notificaciones"); }
    };

    useEffect(() => {
        fetchNotifications();
        // RF-05.2: Simulación de tiempo real mediante polling cada 30 seg
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id = null) => {
        try {
            // RF-05.4: Marcar una o todas como leídas
            const endpoint = id ? `/notifications/${id}/read` : '/notifications/read-all';
            await apiClient.patch(endpoint);
            fetchNotifications();
        } catch (error) { alert("Error al actualizar"); }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div style={{ position: 'relative' }}>
            <div onClick={() => setShowList(!showList)} style={{ cursor: 'pointer', position: 'relative' }}>
                🔔 {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>
                        {unreadCount}
                    </span>
                )}
            </div>

            {showList && (
                <div style={{ position: 'absolute', right: 0, top: '30px', background: 'white', color: 'black', width: '300px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', borderRadius: '8px', zIndex: 1000, padding: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                        <strong style={{ fontSize: '12px' }}>Notificaciones</strong>
                        <button onClick={() => markAsRead()} style={{ fontSize: '10px', border: 'none', background: 'none', color: 'blue', cursor: 'pointer' }}>Marcar todo</button>
                    </div>
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? <p style={{ fontSize: '11px' }}>No hay notificaciones</p> : 
                            notifications.map(n => (
                                <div key={n._id} onClick={() => markAsRead(n._id)} style={{ padding: '8px', fontSize: '11px', borderBottom: '1px solid #f0f0f0', background: n.isRead ? 'white' : '#eef6ff', cursor: 'pointer' }}>
                                    {n.message}
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;