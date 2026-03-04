import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import { useAuth } from '../context/AuthContext';
import { getAllTransactions, formatCurrency } from '../api/api';

export default function History() {
    const { user } = useAuth();
    const { onToggleSidebar } = useOutletContext();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (user?.id) getAllTransactions(user.id).then(setTransactions).catch(() => { }).finally(() => setLoading(false));
    }, [user]);

    const filtered = transactions.filter(t => {
        if (filter !== 'all' && t.type?.toLowerCase() !== filter) return false;
        if (search && !(`${t.type} ${t.details_primary} ${t.amount}`).toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const totalSpent = transactions.reduce((s, t) => s + (t.amount || 0), 0);
    const card = { background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };

    return (
        <>
            <Header title="Transaction History" subtitle="All your transactions" onToggleSidebar={onToggleSidebar} />
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>



                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ ...card, padding: '20px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total Transactions</p>
                        <p style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>{transactions.length}</p>
                    </div>
                    <div style={{ ...card, padding: '20px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total Spent</p>
                        <p style={{ fontSize: '28px', fontWeight: 800, color: '#ea580c' }}>{formatCurrency(totalSpent)}</p>
                    </div>
                    <div style={{ ...card, padding: '20px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Current Filter</p>
                        <p style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', textTransform: 'capitalize' }}>{filter}</p>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ ...card, padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {['all', 'transfer', 'bill payment'].map(f => (
                            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: filter === f ? '#ea580c' : '#f8fafc', color: filter === f ? 'white' : '#64748b' }}>{f === 'all' ? 'All' : f === 'transfer' ? 'Transfers' : 'Bills'}</button>
                        ))}
                    </div>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..." style={{ padding: '10px 16px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', outline: 'none', width: '260px', boxSizing: 'border-box' }} onFocus={(e) => { e.target.style.borderColor = '#ea580c'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }} />
                </div>

                {/* Transaction List */}
                <div style={{ ...card, overflow: 'hidden' }}>
                    {/* Table Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 120px', padding: '14px 24px', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Type</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Details</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</span>
                    </div>

                    {loading ? (
                        <div style={{ padding: '20px 24px' }}>{[1, 2, 3, 4].map(i => <div key={i} style={{ height: '40px', borderRadius: '10px', background: '#f1f5f9', marginBottom: '8px' }}></div>)}</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                            <svg width="48" height="48" fill="none" stroke="#cbd5e1" viewBox="0 0 24 24" style={{ margin: '0 auto 12px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p style={{ fontWeight: 600 }}>No transactions found</p>
                        </div>
                    ) : filtered.map((t, i) => (
                        <div key={t.id || i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 120px', padding: '14px 24px', borderBottom: '1px solid #f8fafc', alignItems: 'center', transition: 'background 0.1s' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: t.type === 'Fund Transfer' ? '#fff7ed' : '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <svg width="14" height="14" fill="none" stroke={t.type === 'Fund Transfer' ? '#ea580c' : '#059669'} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={t.type === 'Fund Transfer' ? 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4' : 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2'} /></svg>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{t.type}</span>
                            </div>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>{t.details_primary || '—'}</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>-{formatCurrency(t.amount)}</span>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
