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
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="bg-white text-center m-auto p-6 rounded-3xl shadow-md w-full max-w-sm border-0">
                <div className="py-2">
                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-semibold">Sign Up</h2>
                        <p className="text-sm text-gray-500">Create your account</p>
                    </div>
                    <div className="text-left px-2">
                        <form className="flex flex-col gap-4" onSubmit={handleSignup}>
                            
                            <div className="relative">
                                <input
                                    type="text"
                                    id="signup-firstname"
                                    className="peer w-full px-3 pt-5 pb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder-transparent"
                                    placeholder="First name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                                <label 
                                    htmlFor="signup-firstname" 
                                    className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600"
                                >
                                    First name
                                </label>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    id="signup-lastname"
                                    className="peer w-full px-3 pt-5 pb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder-transparent"
                                    placeholder="Last name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                                <label 
                                    htmlFor="signup-lastname" 
                                    className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600"
                                >
                                    Last name
                                </label>
                            </div>

                            <div className="relative">
                                <input
                                    type="email"
                                    id="signup-email"
                                    className="peer w-full px-3 pt-5 pb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder-transparent"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <label 
                                    htmlFor="signup-email" 
                                    className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600"
                                >
                                    Email address
                                </label>
                            </div>

                            <div className="relative">
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="signup-pass"
                                        className="peer w-full px-3 pt-5 pb-2 border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder-transparent"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <label 
                                        htmlFor="signup-pass" 
                                        className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600"
                                    >
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
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

                            <p className="mb-0 mt-2">
                                <RouterLink to="/login" className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium">
                                    Or log in &gt;
                                </RouterLink>
                            </p>

                            <div className="text-center">
                                <button
                                    type="submit"
                                    className="w-auto px-8 text-white py-2 rounded-md mt-2 transition-colors font-semibold bg-blue-600 hover:bg-blue-700"
                                >
                                    Sign up
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;