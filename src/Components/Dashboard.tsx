import { usePortfolioStore } from '../store/usePortfolioStore';

export function PortfolioDashboard() {
  // Grab state slices and actions using selectors
  const transactions = usePortfolioStore((state) => state.transactions);
  const prices = usePortfolioStore((state) => state.prices);
  const addTransaction = usePortfolioStore((state) => state.addTransaction);
  const updatePrices = usePortfolioStore((state) => state.updatePrices);

  const handleBuyApple = () => {
    addTransaction({
      assetTicker: 'AAPL',
      type: 'BUY',
      quantity: 5,
      purchasePrice: 175.50,
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div>
      <h2>My Portfolio History ({transactions.length} items)</h2>
      <button onClick={handleBuyApple}>Simulate Buying 5 AAPL Shares</button>
      <button onClick={updatePrices}>Refresh Market Prices</button>

     
      {prices['AAPL'] && (
        <p>Current Apple Market Value: ${prices['AAPL'].currentPrice}</p>
      )}
    </div>
  );
}