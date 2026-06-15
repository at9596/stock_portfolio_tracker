import { useEffect, useRef } from 'react';
import { usePortfolioStore } from '../store/usePortfolioStore';

/**
 * Custom hook to fetch and poll live prices for all unique assets 
 * present in the user's transaction history.
 * * @param intervalMs The polling frequency in milliseconds (Default: 30000ms / 30s)
 */
export function usePricePoller(intervalMs: number = 30000) {
  // 1. Extract core methods and state slices out of Zustand
  const updatePrices = usePortfolioStore((state) => state.updatePrices);
  const transactions = usePortfolioStore((state) => state.transactions);
  const isLoading = usePortfolioStore((state) => state.isLoadingPrices);
  const error = usePortfolioStore((state) => state.error);

  // Store the updatePrices function in a ref to keep interval side-effects clean
  const updatePricesRef = useRef(updatePrices);
  
  useEffect(() => {
    updatePricesRef.current = updatePrices;
  }, [updatePrices]);

  // 2. Generate a comma-separated string of unique tickers to track changes safely
  const uniqueTickersString = Array.from(
    new Set(transactions.map((tx) => tx.assetTicker))
  ).sort().join(',');

  useEffect(() => {
    // If the portfolio is empty, don't run any fetch cycles
    if (!uniqueTickersString) return;

    // Trigger an immediate fetch on initial load or when unique tickers change
    updatePricesRef.current();

    // 3. Set up the polling heartbeat interval
    const intervalId = setInterval(() => {
      // Security Layer: Only pull data if the user is actively looking at the browser tab
      if (document.visibilityState === 'visible') {
        updatePricesRef.current();
      }
    }, intervalMs);

    // 4. Handle Window Focus re-fetches
    // When a user leaves the tab and comes back, fetch instantly to provide snappy numbers
    const handleFocus = () => {
      updatePricesRef.current();
    };

    window.addEventListener('focus', handleFocus);

    // 5. Cleanup routine to clear memory and halt loops on unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [uniqueTickersString, intervalMs]);

  return { isLoading, error };
}