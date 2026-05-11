import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

const NotificationBell = ({ isOpen, onToggle }) => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const { data } = await apiClient.get('/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Error al cargar notificaciones');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id = null) => {
    try {
      const endpoint = id ? `/notifications/${id}/read` : '/notifications/read-all';
      await apiClient.patch(endpoint);
      fetchNotifications();
    } catch (error) {
      console.error('Error al actualizar notificaciones');
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="notification-widget">
      <button
        className="icon-button notification-trigger"
        onClick={onToggle}
        type="button"
        aria-expanded={isOpen}
        aria-label="Abrir notificaciones"
      >
        N
        {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <strong>Notificaciones</strong>
            <button className="link-button" onClick={() => markAsRead()} type="button">
              Marcar todo
            </button>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="form-helper">No hay notificaciones</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  className={notification.isRead ? 'notification-item' : 'notification-item unread'}
                  onClick={() => markAsRead(notification._id)}
                  type="button"
                >
                  {notification.message}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
