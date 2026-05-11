export const auditModuleOptions = [
  { value: '', label: 'Todos los modulos' },
  { value: 'USERS', label: 'Usuarios' },
  { value: 'PROJECTS', label: 'Proyectos' },
  { value: 'BOARDS', label: 'Tableros' },
  { value: 'TASKS', label: 'Tareas' },
  { value: 'NOTIFICATIONS', label: 'Notificaciones' },
  { value: 'SETTINGS', label: 'Configuracion' },
  { value: 'REPORTS', label: 'Reportes' },
];

const actionLabels = {
  PROJECT_CREATED: 'Creo el proyecto',
  PROJECT_UPDATED: 'Actualizo el proyecto',
  PROJECT_ARCHIVED: 'Archivo el proyecto',
  PROJECT_MEMBER_ADDED: 'Invito un miembro',
  PROJECT_CLONED: 'Clono el proyecto',
  PROJECT_DELETED: 'Elimino el proyecto',
  TASK_CREATED: 'Creo una tarea',
  TASK_UPDATED: 'Actualizo una tarea',
  TASK_ASSIGNEES_UPDATED: 'Actualizo responsables',
  TASK_SUBTASK_ADDED: 'Agrego una subtarea',
  TASK_SUBTASK_UPDATED: 'Actualizo una subtarea',
  TASK_SUBTASK_DELETED: 'Elimino una subtarea',
  TASK_MOVED: 'Movio una tarea',
  TASK_CLONED: 'Clono una tarea',
  TASK_COMMENT_ADDED: 'Comento una tarea',
  TASK_COMMENT_UPDATED: 'Edito un comentario',
  TASK_COMMENT_DELETED: 'Elimino un comentario',
  TASK_ATTACHMENT_ADDED: 'Adjunto un archivo',
  TASK_ATTACHMENT_DELETED: 'Elimino un adjunto',
  TASK_TIME_LOG_ADDED: 'Registro tiempo',
  TASK_FILTER_SAVED: 'Guardo un filtro',
  TASK_FILTER_DELETED: 'Elimino un filtro',
  SYSTEM_SETTINGS_UPDATED: 'Actualizo parametros globales',
};

const moduleLabels = auditModuleOptions.reduce((labels, option) => {
  if (option.value) {
    labels[option.value] = option.label;
  }
  return labels;
}, {});

export const getAuditActionLabel = (action) => {
  return actionLabels[action] || action?.replaceAll('_', ' ').toLowerCase() || 'Evento registrado';
};

export const getAuditModuleLabel = (module) => {
  return moduleLabels[module] || module || 'General';
};

export const getAuditResourceLabel = (log) => {
  if (log?.task?.title) {
    return log.task.title;
  }

  if (log?.project?.name) {
    return log.project.name;
  }

  return log?.resourceType || 'Recurso';
};
