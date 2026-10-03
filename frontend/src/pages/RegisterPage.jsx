import { ArrowRight, LockKeyhole, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getApiError(err, 'Unable to create the account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-promo register-promo">
        <div className="auth-brand"><WalletCards size={24} /> VaultPay</div>
        <div className="auth-promo-copy">
          
          <h1>A clean interface for your Spring Boot wallet.</h1>
          <p>Create an account, open wallets, deposit test funds, transfer between users and inspect every ledger entry.</p>
          <div className="auth-feature"><LockKeyhole size={20} /> Passwords are handled by your secured backend</div>
        </div>

      </section>

      <section className="auth-form-side">
        <form className="auth-form" onSubmit={submit}>
          <div className="form-heading">
            
            <h2>Register for VaultPay</h2>
            
          </div>

          {error && <div className="alert error">{error}</div>}

          <label>Full name
            <input required maxLength={120} placeholder="Raiyan Ahmed" value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </label>
          <label>Email address
            <input required type="email" autoComplete="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <div className="form-grid-two">
            <label>Password
              <input required minLength={8} type="password" autoComplete="new-password" placeholder="Minimum 8 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </label>
            <label>Confirm password
              <input required minLength={8} type="password" autoComplete="new-password" placeholder="Repeat password" value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
            </label>
          </div>

          <button className="primary-button full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'} <ArrowRight size={18} />
          </button>
          <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
        </form>
      </section>
    </div>
  );
}
