import TransactionForm from './components/TransactionForm';
import { usePortfolioStore } from './store/usePortfolioStore';
import { usePricePoller } from './hooks/usePricePoller';

export default function App() {
  const transactions = usePortfolioStore((state) => state.transactions);
  
  // Initialize the pricing heartbeat engine (Polls every 30 seconds)
  const { isLoading, error } = usePricePoller(30000);

  return (
    <main style={{ padding: '2rem', backgroundColor: '#121212', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ textAlign: 'center' }}>📈 Investment Portfolio Tracker</h1>

      {/* Visual Activity Tracker */}
      <div style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
        {isLoading ? '🔄 Refreshing asset rates...' : '🟢 Live updates connected'}
      </div>

      {error && (
        <div style={{ maxWidth: '500px', margin: '1rem auto', padding: '0.75rem', backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px' }}>
          <strong>API error discovered:</strong> {error}
        </div>
      )}
      
      <TransactionForm />

      {/* Simple debug checklist display underneath to confirm the state is writing properly */}
      <section style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <h3>History Count: {transactions.length} items logged</h3>
        <ul>
          {transactions.map(tx => (
            <li key={tx.id}>
              [{tx.type}] {tx.quantity} units of {tx.assetTicker} @ ${tx.purchasePrice} each
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}