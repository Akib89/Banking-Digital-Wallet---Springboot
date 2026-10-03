import { ArrowRight, ShieldCheck, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(getApiError(err, 'Unable to sign in.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-promo">
        <div className="auth-brand"><WalletCards size={24} /> VaultPay</div>
        <div className="auth-promo-copy">
          
          <h1>Wallet practice, with real transaction rules.</h1>
          <p>JWT authentication, transaction-safe transfers, idempotency protection and a PostgreSQL ledger.</p>
          <div className="auth-feature"><ShieldCheck size={20} /> Transaction-safe wallet operations</div>
        </div>

      </section>

      <section className="auth-form-side">
        <form className="auth-form" onSubmit={submit}>
          <div className="form-heading">
            
            <h2>Sign in to your wallet</h2>
            
          </div>

          {error && <div className="alert error">{error}</div>}

          <label>
            Email address
            <input type="email" required autoComplete="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            Password
            <input type="password" required autoComplete="current-password" placeholder="Password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>

          <button className="primary-button full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'} <ArrowRight size={18} />
          </button>

          <p className="auth-switch">No account? <Link to="/register">Create one</Link></p>
        </form>
      </section>
    </div>
  );
}
