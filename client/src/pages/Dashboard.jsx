import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllTransactions, formatCurrency } from '../api/api';
import Header from '../components/Layout/Header';
import Modal from '../components/common/Modal';

const DEMO_MPIN = '123456';



export default function Dashboard() {
    const { user, accounts, monthlyExpenses, branchName, ifscCode } = useAuth();
    const { onToggleSidebar } = useOutletContext();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBalance, setShowBalance] = useState(false);
    const [mpinVerified, setMpinVerified] = useState(false);
    const [showMpinModal, setShowMpinModal] = useState(false);
    const [mpinInput, setMpinInput] = useState('');
    const [mpinError, setMpinError] = useState('');

    const primaryAcc = accounts?.[0];
    const totalBalance = accounts?.reduce((s, a) => s + (a.Balance || 0), 0) || 0;

    useEffect(() => {
        if (user?.id) getAllTransactions(user.id).then(setTransactions).catch(() => { }).finally(() => setLoading(false));
    }, [user]);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    const lastLogin = new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const maskAccNo = (acc) => acc ? '●●●●●●' + acc.slice(-4) : '●●●●●●●●';
    const maskAmount = () => '₹ ●●,●●,●●●.●●';

    const verifyMpin = () => {
        if (mpinInput === DEMO_MPIN) {
            setMpinVerified(true);
            setShowMpinModal(false);
            setMpinInput('');
            setMpinError('');
        } else {
            setMpinError('Invalid MPIN. Please try again.');
            setMpinInput('');
        }
    };

    const card = { background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px' };
    const label = { fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' };

    const quickActions = [
        { label: 'Send Money', path: '/transfer', color: '#ea580c', bg: '#fff7ed', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
        { label: 'Pay Bills', path: '/pay-bills', color: '#059669', bg: '#ecfdf5', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
        { label: 'Loans & EMI', path: '/loans', color: '#8b5cf6', bg: '#f5f3ff', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
        { label: 'History', path: '/history', color: '#d97706', bg: '#fffbeb', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: 'Services', path: '/services', color: '#2563eb', bg: '#eff6ff', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { label: 'Profile', path: '/profile', color: '#06b6d4', bg: '#ecfeff', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ];

    return (
        <>
            <Header title="Dashboard" subtitle="Overview of your finances" onToggleSidebar={onToggleSidebar} />
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                <div style={{ maxWidth: '1400px' }}>
                    {/* Hero Banner */}
                    <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b4e, #1a1a2e)', borderRadius: '20px', padding: '28px 32px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(234,88,12,0.15)' }}></div>
                        <div style={{ position: 'absolute', bottom: '-30px', left: '40%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(251,146,60,0.1)' }}></div>
                        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <p style={{ color: '#fb923c', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{greeting},</p>
                                <h2 style={{ color: 'white', fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>{user?.name || 'User'}</h2>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Last login: {lastLogin}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Total Balance</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                                    <p style={{ color: 'white', fontSize: '28px', fontWeight: 800, letterSpacing: '-1px' }}>{showBalance ? formatCurrency(totalBalance) : maskAmount()}</p>
                                    <button onClick={() => setShowBalance(!showBalance)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}>
                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showBalance ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'} /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '20px' }}>
                        {quickActions.map(a => (
                            <button key={a.label} onClick={() => navigate(a.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '18px 8px', borderRadius: '16px', border: '1px solid #f1f5f9', background: '#fff', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = a.bg; e.currentTarget.style.borderColor = a.color + '30'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${a.color}15`; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="18" height="18" fill="none" stroke={a.color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={a.icon} /></svg>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>{a.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Account Card with MPIN Protection */}
                    <div style={{ background: 'linear-gradient(135deg, #ea580c, #f97316, #fb923c)', borderRadius: '18px', padding: '24px 28px', marginBottom: '20px', position: 'relative', overflow: 'hidden', color: 'white' }}>
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                        <div style={{ position: 'absolute', bottom: '-15px', right: '30%', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}></div>

                        {!mpinVerified ? (
                            /* Locked State */
                            <div style={{ textAlign: 'center', padding: '16px 0', position: 'relative', zIndex: 2 }}>
                                <div style={{ width: '56px', height: '56px', margin: '0 auto 12px', borderRadius: '16px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="28" height="28" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <p style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Account Details Locked</p>
                                <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '16px' }}>Enter your MPIN to view account number, IFSC & balance</p>
                                <button onClick={() => setShowMpinModal(true)} style={{ padding: '10px 28px', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '12px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px', backdropFilter: 'blur(4px)' }}>🔑 Enter MPIN</button>
                            </div>
                        ) : (
                            /* Unlocked State */
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.7, marginBottom: '4px' }}>Savings Account</p>
                                        <p style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>{showBalance ? formatCurrency(primaryAcc?.Balance || 0) : maskAmount()}</p>
                                    </div>
                                    <button onClick={() => { setMpinVerified(false); setShowBalance(false); }} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: 'white', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        Lock
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                                    <div><p style={{ fontSize: '9px', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>Account Number</p><p style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1px' }}>{primaryAcc?.Account_No}</p></div>
                                    <div><p style={{ fontSize: '9px', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>IFSC Code</p><p style={{ fontSize: '14px', fontWeight: 700 }}>{ifscCode}</p></div>
                                    <div><p style={{ fontSize: '9px', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>Account Type</p><p style={{ fontSize: '14px', fontWeight: 700 }}>{primaryAcc?.Acc_Type || 'Savings'}</p></div>
                                    <div><p style={{ fontSize: '9px', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>Branch</p><p style={{ fontSize: '13px', fontWeight: 600 }}>{branchName}</p></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px', marginBottom: '20px' }}>
                        {/* Recent Transactions */}
                        <div style={{ ...card, padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Recent Transactions</h3>
                                <button onClick={() => navigate('/history')} style={{ background: 'none', border: 'none', color: '#ea580c', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>View All →</button>
                            </div>
                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {[1, 2, 3].map(i => <div key={i} style={{ height: '44px', borderRadius: '10px', background: '#f1f5f9' }}></div>)}
                                </div>
                            ) : transactions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '28px 16px', color: '#94a3b8', background: '#fafafa', borderRadius: '12px' }}>
                                    <svg width="36" height="36" fill="none" stroke="#cbd5e1" viewBox="0 0 24 24" style={{ margin: '0 auto 8px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                    <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>No transactions yet</p>
                                    <p style={{ fontSize: '11px' }}>Your activity will appear here</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {transactions.slice(0, 5).map(t => (
                                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: t.type === 'Fund Transfer' ? '#fff7ed' : '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <svg width="14" height="14" fill="none" stroke={t.type === 'Fund Transfer' ? '#ea580c' : '#059669'} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={t.type === 'Fund Transfer' ? 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4' : 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2'} /></svg>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{t.type}</p>
                                                    <p style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>-{showBalance ? formatCurrency(t.amount) : '₹●●●●'}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {/* Expenses */}
                            <div style={{ ...card, background: 'linear-gradient(135deg, #fafafa, #fff)' }}>
                                <p style={label}>This Month's Expenses</p>
                                <p style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>{showBalance ? formatCurrency(monthlyExpenses || 0) : maskAmount()}</p>
                                <div style={{ height: '6px', borderRadius: '3px', background: '#f1f5f9', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #ea580c, #fb923c)', width: `${Math.min((monthlyExpenses || 0) / (totalBalance || 1) * 100, 100)}%`, transition: 'width 0.5s' }}></div>
                                </div>
                                <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{totalBalance > 0 ? ((monthlyExpenses || 0) / totalBalance * 100).toFixed(1) : 0}% of balance</p>
                            </div>

                            {/* Security Status */}
                            <div style={{ ...card, background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="14" height="14" fill="none" stroke="#16a34a" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>Account Secured</span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#16a34a' }}>
                                    {['🔒 256-bit SSL Encryption', `🔑 MPIN ${mpinVerified ? 'Verified ✓' : 'Locked'}`, '🛡️ Two-factor Ready', '📱 Session Monitored'].map(s => (
                                        <p key={s} style={{ marginBottom: '4px' }}>{s}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div style={{ ...card, padding: '16px 18px' }}>
                                <p style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>📌 Account Quick Info</p>
                                {[
                                    { l: 'Account No', v: mpinVerified ? primaryAcc?.Account_No : maskAccNo(primaryAcc?.Account_No) },
                                    { l: 'IFSC Code', v: ifscCode },
                                    { l: 'Branch', v: branchName },
                                    { l: 'Customer ID', v: user?.id },
                                ].map(({ l, v }) => (
                                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>{l}</span>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Banking Guide Link */}
                    <div onClick={() => navigate('/tips')} style={{ ...card, marginBottom: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ea580c'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(234,88,12,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📖</div>
                            <div>
                                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>Banking Guide & Tips</h3>
                                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Learn how to use all features — transfers, bills, loans & more</p>
                            </div>
                        </div>
                        <svg width="20" height="20" fill="none" stroke="#ea580c" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </div>
                </div>
            </div>

            {/* MPIN Modal */}
            <Modal isOpen={showMpinModal} onClose={() => { setShowMpinModal(false); setMpinInput(''); setMpinError(''); }}>
                <div style={{ background: 'white', borderRadius: '24px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', borderRadius: '18px', background: 'linear-gradient(135deg, #ea580c, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(234,88,12,0.3)' }}>
                        <svg width="28" height="28" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Enter MPIN</h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>Enter your 6-digit MPIN to view account details</p>
                    {mpinError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px' }}>{mpinError}</div>}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{ width: '44px', height: '52px', borderRadius: '12px', border: `2px solid ${mpinInput.length > i ? '#ea580c' : '#e2e8f0'}`, background: mpinInput.length > i ? '#fff7ed' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
                                {mpinInput[i] ? '●' : ''}
                            </div>
                        ))}
                    </div>
                    <input type="password" maxLength={6} value={mpinInput} onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setMpinInput(v); setMpinError(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && mpinInput.length === 6) verifyMpin(); }}
                        autoFocus
                        style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px' }} />
                    {/* Numeric Keypad */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxWidth: '240px', margin: '0 auto 20px' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((n, i) => {
                            if (n === null) return <div key={i}></div>;
                            return (
                                <button key={i} onClick={() => { if (n === 'del') { setMpinInput(p => p.slice(0, -1)); } else if (mpinInput.length < 6) { setMpinInput(p => p + n); } setMpinError(''); }}
                                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fafafa', fontSize: '18px', fontWeight: 700, color: n === 'del' ? '#ea580c' : '#1e293b', cursor: 'pointer' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#fafafa'}>
                                    {n === 'del' ? '⌫' : n}
                                </button>
                            );
                        })}
                    </div>
                    <button onClick={verifyMpin} disabled={mpinInput.length !== 6} style={{ width: '100%', padding: '14px', background: mpinInput.length === 6 ? 'linear-gradient(135deg, #c2410c, #ea580c)' : '#e2e8f0', color: mpinInput.length === 6 ? 'white' : '#94a3b8', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: mpinInput.length === 6 ? 'pointer' : 'default', boxShadow: mpinInput.length === 6 ? '0 4px 20px rgba(234,88,12,0.35)' : 'none' }}>Verify MPIN</button>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px' }}>Demo MPIN: 123456</p>
                </div>
            </Modal>
        </>
    );
}
