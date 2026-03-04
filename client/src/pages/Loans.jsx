import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import { formatCurrency } from '../api/api';

const LOAN_TYPES = [
    { name: 'Home Loan', rate: 8.5, maxAmt: 50000000, emoji: '🏠', color: '#2563eb' },
    { name: 'Personal Loan', rate: 11, maxAmt: 4000000, emoji: '💼', color: '#059669' },
    { name: 'Car Loan', rate: 9.25, maxAmt: 10000000, emoji: '🚗', color: '#8b5cf6' },
    { name: 'Education Loan', rate: 7.5, maxAmt: 7500000, emoji: '🎓', color: '#ea580c' },
    { name: 'Gold Loan', rate: 7, maxAmt: 5000000, emoji: '🥇', color: '#d97706' },
    { name: 'Business Loan', rate: 11.5, maxAmt: 20000000, emoji: '📊', color: '#06b6d4' },
];

const PRODUCTS = [
    { name: 'iPhone 16 Pro Max', price: 144900, emoji: '📱' },
    { name: 'Samsung Galaxy S25 Ultra', price: 134999, emoji: '📱' },
    { name: 'MacBook Air M4', price: 119900, emoji: '💻' },
    { name: 'Dell XPS 15', price: 159990, emoji: '💻' },
    { name: 'iPad Pro M4', price: 99900, emoji: '📋' },
    { name: 'Sony 65" 4K TV', price: 89990, emoji: '📺' },
    { name: 'Custom Amount', price: 0, emoji: '🛒' },
];

const TENURES = [3, 6, 9, 12, 18, 24, 36];

