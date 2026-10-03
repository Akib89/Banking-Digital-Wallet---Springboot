import { ChevronLeft, ChevronRight, ReceiptText } from 'lucide-react';
import { useEffect, useState } from 'react';
import api, { getApiError } from '../api/client';
import TransactionTable from '../components/TransactionTable';

export default function TransactionsPage() {
  const [wallets, setWallets] = useState([]);
  const [walletId, setWalletId] = useState('');
  const [page, setPage] = useState(0);
  const [result, setResult] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/wallets/me').then(({ data }) => {
      setWallets(data);
      if (data[0]) setWalletId(data[0].id);
      else setLoading(false);
    }).catch((err) => { setError(getApiError(err)); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!walletId) return;
    setLoading(true);
    setError('');
    api.get(`/wallets/${walletId}/transactions?page=${page}&size=15`)
      .then(({ data }) => setResult(data))
      .catch((err) => setError(getApiError(err, 'Could not load transactions.')))
      .finally(() => setLoading(false));
  }, [walletId, page]);

  const selected = wallets.find((w) => w.id === walletId);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div><h1>Transactions</h1><p>Review deposits, withdrawals and transfers.</p></div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <section className="section-block">
        <div className="filter-row">
          <div className="filter-title"><ReceiptText size={20} /><span>{result.totalElements || 0} entries</span></div>
          <label className="inline-select">Wallet
            <select value={walletId} onChange={(e) => { setWalletId(e.target.value); setPage(0); }}>
              {wallets.map((wallet) => <option value={wallet.id} key={wallet.id}>{wallet.currency} - {wallet.id.slice(0, 8)}...</option>)}
            </select>
          </label>
        </div>

        {!wallets.length && !loading ? (
          <div className="empty-state compact">Create a wallet first to see transaction history.</div>
        ) : (
          <TransactionTable rows={result.content || []} currency={selected?.currency || 'BDT'} loading={loading} />
        )}

        {result.totalPages > 1 && (
          <div className="pagination">
            <button className="secondary-button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={17} /> Previous</button>
            <span>Page {page + 1} of {result.totalPages}</span>
            <button className="secondary-button" disabled={page + 1 >= result.totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={17} /></button>
          </div>
        )}
      </section>
    </div>
  );
}