import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.scss';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message
        || Object.values(err.response?.data?.errors || {})[0]?.[0]
        || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1>{mode === 'login' ? 'Sign In' : 'Create Account'}</h1>
        <p className="subtitle">
          {mode === 'login' ? 'Welcome back!' : 'Get started with Edits Manager'}
        </p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={submit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Name</label>
              <input className="input" value={form.name}
                onChange={e => update('name', e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input className="input" type="email" value={form.email}
              onChange={e => update('email', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="input" type="password" value={form.password}
              onChange={e => update('password', e.target.value)} required />
          </div>
          {mode === 'register' && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input className="input" type="password" value={form.password_confirmation}
                onChange={e => update('password_confirmation', e.target.value)} required />
            </div>
          )}
          <button className="btn btn-primary full" disabled={loading}>
            {loading ? 'Loading...' : (mode === 'login' ? 'Sign In' : 'Register')}
          </button>
        </form>

        <div className="switch-mode">
          {mode === 'login' ? "Don't have an account? " : "Already have one? "}
          <a onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </a>
        </div>
      </div>
    </div>
  );
}