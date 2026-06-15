# 📈 Investment Portfolio Tracker (Vite + React + TS)

A real-time financial asset portfolio tracker built with React, TypeScript, and Vite. The application aggregates manual buy/sell transaction histories, secure client-side API integrations to pull live asset pricing tokens, tracks overall portfolio valuations, and visualizes asset allocation profiles completely client-side.

---

## 🛠️ Tech Stack & Key Modules

* **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) via [Vite](https://vite.dev/) (utilizing HMR and optimized compilers).
* **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) with built-in `persist` middleware synchronization to track local transaction registers seamlessly across browser refreshes via `localStorage`.
* **Data Aggregation:** Custom declarative react polling hooks tracking window context visibility boundaries to interface smoothly with [Finnhub Stock API](https://finnhub.io/).
* **Data Visualization:** [Recharts](https://recharts.org/) charting engine delivering interactive Donut/Pie allocations and 7-day chronological asset valuation vector line graphs.

---

## 🚀 Getting Started

### 1. Installation
Clone the repository, navigate to the root workspace folder, and install node dependencies:
```
npm install