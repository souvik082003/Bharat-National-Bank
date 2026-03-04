import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { payBill, formatCurrency } from '../api/api';

const CATEGORIES = [
    { name: 'Electricity', color: '#f59e0b', bg: '#fffbeb', emoji: '⚡' },
    { name: 'Water', color: '#3b82f6', bg: '#eff6ff', emoji: '💧' },
    { name: 'Gas', color: '#ef4444', bg: '#fef2f2', emoji: '🔥' },
    { name: 'Mobile', color: '#10b981', bg: '#ecfdf5', emoji: '📱' },
    { name: 'DTH', color: '#8b5cf6', bg: '#f5f3ff', emoji: '📺' },
    { name: 'Internet', color: '#06b6d4', bg: '#ecfeff', emoji: '🌐' },
    { name: 'Cards', color: '#6366f1', bg: '#eef2ff', emoji: '💳' },
    { name: 'Education', color: '#ec4899', bg: '#fdf2f8', emoji: '🎓' },
];

const PROVIDERS = {
    Electricity: ['TATA Power', 'Adani Electricity', 'BSES Rajdhani', 'MSEDCL', 'CESC'],
    Water: ['Delhi Jal Board', 'BWSSB', 'MCGM', 'Chennai Metro Water'],
    Gas: ['Indraprastha Gas', 'Mahanagar Gas', 'Adani Gas', 'Gujarat Gas'],
    Mobile: ['Jio', 'Airtel', 'Vi (Vodafone)', 'BSNL'],
    DTH: ['Tata Play', 'Airtel Digital TV', 'Dish TV', 'Sun Direct'],
    Internet: ['Jio Fiber', 'Airtel Xstream', 'ACT Fibernet', 'BSNL Fiber'],
    Cards: ['Bharat National Bank', 'HDFC', 'SBI Card', 'ICICI'],
    Education: ['University Fees', 'School Fees', 'Coaching Institute', 'Online Courses'],
};

