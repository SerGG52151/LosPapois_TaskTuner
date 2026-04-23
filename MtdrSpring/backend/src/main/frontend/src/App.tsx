import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import TasksPage from './Pages/TasksPage';
import LoginPage from './Pages/LoginPage';
import SignupPage from './Pages/SignupPage'; 
import ProfilePage from './Pages/ProfilePage';
import TeamPage from './Pages/TeamPage';
import ProjectsPage from './Pages/ProjectsPage';
import Navigation from './Components/Navigation';

function App() {
  const location = useLocation();
  const showNavigation = location.pathname !== '/login' && location.pathname !== '/signup';

  return (
    <div>
      {showNavigation && <Navigation />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/tasks" element={<TasksPage/>} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
