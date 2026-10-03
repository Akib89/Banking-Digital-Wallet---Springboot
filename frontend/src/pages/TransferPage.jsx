import { CheckCircle2, Copy, Send, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getApiError } from '../api/client';
import { formatMoney } from '../utils/format';

export default function TransferPage() {
  const [params] = useSearchParams();
  const [wallets, setWallets] = useState([]);
  const [form, setForm] = useState({ senderWalletId: params.get('sender') || '', receiverWalletId: '', amount: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const idempotencyKey = useRef(null);

  useEffect(() => {
    api.get('/wallets/me')
      .then(({ data }) => {
        setWallets(data);
        if (!form.senderWalletId && data[0]) setForm((prev) => ({ ...prev, senderWalletId: data[0].id }));
      })
      .catch((err) => setError(getApiError(err, 'Could not load wallets.')))
      .finally(() => setLoading(false));
  }, []);

  const sender = wallets.find((w) => w.id === form.senderWalletId);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setSending(true);

    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();

    try {
      const { data } = await api.post('/transfers', {
        senderWalletId: form.senderWalletId,
        receiverWalletId: form.receiverWalletId.trim(),
        amount: Number(form.amount),
        description: form.description.trim() || null,
      }, {
        headers: { 'Idempotency-Key': idempotencyKey.current },
      });
      setSuccess(data);
      setForm((prev) => ({ ...prev, receiverWalletId: '', amount: '', description: '' }));
      idempotencyKey.current = null;
      const { data: refreshed } = await api.get('/wallets/me');
      setWallets(refreshed);
    } catch (err) {
      setError(getApiError(err, 'Transfer failed. Retry will reuse the same idempotency key.'));
    } finally {
      setSending(false);
    }
  };

  const resetRetryKey = () => { idempotencyKey.current = null; setSuccess(null); };

  return (
    <div className="page-shell narrow-page">
      <div className="page-header">
        <div><h1>Send money</h1><p>Move funds from one wallet to another.</p></div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && (
        <div className="success-panel">
          <CheckCircle2 size={26} />
          <div><strong>Transfer completed</strong><span>{success.reference} - {formatMoney(success.amount, success.currency)}</span></div>
          <button className="icon-button" onClick={() => navigator.clipboard.writeText(success.reference)} aria-label="Copy transfer reference" title="Copy reference"><Copy size={17} /></button>
        </div>
      )}

      <section className="transfer-layout">
        <form className="transfer-card" onSubmit={submit}>
          <label>From wallet
            <select required disabled={loading} value={form.senderWalletId} onChange={(e) => { setForm({ ...form, senderWalletId: e.target.value }); resetRetryKey(); }}>
              <option value="">Select wallet</option>
              {wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.currency} - {Number(wallet.balance).toFixed(2)}</option>)}
            </select>
          </label>

          {sender && <div className="available-balance"><span>Available</span><strong>{formatMoney(sender.balance, sender.currency)}</strong></div>}

          <label>Receiver wallet ID
            <input required value={form.receiverWalletId} onChange={(e) => { setForm({ ...form, receiverWalletId: e.target.value }); resetRetryKey(); }} placeholder="UUID of recipient wallet" />
          </label>

          <label>Amount
            <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => { setForm({ ...form, amount: e.target.value }); resetRetryKey(); }} placeholder="0.00" />
          </label>

          <label>Description <span className="optional">optional</span>
            <textarea maxLength={255} rows={3} value={form.description} onChange={(e) => { setForm({ ...form, description: e.target.value }); resetRetryKey(); }} placeholder="What is this payment for?" />
          </label>

          <button className="primary-button full" disabled={sending || !wallets.length}>
            {sending ? 'Sending...' : 'Send money'} <Send size={18} />
          </button>
        </form>

        <aside className="info-card">
          <ShieldCheck size={26} />
          <h3>How this transfer is protected</h3>
          <p>The backend debits, credits and writes the ledger in one database transaction.</p>
          <ul>
            <li>JWT-authenticated sender</li>
            <li>Pessimistic wallet locking</li>
            <li>Currency and ownership validation</li>
            <li>Idempotency key on every transfer</li>
          </ul>
          <p className="form-note">If a request fails due to a network error, pressing Send again without editing the form reuses the same idempotency key.</p>
        </aside>
      </section>
    </div>
  );
}