export default function PayBills() {
    const { onToggleSidebar } = useOutletContext();
    const { user, accounts, refreshUserData } = useAuth();
    const [selected, setSelected] = useState(null);
    const [savedBillers, setSavedBillers] = useState(() => {
        try { return JSON.parse(localStorage.getItem('bnb_billers') || '[]'); } catch { return []; }
    });
    const [showAddBiller, setShowAddBiller] = useState(false);
    const [newBiller, setNewBiller] = useState({ name: '', category: 'Electricity', provider: '', consumerNo: '' });
    const [billDetail, setBillDetail] = useState(null);
    const [payProvider, setPayProvider] = useState('');
    const [payConsumer, setPayConsumer] = useState('');
    const [payAmount, setPayAmount] = useState('');
    const [quickConsumer, setQuickConsumer] = useState('');
    const [message, setMessage] = useState(null);
    const [paying, setPaying] = useState(false);

    useEffect(() => { localStorage.setItem('bnb_billers', JSON.stringify(savedBillers)); }, [savedBillers]);

    const card = { background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '24px' };
    const inp = { width: '100%', padding: '12px 16px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 500, color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' };
    const fIn = (e) => { e.target.style.border = '2px solid #ea580c'; e.target.style.boxShadow = '0 0 0 3px rgba(234,88,12,0.1)'; };
    const fOut = (e) => { e.target.style.border = '2px solid #e2e8f0'; e.target.style.boxShadow = 'none'; };
    const lbl = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' };

    const addBiller = () => {
        if (!newBiller.name || !newBiller.provider || !newBiller.consumerNo) return;
        setSavedBillers(prev => [...prev, { ...newBiller, id: Date.now() }]);
        setNewBiller({ name: '', category: 'Electricity', provider: '', consumerNo: '' });
        setShowAddBiller(false);
        showMsg('Biller saved successfully!', 'success');
    };

    const showMsg = (text, type = 'success') => { setMessage({ text, type }); setTimeout(() => setMessage(null), 4000); };

    const fetchBill = (consumer, provider, category) => {
        const amt = Math.floor(Math.random() * 3000) + 200;
        const due = new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-IN');
        setBillDetail({ amount: amt, dueDate: due, consumer, provider, category });
        setPayAmount(String(amt));
    };

    const handlePayBill = async () => {
        if (!payAmount || !billDetail) return;
        setPaying(true);
        try {
            if (user?.id && accounts?.length > 0) {
                await payBill({ userId: user.id, billerName: billDetail.provider, category: billDetail.category, amount: parseFloat(payAmount), fromAccount: accounts[0].Account_No });
                refreshUserData();
            }
            showMsg(`Bill of ${formatCurrency(parseFloat(payAmount))} paid to ${billDetail.provider}!`);
            setBillDetail(null); setPayAmount(''); setPayConsumer(''); setPayProvider('');
        } catch (err) { showMsg(err.message, 'error'); }
        finally { setPaying(false); }
    };

    return (
        <>
            <Header title="Pay Bills" subtitle="Manage and pay your bills" onToggleSidebar={onToggleSidebar} />
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>


                {message && <div style={{ padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, marginBottom: '16px', background: message.type === 'error' ? '#fef2f2' : '#ecfdf5', color: message.type === 'error' ? '#dc2626' : '#059669', border: `1px solid ${message.type === 'error' ? '#fecaca' : '#a7f3d0'}` }}>{message.text}</div>}

                {/* Quick Bill Fetch — AT TOP */}
                <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b4e)', borderRadius: '18px', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(234,88,12,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="24" height="24" fill="none" stroke="#fb923c" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div><h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '2px' }}>Quick Bill Fetch</h3><p style={{ fontSize: '13px', color: '#94a3b8' }}>Enter consumer number to fetch and pay instantly</p></div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '400px' }}>
                        <input type="text" value={quickConsumer} onChange={(e) => setQuickConsumer(e.target.value)} placeholder="Consumer No." style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#fb923c'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                        <button onClick={() => { if (quickConsumer) { fetchBill(quickConsumer, 'Quick Fetch', 'General'); } }} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #c2410c, #ea580c)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}>Fetch</button>
                    </div>
                </div>

                {/* Saved Billers */}
                <div style={{ ...card, marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>⭐ Saved Billers</h3>
                        <button onClick={() => setShowAddBiller(true)} style={{ background: 'linear-gradient(135deg, #c2410c, #ea580c)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(234,88,12,0.25)' }}>+ Add Biller</button>
                    </div>
                    {savedBillers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px', background: '#fafafa', borderRadius: '12px' }}>No billers saved yet. Click "+ Add Biller" to save your first biller for quick payments.</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                            {savedBillers.map(b => {
                                const cat = CATEGORIES.find(c => c.name === b.category);
                                return (
                                    <div key={b.id} style={{ padding: '16px', borderRadius: '14px', border: '1px solid #f1f5f9', background: '#fafafa', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onClick={() => fetchBill(b.consumerNo, b.provider, b.category)}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = (cat?.color || '#94a3b8') + '50'; e.currentTarget.style.background = cat?.bg || '#f8fafc'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.transform = 'none'; }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `linear-gradient(135deg, ${cat?.color || '#94a3b8'}, ${cat?.color || '#94a3b8'}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{cat?.emoji || '📋'}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{b.name}</p>
                                                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{b.provider} · {b.consumerNo}</p>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); setSavedBillers(prev => prev.filter(x => x.id !== b.id)); }} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>×</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Bill Payment Result (if fetched) */}
                {billDetail && (
                    <div style={{ ...card, marginBottom: '20px', borderColor: '#fed7aa', background: '#fffbeb' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>📄 Bill Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                            <div><p style={lbl}>Provider</p><p style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{billDetail.provider}</p></div>
                            <div><p style={lbl}>Consumer No</p><p style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>{billDetail.consumer}</p></div>
                            <div><p style={lbl}>Bill Amount</p><p style={{ fontSize: '22px', fontWeight: 800, color: '#ea580c' }}>₹{billDetail.amount}</p></div>
                            <div><p style={lbl}>Due Date</p><p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{billDetail.dueDate}</p></div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1, maxWidth: '200px' }}><label style={lbl}>Pay Amount</label><input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} style={inp} onFocus={fIn} onBlur={fOut} /></div>
                            <button onClick={handlePayBill} disabled={paying} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #c2410c, #ea580c)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(234,88,12,0.3)', opacity: paying ? 0.6 : 1, whiteSpace: 'nowrap' }}>{paying ? 'Processing...' : `Pay ₹${payAmount}`}</button>
                            <button onClick={() => setBillDetail(null)} style={{ padding: '12px 18px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* Bill Categories */}
                <div style={{ ...card }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>Bill Categories</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginBottom: selected ? '20px' : '0' }}>
                        {CATEGORIES.map(cat => (
                            <button key={cat.name} onClick={() => { setSelected(cat); setBillDetail(null); setPayProvider(''); setPayConsumer(''); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px 12px', borderRadius: '16px', border: selected?.name === cat.name ? `2px solid ${cat.color}` : '2px solid transparent', background: selected?.name === cat.name ? cat.bg : '#fafafa', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => { if (selected?.name !== cat.name) { e.currentTarget.style.background = cat.bg; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                                onMouseLeave={(e) => { if (selected?.name !== cat.name) { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.transform = 'none'; } }}>
                                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `linear-gradient(135deg, ${cat.color}, ${cat.color}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: `0 4px 14px ${cat.color}30` }}>{cat.emoji}</div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>{cat.name}</span>
                            </button>
                        ))}
                    </div>

                    {selected && (
                        <div style={{ background: '#fafafa', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '20px' }}>{selected.emoji}</span> Pay {selected.name} Bill</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                <div><label style={lbl}>Provider</label><select value={payProvider} onChange={(e) => setPayProvider(e.target.value)} style={{ ...inp, cursor: 'pointer' }} onFocus={fIn} onBlur={fOut}><option value="">Select Provider</option>{(PROVIDERS[selected.name] || []).map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                                <div><label style={lbl}>Consumer Number</label><input type="text" value={payConsumer} onChange={(e) => setPayConsumer(e.target.value)} placeholder="Enter consumer no." style={inp} onFocus={fIn} onBlur={fOut} /></div>
                            </div>
                            <button onClick={() => { if (payProvider && payConsumer) fetchBill(payConsumer, payProvider, selected.name); }} disabled={!payProvider || !payConsumer} style={{ padding: '12px 28px', background: payProvider && payConsumer ? 'linear-gradient(135deg, #c2410c, #ea580c)' : '#e2e8f0', color: payProvider && payConsumer ? 'white' : '#94a3b8', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: payProvider && payConsumer ? 'pointer' : 'default', boxShadow: payProvider && payConsumer ? '0 4px 16px rgba(234,88,12,0.3)' : 'none' }}>Fetch Bill</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Biller Modal */}
            <Modal isOpen={showAddBiller} onClose={() => setShowAddBiller(false)}>
                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', maxWidth: '440px', width: '100%' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>Add New Biller</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div><label style={lbl}>Biller Nickname</label><input value={newBiller.name} onChange={(e) => setNewBiller({ ...newBiller, name: e.target.value })} placeholder="e.g. Home Electricity" style={inp} onFocus={fIn} onBlur={fOut} /></div>
                        <div><label style={lbl}>Category</label><select value={newBiller.category} onChange={(e) => setNewBiller({ ...newBiller, category: e.target.value, provider: '' })} style={{ ...inp, cursor: 'pointer' }}>{CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}</select></div>
                        <div><label style={lbl}>Provider</label><select value={newBiller.provider} onChange={(e) => setNewBiller({ ...newBiller, provider: e.target.value })} style={{ ...inp, cursor: 'pointer' }}><option value="">Select Provider</option>{(PROVIDERS[newBiller.category] || []).map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                        <div><label style={lbl}>Consumer / Account Number</label><input value={newBiller.consumerNo} onChange={(e) => setNewBiller({ ...newBiller, consumerNo: e.target.value })} placeholder="Enter consumer number" style={inp} onFocus={fIn} onBlur={fOut} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button onClick={() => setShowAddBiller(false)} style={{ flex: 1, padding: '12px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={addBiller} disabled={!newBiller.name || !newBiller.provider || !newBiller.consumerNo} style={{ flex: 1, padding: '12px', background: newBiller.name && newBiller.provider && newBiller.consumerNo ? 'linear-gradient(135deg, #c2410c, #ea580c)' : '#e2e8f0', color: newBiller.name && newBiller.provider && newBiller.consumerNo ? 'white' : '#94a3b8', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: newBiller.name ? '0 4px 12px rgba(234,88,12,0.3)' : 'none' }}>Save Biller</button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
