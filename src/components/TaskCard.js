import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import TaskHistory from './TaskHistory'; // Asegúrate de tener este archivo creado

const TaskCard = ({ task, onTaskUpdated }) => {
    const [hours, setHours] = useState(0);
    const [showHistory, setShowHistory] = useState(false);

    // RF-04.9: Indicador de vencimiento
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETADO';

    const handleAction = async (type) => {
        try {
            if (type === 'clone') await apiClient.post(`/tasks/${task._id}/clone`); // RF-04.8
            if (type === 'time') await apiClient.post(`/tasks/${task._id}/time-logs`, { hours: parseFloat(hours) }); // RF-04.10
            onTaskUpdated();
        } catch (e) {
            alert("Error al procesar la acción");
        }
    };

    return (
        <div style={{ 
            background: 'white', padding: '15px', margin: '12px 0', borderRadius: '10px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            borderLeft: `6px solid ${task.type === 'BUG' ? '#ef4444' : '#3b82f6'}`,
            outline: isOverdue ? '2px solid #ff4d4f' : 'none',
            position: 'relative'
        }}>
            {/* RF-04.9: Alerta Visual */}
            {isOverdue && (
                <div style={{ background: '#ff4d4f', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', position: 'absolute', top: '-10px', right: '10px', fontWeight: 'bold' }}>
                    VENCIDA
                </div>
            )}

            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'bold', marginBottom: '5px' }}>{task.type}</div>
            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '10px' }}>{task.title}</div>
            
            {/* Registro de Tiempo RF-04.10 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #f3f4f6' }}>
                <input 
                    type="number" 
                    value={hours} 
                    onChange={e => setHours(e.target.value)} 
                    style={{ width: '45px', padding: '3px', borderRadius: '4px', border: '1px solid #ddd' }} 
                />
                <button onClick={() => handleAction('time')} style={{ fontSize: '11px', cursor: 'pointer', background: '#e5e7eb', border: 'none', padding: '4px 8px', borderRadius: '4px' }}>
                    Log Hrs
                </button>
                <span style={{ fontSize: '11px', color: '#374151' }}>Total: {task.totalHours || 0}h</span>
            </div>

            {/* Acciones Rápidas */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '5px' }}>
                <button 
                    onClick={() => handleAction('clone')} 
                    style={{ flex: 1, fontSize: '10px', padding: '5px', cursor: 'pointer', background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                    📑 Clonar (RF-04.8)
                </button>
                <button 
                    onClick={() => setShowHistory(!showHistory)} 
                    style={{ flex: 1, fontSize: '10px', padding: '5px', cursor: 'pointer', background: showHistory ? '#dbeafe' : '#f9fafb', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                    📜 {showHistory ? 'Cerrar Historial' : 'Ver Historial'}
                </button>
            </div>

            {/* INTEGRACIÓN RF-06: Historial y Undo */}
            {showHistory && (
                <div style={{ marginTop: '15px', borderTop: '2px dashed #e5e7eb', paddingTop: '10px' }}>
                    <TaskHistory task={task} onUndoSuccess={onTaskUpdated} />
                </div>
            )}
        </div>
    );
};

export default TaskCard;