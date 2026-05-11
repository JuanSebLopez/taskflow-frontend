import React, { useMemo } from 'react';

const TaskFilters = ({ filters, setFilters }) => {
  const activeCount = useMemo(() => {
    return ['search', 'priority', 'type'].filter((key) => Boolean(filters[key])).length;
  }, [filters]);

  return (
    <section className="filters-panel">
      <div className="filters-header">
        <div>
          <span className="eyebrow">Filtros</span>
          <h3>Filtra tareas de este tablero</h3>
        </div>
        <span className="role-pill">{activeCount} activos</span>
      </div>

      <div className="filters-grid">
        <label>
          Buscar
          <input
            type="text"
            placeholder={filters.searchBy === 'assignee' ? 'Nombre del asignado' : filters.searchBy === 'label' ? 'Etiqueta' : 'Titulo de la tarea'}
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />
        </label>

        <label>
          Buscar por
          <select
            value={filters.searchBy}
            onChange={(event) => setFilters((current) => ({ ...current, searchBy: event.target.value, search: '' }))}
          >
            <option value="title">Titulo</option>
            <option value="assignee">Asignado</option>
            <option value="label">Etiqueta</option>
          </select>
        </label>

        <label>
          Prioridad
          <select
            value={filters.priority}
            onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
          >
            <option value="">Todas</option>
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="URGENTE">Urgente</option>
          </select>
        </label>

        <label>
          Tipo
          <select
            value={filters.type}
            onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
          >
            <option value="">Todos</option>
            <option value="TASK">Task</option>
            <option value="FEATURE">Feature</option>
            <option value="BUG">Bug</option>
            <option value="IMPROVEMENT">Improvement</option>
          </select>
        </label>
      </div>
    </section>
  );
};

export default TaskFilters;
