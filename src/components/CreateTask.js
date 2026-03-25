import React, { useState } from 'react';
import apiClient from '../api/apiClient';

const CreateTask = ({ projectId, boardId, columnId, onTaskCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('TASK');
    const [priority, setPriority] = useState('MEDIA');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // El backend usará el Factory para procesar el prefijo si es BUG
            const { data } = await apiClient.post('/tasks', {
                title,
                description,
                type,
                priority,
                project: projectId,
                board: boardId,
                columnId: columnId
            });
            alert("Tarea creada");
            setTitle('');
            setDescription('');
            onTaskCreated(); // Función para refrescar el tablero
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "No se pudo crear la tarea"));
        }
    };

    return (
        <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h4>Nueva Tarea</h4>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} required style={{width: '100%', marginBottom: '10px'}} />
                <textarea placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} style={{width: '100%', marginBottom: '10px'}} />
                
                <select value={type} onChange={e => setType(e.target.value)} style={{marginRight: '10px'}}>
                    <option value="TASK">Tarea</option>
                    <option value="BUG">Error (Bug)</option>
                    <option value="FEATURE">Funcionalidad</option>
                    <option value="IMPROVEMENT">Mejora</option>
                </select>

                <select value={priority} onChange={e => setPriority(e.target.value)} style={{marginRight: '10px'}}>
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                </select>

                <button type="submit" style={{background: '#0052cc', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px'}}>Añadir</button>
            </form>
        </div>
    );
};

export default CreateTask;