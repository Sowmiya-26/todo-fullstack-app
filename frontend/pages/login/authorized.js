import { useEffect } from 'react';
import axios from 'axios';
import Router from 'next/router';

export default function GoogleAuthCallback() {
  useEffect(() => {
    const getToken = async () => {
      try {
        const res = await axios.get('https://todo-fullstack-app-njwt.onrender.com/login/google', {
          withCredentials: true,
        });
        localStorage.setItem('token', res.data.access_token);
        Router.push('/');
      } catch (err) {
        console.error(err);
        alert('Google login failed');
      }
    };

    getToken();
  }, []);

  return <p>Signing you in...</p>;
}
