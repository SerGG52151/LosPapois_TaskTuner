import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import useLogin from '../Hooks/useLogin';

export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { loading, error, handleSubmit: login } = useLogin();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login(email, password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold">Sign In</h2>
            <p className="text-sm text-gray-500">Enter your account details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
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
                disabled={loading}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                autoComplete="current-password"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium"
              >
                {loading ? 'Iniciando sesión...' : 'Log in'}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?&nbsp;
            <RouterLink to="/signup" className="text-indigo-600 hover:underline">Create one</RouterLink>
          </div>
        </div>
      </div>
    </div>
  );
}
