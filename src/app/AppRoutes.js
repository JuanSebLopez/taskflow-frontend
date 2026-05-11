import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AuthPage from '../features/auth/AuthPage';
import WorkspacePage from '../features/workspace/WorkspacePage';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/app" replace />} />
    <Route
      path="/login"
      element={(
        <PublicOnlyRoute>
          <AuthPage mode="login" />
        </PublicOnlyRoute>
      )}
    />
    <Route
      path="/register"
      element={(
        <PublicOnlyRoute>
          <AuthPage mode="register" />
        </PublicOnlyRoute>
      )}
    />
    <Route
      path="/verify-email"
      element={(
        <PublicOnlyRoute>
          <AuthPage mode="verify" />
        </PublicOnlyRoute>
      )}
    />
    <Route
      path="/app"
      element={(
        <ProtectedRoute>
          <WorkspacePage section="workspace" />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/app/projects/:projectId"
      element={(
        <ProtectedRoute>
          <WorkspacePage section="workspace" />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/app/projects/:projectId/boards"
      element={(
        <ProtectedRoute>
          <WorkspacePage section="workspace" />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/app/projects/:projectId/boards/:boardId"
      element={(
        <ProtectedRoute>
          <WorkspacePage section="workspace" />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/app/projects/:projectId/settings"
      element={(
        <ProtectedRoute>
          <WorkspacePage section="workspace" />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/app/profile"
      element={(
        <ProtectedRoute>
          <WorkspacePage section="profile" />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/app/admin"
      element={(
        <ProtectedRoute>
          <WorkspacePage section="admin" />
        </ProtectedRoute>
      )}
    />
    <Route path="*" element={<Navigate to="/app" replace />} />
  </Routes>
);

export default AppRoutes;
