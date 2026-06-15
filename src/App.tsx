import TransactionForm from './components/TransactionForm';
import { usePortfolioStore } from './store/usePortfolioStore';

export default function App() {
  const transactions = usePortfolioStore((state) => state.transactions);

  return (
    <main style={{ padding: '2rem', backgroundColor: '#121212', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ textAlign: 'center' }}>📈 Investment Portfolio Tracker</h1>
      
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