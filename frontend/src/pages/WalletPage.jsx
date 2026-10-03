import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Copy, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getApiError } from '../api/client';
import Modal from '../components/Modal';
import TransactionTable from '../components/TransactionTable';
import { formatDate, formatMoney } from '../utils/format';

export default function WalletPage() {
  const { walletId } = useParams();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [walletResponse, txResponse] = await Promise.all([
        api.get('/wallets/me'),
        api.get(`/wallets/${walletId}/transactions?page=0&size=20`),
      ]);
      const found = walletResponse.data.find((w) => w.id === walletId);
      if (!found) throw new Error('Wallet not found in your account.');
      setWallet(found);
      setTransactions(txResponse.data.content || []);
    } catch (err) {
      setError(getApiError(err, err.message || 'Could not load the wallet.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [walletId]);

  const action = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post(`/wallets/${walletId}/${modal}`, { amount: Number(amount) });
      setModal(null);
      setAmount('');
      await load();
    } catch (err) {
      setError(getApiError(err, `Could not ${modal} funds.`));
    } finally {
      setSaving(false);
    }
  };

  const copyId = async () => {
    await navigator.clipboard.writeText(walletId);
  };

  return (
    <div className="page-shell">
      <div className="back-row"><Link to="/"><ArrowLeft size={17} /> Back to dashboard</Link></div>
      {error && <div className="alert error">{error}</div>}

      {loading ? <div className="skeleton-card large" /> : wallet && (
        <>
          <section className="wallet-hero">
            <div>
              
              <h1>{formatMoney(wallet.balance, wallet.currency)}</h1>
              <div className="wallet-full-id">
                <span>{wallet.id}</span>
                <button className="icon-button" onClick={copyId} aria-label="Copy wallet ID" title="Copy wallet ID"><Copy size={17} /></button>
              </div>
            </div>
            <div className="wallet-hero-actions">
              <button className="secondary-button" onClick={() => setModal('deposit')}><ArrowDownLeft size={18} /> Deposit</button>
              <button className="secondary-button" onClick={() => setModal('withdraw')}><ArrowUpRight size={18} /> Withdraw</button>
              <Link className="primary-button" to={`/transfer?sender=${wallet.id}`}><Send size={18} /> Send</Link>
            </div>
          </section>

          <section className="wallet-meta-grid">
            <div><span>Status</span><strong>{wallet.status}</strong></div>
            <div><span>Currency</span><strong>{wallet.currency}</strong></div>
            <div><span>Created</span><strong>{formatDate(wallet.createdAt)}</strong></div>
          </section>

          <section className="section-block">
            <div className="section-heading"><div><h2>Transaction history</h2></div></div>
            <TransactionTable rows={transactions} currency={wallet.currency} />
          </section>
        </>
      )}

      <Modal open={Boolean(modal)} title={modal === 'deposit' ? 'Deposit test funds' : 'Withdraw funds'} onClose={() => setModal(null)}>
        <form className="modal-form" onSubmit={action}>
          <label>Amount
            <input type="number" min="0.01" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500.00" />
          </label>
          <button className="primary-button full" disabled={saving}>{saving ? 'Processing...' : modal === 'deposit' ? 'Deposit' : 'Withdraw'}</button>
        </form>
      </Modal>
    </div>
  );
}
