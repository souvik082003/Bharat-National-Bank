import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/Layout/AppLayout';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import FundTransfer from './pages/FundTransfer';
import PayBills from './pages/PayBills';
import History from './pages/History';
import Services from './pages/Services';
import SIPCalculator from './pages/SIPCalculator';
import Loans from './pages/Loans';
import Profile from './pages/Profile';
import Tips from './pages/Tips';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-slate-400">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AuthPage() {
  const [mode, setMode] = useState('login');
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return mode === 'login'
    ? <LoginForm onSwitchToRegister={() => setMode('register')} />
    : <RegisterForm onSwitchToLogin={() => setMode('login')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="transfer" element={<FundTransfer />} />
            <Route path="pay-bills" element={<PayBills />} />
            <Route path="history" element={<History />} />
            <Route path="services" element={<Services />} />
            <Route path="sip-calculator" element={<SIPCalculator />} />
            <Route path="loans" element={<Loans />} />
            <Route path="profile" element={<Profile />} />
            <Route path="tips" element={<Tips />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
