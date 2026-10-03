import { CreditCard, LayoutDashboard, LogOut, Menu, Send, WalletCards, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: CreditCard },
  { to: '/transfer', label: 'Send money', icon: Send },
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><WalletCards size={20} /></div>
          <div>
            <div className="brand-name">VaultPay</div>
            <div className="brand-subtitle">Digital wallet</div>
          </div>
          <button className="icon-button sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="side-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="avatar">{(auth?.email || 'U')[0].toUpperCase()}</div>
          <div className="sidebar-user-copy">
            <strong>{auth?.email || 'Signed in'}</strong>
            <span>{auth?.userId ? `ID ${auth.userId.slice(0, 8)}…` : 'Wallet user'}</span>
          </div>
          <button className="icon-button" onClick={signOut} title="Sign out" aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {open && <button className="mobile-overlay" onClick={() => setOpen(false)} aria-label="Close menu" />}

      <main className="main-area">
        <header className="mobile-header">
          <button className="icon-button" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
          <div className="mobile-brand">VaultPay</div>
          <div className="avatar small">{(auth?.email || 'U')[0].toUpperCase()}</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
