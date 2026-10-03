import { ArrowDownLeft, ArrowUpRight, CircleDollarSign } from 'lucide-react';
import { formatDate, formatMoney } from '../utils/format';

function TypeIcon({ type }) {
  if (type === 'DEPOSIT' || type === 'TRANSFER_IN') return <ArrowDownLeft size={18} />;
  if (type === 'WITHDRAWAL' || type === 'TRANSFER_OUT') return <ArrowUpRight size={18} />;
  return <CircleDollarSign size={18} />;
}

function isCredit(type) {
  return type === 'DEPOSIT' || type === 'TRANSFER_IN' || type === 'REFUND';
}

export default function TransactionTable({ rows = [], currency = 'BDT', loading = false }) {
  if (loading) return <div className="empty-state compact">Loading transactions…</div>;
  if (!rows.length) return <div className="empty-state compact">No transactions yet.</div>;

  return (
    <div className="table-wrap">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Reference</th>
            <th>Date</th>
            <th className="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const credit = isCredit(row.type);
            return (
              <tr key={row.id}>
                <td>
                  <div className={`transaction-type-icon ${credit ? 'credit' : 'debit'}`}>
                    <TypeIcon type={row.type} />
                  </div>
                </td>
                <td>
                  <strong>{row.type.replaceAll('_', ' ')}</strong>
                  <span className="cell-subtext">{row.description || 'Wallet transaction'}</span>
                </td>
                <td><span className="mono">{row.reference}</span></td>
                <td>{formatDate(row.createdAt)}</td>
                <td className={`right amount ${credit ? 'positive' : 'negative'}`}>
                  {credit ? '+' : '-'}{formatMoney(row.amount, currency)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
