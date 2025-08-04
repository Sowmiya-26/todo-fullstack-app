// frontend/pages/login/authorized.js

import { useEffect } from 'react';
import axios from 'axios';
import Router from 'next/router';

export default function GoogleAuthRedirect() {
  useEffect(() => {
    const handleAuth = async () => {
      try {
        const res = await axios.get('https://todo-fullstack-app-njwt.onrender.com/login/google', {
          withCredentials: true
        });

        if (res.data.access_token) {
          localStorage.setItem('token', res.data.access_token);
          Router.push('/');
        } else if (res.data.auth_url) {
          window.location.href = res.data.auth_url;
        } else {
          alert('Google login failed');
          Router.push('/login');
        }
      } catch (error) {
        console.error('OAuth callback failed:', error);
        Router.push('/login');
      }
    };

    handleAuth();
  }, []);

  return <p>Logging in with Google...</p>;
}
