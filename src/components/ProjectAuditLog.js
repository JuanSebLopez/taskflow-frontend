import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient, { getApiErrorMessage } from '../api/apiClient';
import {
  auditModuleOptions,
  getAuditActionLabel,
  getAuditModuleLabel,
  getAuditResourceLabel,
} from '../utils/auditLabels';

const ProjectAuditLog = ({
  compact = false,
  limit,
  projectId,
  showFilters = false,
  subtitle = 'Ultimos eventos registrados por el sistema.',
  title = 'Auditoria',
}) => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ module: '', action: '' });
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setFeedback('');

    try {
      const params = new URLSearchParams();

      if (projectId) {
        params.set('projectId', projectId);
      }

      if (showFilters && filters.module) {
        params.set('module', filters.module);
      }

      if (showFilters && filters.action.trim()) {
        params.set('action', filters.action.trim());
      }

      const query = params.toString();
      const { data } = await apiClient.get(`/audit-logs${query ? `?${query}` : ''}`);
      setLogs(data);
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos cargar la auditoria.'));
    } finally {
      setLoading(false);
    }
  }, [filters.action, filters.module, projectId, showFilters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const visibleLogs = useMemo(() => {
    return typeof limit === 'number' ? logs.slice(0, limit) : logs;
  }, [limit, logs]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <section className={compact ? 'audit-log audit-log-compact' : 'audit-log'}>
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{compact ? 'Actividad' : 'Control'}</span>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        {!compact && <span className="role-pill">{visibleLogs.length} eventos</span>}
      </div>

      {showFilters && (
        <div className="audit-filters">
          <label>
            Modulo
            <select name="module" value={filters.module} onChange={handleFilterChange}>
              {auditModuleOptions.map((option) => (
                <option key={option.value || 'ALL'} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            Accion
            <input
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              placeholder="TASK_CREATED, PROJECT_UPDATED..."
            />
          </label>
        </div>
      )}

      {loading ? (
        <p className="form-helper">Cargando eventos...</p>
      ) : feedback ? (
        <p className="form-error">{feedback}</p>
      ) : visibleLogs.length ? (
        <div className="audit-list">
          {visibleLogs.map((log) => {
            const actorLabel = log.actor?.fullName || log.actor?.email || 'Sistema';
            const dateLabel = log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Sin fecha';

            return (
              <article className="audit-event" key={log.id}>
                <div className="audit-event-marker" aria-hidden="true" />
                <div>
                  <strong>{getAuditActionLabel(log.action)}</strong>
                  <p>
                    {actorLabel} sobre {getAuditResourceLabel(log)}
                  </p>
                  {!compact && (
                    <div className="audit-event-meta">
                      <span>{getAuditModuleLabel(log.module)}</span>
                      <span>{log.resourceType}</span>
                      <span>{dateLabel}</span>
                    </div>
                  )}
                </div>
                {compact && <span>{dateLabel}</span>}
              </article>
            );
          })}
        </div>
      ) : (
        <section className="rail-empty">
          <strong>Sin eventos</strong>
          <p>Aun no hay actividad registrada para este contexto.</p>
        </section>
      )}
    </section>
  );
};

export default ProjectAuditLog;
