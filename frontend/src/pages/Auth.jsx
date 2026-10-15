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

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="auth-page">

      {/* ---------- LEFT: brand visual ---------- */}
      <aside className="auth-visual">
        <div className="brand">
          <div className="logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                 stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6" />
              <path d="M9 16h4" />
            </svg>
          </div>
          <span>Edits Manager</span>
        </div>

        <div className="hero-text">
          <h2>
            Manage your clients,<br />
            track every <span>edit</span>.
          </h2>
          <p>
            A focused workspace for freelancers and agencies — clients,
            edits, payments, and attachments all in one place.
          </p>

          <ul>
            <li>Track edit status from pending to done</li>
            <li>Attach files and download anytime</li>
            <li>See paid vs. unpaid at a glance</li>
          </ul>
        </div>

        <div className="visual-footer">
          © {new Date().getFullYear()} Edits Manager — All rights reserved
        </div>
      </aside>

      {/* ---------- RIGHT: form ---------- */}
      <main className="auth-form-side">
        <div className="auth-card">
          <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="subtitle">
            {mode === 'login'
              ? 'Sign in to continue to your workspace.'
              : 'Start managing your clients and edits in minutes.'}
          </p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={submit}>
            {mode === 'register' && (
              <div className="form-group">
                <label>Name</label>
                <input
                  className="input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                required
              />
            </div>
            {mode === 'register' && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password_confirmation}
                  onChange={e => update('password_confirmation', e.target.value)}
                  required
                />
              </div>
            )}
            <button className="btn btn-primary full" disabled={loading}>
              {loading ? 'Please wait…' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="switch-mode">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <a onClick={switchMode}>
              {mode === 'login' ? 'Register' : 'Sign In'}
            </a>
          </div>
        </div>
      </main>

    </div>
  );
}