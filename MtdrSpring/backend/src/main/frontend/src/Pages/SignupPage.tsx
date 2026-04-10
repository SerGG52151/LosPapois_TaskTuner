import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

const SignupPage: React.FC = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Signup Attempt:', { firstName, lastName, email, password });
        alert('Signup completed successfully! Please log in now.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6">
                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-semibold">Sign Up</h2>
                        <p className="text-sm text-gray-500">Create your account</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label htmlFor="signup-firstname" className="block text-sm font-medium text-gray-700 mb-1">
                                First name
                            </label>
                            <input
                                type="text"
                                id="signup-firstname"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                autoComplete="given-name"
                            />
                        </div>

                        <div>
                            <label htmlFor="signup-lastname" className="block text-sm font-medium text-gray-700 mb-1">
                                Last name
                            </label>
                            <input
                                type="text"
                                id="signup-lastname"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                autoComplete="family-name"
                            />
                        </div>

                        <div>
                            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="signup-email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label htmlFor="signup-pass" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="signup-pass"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium"
                        >
                            Sign up
                        </button>
                    </form>

                    <div className="mt-4 text-center text-sm text-gray-600">
                        Already have an account?&nbsp;
                        <RouterLink to="/login" className="text-indigo-600 hover:underline">
                            Log in
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;