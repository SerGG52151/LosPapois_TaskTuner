import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import TasksPage from './Pages/TasksPage';

function App() {
  return (
    <div>
      <nav style={{ padding: '0.5rem' }}>
        <Link to="/">Home</Link> {' | '}
        <Link to="/tasks">Tasks</Link>
      </nav>
      <Routes>
        <Route path="/" element={<TasksPage/>} />
        <Route path="/tasks" element={<TasksPage/>} />
      </Routes>
    </div>
  );
}

export default App;
