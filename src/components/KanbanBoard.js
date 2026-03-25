import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '../api/apiClient';
import TaskCard from './TaskCard';
import CreateTask from './CreateTask';
import TaskFilters from './TaskFilters';
import ProjectDashboard from './ProjectDashboard';

const KanbanBoard = ({ projectId }) => {
    const [board, setBoard] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [filters, setFilters] = useState({ search: '', priority: '', type: '' });
    const [newColumnTitle, setNewColumnTitle] = useState('');

    // --- CARGA DE DATOS (RF-03.1) ---
    const loadData = useCallback(async () => {
        try {
            // Obtener estructura del tablero y columnas
            const boardRes = await apiClient.get(`/boards/project/${projectId}`);
            if (boardRes.data.length > 0) setBoard(boardRes.data[0]);
            
            // Obtener todas las tareas del proyecto
            const tasksRes = await apiClient.get(`/tasks?projectId=${projectId}`);
            setTasks(tasksRes.data);
        } catch (e) {
            console.error("Error al cargar el tablero de TaskFlow");
        }
    }, [projectId]);

    useEffect(() => {
        if (projectId) loadData();
    }, [projectId, loadData]);

    // --- LÓGICA DE FILTRADO (RF-07.1 y RF-07.2) ---
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                                 (task.description && task.description.toLowerCase().includes(filters.search.toLowerCase()));
            const matchesPriority = filters.priority === '' || task.priority === filters.priority;
            const matchesType = filters.type === '' || task.type === filters.type;
            return matchesSearch && matchesPriority && matchesType;
        });
    }, [tasks, filters]);

    // --- GESTIÓN DE COLUMNAS (RF-03.3) ---
    const addColumn = async () => {
        if (!newColumnTitle) return;
        try {
            await apiClient.post(`/boards/${board._id}/columns`, { title: newColumnTitle });
            setNewColumnTitle('');
            loadData();
        } catch (e) { alert("Error al añadir columna"); }
    };

    if (!board) return <div style={{padding: '20px'}}>Cargando tablero...</div>;

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* RF-08: Dashboard de Métricas y Estadísticas */}
            <ProjectDashboard tasks={tasks} project={board} />

            {/* RF-07: Barra de Búsqueda y Filtros */}
            <TaskFilters filters={filters} setFilters={setFilters} />

            {/* RF-03.3: Herramienta para nuevas columnas */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Nueva Columna (Ej: QA)" 
                    value={newColumnTitle} 
                    onChange={e => setNewColumnTitle(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <button 
                    onClick={addColumn}
                    style={{ background: '#0052cc', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
                >
                    + Añadir Etapa
                </button>
            </div>

            {/* RF-03.4: Visualización del Tablero Kanban */}
            <div style={{ 
                display: 'flex', 
                gap: '20px', 
                overflowX: 'auto', 
                paddingBottom: '30px', 
                alignItems: 'flex-start' 
            }}>
                {board.columns.map((col, index) => {
                    // Filtrar tareas que pertenecen a esta columna específica
                    const columnTasks = filteredTasks.filter(t => t.columnId === col._id);
                    
                    // RF-03.5: Verificación de Límite WIP
                    const isOverWIP = col.wipLimit > 0 && columnTasks.length > col.wipLimit;

                    return (
                        <div key={col._id} style={{ 
                            background: '#ebecf0', 
                            minWidth: '300px', 
                            padding: '15px', 
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            borderTop: isOverWIP ? '6px solid #ff4d4f' : '6px solid #0052cc'
                        }}>
                            {/* Cabecera de Columna */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <strong style={{ color: '#172b4d' }}>{col.title}</strong>
                                <span style={{ 
                                    fontSize: '11px', 
                                    fontWeight: 'bold',
                                    color: isOverWIP ? '#ff4d4f' : '#6b7280',
                                    background: isOverWIP ? '#fff1f0' : '#f4f5f7',
                                    padding: '2px 8px',
                                    borderRadius: '10px'
                                }}>
                                    WIP: {columnTasks.length} / {col.wipLimit || '∞'}
                                </span>
                            </div>

                            {/* RF-04.1: Crear tareas (Solo habilitado en la primera columna) */}
                            {index === 0 && (
                                <CreateTask 
                                    projectId={projectId} 
                                    boardId={board._id} 
                                    columnId={col._id} 
                                    onTaskCreated={loadData} 
                                />
                            )}

                            {/* Listado de Tarjetas de Tarea */}
                            <div style={{ minHeight: '100px' }}>
                                {columnTasks.length === 0 ? (
                                    <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '20px' }}>No hay tareas aquí</p>
                                ) : (
                                    columnTasks.map(task => (
                                        <TaskCard key={task._id} task={task} onTaskUpdated={loadData} />
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default KanbanBoard;