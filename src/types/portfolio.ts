
export interface Transaction {
  id: string;             
  assetTicker: string;    
  type: 'BUY' | 'SELL';   
  quantity: number;       
  purchasePrice: number;  
  date: string;          
}


export interface FinnhubQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Unix timestamp of the data
}

// is what your React application will actually use.
export interface AssetPrice {
  ticker: string;
  currentPrice: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  lastUpdated: Date;
}


export function mapFinnhubQuoteToAssetPrice(ticker: string, rawData: FinnhubQuote): AssetPrice {
  return {
    ticker: ticker.toUpperCase(),
    currentPrice: rawData.c,
    change: rawData.d,
    percentChange: rawData.dp,
    high: rawData.h,
    low: rawData.l,
    open: rawData.o,
    previousClose: rawData.pc,
    lastUpdated: new Date(rawData.t * 1000),
  };
}