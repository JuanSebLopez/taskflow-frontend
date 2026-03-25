import React from 'react';

const formatHistoryLine = (entry) => {
  const destination = entry.toColumnId ? ` -> ${entry.toColumnId}` : '';
  return `${entry.action}${destination}`;
};

const TaskHistory = ({ task }) => {
  if (!task.history?.length) {
    return <p className="form-helper">Aun no hay historial registrado.</p>;
  }

  return (
    <div className="history-list">
      {task.history.map((entry, index) => (
        <article key={`${entry.action}-${entry.createdAt}-${index}`} className="history-item">
          <strong>{formatHistoryLine(entry)}</strong>
          <span>{new Date(entry.createdAt).toLocaleString()}</span>
        </article>
      ))}
    </div>
  );
};

export default TaskHistory;
