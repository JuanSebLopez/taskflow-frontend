import React, { useMemo, useState } from 'react';
import apiClient, { getApiErrorMessage } from '../api/apiClient';

const getColumnId = (column) => column?.id || column?._id;

const ColumnManager = ({ board, onBoardChanged, onClose, tasks }) => {
  const [newColumn, setNewColumn] = useState({ title: '', wipLimit: 0 });
  const [editingColumnId, setEditingColumnId] = useState('');
  const [editData, setEditData] = useState({ title: '', wipLimit: 0 });
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const sortedColumns = useMemo(() => {
    return [...(board.columns || [])].sort((first, second) => (first.order || 0) - (second.order || 0));
  }, [board.columns]);

  const taskCountByColumn = useMemo(() => {
    return tasks.reduce((counts, task) => {
      counts[task.columnId] = (counts[task.columnId] || 0) + 1;
      return counts;
    }, {});
  }, [tasks]);

  const runBoardAction = async (request, successMessage) => {
    setFeedback('');
    setSaving(true);

    try {
      const { data } = await request();
      onBoardChanged(data.board);
      setFeedback(successMessage);
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos actualizar las columnas.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateColumn = async (event) => {
    event.preventDefault();
    await runBoardAction(
      () => apiClient.post(`/boards/${board.id || board._id}/columns`, {
        title: newColumn.title,
        wipLimit: Number(newColumn.wipLimit) || 0,
      }),
      'Columna creada correctamente.',
    );
    setNewColumn({ title: '', wipLimit: 0 });
  };

  const startEdit = (column) => {
    setEditingColumnId(getColumnId(column));
    setEditData({ title: column.title, wipLimit: column.wipLimit || 0 });
  };

  const handleSaveColumn = async (columnId) => {
    await runBoardAction(
      () => apiClient.patch(`/boards/${board.id || board._id}/columns/${columnId}`, {
        title: editData.title,
        wipLimit: Number(editData.wipLimit) || 0,
      }),
      'Columna actualizada correctamente.',
    );
    setEditingColumnId('');
  };

  const handleDeleteColumn = async (columnId) => {
    await runBoardAction(
      () => apiClient.delete(`/boards/${board.id || board._id}/columns/${columnId}`),
      'Columna eliminada correctamente.',
    );
  };

  const handleMoveColumn = async (columnId, direction) => {
    const currentIndex = sortedColumns.findIndex((column) => getColumnId(column) === columnId);
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sortedColumns.length) {
      return;
    }

    const reordered = [...sortedColumns];
    const [column] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, column);

    await runBoardAction(
      () => apiClient.patch(`/boards/${board.id || board._id}/columns/reorder`, {
        columns: reordered.map((item, index) => ({
          columnId: getColumnId(item),
          order: index + 1,
        })),
      }),
      'Columnas reordenadas correctamente.',
    );
  };

  return (
    <section className="column-manager">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Columnas</span>
          <h3>Gestionar columnas</h3>
          <p>Configura estados, limites WIP y orden visual del tablero.</p>
        </div>
        <button className="ghost-button compact-action" type="button" onClick={onClose}>
          Cerrar
        </button>
      </div>

      <form className="column-create-form" onSubmit={handleCreateColumn}>
        <label>
          Nueva columna
          <input
            value={newColumn.title}
            onChange={(event) => setNewColumn((current) => ({ ...current, title: event.target.value }))}
            placeholder="QA, Bloqueado, Listo..."
            required
          />
        </label>
        <label>
          WIP
          <input
            type="number"
            min="0"
            value={newColumn.wipLimit}
            onChange={(event) => setNewColumn((current) => ({ ...current, wipLimit: event.target.value }))}
          />
        </label>
        <button className="primary-button" type="submit" disabled={saving}>
          Crear columna
        </button>
      </form>

      {feedback && <p className="form-helper">{feedback}</p>}

      <div className="column-manager-list">
        {sortedColumns.map((column, index) => {
          const columnId = getColumnId(column);
          const taskCount = taskCountByColumn[columnId] || 0;
          const isEditing = editingColumnId === columnId;

          return (
            <article className="column-manager-item" key={columnId}>
              {isEditing ? (
                <div className="column-edit-grid">
                  <label>
                    Nombre
                    <input
                      value={editData.title}
                      onChange={(event) => setEditData((current) => ({ ...current, title: event.target.value }))}
                    />
                  </label>
                  <label>
                    WIP
                    <input
                      type="number"
                      min="0"
                      value={editData.wipLimit}
                      onChange={(event) => setEditData((current) => ({ ...current, wipLimit: event.target.value }))}
                    />
                  </label>
                </div>
              ) : (
                <div>
                  <strong>{column.title}</strong>
                  <p>
                    {taskCount} tareas · WIP {column.wipLimit || 'Sin limite'}
                  </p>
                </div>
              )}

              <div className="column-manager-actions">
                <button
                  className="ghost-button compact-action"
                  type="button"
                  onClick={() => handleMoveColumn(columnId, 'left')}
                  disabled={index === 0 || saving}
                >
                  Izq.
                </button>
                <button
                  className="ghost-button compact-action"
                  type="button"
                  onClick={() => handleMoveColumn(columnId, 'right')}
                  disabled={index === sortedColumns.length - 1 || saving}
                >
                  Der.
                </button>
                {isEditing ? (
                  <>
                    <button className="secondary-button compact-action" type="button" onClick={() => setEditingColumnId('')}>
                      Cancelar
                    </button>
                    <button className="primary-button compact-action" type="button" onClick={() => handleSaveColumn(columnId)} disabled={saving}>
                      Guardar
                    </button>
                  </>
                ) : (
                  <>
                    <button className="ghost-button compact-action" type="button" onClick={() => startEdit(column)} disabled={saving}>
                      Editar
                    </button>
                    <button
                      className="ghost-button compact-action danger-action"
                      type="button"
                      onClick={() => handleDeleteColumn(columnId)}
                      disabled={taskCount > 0 || saving}
                      title={taskCount > 0 ? 'Solo puedes eliminar columnas vacias.' : 'Eliminar columna'}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ColumnManager;
