export const getProjectId = (project) => project?.id || project?._id;

export const getProjectPermissions = ({ user, project }) => {
  const userId = user?.id || user?._id;
  const projectId = getProjectId(project);
  const ownerId = project?.owner?.id || project?.owner?._id || project?.owner;
  const members = Array.isArray(project?.members) ? project.members : [];
  const membership = members.find((member) => {
    const memberUser = member.user || member;
    const memberUserId = memberUser.id || memberUser._id || memberUser;
    return memberUserId && userId && memberUserId.toString() === userId.toString();
  });

  const isAdmin = user?.role === 'ADMIN';
  const isProjectManager = user?.role === 'PROJECT_MANAGER';
  const isOwner = Boolean(ownerId && userId && ownerId.toString() === userId.toString());
  const isMember = Boolean(membership || isOwner);
  const isReadOnly = Boolean(project?.isArchived || project?.status === 'ARCHIVADO');

  return {
    projectId,
    projectRole: isOwner ? 'OWNER' : membership?.role || (isAdmin ? 'ADMIN' : 'GUEST'),
    isAdmin,
    isOwner,
    isMember,
    isReadOnly,
    canViewProject: isAdmin || isOwner || isMember,
    canEditProject: !isReadOnly && (isAdmin || isOwner),
    canArchiveProject: !isReadOnly && (isAdmin || isOwner),
    canInviteMembers: !isReadOnly && (isAdmin || isOwner),
    canManageBoard: !isReadOnly && (isAdmin || isOwner || (isProjectManager && isMember)),
    canCoordinateTasks: !isReadOnly && (isAdmin || isOwner || (isProjectManager && isMember)),
    canAccessAdminPanel: isAdmin,
    canViewAudit: isAdmin || isOwner || isMember,
  };
};
