import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pulse from './pages/Pulse';
import Departments from './pages/Departments';
import DepartmentDetail from './pages/DepartmentDetail';
import People from './pages/People';
import Recognition from './pages/Recognition';
import Documents from './pages/Documents';
import Forum from './pages/Forum';
import ForumThread from './pages/ForumThread';
import Gallery from './pages/Gallery';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

// Route Guard: redirects authenticated users away from /login
function PublicRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Screen */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Gated Application Workspace Shell */}
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="pulse" element={<Pulse />} />
          <Route path="departments" element={<Departments />} />
          <Route path="departments/:id" element={<DepartmentDetail />} />
          <Route path="people" element={<People />} />
          <Route path="recognition" element={<Recognition />} />
          <Route path="documents" element={<Documents />} />
          <Route path="forum" element={<Forum />} />
          <Route path="forum/:id" element={<ForumThread />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="admin" element={<Admin />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:id" element={<Profile />} />
        </Route>

        {/* Catch-all Routing Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
