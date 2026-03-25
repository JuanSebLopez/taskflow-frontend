import React, { useMemo } from 'react';
import apiClient from '../api/apiClient';

const ProjectDashboard = ({ tasks, project }) => {
    
    // RF-08.1: Cálculo de Métricas
    const stats = useMemo(() => {
        const completed = tasks.filter(t => t.status === 'COMPLETADO').length;
        const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETADO').length;
        
        return {
            total: tasks.length,
            completed,
            pending: tasks.length - completed,
            overdue,
            progress: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
        };
    }, [tasks]);

    // RF-08.3: Exportar Reporte (CSV simplificado)
    const exportCSV = () => {
        const headers = "Titulo,Estado,Prioridad,Horas Totales\n";
        const rows = tasks.map(t => `${t.title},${t.status},${t.priority},${t.totalHours || 0}`).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `reporte_${project.name}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>📊 Dashboard: {project.name}</h3>
                <button onClick={exportCSV} style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                    📥 Exportar CSV (RF-08.3)
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
                <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0052cc' }}>{stats.total}</div>
                    <div style={{ fontSize: '12px' }}>Tareas Totales</div>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{stats.completed}</div>
                    <div style={{ fontSize: '12px' }}>Completadas</div>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: stats.overdue > 0 ? '1px solid red' : 'none' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{stats.overdue}</div>
                    <div style={{ fontSize: '12px' }}>Vencidas (RF-04.9)</div>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', background: '#eef6ff', borderRadius: '8px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0052cc' }}>{stats.progress}%</div>
                    <div style={{ fontSize: '12px' }}>Progreso General</div>
                </div>
            </div>

            {/* Simulación RF-08.2: Velocidad del Equipo */}
            <div style={{ marginTop: '25px' }}>
                <h4 style={{ fontSize: '14px' }}>📈 Velocidad del Equipo (RF-08.2)</h4>
                <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', gap: '10px', background: '#f1f3f5', padding: '10px', borderRadius: '5px' }}>
                    {[2, 5, 3, stats.completed].map((val, i) => (
                        <div key={i} style={{ flex: 1, background: '#0052cc', height: `${(val / 10) * 100}%`, borderRadius: '3px 3px 0 0' }} title={`Semana ${i+1}: ${val} tareas`}></div>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '5px' }}>
                    <span>Semana 1</span><span>Semana 2</span><span>Semana 3</span><span>Actual</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectDashboard;