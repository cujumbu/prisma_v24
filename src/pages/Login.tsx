import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const checkUserExistence = async () => {
      try {
        const response = await fetch('/api/users/check');
        const data = await response.json();
        if (!data.exists) {
          setIsCreatingAdmin(true);
          setError('No admin user exists. Create the first admin account.');
        }
      } catch (error) {
        console.error('Error checking user existence:', error);
      }
    };

    checkUserExistence();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      if (isCreatingAdmin) {
        const response = await fetch('/api/admin/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          setIsCreatingAdmin(false);
          setError('Admin created successfully. Please log in.');
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to create admin user');
        }
      } else {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const userData = await response.json();
          login(userData);
          navigate(userData.isAdmin ? '/admin' : '/status');
        } else {
          const data = await response.json();
          if (data.error === 'No users exist') {
            setIsCreatingAdmin(true);
            setError('No admin user exists. Create the first admin account.');
          } else {
            setError('Invalid credentials');
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    }
  };

  // ... rest of the component remains the same