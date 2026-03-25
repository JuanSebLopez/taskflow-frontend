import React from 'react';
import apiClient from '../api/apiClient';

const TaskHistory = ({ task, onUndoSuccess }) => {
    
    const handleUndo = async () => {
        try {
            // El endpoint /undo revierte al estado anterior usando Memento
            await apiClient.post(`/tasks/${task._id}/undo`);
            alert("Acción deshecha (Undo) con éxito");
            onUndoSuccess(); // Refresca la tarjeta y el tablero
        } catch (error) {
            alert("No hay más cambios en la sesión para deshacer");
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Registro de Auditoría:</span>
                <button onClick={handleUndo} style={{ fontSize: '10px', background: '#f59e0b', color: 'white', border: 'none', padding: '3px 7px', borderRadius: '3px', cursor: 'pointer' }}>
                    ↩ UNDO
                </button>
            </div>
            <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                {task.history && task.history.length > 0 ? (
                    task.history.map((h, i) => (
                        <div key={i} style={{ fontSize: '10px', padding: '5px', borderBottom: '1px solid #f3f4f6', color: '#4b5563' }}>
                            <strong>{h.action}:</strong> {h.details}
                            <div style={{ color: '#9ca3af' }}>{new Date(h.timestamp).toLocaleString()} - {h.user}</div>
                        </div>
                    ))
                ) : (
                    <p style={{ fontSize: '10px', color: '#9ca3af' }}>No hay historial registrado.</p>
                )}
            </div>
        </div>
    );
};

export default TaskHistory;