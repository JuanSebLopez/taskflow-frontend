import React, { useEffect, useMemo, useState } from 'react';
import apiClient, { getApiErrorMessage } from '../api/apiClient';
import ProjectAuditLog from './ProjectAuditLog';
import { getRoleLabel } from '../utils/enumLabels';

const roleOptions = ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'];

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({ platformName: 'TaskFlow', maxAttachmentSizeMb: 10 });
  const [userQuery, setUserQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  const activeUsers = useMemo(() => users.filter((user) => user.isActive).length, [users]);
  const adminUsers = useMemo(() => users.filter((user) => user.role === 'ADMIN').length, [users]);
  const inactiveUsers = useMemo(() => users.filter((user) => !user.isActive).length, [users]);

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesText = !query
        || user.fullName?.toLowerCase().includes(query)
        || user.email?.toLowerCase().includes(query);
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter
        || (statusFilter === 'ACTIVE' && user.isActive)
        || (statusFilter === 'INACTIVE' && !user.isActive);

      return matchesText && matchesRole && matchesStatus;
    });
  }, [roleFilter, statusFilter, userQuery, users]);

  const loadAdminData = async () => {
    setLoading(true);
    setFeedback('');

    try {
      const [usersResponse, settingsResponse] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/system-settings'),
      ]);

      setUsers(usersResponse.data);
      setSettings((current) => ({ ...current, ...settingsResponse.data }));
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos cargar el panel de administracion.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUserStatus = async (userId, isActive) => {
    setFeedback('');

    try {
      await apiClient.patch(`/users/${userId}/status`, { isActive });
      await loadAdminData();
      setFeedback('Estado de usuario actualizado.');
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos actualizar el estado del usuario.'));
    }
  };

  const handleRoleChange = async (userId, role) => {
    setFeedback('');

    try {
      await apiClient.patch(`/users/${userId}/role`, { role });
      await loadAdminData();
      setFeedback('Rol actualizado correctamente.');
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos actualizar el rol.'));
    }
  };

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();
    setFeedback('');

    try {
      const { data } = await apiClient.patch('/system-settings', {
        platformName: settings.platformName,
        maxAttachmentSizeMb: Number(settings.maxAttachmentSizeMb) || 10,
      });
      setSettings((current) => ({ ...current, ...(data.settings || data) }));
      setFeedback('Configuracion global guardada.');
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos guardar la configuracion.'));
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-header">
        <div>
          <span className="eyebrow">Administracion</span>
          <h2>Panel administrativo</h2>
          <p>Gestiona usuarios, accesos y parametros globales de la plataforma.</p>
        </div>
        <div className="admin-stats">
          <article>
            <strong>{users.length}</strong>
            <span>Usuarios</span>
          </article>
          <article>
            <strong>{activeUsers}</strong>
            <span>Activos</span>
          </article>
          <article>
            <strong>{adminUsers}</strong>
            <span>Admins</span>
          </article>
          <article>
            <strong>{inactiveUsers}</strong>
            <span>Inactivos</span>
          </article>
        </div>
      </div>

      {feedback && <p className="form-helper">{feedback}</p>}

      <form className="admin-settings" onSubmit={handleSettingsSubmit}>
        <div>
          <span className="eyebrow">Configuracion</span>
          <h3>Parametros globales</h3>
        </div>
        <label>
          Nombre de la plataforma
          <input
            value={settings.platformName || ''}
            onChange={(event) => setSettings((current) => ({ ...current, platformName: event.target.value }))}
          />
        </label>
        <label>
          Limite de adjuntos MB
          <input
            type="number"
            min="1"
            value={settings.maxAttachmentSizeMb || 10}
            onChange={(event) => setSettings((current) => ({ ...current, maxAttachmentSizeMb: event.target.value }))}
          />
        </label>
        <button className="primary-button" type="submit">Guardar configuracion</button>
      </form>

      <section className="admin-users">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Usuarios</span>
            <h3>Gestion de cuentas</h3>
          </div>
          <span className="role-pill">{filteredUsers.length} visibles</span>
        </div>

        <div className="admin-user-filters">
          <label>
            Buscar usuario
            <input
              type="search"
              value={userQuery}
              onChange={(event) => setUserQuery(event.target.value)}
              placeholder="Nombre o correo"
            />
          </label>
          <label>
            Rol
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="">Todos</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>{getRoleLabel(role)}</option>
              ))}
            </select>
          </label>
          <label>
            Estado
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">Todos</option>
              <option value="ACTIVE">Activos</option>
              <option value="INACTIVE">Inactivos</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p className="form-helper">Cargando usuarios...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Ultimo acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => (
                  <tr key={item.id || item._id}>
                    <td>
                      <strong>{item.fullName}</strong>
                      <span>{item.email}</span>
                    </td>
                    <td>
                      <select value={item.role} onChange={(event) => handleRoleChange(item.id || item._id, event.target.value)}>
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>{getRoleLabel(role)}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={item.isActive ? 'status-pill success-pill' : 'status-pill danger-pill'}>
                        {item.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>{item.lastAccessAt ? new Date(item.lastAccessAt).toLocaleString() : 'Sin acceso'}</td>
                    <td>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => handleUserStatus(item.id || item._id, !item.isActive)}
                      >
                        {item.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredUsers.length && <p className="form-helper">No hay usuarios con esos filtros.</p>}
          </div>
        )}
      </section>

      <ProjectAuditLog
        showFilters
        title="Auditoria global"
        subtitle="Eventos del sistema, proyectos, tableros, tareas y configuracion."
      />
    </section>
  );
};

export default AdminPanel;
