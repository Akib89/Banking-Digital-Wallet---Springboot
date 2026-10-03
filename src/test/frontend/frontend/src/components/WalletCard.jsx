import { ArrowDownLeft, ArrowUpRight, ChevronRight, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMoney, shortId } from '../utils/format';

export default function WalletCard({ wallet, onDeposit, onWithdraw }) {
  return (
    <article className="wallet-card">
      <div className="wallet-card-top">
        <div className="wallet-icon"><Wallet size={21} /></div>
        <div className={`status-pill ${wallet.status === 'ACTIVE' ? 'good' : ''}`}>{wallet.status}</div>
      </div>

      <div className="wallet-currency">{wallet.currency} wallet</div>
      <div className="wallet-balance">{formatMoney(wallet.balance, wallet.currency)}</div>
      <div className="wallet-id">Wallet ID: {shortId(wallet.id)}</div>

      <div className="wallet-actions">
        <button className="soft-button" onClick={() => onDeposit(wallet)}><ArrowDownLeft size={17} /> Deposit</button>
        <button className="soft-button" onClick={() => onWithdraw(wallet)}><ArrowUpRight size={17} /> Withdraw</button>
      </div>

      <Link className="wallet-details" to={`/wallets/${wallet.id}`}>
        View wallet <ChevronRight size={17} />
      </Link>
    </article>
  );
}
