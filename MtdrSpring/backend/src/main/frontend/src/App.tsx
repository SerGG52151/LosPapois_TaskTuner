import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import TasksPage from './Pages/TasksPage';
import LoginPage from './Pages/LoginPage';
import SignupPage from './Pages/SignupPage';
import ProfilePage from './Pages/ProfilePage';
import TeamPage from './Pages/TeamPage';
import SprintPage from './Pages/SprintPage';
import ProjectsPage from './Pages/ProjectsPage';
import { Sidebar, SidebarToggle } from './Components/Sidebar';
import PageBreadcrumb from './Components/Header/PageBreadcrumb';
// Old top-bar Navigation kept importable in case we need to revert quickly,
// but it is no longer rendered — Sidebar replaces it.
// import Navigation from './Components/Navigation';
import {
  getFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from './Utils/storage';

function App() {
  const location = useLocation();
  const isAuthRoute =
    location.pathname === '/login' || location.pathname === '/signup';

  // Sidebar visibility — persisted across reloads via localStorage.
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(
    () => getFromStorage<boolean>(STORAGE_KEYS.SIDEBAR_OPEN) ?? true
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SIDEBAR_OPEN, sidebarOpen);
  }, [sidebarOpen]);

  const toggleSidebar = useCallback(() => setSidebarOpen(o => !o), []);

  const routes = (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      {/* Team and Sprint are scoped to a project — the projectId / */}
      {/* sprintId in the URL gives every sidebar link a unique address, */}
      {/* which keeps NavLink's active highlight per-group correct. */}
      <Route path="/projects/:projectId/team" element={<TeamPage />} />
      <Route path="/projects/:projectId/sprints/:sprintId" element={<SprintPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );

  // Auth pages render full-bleed without sidebar/header chrome.
  if (isAuthRoute) {
    return <>{routes}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* White header with a 2px brand-green underline — keeps the green */}
        {/* present as an accent without doubling the dark-green wordmark */}
        {/* that already lives in the sidebar. Fixed h-16 matches the */}
        {/* sidebar header so the two zones align cleanly at the corner. */}
        <header className="flex items-center gap-3 px-4 h-16 bg-white border-b-2 border-brand">
          <SidebarToggle isOpen={sidebarOpen} onToggle={toggleSidebar} />
          <PageBreadcrumb />
        </header>
        <main className="flex-1 overflow-auto">{routes}</main>
      </div>
    </div>
  );
}

export default App;
