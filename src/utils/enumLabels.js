const projectStatusLabels = {
  PLANIFICADO: 'Planificado',
  EN_PROGRESO: 'En progreso',
  PAUSADO: 'Pausado',
  COMPLETADO: 'Completado',
  ARCHIVADO: 'Archivado',
};

const roleLabels = {
  ADMIN: 'Admin',
  PROJECT_MANAGER: 'Project manager',
  DEVELOPER: 'Developer',
  OWNER: 'Owner',
  MEMBER: 'Member',
};

const humanizeEnum = (value) => {
  if (!value) {
    return '';
  }

  return value
    .toString()
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const getProjectStatusLabel = (status) => projectStatusLabels[status] || humanizeEnum(status);

export const getRoleLabel = (role) => roleLabels[role] || humanizeEnum(role);

export const projectStatusOptions = Object.entries(projectStatusLabels).map(([value, label]) => ({
  value,
  label,
}));
