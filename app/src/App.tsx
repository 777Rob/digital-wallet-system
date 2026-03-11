import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { AuthLayout } from './components/Auth/AuthLayout';
import { Shell } from './components/Layout/Shell';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { MyBets } from './pages/MyBets';
import { Transactions } from './pages/Transactions';
import { Wallet } from './pages/Wallet';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route 
            path="/login" 
            element={token ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={token ? <Navigate to="/dashboard" replace /> : <Register />} 
          />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Shell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/my-bets" element={<MyBets />} />
            <Route path="/transactions" element={<Transactions />} />
          </Route>
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
