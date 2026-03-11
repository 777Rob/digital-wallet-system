# Digital Wallet System

A single-page web application implementing a digital wallet for an online gaming platform. Users can register, authenticate, place coin-flip bets, top up their balance, redeem promotional codes, and review their transaction and betting history in real time.

## Features

- **Authentication** — Registration and login with JWT-based session persistence.
- **Coin-Flip Betting** — Place bets with animated coin-flip resolution and instant balance updates.
- **Wallet Management** — Top up balance and redeem one-time promotional codes (e.g., `HELLO` for €1,000 free credits).
- **Bet Management** — View paginated bet history with status filtering and cancellation support.
- **Transaction History** — Filterable, paginated ledger of all wallet activity (bets, wins, cancellations, deposits, promos).
- **Real-Time Balance** — WebSocket integration ensures the displayed balance stays current across tabs and after background events.
- **Internationalisation** — Full English and Lithuanian translations, switchable at runtime.
- **Dark / Light Mode** — Theme toggle powered by Mantine's colour scheme engine, persisted across sessions.
- **Clean Architecture** — No unnecessary prop drilling; components independently fetch their required data and manage scoped loading/error boundaries (`ErrorState`).

## Technology Stack

| Layer             | Technology                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| Build             | [Vite](https://vitejs.dev/) 7                                                                     |
| UI Framework      | [React](https://react.dev/) 19 + TypeScript 5.9                                                   |
| Component Library | [Mantine](https://mantine.dev/) 8 + [Tabler Icons](https://tabler.io/icons)                       |
| State Management  | [Zustand](https://zustand-demo.pmnd.rs/) (auth & wallet stores, persisted via middleware)         |
| Server State      | [TanStack React Query](https://tanstack.com/query) 5 (caching, pagination, mutation invalidation) |
| Routing           | [React Router](https://reactrouter.com/) 7                                                        |
| HTTP Client       | [Axios](https://axios-http.com/) with interceptor-based auth                                      |
| WebSockets        | [Socket.IO Client](https://socket.io/)                                                            |
| i18n              | [i18next](https://www.i18next.com/) + react-i18next                                               |
| Mock API          | [Express.js](https://expressjs.com/) + Faker.js + Swagger UI                                      |

## Project Structure

```
Digital-Wallet-System/
├── app/                          # Frontend application
│   └── src/
│       ├── api/                  # Axios client with auth interceptor
│       ├── components/
│       │   ├── Auth/             # AuthLayout, ProtectedRoute
│       │   ├── common/           # Shared UI (AppLogo, BetStatusBadge, ColorSchemeToggle, LanguageMenu, TransactionAmountCell, ErrorState)
│       │   ├── Dashboard/        # BetForm, CoinFlipResult, TopUpForm, PromoCodeForm, RecentBetsTable, RecentTransactionsTable
│       │   └── Layout/           # Application shell with sidebar navigation
│       ├── config/               # Environment-based constants
│       ├── hooks/
│       │   ├── mutations/        # useAuthMutations, useBetMutations, useWalletMutations
│       │   ├── queries/          # useBets, useTransactions, useRecentTransactions
│       │   ├── useCoinFlipAnimation.ts
│       │   ├── useCountdown.ts   # Custom hook for standardizing countdown intervals
│       │   ├── useWalletWs.ts
│       │   └── useWheel.ts
│       ├── pages/                # Dashboard, Wallet, Login, Register, MyBets, Transactions, WheelOfFortune
│       ├── store/                # Zustand stores (auth, wallet)
│       ├── types/                # Shared TypeScript interfaces
│       └── utils/                # Currency formatting, date formatting, error message extraction
├── mock-api/                     # Express.js mock server with Swagger docs
└── README.md
```

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm

### 1. Start the Mock API

```bash
cd mock-api
npm install
npm start
```

The API server will be available at [http://localhost:3000](http://localhost:3000).
Swagger documentation is served at [http://localhost:3000/docs](http://localhost:3000/docs).

### 2. Start the Frontend Application

In a separate terminal:

```bash
cd app
npm install
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

### 3. Verify the Build

```bash
cd app
npm run lint
npm run build
```

## Architecture Overview

### State Management

The application uses a dual-store approach:

- **`useAuthStore`** — Manages the JWT token and authenticated user identity. Persisted to `localStorage` via Zustand middleware.
- **`useWalletStore`** — Tracks the user's current balance and currency. Updated both on API responses and via WebSocket events.

### Data Fetching

TanStack React Query handles all server state:

- **Query hooks** (`useBets`, `useTransactions`, `useRecentBets`, `useRecentTransactions`) provide declarative data fetching with built-in caching and pagination.
- **Mutation hooks** (`useLoginMutation`, `useRegisterMutation`, `usePlaceBetMutation`, `useCancelBetMutation`, `useTopUpMutation`, `usePromoCodeMutation`) handle write operations and trigger automatic query invalidation on success.

### Real-Time Updates

The `useWalletWs` hook establishes a Socket.IO connection that listens for `balance_update` events. When the server emits a balance change (e.g., after a bet resolves or a top-up completes), the wallet store updates immediately without requiring an API poll.

### Routing and Authentication

- **`ProtectedRoute`** — A route guard component that redirects unauthenticated users to the login page.
- **`AuthLayout`** — Wraps public pages (login, register) with shared controls for language and theme switching.
- **`Shell`** — The authenticated layout providing the application header, sidebar navigation, and content area.

### Mock API Endpoints

| Method   | Endpoint           | Description                                 |
| -------- | ------------------ | ------------------------------------------- |
| `POST`   | `/register`        | Create a new player account                 |
| `POST`   | `/login`           | Authenticate and receive access token       |
| `POST`   | `/bet`             | Place a coin-flip bet                       |
| `GET`    | `/my-bets`         | List bets with pagination and filtering     |
| `DELETE` | `/my-bet/:id`      | Cancel a pending bet                        |
| `GET`    | `/my-transactions` | List transactions with pagination/filtering |
| `POST`   | `/top-up`          | Deposit funds into wallet                   |
| `POST`   | `/promo-code`      | Redeem a promotional code                   |
