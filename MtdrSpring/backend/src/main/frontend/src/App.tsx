import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import TasksPage from './Pages/TasksPage';
import LoginPage from './Pages/LoginPage';
import SignupPage from './Pages/SignupPage'; 
import TailwindTestPage from './Pages/TailwindTestPage';

function App() {
  return (
    <div>
      <nav style={{ padding: '0.5rem' }}>
        <Link to="/login">Home</Link> {' | '}
        <Link to="/tasks">Tasks</Link> {' | '}
        <Link to="/signup">Signup</Link> {' | '}
        <Link to="/tailwind-test" className="text-blue-500 hover:text-blue-700 font-semibold underline">Tailwind Test</Link>
      </nav>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/tasks" element={<TasksPage/>} />
        <Route path="/signup" element={<SignupPage/>} />
        <Route path="/tailwind-test" element={<TailwindTestPage/>} />
      </Routes>
    </div>
  );
}

export default App;
