import React, { useState } from 'react';
import { usePortfolioStore } from '../store/usePortfolioStore';

export default function TransactionForm() {
  // 1. Hook up our addTransaction action from the global Zustand store
  const addTransaction = usePortfolioStore((state) => state.addTransaction);

  // 2. Set up local component state to handle form fields smoothly
  const [ticker, setTicker] = useState('');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Defaults to today
  
  const [error, setError] = useState('');

  // 3. Handle Form Submission safely
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Quick validation checks
    if (!ticker.trim()) return setError('Please enter a valid asset ticker.');
    
    const parsedQuantity = parseFloat(quantity);
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return setError('Quantity must be a positive number.');
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return setError('Price must be a positive number.');
    }

    // 4. Dispatch valid structured data to our global state store
    addTransaction({
      assetTicker: ticker.trim().toUpperCase(),
      type,
      quantity: parsedQuantity,
      purchasePrice: parsedPrice,
      date,
    });

    // 5. Reset input fields for the next transaction (leaving type and date intact)
    setTicker('');
    setQuantity('');
    setPrice('');
  };

  return (
    <div style={styles.formContainer}>
      <h3 style={styles.title}>Log a New Transaction</h3>
      
      {error && <div style={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.formGrid}>
        
        {/* Ticker Input */}
        <div style={styles.inputGroup}>
          <label htmlFor="ticker" style={styles.label}>Asset Ticker</label>
          <input
            id="ticker"
            type="text"
            placeholder="e.g. AAPL, TSLA, BTC"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Action Type Toggle (Buy/Sell) */}
        <div style={styles.inputGroup}>
          <label htmlFor="actionType" style={styles.label}>Action</label>
          <select
            id="actionType"
            value={type}
            onChange={(e) => setType(e.target.value as 'BUY' | 'SELL')}
            style={styles.select}
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>

        {/* Share/Token Quantity */}
        <div style={styles.inputGroup}>
          <label htmlFor="quantity" style={styles.label}>Quantity</label>
          <input
            id="quantity"
            type="number"
            step="any"
            placeholder="0.00"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Price Paid per unit */}
        <div style={styles.inputGroup}>
          <label htmlFor="price" style={styles.label}>Price (per unit)</label>
          <input
            id="price"
            type="number"
            step="0.01"
            placeholder="$0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Date of Purchase */}
        <div style={styles.inputGroup}>
          <label htmlFor="date" style={styles.label}>Transaction Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Submit Button */}
        <button type="submit" style={type === 'BUY' ? styles.submitButtonBuy : styles.submitButtonSell}>
          Add {type} Transaction
        </button>
      </form>
    </div>
  );
}

// Inline styling schema to keep things working without needing extra CSS frameworks configured yet
const styles = {
  formContainer: {
    maxWidth: '500px',
    margin: '2rem auto',
    padding: '2rem',
    borderRadius: '12px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    color: '#fff',
    fontFamily: 'system-ui, sans-serif'
  },
  title: {
    marginTop: 0,
    marginBottom: '1.5rem',
    fontSize: '1.4rem',
    borderBottom: '1px solid #333',
    paddingBottom: '0.5rem'
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.2rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.4rem'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#aaa',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #444',
    backgroundColor: '#262626',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none'
  },
  select: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #444',
    backgroundColor: '#262626',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  errorMessage: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    border: '1px solid rgba(239, 68, 68, 0.3)'
  },
  submitButtonBuy: {
    marginTop: '0.5rem',
    padding: '0.85rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#10b981',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  },
  submitButtonSell: {
    marginTop: '0.5rem',
    padding: '0.85rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  }
};