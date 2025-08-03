import { useState } from 'react';
import axios from 'axios';
import Router from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');

  const login = async () => {
    const res = await axios.post('http://localhost:5000/register', { email });
    localStorage.setItem('token', res.data.access_token);
    Router.push('/');
  };

  const googleLogin = async () => {
    const res = await axios.get('http://localhost:5000/login/google');
    if (res.data.auth_url) {
      window.location.href = res.data.auth_url;
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Login</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' />
      <button onClick={login}>Login with Email</button>
      <br /><br />
      <button onClick={googleLogin}>Login with Google</button>
    </div>
  );
}
