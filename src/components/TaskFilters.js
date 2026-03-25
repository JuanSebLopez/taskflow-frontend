import React from 'react';

const TaskFilters = ({ filters, setFilters, onSaveFilter }) => {
    return (
        <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            
            {/* RF-07.1: Búsqueda por texto libre */}
            <input 
                type="text" 
                placeholder="🔍 Buscar tarea (título/desc)..." 
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                style={{ flex: '1', minWidth: '200px', padding: '8px' }}
            />

            {/* RF-07.2: Filtros específicos */}
            <select value={filters.priority} onChange={(e) => setFilters({...filters, priority: e.target.value})} style={{ padding: '8px' }}>
                <option value="">Todas las Prioridades</option>
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
            </select>

            <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} style={{ padding: '8px' }}>
                <option value="">Todos los Tipos</option>
                <option value="FEATURE">Feature</option>
                <option value="BUG">Bug</option>
            </select>

            {/* RF-07.3: Botón para guardar filtro personalizado */}
            <button 
                onClick={onSaveFilter}
                style={{ background: '#0052cc', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
            >
                💾 Guardar Filtro
            </button>
        </div>
    );
};

export default TaskFilters;