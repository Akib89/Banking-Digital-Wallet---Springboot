import { ArrowRight, CirclePlus, CreditCard, Send, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getApiError } from '../api/client';
import Modal from '../components/Modal';
import TransactionTable from '../components/TransactionTable';
import WalletCard from '../components/WalletCard';
import { useAuth } from '../context/AuthContext';
import { formatMoney } from '../utils/format';

export default function DashboardPage() {
  const { auth } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [currency, setCurrency] = useState('BDT');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const primaryWallet = wallets[0] || null;
  const balances = useMemo(() => wallets.map((w) => `${w.currency} ${Number(w.balance).toFixed(2)}`), [wallets]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const walletResponse = await api.get('/wallets/me');
      setWallets(walletResponse.data);
      const first = walletResponse.data[0];
      if (first) {
        const txResponse = await api.get(`/wallets/${first.id}/transactions?page=0&size=5`);
        setRecent(txResponse.data.content || []);
      } else {
        setRecent([]);
      }
    } catch (err) {
      setError(getApiError(err, 'Could not load your dashboard.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createWallet = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/wallets', { currency: currency.trim().toUpperCase() });
      setModal(null);
      setCurrency('BDT');
      await load();
    } catch (err) {
      setError(getApiError(err, 'Could not create the wallet.'));
    } finally {
      setSaving(false);
    }
  };

  const moneyAction = async (e) => {
    e.preventDefault();
    if (!modal?.wallet) return;
    setSaving(true);
    setError('');
    try {
      await api.post(`/wallets/${modal.wallet.id}/${modal.type}`, { amount: Number(amount) });
      setModal(null);
      setAmount('');
      await load();
    } catch (err) {
      setError(getApiError(err, `Could not ${modal.type} funds.`));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h1>Wallet dashboard</h1>
          <p>Signed in as {auth?.email}</p>
        </div>
        <button className="primary-button" onClick={() => setModal({ type: 'create' })}><CirclePlus size={18} /> New wallet</button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <section className="stats-grid">
        <div className="stat-card featured">
          <div className="stat-top"><span>Primary wallet</span><WalletCards size={20} /></div>
          <strong>{primaryWallet ? formatMoney(primaryWallet.balance, primaryWallet.currency) : 'No wallet yet'}</strong>
          <small>{primaryWallet ? primaryWallet.currency : 'Create your first wallet to begin'}</small>
        </div>
        <div className="stat-card">
          <div className="stat-top"><span>Total wallets</span><CreditCard size={20} /></div>
          <strong>{wallets.length}</strong>
          <small>{balances.length ? balances.join(' · ') : 'No balances available'}</small>
        </div>
        <div className="stat-card quick-send">
          <div className="stat-top"><span>Quick transfer</span><Send size={20} /></div>
          <strong>Send funds</strong>
          <Link to="/transfer">Open transfer <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div><h2>Your wallets</h2><p>Balances are read directly from the Spring Boot API.</p></div>
        </div>

        {loading ? (
          <div className="wallet-grid"><div className="skeleton-card" /><div className="skeleton-card" /></div>
        ) : wallets.length ? (
          <div className="wallet-grid">
            {wallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onDeposit={(w) => setModal({ type: 'deposit', wallet: w })}
                onWithdraw={(w) => setModal({ type: 'withdraw', wallet: w })}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <WalletCards size={34} />
            <h3>No wallet yet</h3>
            <p>Create a three-letter currency wallet such as BDT, USD or EUR.</p>
            <button className="primary-button" onClick={() => setModal({ type: 'create' })}>Create wallet</button>
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div><h2>Recent activity</h2><p>Latest transactions from your first wallet.</p></div>
          <Link className="text-link" to="/transactions">All transactions <ArrowRight size={16} /></Link>
        </div>
        <TransactionTable rows={recent} currency={primaryWallet?.currency || 'BDT'} loading={loading} />
      </section>

      <Modal open={modal?.type === 'create'} title="Create wallet" onClose={() => setModal(null)}>
        <form className="modal-form" onSubmit={createWallet}>
          <label>Currency code
            <input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} minLength={3} maxLength={3} required placeholder="BDT" />
          </label>
          <p className="form-note">Use a three-letter code. The backend prevents duplicate wallets for the same user/currency.</p>
          <button className="primary-button full" disabled={saving}>{saving ? 'Creating…' : 'Create wallet'}</button>
        </form>
      </Modal>

      <Modal open={modal?.type === 'deposit' || modal?.type === 'withdraw'}
        title={modal?.type === 'deposit' ? 'Deposit test funds' : 'Withdraw funds'} onClose={() => setModal(null)}>
        <form className="modal-form" onSubmit={moneyAction}>
          <div className="mini-wallet-summary">
            <span>{modal?.wallet?.currency} wallet</span>
            <strong>{modal?.wallet ? formatMoney(modal.wallet.balance, modal.wallet.currency) : ''}</strong>
          </div>
          <label>Amount
            <input type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000.00" />
          </label>
          <p className="form-note">Deposits in this portfolio project are simulated test funding, not a real bank/card deposit.</p>
          <button className="primary-button full" disabled={saving}>{saving ? 'Processing…' : modal?.type === 'deposit' ? 'Deposit' : 'Withdraw'}</button>
        </form>
      </Modal>
    </div>
  );
}
