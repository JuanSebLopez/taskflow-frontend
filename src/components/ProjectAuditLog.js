import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

const ProjectAuditLog = ({ projectId }) => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // RF-06.3: Log de auditoría a nivel proyecto
                const { data } = await apiClient.get(`/projects/${projectId}/audit-logs`);
                setLogs(data);
            } catch (e) { console.error("Error al cargar logs"); }
        };
        fetchLogs();
    }, [projectId]);

    return (
        <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginTop: '20px', border: '1px solid #ddd' }}>
            <h4>🛡️ Log de Auditoría del Proyecto (RF-06.3)</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#eee' }}>
                            <th style={{ padding: '5px', textAlign: 'left' }}>Fecha</th>
                            <th style={{ padding: '5px', textAlign: 'left' }}>Usuario</th>
                            <th style={{ padding: '5px', textAlign: 'left' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '5px' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                <td style={{ padding: '5px' }}>{log.userName}</td>
                                <td style={{ padding: '5px' }}>{log.action} - {log.resource}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProjectAuditLog;