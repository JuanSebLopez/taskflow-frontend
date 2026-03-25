import React, { useState } from 'react';
import apiClient from '../api/apiClient';

const CreateProject = ({ onProjectCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        estimatedEndDate: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await apiClient.post('/projects', formData);
            alert("Proyecto creado exitosamente");
            onProjectCreated(data._id);
        } catch (error) {
            alert("Error al crear el proyecto");
        }
    };

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>RF-02.1: Nuevo Proyecto</h3>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Nombre" required style={{marginRight: '10px'}}
                    onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="text" placeholder="Descripción" style={{marginRight: '10px'}}
                    onChange={e => setFormData({...formData, description: e.target.value})} />
                <input type="date" title="Fecha de Inicio" style={{marginRight: '10px'}}
                    onChange={e => setFormData({...formData, startDate: e.target.value})} />
                <input type="date" title="Fecha Estimada Fin" style={{marginRight: '10px'}}
                    onChange={e => setFormData({...formData, estimatedEndDate: e.target.value})} />
                <button type="submit">Crear</button>
            </form>
        </div>
    );
};

export default CreateProject;