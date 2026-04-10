import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Frontend-only: backend login will be implemented later.
    console.log('login attempt', { email, password });
    //alert('Login submitted (frontend only), redirecting...');
    navigate("/tasks"); // Simulate successful login by redirecting to dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold">Sign in</h2>
            <p className="text-sm text-gray-500">Enter your account details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                autoComplete="current-password"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium"
              >
                Log in
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?&nbsp;
            <RouterLink to="/signup" className="text-red-600 hover:underline">Create one</RouterLink>
          </div>
        </div>
      </div>
    </div>
  );
}
