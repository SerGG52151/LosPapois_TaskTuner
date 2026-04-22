import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config';
import { saveToStorage, STORAGE_KEYS } from '../Utils/storage';

interface SignupCredentials {
  username: string;
  mail: string;
  telegramId: string;
  password: string;
}

interface UseSignupReturn {
  loading: boolean;
  error: string;
  handleSubmit: (username: string, email: string, telegramId: string, password: string) => Promise<void>;
}

export default function useSignup(): UseSignupReturn {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const isMountedRef = useRef(true);

  const handleSubmit = async (
    username: string,
    email: string,
    telegramId: string,
    password: string
  ): Promise<void> => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_CONFIG.auth.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            mail: email,
            idTelegram: telegramId,
            password: password,
        } as unknown as SignupCredentials),
      });

      if (response.ok) {
        const user = await response.json();
        saveToStorage(STORAGE_KEYS.USER, user);
        
        // Optional: store auth token if provided
        if (user.token) {
          saveToStorage(STORAGE_KEYS.AUTH_TOKEN, user.token);
        }
        
        // Don't update state after navigation
        navigate('/login');
      } else {
        const errorData = await response.json();
        if (isMountedRef.current) {
          setError(errorData.error || 'Error during registration');
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError('Error connecting to the server');
        console.error('Signup error:', err);
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
