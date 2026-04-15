import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config';

interface LoginCredentials {
  mail: string;
  password: string;
}

interface UseLoginReturn {
  loading: boolean;
  error: string;
  handleSubmit: (email: string, password: string) => Promise<void>;
}

export default function useLogin(): UseLoginReturn {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const isMountedRef = useRef(true);

  const handleSubmit = async (email: string, password: string): Promise<void> => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_CONFIG.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mail: email,
          password: password,
        } as LoginCredentials),
      });

      if (response.ok) {
        const user = await response.json();
        console.log('Login successful', user);
        localStorage.setItem('user', JSON.stringify(user));
        // Don't update state after navigation
        navigate('/tasks');
      } else {
        const errorData = await response.json();
        if (isMountedRef.current) {
          setError(errorData.error || 'Correo o contraseña incorrectos');
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError('Error al conectar con el servidor');
        console.error('Login error:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { loading, error, handleSubmit };
}
