import React, { useState } from 'react';
import { authApi } from '../api';

interface LoginProps {
  onLoginSuccess: (token: string, username: string, role: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const response = await authApi.login({ username, password });
        const { token, role: userRole } = response.data;
        onLoginSuccess(token, username, userRole);
      } else {
        await authApi.register({ username, password, role });
        setIsLogin(true);
        alert('Registration successful! Please login.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container glass">
      <h2>{isLogin ? 'Login to Store' : 'Join Our Store'}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter username"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
          />
        </div>
        {!isLogin && (
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="CUSTOMER">Customer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        )}
        <button type="submit" disabled={loading} className="primary-button">
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      <p className="toggle-auth">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <span onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? ' Register here' : ' Login here'}
        </span>
      </p>
    </div>
  );
};

export default Login;
