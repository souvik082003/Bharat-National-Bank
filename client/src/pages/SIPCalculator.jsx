import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import { formatCurrency } from '../api/api';

export default function SIPCalculator() {
    const { onToggleSidebar } = useOutletContext();
    const [monthly, setMonthly] = useState(5000);
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(10);

    const result = useMemo(() => {
        const r = rate / 100 / 12;
        const n = years * 12;
        const invested = monthly * n;
        const fv = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        const wealth = fv - invested;
        return { invested, fv: Math.round(fv), wealth: Math.round(wealth) };
    }, [monthly, rate, years]);

    const investedPct = result.fv > 0 ? Math.round((result.invested / result.fv) * 100) : 0;

    const card = { background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '24px' };

    return (
        <>
            <Header title="SIP Calculator" subtitle="Plan your investments" onToggleSidebar={onToggleSidebar} />
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>



                {/* Hero */}
                <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b4e, #1a1a2e)', borderRadius: '20px', padding: '28px 32px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(234,88,12,0.12)' }}></div>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>SIP Investment Calculator</h2>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Plan your systematic investment for long-term wealth creation</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
                    {/* Inputs */}
                    <div style={card}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Investment Parameters</h3>

                        {/* Monthly Investment */}
                        <div style={{ marginBottom: '28px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Monthly Investment</label>
                                <span style={{ fontSize: '16px', fontWeight: 800, color: '#ea580c' }}>{formatCurrency(monthly)}</span>
                            </div>
                            <input type="range" min="500" max="100000" step="500" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))}
                                style={{ width: '100%', height: '6px', borderRadius: '3px', outline: 'none', cursor: 'pointer', accentColor: '#ea580c' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                                <span>₹500</span><span>₹1,00,000</span>
                            </div>
                        </div>

                        {/* Rate */}
                        <div style={{ marginBottom: '28px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Expected Return Rate</label>
                                <span style={{ fontSize: '16px', fontWeight: 800, color: '#ea580c' }}>{rate}%</span>
                            </div>
                            <input type="range" min="1" max="30" step="0.5" value={rate} onChange={(e) => setRate(Number(e.target.value))}
                                style={{ width: '100%', height: '6px', borderRadius: '3px', outline: 'none', cursor: 'pointer', accentColor: '#ea580c' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                                <span>1%</span><span>30%</span>
                            </div>
                        </div>

                        {/* Years */}
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Investment Period</label>
                                <span style={{ fontSize: '16px', fontWeight: 800, color: '#ea580c' }}>{years} Years</span>
                            </div>
                            <input type="range" min="1" max="30" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))}
                                style={{ width: '100%', height: '6px', borderRadius: '3px', outline: 'none', cursor: 'pointer', accentColor: '#ea580c' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                                <span>1 yr</span><span>30 yrs</span>
                            </div>
                        </div>

                        {/* Proportion Bar */}
                        <div style={{ marginTop: '24px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Investment Breakdown</p>
                            <div style={{ height: '14px', borderRadius: '7px', background: '#f1f5f9', overflow: 'hidden', display: 'flex' }}>
                                <div style={{ width: `${investedPct}%`, height: '100%', background: 'linear-gradient(90deg, #ea580c, #f97316)', transition: 'width 0.5s', borderRadius: '7px 0 0 7px' }}></div>
                                <div style={{ flex: 1, height: '100%', background: 'linear-gradient(90deg, #059669, #10b981)', borderRadius: '0 7px 7px 0' }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ea580c' }}></span>Invested ({investedPct}%)</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#059669' }}></span>Returns ({100 - investedPct}%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Total Value */}
                        <div style={{ background: 'linear-gradient(135deg, #ea580c, #f97316, #fb923c)', borderRadius: '16px', padding: '28px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.7, marginBottom: '8px' }}>Total Value</p>
                            <p style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px' }}>{formatCurrency(result.fv)}</p>
                            <p style={{ fontSize: '12px', opacity: 0.7 }}>After {years} years of investing</p>
                        </div>

                        <div style={card}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ea580c' }}></div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Invested Amount</span>
                            </div>
                            <p style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>{formatCurrency(result.invested)}</p>
                        </div>

                        <div style={card}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#059669' }}></div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Estimated Returns</span>
                            </div>
                            <p style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>{formatCurrency(result.wealth)}</p>
                        </div>

                        <div style={card}>
                            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>Quick Summary</p>
                            {[
                                { l: 'Monthly SIP', v: formatCurrency(monthly) },
                                { l: 'Total Months', v: `${years * 12} months` },
                                { l: 'Expected Return', v: `${rate}% p.a.` },
                                { l: 'Wealth Gained', v: formatCurrency(result.wealth) },
                            ].map(({ l, v }) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{l}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
