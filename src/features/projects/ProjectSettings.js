import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient, { getApiErrorMessage } from '../../api/apiClient';
import ProjectAuditLog from '../../components/ProjectAuditLog';
import { useAuth } from '../../context/AuthContext';
import { getProjectStatusLabel, getRoleLabel, projectStatusOptions } from '../../utils/enumLabels';
import { getProjectId, getProjectPermissions } from '../../utils/projectPermissions';

const mergeProjectDetails = (current, nextProject) => ({
  ...current,
  ...nextProject,
  owner: nextProject?.owner?.fullName || nextProject?.owner?.email ? nextProject.owner : current?.owner || nextProject?.owner,
  members: Array.isArray(nextProject?.members) ? nextProject.members : current?.members,
});

const ProjectSettings = ({ onProjectCreated, onProjectUpdated, project }) => {
  const { user } = useAuth();
  const projectId = getProjectId(project);
  const permissions = getProjectPermissions({ user, project });
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    status: project.status || 'PLANIFICADO',
    startDate: project.startDate ? project.startDate.slice(0, 10) : '',
    estimatedEndDate: project.estimatedEndDate ? project.estimatedEndDate.slice(0, 10) : '',
  });
  const [feedback, setFeedback] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [fullProject, setFullProject] = useState(project);
  const [isSaving, setIsSaving] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  const loadProjectDetails = useCallback(async ({ silent = false } = {}) => {
    try {
      const { data } = await apiClient.get(`/projects/${projectId}`);
      const nextProject = data.project || data;
      setFullProject((current) => mergeProjectDetails(current, nextProject));
      onProjectUpdated(nextProject);
      return nextProject;
    } catch (error) {
      if (!silent) {
        setFeedback(getApiErrorMessage(error, 'No pudimos cargar todos los detalles del proyecto.'));
      }
      return null;
    }
  }, [onProjectUpdated, projectId]);

  useEffect(() => {
    setFullProject(project);
    setFormData({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'PLANIFICADO',
      startDate: project.startDate ? project.startDate.slice(0, 10) : '',
      estimatedEndDate: project.estimatedEndDate ? project.estimatedEndDate.slice(0, 10) : '',
    });
  }, [project]);

  useEffect(() => {
    if (projectId) {
      loadProjectDetails();
    }
  }, [loadProjectDetails, projectId]);

  const members = useMemo(() => {
    const rawMembers = Array.isArray(fullProject?.members) ? fullProject.members : [];
    const ownerId = fullProject?.owner?.id || fullProject?.owner?._id || fullProject?.owner;
    const uniqueMembers = rawMembers.filter((member, index, list) => {
      const memberUser = member.user || member;
      const memberId = memberUser?.id || memberUser?._id || memberUser;
      return list.findIndex((item) => {
        const itemUser = item.user || item;
        const itemId = itemUser?.id || itemUser?._id || itemUser;
        return itemId?.toString() === memberId?.toString();
      }) === index;
    });

    if (!ownerId || uniqueMembers.some((member) => {
      const memberUser = member.user || member;
      const memberId = memberUser?.id || memberUser?._id || memberUser;
      return memberId?.toString() === ownerId?.toString();
    })) {
      return uniqueMembers;
    }

    return [
      {
        user: fullProject.owner,
        role: 'OWNER',
        invitedAt: fullProject.createdAt,
      },
      ...uniqueMembers,
    ];
  }, [fullProject]);

  const ownerName = fullProject?.owner?.fullName || fullProject?.owner?.email || 'Owner del proyecto';
  const archived = Boolean(fullProject?.isArchived || fullProject?.status === 'ARCHIVADO');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback('');
    setIsSaving(true);

    try {
      const { data } = await apiClient.patch(`/projects/${projectId}`, {
        ...formData,
        startDate: formData.startDate || undefined,
        estimatedEndDate: formData.estimatedEndDate || undefined,
      });
      const nextProject = data.project || data;
      setFullProject((current) => mergeProjectDetails(current, nextProject));
      onProjectUpdated(nextProject);
      setFeedback('Proyecto actualizado correctamente.');
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos actualizar el proyecto.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvite = async (event) => {
    event.preventDefault();
    setFeedback('');
    setIsInviting(true);

    try {
      const { data } = await apiClient.post(`/projects/${projectId}/members`, { email: inviteEmail });
      const nextProject = data.project || data;
      setFullProject((current) => mergeProjectDetails(current, nextProject));
      onProjectUpdated(nextProject);
      await loadProjectDetails({ silent: true });
      setInviteEmail('');
      setFeedback('Miembro agregado correctamente.');
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos agregar el miembro al proyecto.'));
    } finally {
      setIsInviting(false);
    }
  };

  const handleArchive = async () => {
    const confirmed = window.confirm('Archivar este proyecto lo dejara en modo lectura. Deseas continuar?');
    if (!confirmed) {
      return;
    }

    setFeedback('');
    setIsArchiving(true);

    try {
      const { data } = await apiClient.post(`/projects/${projectId}/archive`);
      const nextProject = data.project || data;
      setFullProject((current) => mergeProjectDetails(current, nextProject));
      onProjectUpdated(nextProject);
      setFeedback('Proyecto archivado correctamente.');
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos archivar el proyecto.'));
    } finally {
      setIsArchiving(false);
    }
  };

  const handleClone = async () => {
    setFeedback('');
    setIsCloning(true);

    try {
      const { data } = await apiClient.post(`/projects/${projectId}/clone`);
      const nextProject = data.project || data;
      setFeedback('Proyecto clonado correctamente.');
      if (onProjectCreated) {
        onProjectCreated(nextProject);
      }
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No pudimos clonar el proyecto.'));
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <section className="project-settings">
      <section className="project-overview-panel project-overview-header">
        <div>
          <span className="eyebrow">Ajustes</span>
          <h2>Configuracion del proyecto</h2>
          <p>Edita datos generales y estado del proyecto seleccionado.</p>
        </div>
        <span className="status-pill">{getProjectStatusLabel(project.status)}</span>
      </section>

      <section className="project-settings-summary">
        <article>
          <span>Owner</span>
          <strong>{ownerName}</strong>
        </article>
        <article>
          <span>Miembros</span>
          <strong>{fullProject?.memberCount ?? members.length}</strong>
        </article>
        <article>
          <span>Estado</span>
          <strong>{getProjectStatusLabel(fullProject?.status)}</strong>
        </article>
        <article>
          <span>Archivado</span>
          <strong>{archived ? 'Si' : 'No'}</strong>
        </article>
      </section>

      <form className="project-overview-panel project-settings-form" onSubmit={handleSubmit}>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">General</span>
            <h3>Datos del proyecto</h3>
          </div>
        </div>
        <div className="profile-form-grid">
          <label>
            Nombre
            <input name="name" value={formData.name} onChange={handleChange} required disabled={!permissions.canEditProject} />
          </label>
          <label>
            Estado
            <select name="status" value={formData.status} onChange={handleChange} disabled={!permissions.canEditProject}>
              {projectStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Descripcion
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange} disabled={!permissions.canEditProject} />
        </label>

        <div className="profile-form-grid">
          <label>
            Inicio
            <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} disabled={!permissions.canEditProject} />
          </label>
          <label>
            Fin estimado
            <input name="estimatedEndDate" type="date" value={formData.estimatedEndDate} onChange={handleChange} disabled={!permissions.canEditProject} />
          </label>
        </div>

        {feedback && <p className="form-helper">{feedback}</p>}
        <button className="primary-button" type="submit" disabled={isSaving || !permissions.canEditProject}>
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <section className="project-overview-panel project-members-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Equipo</span>
            <h3>Miembros del proyecto</h3>
          </div>
          <span className="role-pill">{members.length || fullProject?.memberCount || 0} visibles</span>
        </div>

        {permissions.canInviteMembers && (
          <form className="invite-form" onSubmit={handleInvite}>
            <label>
              Invitar por correo
              <input
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="correo@empresa.com"
              />
            </label>
            <button className="secondary-button" type="submit" disabled={!inviteEmail || isInviting}>
              {isInviting ? 'Agregando...' : 'Agregar miembro'}
            </button>
          </form>
        )}

        <div className="project-member-list">
          {members.length ? members.map((member) => {
            const memberUser = member.user || member;
            const memberId = memberUser?.id || memberUser?._id || memberUser;
            const memberName = memberUser?.fullName || memberUser?.email || 'Miembro del proyecto';
            const memberEmail = memberUser?.email || (memberId ? 'Detalle de usuario no disponible' : 'Correo no disponible');

            return (
              <article className="project-member-item" key={`${memberId}-${member.role}`}>
                <span className="avatar-chip">{memberName.slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{memberName}</strong>
                  <span>{memberEmail}</span>
                </div>
                <span className="role-pill">{getRoleLabel(member.role)}</span>
              </article>
            );
          }) : (
            <p className="form-helper">El backend solo envio el conteo de miembros para este proyecto.</p>
          )}
        </div>
      </section>

      {(permissions.canCloneProject || permissions.canArchiveProject) && (
        <section className="project-overview-panel project-control-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Control</span>
              <h3>Acciones del proyecto</h3>
              <p>Duplica la estructura del proyecto o archiva el trabajo cuando ya no deba editarse.</p>
            </div>
          </div>

          <div className="project-control-grid">
            {permissions.canCloneProject && (
              <article>
                <div>
                  <strong>Clonar como plantilla</strong>
                  <span>Crea un proyecto nuevo con la misma configuracion base y columnas.</span>
                </div>
                <button className="secondary-button" type="button" onClick={handleClone} disabled={isCloning}>
                  {isCloning ? 'Clonando...' : 'Clonar proyecto'}
                </button>
              </article>
            )}

            {permissions.canArchiveProject && (
              <article className="project-danger-panel">
                <div>
                  <strong>Archivar proyecto</strong>
                  <span>El proyecto quedara en modo lectura y no se podran crear tableros ni tareas nuevas.</span>
                </div>
                <button className="secondary-button danger-action" type="button" onClick={handleArchive} disabled={isArchiving}>
                  {isArchiving ? 'Archivando...' : 'Archivar proyecto'}
                </button>
              </article>
            )}
          </div>
        </section>
      )}

      {permissions.canViewAudit && (
        <ProjectAuditLog
          projectId={projectId}
          showFilters
          title="Auditoria del proyecto"
          subtitle="Eventos completos de gestion, tableros y tareas de este proyecto."
        />
      )}
    </section>
  );
};

export default ProjectSettings;
