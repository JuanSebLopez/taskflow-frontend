import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '../api/apiClient';

const ProjectList = ({ onSelectProject }) => {
    const [projects, setProjects] = useState([]);

    const fetchProjects = useCallback(async () => {
        try {
            const { data } = await apiClient.get('/projects');
            setProjects(data);
        } catch (error) {
            console.error("Error al cargar proyectos");
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // RF-02.7: Actualizar Estado General del Proyecto
    const handleUpdateStatus = async (projectId, newStatus) => {
        try {
            await apiClient.patch(`/projects/${projectId}`, { status: newStatus });
            fetchProjects(); // Refrescar lista
        } catch (error) {
            alert("No se pudo cambiar el estado");
        }
    };

    // RF-02.6: Archivar Proyecto (Estado ARCHIVADO y solo lectura)
    const handleArchive = async (projectId) => {
        if (!window.confirm("¿Estás seguro de archivar este proyecto? Será de solo lectura.")) return;
        try {
            // El backend marca isArchived: true y status: 'ARCHIVADO'
            await apiClient.post(`/projects/${projectId}/archive`);
            fetchProjects();
        } catch (error) {
            alert("Error al archivar");
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#0052cc' }}>RF-02: Gestión de Proyectos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {projects.map(p => (
                    <div key={p._id} style={{ 
                        border: '1px solid #ddd', 
                        padding: '15px', 
                        borderRadius: '10px', 
                        background: p.isArchived ? '#f9f9f9' : '#fff',
                        opacity: p.isArchived ? 0.8 : 1
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h4 onClick={() => onSelectProject(p._id)} style={{ cursor: 'pointer', color: p.isArchived ? '#666' : '#0052cc', margin: 0 }}>
                                {p.name} {p.isArchived && "(Archivado)"}
                            </h4>
                            <span style={{ fontSize: '10px', padding: '2px 6px', background: '#eee', borderRadius: '4px' }}>{p.status}</span>
                        </div>
                        
                        {/* Barra de Progreso */}
                        <div style={{ background: '#eee', height: '8px', borderRadius: '4px', margin: '15px 0 10px 0' }}>
                            <div style={{ width: `${p.progress || 0}%`, background: '#4caf50', height: '100%', borderRadius: '4px' }}></div>
                        </div>

                        {/* RF-02.7: Selector de Estado */}
                        {!p.isArchived && (
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ fontSize: '11px' }}>Cambiar Estado: </label>
                                <select 
                                    value={p.status} 
                                    onChange={(e) => handleUpdateStatus(p._id, e.target.value)}
                                    style={{ fontSize: '11px', padding: '2px' }}
                                >
                                    <option value="PLANIFICADO">PLANIFICADO</option>
                                    <option value="EN_PROGRESO">EN_PROGRESO</option>
                                    <option value="PAUSADO">PAUSADO</option>
                                    <option value="COMPLETADO">COMPLETADO</option>
                                </select>
                            </div>
                        )}

                        {/* RF-02.6: Botón de Archivar */}
                        {!p.isArchived && (
                            <button 
                                onClick={() => handleArchive(p._id)}
                                style={{ 
                                    width: '100%', 
                                    background: '#6c757d', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '5px', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                📦 Archivar Proyecto
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectList;