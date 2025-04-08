import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './features/dashboard/components/Dashboard';
import TaskPage from './features/tasks/pages/TaskPage';
import Login from './features/auth/components/Login';
import Register from './features/auth/components/Register';
import OAuthCallback from './features/auth/components/OAuthCallback';
import { useAuth } from './features/auth/contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ProjectsPage, ProjectDetailPage } from './features/projects';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import UserManagement from './features/admin/components/UserManagement';
import ProjectInvitationsDrawer from './features/projects/components/ProjectInvitationsDrawer';

const PrivateRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  return (
    <>
      {isAuthenticated && !isAdmin && <ProjectInvitationsDrawer />}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={1}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />
          ) : (
            <Login />
          )
        } />
        
        <Route path="/register" element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />
          ) : (
            <Register />
          )
        } />
        
        {/* OAuth Callback Route */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Admin routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
        </Route>

        {/* User routes */}
        <Route path="/" element={
          <PrivateRoute>
            <UserLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks/*" element={<TaskPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App; 