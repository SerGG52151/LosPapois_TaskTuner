import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config';
import { saveToStorage, STORAGE_KEYS } from '../Utils/storage';

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

        // Use centralized storage utility
        saveToStorage(STORAGE_KEYS.USER, user);
        
        if (user.token) {
          saveToStorage(STORAGE_KEYS.AUTH_TOKEN, user.token);
        }
        
        navigate('/tasks');
      } else {
        const errorData = await response.json();
        if (isMountedRef.current) {
          setError(errorData.error || 'Incorrect email or password');
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError('Error connecting to the server');
        console.error('Login error:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { loading, error, handleSubmit };
}
