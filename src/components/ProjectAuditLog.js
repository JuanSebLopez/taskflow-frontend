import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

const ProjectAuditLog = ({ projectId }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await apiClient.get(`/projects/${projectId}/audit-logs`);
        setLogs(data);
      } catch (e) {
        console.error('Error al cargar logs');
      }
    };

    fetchLogs();
  }, [projectId]);

  return (
    <section className="audit-log">
      <h4>Log de auditoria del proyecto</h4>
      <div className="audit-log-scroll">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={log.id || log._id || index}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>{log.userName}</td>
                <td>
                  {log.action} - {log.resource}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProjectAuditLog;
