import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { usePortfolioStore } from '../store/usePortfolioStore';

export default function PortfolioCharts() {
  const transactions = usePortfolioStore((state) => state.transactions);
  const prices = usePortfolioStore((state) => state.prices);

  // --- CHART 1: PIE CHART ALLOCATION LOGIC ---
  // Compile total live values per unique ticker
  const allocationMap = transactions.reduce((acc, tx) => {
    const ticker = tx.assetTicker;
    if (!acc[ticker]) acc[ticker] = 0;
    
    const direction = tx.type === 'BUY' ? 1 : -1;
    acc[ticker] += tx.quantity * direction;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(allocationMap)
    .map(([name, qty]) => {
      const livePrice = prices[name]?.currentPrice || 0;
      return {
        name,
        value: parseFloat((qty * livePrice).toFixed(2)),
      };
    })
    .filter((item) => item.value > 0); // Ignore closed out fully sold stakes

  // Theme spectrum arrays for beautiful node division matching dark ui rules
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  // --- CHART 2: LINE CHART TREND GENERATOR (7-Day Performance Strategy) ---
  // To generate a historical timeline safely on the free tier, we map the cumulative transactions 
  // chronologically across the last rolling 7 calendar days.
  const generate7DayHistory = () => {
    const dataPoints = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      const dateString = targetDate.toISOString().split('T')[0];

      let dayTotalValue = 0;

      // Scan positions acquired up to this calendar slice
      Object.entries(allocationMap).forEach(([ticker, currentQty]) => {
        const livePrice = prices[ticker]?.currentPrice || 0;
        
        // Find if this asset was held on this historical date
        const sharesOnDate = transactions
          .filter((tx) => tx.assetTicker === ticker && tx.date <= dateString)
          .reduce((sum, tx) => sum + tx.quantity * (tx.type === 'BUY' ? 1 : -1), 0);

        if (sharesOnDate > 0) {
          // Fallback algorithm: scale slightly against daily movement delta metrics if available
          const priceDelta = prices[ticker]?.change || 0;
          const estimatedPriceOnDate = i === 0 ? livePrice : livePrice - (priceDelta * (i / 7));
          dayTotalValue += sharesOnDate * estimatedPriceOnDate;
        }
      });

      dataPoints.push({
        day: targetDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
        'Portfolio Value ($)': parseFloat(dayTotalValue.toFixed(2)),
      });
    }
    return dataPoints;
  };

  const lineData = generate7DayHistory();

  return (
    <div style={styles.chartWrapper}>
      {/* Asset Allocation Pie Section */}
      <div style={styles.chartBlock}>
        <h4 style={styles.chartTitle}>Asset Allocation (Current Value)</h4>
        {pieData.length === 0 ? (
          <p style={styles.emptyText}>Add buy transactions to see allocations.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} 
                formatter={(value) => [`$${value}`, 'Allocation Value']}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Valuation Growth Line Section */}
      <div style={styles.chartBlock}>
        <h4 style={styles.chartTitle}>7-Day Valuation Trend</h4>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={lineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <XAxis dataKey="day" stroke="#6b7280" fontSize={11} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
            <Line 
              type="monotone" 
              dataKey="Portfolio Value ($)" 
              stroke="#10b981" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 1 }}
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const styles = {
  chartWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    maxWidth: '1000px',
    margin: '2rem auto',
    padding: '0 1rem',
    fontFamily: 'system-ui, sans-serif',
  },
  chartBlock: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #2d2d2d',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)',
  },
  chartTitle: {
    margin: '0 0 1.2rem 0',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  emptyText: {
    color: '#4b5563',
    textAlign: 'center' as const,
    paddingTop: '4rem',
    fontSize: '0.95rem',
  },
};