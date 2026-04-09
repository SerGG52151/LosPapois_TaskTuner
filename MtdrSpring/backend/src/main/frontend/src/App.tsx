import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import TasksPage from './Pages/TasksPage';
import LoginPage from './Pages/LoginPage';

function App() {
  return (
    <div>
      <nav style={{ padding: '0.5rem' }}>
        <Link to="/login">Home</Link> {' | '}
        <Link to="/tasks">Tasks</Link>
      </nav>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/tasks" element={<TasksPage/>} />
      </Routes>
    </div>
  );
}

export default App;
