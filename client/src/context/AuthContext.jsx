import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserSummary } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);
    const [branchName, setBranchName] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('bnb_user');
        if (saved) {
            try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem('bnb_user'); }
        }
        setLoading(false);
    }, []);

    const refreshUserData = useCallback(async () => {
        if (!user) return;
        try {
            const data = await getUserSummary(user.id);
            setAccounts(data.accounts || []);
            setMonthlyExpenses(data.monthlyExpenses || 0);
            setBranchName(data.branchName || '');
            setIfscCode(data.ifscCode || '');
        } catch (err) {
            console.error('Failed to refresh user data:', err);
        }
    }, [user]);

    useEffect(() => { if (user) refreshUserData(); }, [user, refreshUserData]);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('bnb_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setAccounts([]);
        setMonthlyExpenses(0);
        setBranchName('');
        setIfscCode('');
        localStorage.removeItem('bnb_user');
    };

    const value = { user, accounts, monthlyExpenses, branchName, ifscCode, loading, login, logout, refreshUserData };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