export default function Loans() {
    const { onToggleSidebar } = useOutletContext();
    const [tab, setTab] = useState('calculator');
    // Loan EMI
    const [selLoan, setSelLoan] = useState(LOAN_TYPES[0]);
    const [loanAmt, setLoanAmt] = useState(3000000);
    const [loanRate, setLoanRate] = useState(8.5);
    const [loanYears, setLoanYears] = useState(15);
    const [showSchedule, setShowSchedule] = useState(false);
    // Product EMI
    const [selProduct, setSelProduct] = useState(null);
    const [prodPrice, setProdPrice] = useState('');
    const [prodRate, setProdRate] = useState(14);
    const [prodTenure, setProdTenure] = useState(12);
    const [prodDown, setProdDown] = useState(0);

    const loanEMI = useMemo(() => {
        const r = loanRate / 100 / 12;
        const n = loanYears * 12;
        if (r === 0) return { emi: Math.round(loanAmt / n), totalInterest: 0, totalPayment: loanAmt };
        const emi = loanAmt * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        const totalPayment = emi * n;
        return { emi: Math.round(emi), totalInterest: Math.round(totalPayment - loanAmt), totalPayment: Math.round(totalPayment) };
    }, [loanAmt, loanRate, loanYears]);

    const amortization = useMemo(() => {
        const r = loanRate / 100 / 12;
        const n = loanYears * 12;
        let balance = loanAmt;
        const rows = [];
        for (let i = 1; i <= n; i++) {
            const interest = balance * r;
            const principal = loanEMI.emi - interest;
            balance -= principal;
            if (i <= 12 || i % 12 === 0 || i === n) {
                rows.push({ month: i, principal: Math.round(principal), interest: Math.round(interest), balance: Math.max(0, Math.round(balance)) });
            }
        }
        return rows;
    }, [loanAmt, loanRate, loanYears, loanEMI.emi]);

    const prodEMI = useMemo(() => {
        const price = selProduct?.name === 'Custom Amount' ? (Number(prodPrice) || 0) : (selProduct?.price || 0);
        const financing = price - prodDown;
        if (financing <= 0) return null;
        const r = prodRate / 100 / 12;
        const n = prodTenure;
        if (r === 0) return { emi: Math.round(financing / n), total: financing, interest: 0, financing };
        const emi = financing * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        const total = emi * n;
        return { emi: Math.round(emi), total: Math.round(total), interest: Math.round(total - financing), financing };
    }, [selProduct, prodPrice, prodRate, prodTenure, prodDown]);

    const prodSchedule = useMemo(() => {
        if (!prodEMI) return [];
        const price = selProduct?.name === 'Custom Amount' ? (Number(prodPrice) || 0) : (selProduct?.price || 0);
        const financing = price - prodDown;
        const r = prodRate / 100 / 12;
        let balance = financing;
        const rows = [];
        for (let i = 1; i <= prodTenure; i++) {
            const interest = balance * r;
            const principal = prodEMI.emi - interest;
            balance -= principal;
            rows.push({ month: i, emi: prodEMI.emi, principal: Math.round(principal), interest: Math.round(interest), balance: Math.max(0, Math.round(balance)) });
        }
        return rows;
    }, [prodEMI, selProduct, prodPrice, prodRate, prodTenure, prodDown]);

    const card = { background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '24px' };
    const lbl = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' };

    return (
        <>
            <Header title="Loans & EMI" subtitle="Calculate and compare" onToggleSidebar={onToggleSidebar} />
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>


                {/* Hero */}
                <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b4e, #1a1a2e)', borderRadius: '20px', padding: '28px 32px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(234,88,12,0.12)' }}></div>
                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div><h2 style={{ color: 'white', fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Loan & EMI Tools</h2><p style={{ color: '#94a3b8', fontSize: '14px' }}>Calculate EMIs, compare tenures, plan your purchases</p></div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[{ k: 'calculator', l: '🏦 Loan EMI' }, { k: 'product', l: '🛒 Product EMI' }, { k: 'compare', l: '📊 Compare' }].map(t => (
                                <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 18px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', background: tab === t.k ? 'white' : 'rgba(255,255,255,0.08)', color: tab === t.k ? '#9a3412' : '#94a3b8' }}>{t.l}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* === LOAN EMI CALCULATOR === */}
                {tab === 'calculator' && (
                    <>
                        {/* Loan Type Selector */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
                            {LOAN_TYPES.map(l => (
                                <button key={l.name} onClick={() => { setSelLoan(l); setLoanRate(l.rate); setLoanAmt(Math.min(loanAmt, l.maxAmt)); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, border: selLoan.name === l.name ? `2px solid ${l.color}` : '2px solid #e5e7eb', background: selLoan.name === l.name ? l.color + '10' : '#fff', color: selLoan.name === l.name ? l.color : '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    <span style={{ fontSize: '18px' }}>{l.emoji}</span>{l.name}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
                            <div style={card}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>{selLoan.emoji} {selLoan.name} Calculator</h3>

                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Loan Amount</label><span style={{ fontSize: '16px', fontWeight: 800, color: '#ea580c' }}>{formatCurrency(loanAmt)}</span></div>
                                    <input type="range" min="100000" max={selLoan.maxAmt} step="100000" value={loanAmt} onChange={(e) => setLoanAmt(Number(e.target.value))} style={{ width: '100%', accentColor: selLoan.color }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}><span>₹1 Lakh</span><span>{formatCurrency(selLoan.maxAmt)}</span></div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Interest Rate (p.a.)</label><span style={{ fontSize: '16px', fontWeight: 800, color: '#ea580c' }}>{loanRate}%</span></div>
                                    <input type="range" min="5" max="24" step="0.25" value={loanRate} onChange={(e) => setLoanRate(Number(e.target.value))} style={{ width: '100%', accentColor: selLoan.color }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}><span>5%</span><span>24%</span></div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Tenure</label><span style={{ fontSize: '16px', fontWeight: 800, color: '#ea580c' }}>{loanYears} Years</span></div>
                                    <input type="range" min="1" max="30" step="1" value={loanYears} onChange={(e) => setLoanYears(Number(e.target.value))} style={{ width: '100%', accentColor: selLoan.color }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}><span>1 yr</span><span>30 yrs</span></div>
                                </div>

                                {/* Proportion bar */}
                                <div>
                                    <p style={lbl}>Payment Breakdown</p>
                                    <div style={{ height: '14px', borderRadius: '7px', background: '#f1f5f9', overflow: 'hidden', display: 'flex' }}>
                                        <div style={{ width: `${loanEMI.totalPayment > 0 ? Math.round((loanAmt / loanEMI.totalPayment) * 100) : 50}%`, background: `linear-gradient(90deg, ${selLoan.color}, ${selLoan.color}cc)`, borderRadius: '7px 0 0 7px' }}></div>
                                        <div style={{ flex: 1, background: 'linear-gradient(90deg, #f97316, #fb923c)', borderRadius: '0 7px 7px 0' }}></div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: selLoan.color }}></span>Principal</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f97316' }}></span>Interest</span>
                                    </div>
                                </div>

                                {/* Amortization */}
                                <button onClick={() => setShowSchedule(!showSchedule)} style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, border: '1px solid #e2e8f0', background: '#fafafa', color: '#475569', cursor: 'pointer' }}>{showSchedule ? '▲ Hide' : '▼ Show'} Amortization Schedule</button>
                                {showSchedule && (
                                    <div style={{ marginTop: '12px', maxHeight: '300px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                            <thead><tr style={{ background: '#fafafa', position: 'sticky', top: 0 }}><th style={{ padding: '10px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Month</th><th style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#64748b' }}>Principal</th><th style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#64748b' }}>Interest</th><th style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#64748b' }}>Balance</th></tr></thead>
                                            <tbody>{amortization.map(r => <tr key={r.month} style={{ borderBottom: '1px solid #f8fafc' }}><td style={{ padding: '8px 10px', color: '#475569' }}>{r.month}</td><td style={{ padding: '8px 10px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>{formatCurrency(r.principal)}</td><td style={{ padding: '8px 10px', textAlign: 'right', color: '#ea580c', fontWeight: 600 }}>{formatCurrency(r.interest)}</td><td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>{formatCurrency(r.balance)}</td></tr>)}</tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Results */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ background: `linear-gradient(135deg, ${selLoan.color}, ${selLoan.color}cc)`, borderRadius: '16px', padding: '24px', color: 'white' }}>
                                    <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.7, marginBottom: '6px' }}>Monthly EMI</p>
                                    <p style={{ fontSize: '32px', fontWeight: 800 }}>{formatCurrency(loanEMI.emi)}</p>
                                    <p style={{ fontSize: '11px', opacity: 0.7 }}>{loanYears * 12} months × {formatCurrency(loanEMI.emi)}</p>
                                </div>
                                <div style={card}><p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Principal</p><p style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>{formatCurrency(loanAmt)}</p></div>
                                <div style={card}><p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total Interest</p><p style={{ fontSize: '24px', fontWeight: 800, color: '#ea580c' }}>{formatCurrency(loanEMI.totalInterest)}</p></div>
                                <div style={card}><p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total Payment</p><p style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>{formatCurrency(loanEMI.totalPayment)}</p></div>
                            </div>
                        </div>
                    </>
                )}

                {/* === PRODUCT EMI === */}
                {tab === 'product' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
                        <div style={card}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>🛒 Product EMI Calculator</h3>
                            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>Select a product or enter custom amount to calculate monthly EMI</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                                {PRODUCTS.map(p => (
                                    <button key={p.name} onClick={() => { setSelProduct(p); if (p.price > 0) setProdPrice(String(p.price)); }} style={{ padding: '14px', borderRadius: '12px', border: selProduct?.name === p.name ? '2px solid #ea580c' : '2px solid #f1f5f9', background: selProduct?.name === p.name ? '#fff7ed' : '#fafafa', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                                        onMouseEnter={(e) => { if (selProduct?.name !== p.name) e.currentTarget.style.borderColor = '#fde68a'; }}
                                        onMouseLeave={(e) => { if (selProduct?.name !== p.name) e.currentTarget.style.borderColor = '#f1f5f9'; }}>
                                        <span style={{ fontSize: '20px' }}>{p.emoji}</span>
                                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginTop: '6px' }}>{p.name}</p>
                                        {p.price > 0 && <p style={{ fontSize: '13px', fontWeight: 800, color: '#ea580c', marginTop: '2px' }}>{formatCurrency(p.price)}</p>}
                                    </button>
                                ))}
                            </div>

                            {selProduct?.name === 'Custom Amount' && (
                                <div style={{ marginBottom: '16px' }}><label style={lbl}>Product Price</label><input type="number" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} placeholder="Enter price" style={{ width: '100%', padding: '12px 16px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '16px', fontWeight: 700, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} /></div>
                            )}

                            {selProduct && (
                                <>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={lbl}>Down Payment</label>
                                        <input type="range" min="0" max={Math.floor((selProduct.name === 'Custom Amount' ? Number(prodPrice) || 0 : selProduct.price) * 0.5)} step="1000" value={prodDown} onChange={(e) => setProdDown(Number(e.target.value))} style={{ width: '100%', accentColor: '#ea580c' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}><span>₹0</span><span style={{ fontWeight: 700, color: '#ea580c' }}>{formatCurrency(prodDown)}</span></div>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={lbl}>Interest Rate (p.a.)</label>
                                        <input type="range" min="0" max="30" step="0.5" value={prodRate} onChange={(e) => setProdRate(Number(e.target.value))} style={{ width: '100%', accentColor: '#ea580c' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}><span>0% (No-Cost)</span><span style={{ fontWeight: 700, color: '#ea580c' }}>{prodRate}%</span></div>
                                    </div>
                                    <div><label style={lbl}>Tenure (Months)</label>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {TENURES.map(t => (
                                                <button key={t} onClick={() => setProdTenure(t)} style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: prodTenure === t ? '2px solid #ea580c' : '2px solid #e5e7eb', background: prodTenure === t ? '#fff7ed' : '#fff', color: prodTenure === t ? '#ea580c' : '#475569', cursor: 'pointer' }}>{t}M</button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Month-wise Schedule */}
                            {prodSchedule.length > 0 && (
                                <div style={{ marginTop: '24px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>📅 Month-wise EMI Breakdown</h4>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                            <thead><tr style={{ background: '#fafafa', position: 'sticky', top: 0 }}><th style={{ padding: '10px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Month</th><th style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#64748b' }}>EMI</th><th style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#64748b' }}>Principal</th><th style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#64748b' }}>Interest</th><th style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#64748b' }}>Balance</th></tr></thead>
                                            <tbody>{prodSchedule.map(r => <tr key={r.month} style={{ borderBottom: '1px solid #f8fafc' }}><td style={{ padding: '8px 10px', color: '#475569' }}>{r.month}</td><td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>{formatCurrency(r.emi)}</td><td style={{ padding: '8px 10px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>{formatCurrency(r.principal)}</td><td style={{ padding: '8px 10px', textAlign: 'right', color: '#ea580c', fontWeight: 600 }}>{formatCurrency(r.interest)}</td><td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>{formatCurrency(r.balance)}</td></tr>)}</tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Results Sidebar */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {prodEMI ? (
                                <>
                                    <div style={{ background: 'linear-gradient(135deg, #ea580c, #f97316, #fb923c)', borderRadius: '16px', padding: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                                        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.7, marginBottom: '6px' }}>Monthly EMI</p>
                                        <p style={{ fontSize: '32px', fontWeight: 800 }}>{formatCurrency(prodEMI.emi)}</p>
                                        <p style={{ fontSize: '11px', opacity: 0.7 }}>for {prodTenure} months</p>
                                    </div>
                                    <div style={card}><p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Financed Amount</p><p style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>{formatCurrency(prodEMI.financing)}</p></div>
                                    <div style={card}><p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total Interest</p><p style={{ fontSize: '22px', fontWeight: 800, color: '#ea580c' }}>{formatCurrency(prodEMI.interest)}</p></div>
                                    <div style={card}><p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total Payment</p><p style={{ fontSize: '22px', fontWeight: 800, color: '#059669' }}>{formatCurrency(prodEMI.total)}</p></div>
                                    {/* Tenure Comparison */}
                                    <div style={card}>
                                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>Compare Tenures</p>
                                        {TENURES.map(t => {
                                            const price = selProduct?.name === 'Custom Amount' ? (Number(prodPrice) || 0) : (selProduct?.price || 0);
                                            const fin = price - prodDown; if (fin <= 0) return null;
                                            const r = prodRate / 100 / 12; const n = t;
                                            const e = r === 0 ? fin / n : fin * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
                                            return <div key={t} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8fafc', fontSize: '12px' }}><span style={{ color: '#64748b' }}>{t} months</span><span style={{ fontWeight: 700, color: t === prodTenure ? '#ea580c' : '#1e293b' }}>{formatCurrency(Math.round(e))}/mo</span></div>;
                                        })}
                                    </div>
                                </>
                            ) : <div style={{ ...card, textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}><p style={{ fontSize: '32px', marginBottom: '10px' }}>🛒</p><p style={{ fontWeight: 600 }}>Select a product to calculate EMI</p></div>}
                        </div>
                    </div>
                )}

                {/* === COMPARE TAB === */}
                {tab === 'compare' && (
                    <div style={card}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>📊 Loan Comparison Table</h3>
                        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead><tr style={{ background: '#fafafa' }}><th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Loan Type</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>Rate</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>Max Amount</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>EMI (₹10L, 5yr)</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>Total Interest</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>Total Payment</th></tr></thead>
                                <tbody>
                                    {LOAN_TYPES.map(l => {
                                        const amt = 1000000; const r = l.rate / 100 / 12; const n = 60;
                                        const emi = amt * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
                                        const total = emi * n; const interest = total - amt;
                                        return (
                                            <tr key={l.name} style={{ borderBottom: '1px solid #f8fafc' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                                <td style={{ padding: '12px 16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '20px' }}>{l.emoji}</span><span style={{ fontWeight: 600, color: '#1e293b' }}>{l.name}</span></div></td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: l.color }}>{l.rate}%</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569' }}>{formatCurrency(l.maxAmt)}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, color: '#1e293b' }}>{formatCurrency(Math.round(emi))}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#ea580c' }}>{formatCurrency(Math.round(interest))}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#059669' }}>{formatCurrency(Math.round(total))}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px' }}>* Comparison based on ₹10 Lakh loan for 5-year tenure. Actual rates may vary.</p>
                    </div>
                )}
            </div>
        </>
    );
}
