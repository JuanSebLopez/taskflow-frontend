import React, { useMemo } from 'react';

const ProjectDashboard = ({ board, tasks }) => {
  const completedColumn = useMemo(() => {
    return board.columns.find((column) => column.title.toLowerCase().includes('complet'));
  }, [board.columns]);

  const stats = useMemo(() => {
    const completed = completedColumn
      ? tasks.filter((task) => task.columnId === (completedColumn._id || completedColumn.id)).length
      : 0;
    const completedColumnId = completedColumn?._id || completedColumn?.id;
    const overdue = tasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.columnId !== completedColumnId).length;
    const totalHours = tasks.reduce((sum, task) => sum + (task.timeLogs || []).reduce((inner, item) => inner + (item.hours || 0), 0), 0);

    return {
      total: tasks.length,
      completed,
      overdue,
      totalHours,
      progress: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
    };
  }, [completedColumn, tasks]);

  return (
    <section className="glass-panel dashboard-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Resumen</span>
          <h3>{board.name}</h3>
        </div>
        <span className="status-pill">{stats.progress}% completado</span>
      </div>

      <div className="stats-grid">
        <article>
          <strong>{stats.total}</strong>
          <span>Tareas totales</span>
        </article>
        <article>
          <strong>{stats.completed}</strong>
          <span>Tareas completadas</span>
        </article>
        <article>
          <strong>{stats.overdue}</strong>
          <span>Vencidas</span>
        </article>
        <article>
          <strong>{stats.totalHours.toFixed(1)}h</strong>
          <span>Tiempo registrado</span>
        </article>
      </div>
    </section>
  );
};

export default ProjectDashboard;
