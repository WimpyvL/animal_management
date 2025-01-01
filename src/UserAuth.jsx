import React, { useState } from 'react';
import { addUser, getUser } from './db';

const UserAuth = ({ db, setUser, navigate, action }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (action === 'signup') {
      try {
        await addUser(db, username, password);
        setMessage('Signup successful! Please log in.');
        navigate('/login');
      } catch (error) {
        setMessage('Username already exists.');
      }
    } else if (action === 'login') {
      const user = await getUser(db, username);
      if (user && user.password === password) {
        setUser(user);
        setMessage('Login successful!');
        navigate('/');
      } else {
        setMessage('Invalid username or password.');
      }
    }
  };

  return (
    <div className="auth-container">
      <h1>{action === 'signup' ? 'Signup' : 'Login'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">{action === 'signup' ? 'Signup' : 'Login'}</button>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default UserAuth;
