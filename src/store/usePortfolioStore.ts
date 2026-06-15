import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Transaction, type AssetPrice, type FinnhubQuote, mapFinnhubQuoteToAssetPrice } from '../types/portfolio';


interface PortfolioState {
  transactions: Transaction[];
  prices: Record<string, AssetPrice>; 
  isLoadingPrices: boolean;
  error: string | null;
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  updatePrices: () => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      transactions: [],
      prices: {},
      isLoadingPrices: false,
      error: null,

      addTransaction: (newTx) => set((state) => ({
        transactions: [
          ...state.transactions,
          {
            ...newTx,
            id: crypto.randomUUID(), // Native browser support for safe unique IDs
            assetTicker: newTx.assetTicker.toUpperCase(),
          }
        ]
      })),

      removeTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((tx) => tx.id !== id)
      })),

      updatePrices: async () => {
        const { transactions, isLoadingPrices } = get();
        
        if (transactions.length === 0 || isLoadingPrices) return;

        set({ isLoadingPrices: true, error: null });

        const uniqueTickers = Array.from(new Set(transactions.map((tx) => tx.assetTicker)));
        const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;

        try {
          const updatedPrices: Record<string, AssetPrice> = { ...get().prices };

          await Promise.all(
            uniqueTickers.map(async (ticker) => {
              const response = await fetch(
                `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`
              );

              if (!response.ok) throw new Error(`Failed to fetch data for ${ticker}`);

              const rawData: FinnhubQuote = await response.json();
              
              updatedPrices[ticker] = mapFinnhubQuoteToAssetPrice(ticker, rawData);
            })
          );

          set({ prices: updatedPrices, isLoadingPrices: false });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err.message : 'An error occurred while updating market prices.', 
            isLoadingPrices: false 
          });
        }
      },
    }),
    {
      name: 'portfolio-storage', // The unique key used in localStorage
      partialize: (state) => ({ transactions: state.transactions }), // Contextual safety: Only persist the transaction history. Don't cache loading states or volatile live asset prices.
    }
  )
);