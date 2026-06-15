import { usePortfolioStore } from '../store/usePortfolioStore';

export default function DashboardMetrics() {
  const transactions = usePortfolioStore((state) => state.transactions);
  const prices = usePortfolioStore((state) => state.prices);

  // 1. Calculate Per-Asset Aggregations
  // We need to know how many net shares the user holds for each ticker
  const assetCalculations = transactions.reduce((acc, tx) => {
    const ticker = tx.assetTicker;
    
    if (!acc[ticker]) {
      acc[ticker] = { netQuantity: 0, netCostBasis: 0 };
    }

    const direction = tx.type === 'BUY' ? 1 : -1;
    
    // Track total circulating tokens/shares
    acc[ticker].netQuantity += tx.quantity * direction;
    // Track total capital deployed minus capital retrieved
    acc[ticker].netCostBasis += (tx.quantity * tx.purchasePrice) * direction;

    return acc;
  }, {} as Record<string, { netQuantity: number; netCostBasis: number }>);

  // 2. Aggregate Globally across all holdings
  let totalCost = 0;
  let currentValue = 0;

  Object.entries(assetCalculations).forEach(([ticker, data]) => {
    const livePrice = prices[ticker]?.currentPrice || 0;
    
    // Only calculate metrics for positions the user currently holds shares in
    if (data.netQuantity > 0) {
      totalCost += data.netCostBasis;
      currentValue += data.netQuantity * livePrice;
    }
  });

  const netProfitLoss = currentValue - totalCost;
  const percentageReturn = totalCost > 0 ? (netProfitLoss / totalCost) * 100 : 0;

  // Determine dynamic UI styling flags based on performance
  const isProfitable = netProfitLoss >= 0;
  const pnlColor = isProfitable ? '#10b981' : '#ef4444';
  const pnlSign = isProfitable ? '+' : '';

  return (
    <div style={styles.metricsContainer}>
      {/* Metric Card 1: Net Worth Valuations */}
      <div style={styles.card}>
        <span style={styles.cardLabel}>Total Portfolio Value</span>
        <h2 style={styles.cardValue}>
          ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
      </div>

      {/* Metric Card 2: Total Capital Outlay */}
      <div style={styles.card}>
        <span style={styles.cardLabel}>Total Invested Capital</span>
        <h2 style={{ ...styles.cardValue, color: '#e5e7eb' }}>
          ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
      </div>

      {/* Metric Card 3: Dynamic Gains / Losses */}
      <div style={styles.card}>
        <span style={styles.cardLabel}>Net Profit / Loss</span>
        <h2 style={{ ...styles.cardValue, color: pnlColor }}>
          {pnlSign}${netProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
        <span style={{ ...styles.percentageBadge, backgroundColor: `${pnlColor}20`, color: pnlColor }}>
          {pnlSign}{percentageReturn.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

const styles = {
  metricsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1000px',
    margin: '1.5rem auto',
    padding: '0 1rem',
    fontFamily: 'system-ui, sans-serif'
  },
  card: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #2d2d2d',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)'
  },
  cardLabel: {
    color: '#9ca3af',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '0.5rem'
  },
  cardValue: {
    margin: 0,
    fontSize: '1.85rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
    color: '#fff'
  },
  percentageBadge: {
    alignSelf: 'flex-start',
    marginTop: '0.5rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700'
  }
};