import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { validateRecipient, transferMoney, selfTransfer, getAllTransactions, formatCurrency } from '../api/api';

const QUICK_AMOUNTS = [500, 1000, 5000, 10000, 25000, 50000];
const NEFT_TIMINGS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

export default function FundTransfer() {
    const { user, accounts, refreshUserData } = useAuth();
    const { onToggleSidebar } = useOutletContext();
    const [activeTab, setActiveTab] = useState('send');
    const [transferType, setTransferType] = useState('imps');
    const [recentTransfers, setRecentTransfers] = useState([]);
    const [message, setMessage] = useState(null);
    const [successModal, setSuccessModal] = useState(null);
    const [fromAccount, setFromAccount] = useState('');
    const [recipientCustId, setRecipientCustId] = useState('');
    const [recipientAccNo, setRecipientAccNo] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [recipientValid, setRecipientValid] = useState(null);
    const [validating, setValidating] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selfFrom, setSelfFrom] = useState('');
    const [selfTo, setSelfTo] = useState('');
    const [selfAmount, setSelfAmount] = useState('');
    // NEFT specific
    const [neftIfsc, setNeftIfsc] = useState('');
    const [neftBankName, setNeftBankName] = useState('');
    const [neftBranch, setNeftBranch] = useState('');
    const [neftBatch, setNeftBatch] = useState('Next Available');
    // UPI specific
    const [upiId, setUpiId] = useState('');
    const [upiVerified, setUpiVerified] = useState(null);

    const totalBalance = accounts.reduce((s, a) => s + a.Balance, 0);
    const selectedAccount = accounts.find(a => a.Account_No === fromAccount);

    useEffect(() => { if (accounts.length > 0) { setFromAccount(accounts[0].Account_No); setSelfFrom(accounts[0].Account_No); if (accounts.length > 1) setSelfTo(accounts[1].Account_No); } }, [accounts]);
    useEffect(() => { if (user) getAllTransactions(user.id).then(txs => setRecentTransfers(txs.filter(t => t.type === 'Transfer').slice(0, 5))).catch(() => { }); }, [user]);

    const doValidate = useCallback(async () => {
        if (!recipientCustId || !recipientAccNo) return;
        setValidating(true);
        try { const data = await validateRecipient(recipientCustId, recipientAccNo); setRecipientValid(data); }
        catch { setRecipientValid(false); }
        finally { setValidating(false); }
    }, [recipientCustId, recipientAccNo]);

    useEffect(() => { setRecipientValid(null); if (recipientCustId.length >= 1 && recipientAccNo.length >= 3) { const t = setTimeout(doValidate, 600); return () => clearTimeout(t); } }, [recipientCustId, recipientAccNo, doValidate]);

    const showMsg = (text, type = 'success') => { setMessage({ text, type }); setTimeout(() => setMessage(null), 4000); };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!fromAccount || !amount) return showMsg('Fill all fields.', 'error');
        if (transferType === 'upi') {
            if (!upiId) return showMsg('Enter UPI ID.', 'error');
            showMsg('UPI transfer initiated! (Demo mode)', 'success');
            setUpiId(''); setAmount(''); return;
        }
        if (!recipientAccNo) return showMsg('Fill recipient details.', 'error');
        if (recipientValid === false) return showMsg('Invalid recipient.', 'error');
        if (transferType === 'neft' && !neftIfsc) return showMsg('Enter IFSC code for NEFT.', 'error');
        setSubmitting(true);
        try {
            const result = await transferMoney({ senderAccountNo: fromAccount, receiverAccountNo: recipientAccNo, receiverCustomerId: recipientCustId, amount: parseFloat(amount), note, userId: user.id });
            setSuccessModal({ ...result, method: transferType.toUpperCase() });
            setRecipientCustId(''); setRecipientAccNo(''); setAmount(''); setNote(''); setRecipientValid(null);
            setNeftIfsc(''); setNeftBankName(''); setNeftBranch('');
            refreshUserData();
            getAllTransactions(user.id).then(txs => setRecentTransfers(txs.filter(t => t.type === 'Transfer').slice(0, 5)));
        } catch (err) { showMsg(err.message, 'error'); } finally { setSubmitting(false); }
    };

    const handleSelfTransfer = async (e) => {
        e.preventDefault();
        if (!selfFrom || !selfTo || !selfAmount) return showMsg('Fill all fields.', 'error');
        if (selfFrom === selfTo) return showMsg('Cannot transfer to same account.', 'error');
        setSubmitting(true);
        try { await selfTransfer({ senderAccountNo: selfFrom, receiverAccountNo: selfTo, amount: parseFloat(selfAmount), userId: user.id }); showMsg(`Self transfer of ${formatCurrency(parseFloat(selfAmount))} successful!`); setSelfAmount(''); refreshUserData(); }
        catch (err) { showMsg(err.message, 'error'); } finally { setSubmitting(false); }
    };

    const verifyUpi = () => {
        if (!upiId || !upiId.includes('@')) { setUpiVerified(false); return; }
        setUpiVerified({ name: 'Demo User', bank: upiId.split('@')[1]?.toUpperCase() || 'BANK' });
    };

    const card = { background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };
    const inp = { width: '100%', padding: '12px 16px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 500, color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' };
    const fIn = (e) => { e.target.style.border = '2px solid #ea580c'; e.target.style.boxShadow = '0 0 0 3px rgba(234,88,12,0.1)'; };
    const fOut = (e) => { e.target.style.border = '2px solid #e2e8f0'; e.target.style.boxShadow = 'none'; };
    const lbl = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' };

    const tabs = [
        { key: 'send', label: 'Send Money', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
        { key: 'self', label: 'Self Transfer', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
    ];

    // Render the recipient form based on transfer type
    const renderRecipientForm = () => {
        if (transferType === 'upi') {
            return (
                <div style={{ background: '#fafafa', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9', marginBottom: '16px' }}>
                    <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: '6px', color: '#ea580c' }}>
                        <span style={{ fontSize: '18px' }}>📱</span> UPI Payment
                    </label>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>Send money using UPI ID — instant 24/7</p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>UPI ID</label>
                            <input type="text" value={upiId} onChange={(e) => { setUpiId(e.target.value); setUpiVerified(null); }} style={inp} onFocus={fIn} onBlur={fOut} placeholder="name@upi or 9876543210@ybl" required />
                        </div>
                        <button type="button" onClick={verifyUpi} style={{ padding: '12px 20px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', fontWeight: 700, color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }}>Verify</button>
                    </div>
                    {upiVerified && upiVerified !== false && <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', fontSize: '13px', fontWeight: 600, borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>✓ {upiVerified.name} ({upiVerified.bank})</div>}
                    {upiVerified === false && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', borderRadius: '10px', padding: '10px 14px' }}>❌ Invalid UPI ID format (must contain @)</div>}

                    {/* QR Section */}
                    <div style={{ marginTop: '16px', padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <div style={{ width: '120px', height: '120px', margin: '0 auto 10px', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '6px' }}>
                            <svg width="32" height="32" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>QR Code</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#94a3b8' }}>Scan QR code to auto-fill UPI ID</p>
                    </div>
                </div>
            );
        }

        if (transferType === 'neft') {
            return (
                <div style={{ background: '#fafafa', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9', marginBottom: '16px' }}>
                    <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb' }}>
                        <span style={{ fontSize: '18px' }}>🏦</span> NEFT Transfer
                    </label>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>National Electronic Fund Transfer — settles in 30-minute batches</p>

                    {/* NEFT Batch Timing */}
                    <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', border: '1px solid #bfdbfe' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>⏰ Next Settlement Batch</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{neftBatch}</span>
                        </div>
                        <select value={neftBatch} onChange={(e) => setNeftBatch(e.target.value)} style={{ ...inp, padding: '8px 12px', fontSize: '12px', background: 'white' }}>
                            <option>Next Available</option>
                            {NEFT_TIMINGS.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div><label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Customer ID</label><input type="text" value={recipientCustId} onChange={(e) => setRecipientCustId(e.target.value)} style={inp} onFocus={fIn} onBlur={fOut} placeholder="e.g. 1" required /></div>
                        <div><label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Account Number</label><input type="text" value={recipientAccNo} onChange={(e) => setRecipientAccNo(e.target.value)} style={inp} onFocus={fIn} onBlur={fOut} placeholder="e.g. BNB000001" required /></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div><label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>IFSC Code *</label><input type="text" value={neftIfsc} onChange={(e) => setNeftIfsc(e.target.value.toUpperCase())} style={inp} onFocus={fIn} onBlur={fOut} placeholder="BNBI0001234" required /></div>
                        <div><label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Bank Name</label><input type="text" value={neftBankName} onChange={(e) => setNeftBankName(e.target.value)} style={inp} onFocus={fIn} onBlur={fOut} placeholder="Auto-filled" /></div>
                        <div><label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Branch</label><input type="text" value={neftBranch} onChange={(e) => setNeftBranch(e.target.value)} style={inp} onFocus={fIn} onBlur={fOut} placeholder="Auto-filled" /></div>
                    </div>

                    {validating && <p style={{ fontSize: '12px', color: '#ea580c', fontWeight: 500 }}>⏳ Validating...</p>}
                    {recipientValid && recipientValid !== false && <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', fontSize: '13px', fontWeight: 600, borderRadius: '10px', padding: '8px 12px' }}>✓ {recipientValid.customerName} — {recipientValid.accountType}</div>}
                    {recipientValid === false && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', borderRadius: '10px', padding: '8px 12px' }}>❌ Recipient not found</div>}

                    <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', fontSize: '11px', color: '#92400e' }}>
                        ⚠️ NEFT transfers are processed in batches. Cut-off time is 6:00 PM on working days. Transfers after cut-off will be processed next working day.
                    </div>
                </div>
            );
        }

        // IMPS (default)
        return (
            <div style={{ background: '#fafafa', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9', marginBottom: '16px' }}>
                <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: '6px', color: '#ea580c' }}>
                    <span style={{ fontSize: '18px' }}>⚡</span> IMPS — Instant Transfer
                </label>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>Immediate Payment Service — available 24/7, 365 days</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div><label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Customer ID</label><input type="text" value={recipientCustId} onChange={(e) => setRecipientCustId(e.target.value)} style={inp} onFocus={fIn} onBlur={fOut} placeholder="e.g. 1" required /></div>
                    <div><label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Account Number</label><input type="text" value={recipientAccNo} onChange={(e) => setRecipientAccNo(e.target.value)} style={inp} onFocus={fIn} onBlur={fOut} placeholder="e.g. BNB000001" required /></div>
                </div>
                {validating && <p style={{ marginTop: '10px', fontSize: '12px', color: '#ea580c', fontWeight: 500 }}>⏳ Validating...</p>}
                {recipientValid && recipientValid !== false && <div style={{ marginTop: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', fontSize: '13px', fontWeight: 600, borderRadius: '10px', padding: '8px 12px' }}>✓ {recipientValid.customerName} — {recipientValid.accountType}</div>}
                {recipientValid === false && <div style={{ marginTop: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', borderRadius: '10px', padding: '8px 12px' }}>❌ Recipient not found</div>}
            </div>
        );
    };

    return (
        <>
            <Header title="Fund Transfer" subtitle="Send money securely" onToggleSidebar={onToggleSidebar} />
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                {message && <div style={{ padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, marginBottom: '16px', background: message.type === 'error' ? '#fef2f2' : '#ecfdf5', color: message.type === 'error' ? '#dc2626' : '#059669', border: `1px solid ${message.type === 'error' ? '#fecaca' : '#a7f3d0'}` }}>{message.text}</div>}

                {/* Hero Stats */}
                <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b4e, #1a1a2e)', borderRadius: '20px', padding: '28px 32px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(234,88,12,0.12)' }}></div>
                    <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'center' }}>
                        <div><p style={{ color: '#fb923c', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Available Balance</p><p style={{ color: 'white', fontSize: '24px', fontWeight: 800 }}>{formatCurrency(totalBalance)}</p></div>
                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px' }}><p style={{ color: '#fb923c', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Daily Limit</p><p style={{ color: 'white', fontSize: '24px', fontWeight: 800 }}>₹2,00,000</p></div>
                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px' }}>
                            <p style={{ color: '#fb923c', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Transfer Type</p>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {[{ k: 'imps', l: 'IMPS', c: '⚡' }, { k: 'neft', l: 'NEFT', c: '🏦' }, { k: 'upi', l: 'UPI', c: '📱' }].map(t => (
                                    <button key={t.k} onClick={() => setTransferType(t.k)} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: transferType === t.k ? 'white' : 'rgba(255,255,255,0.08)', color: transferType === t.k ? '#9a3412' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>{t.c} {t.l}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
                    {/* Form Card */}
                    <div style={{ ...card, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
                            {tabs.map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, padding: '14px', fontSize: '13px', fontWeight: activeTab === tab.key ? 700 : 500, background: 'none', border: 'none', borderBottom: activeTab === tab.key ? '2px solid #ea580c' : '2px solid transparent', color: activeTab === tab.key ? '#ea580c' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s' }}>
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} /></svg>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'send' && (
                            <div style={{ padding: '24px' }}>
                                <form onSubmit={handleSend}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={lbl}>From Account</label>
                                        <select value={fromAccount} onChange={(e) => setFromAccount(e.target.value)} style={{ ...inp, cursor: 'pointer' }} onFocus={fIn} onBlur={fOut}>
                                            {accounts.map(a => <option key={a.Account_No} value={a.Account_No}>{a.Acc_Type} - {a.Account_No} ({formatCurrency(a.Balance)})</option>)}
                                        </select>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>Balance: {selectedAccount ? formatCurrency(selectedAccount.Balance) : '—'}</span>
                                            <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, background: transferType === 'upi' ? '#f5f3ff' : transferType === 'neft' ? '#eff6ff' : '#fff7ed', color: transferType === 'upi' ? '#7c3aed' : transferType === 'neft' ? '#2563eb' : '#ea580c', border: `1px solid ${transferType === 'upi' ? '#ddd6fe' : transferType === 'neft' ? '#bfdbfe' : '#fed7aa'}` }}>{transferType === 'upi' ? '📱 UPI' : transferType === 'neft' ? '🏦 NEFT' : '⚡ IMPS'}</span>
                                        </div>
                                    </div>

                                    {renderRecipientForm()}

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={lbl}>Amount</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '24px', fontWeight: 700, color: '#cbd5e1' }}>₹</span>
                                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="1" step="0.01" required style={{ ...inp, paddingLeft: '44px', fontSize: '24px', fontWeight: 800, padding: '16px 16px 16px 44px' }} onFocus={fIn} onBlur={fOut} placeholder="0.00" />
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                                            {QUICK_AMOUNTS.map(a => (
                                                <button key={a} type="button" onClick={() => setAmount(String(a))} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, border: '1px solid', cursor: 'pointer', background: String(a) === amount ? '#fff7ed' : '#fff', borderColor: String(a) === amount ? '#ea580c' : '#e2e8f0', color: String(a) === amount ? '#ea580c' : '#64748b' }}>{a >= 1000 ? `₹${a / 1000}K` : `₹${a}`}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {transferType !== 'upi' && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={lbl}>Note <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                                            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} maxLength={50} style={inp} onFocus={fIn} onBlur={fOut} placeholder="What is this for?" />
                                        </div>
                                    )}

                                    <button type="submit" disabled={submitting} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #c2410c, #ea580c)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(234,88,12,0.3)', opacity: submitting ? 0.6 : 1 }}>
                                        {submitting ? 'Processing...' : transferType === 'upi' ? '📱 Pay via UPI' : transferType === 'neft' ? '🏦 Transfer via NEFT' : '⚡ Send via IMPS'}
                                    </button>
                                    <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '10px' }}>🔒 256-bit Bank-grade Encryption</p>
                                </form>
                            </div>
                        )}

                        {activeTab === 'self' && (
                            <div style={{ padding: '24px' }}>
                                <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                        <div style={{ width: '56px', height: '56px', margin: '0 auto 12px', background: 'linear-gradient(135deg, #ea580c, #f97316)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(234,88,12,0.25)' }}>
                                            <svg width="28" height="28" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        </div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Move Money Between Accounts</h3>
                                        <p style={{ fontSize: '13px', color: '#94a3b8' }}>Transfer between your own accounts instantly</p>
                                    </div>
                                    <form onSubmit={handleSelfTransfer}>
                                        <div style={{ background: '#fafafa', borderRadius: '14px', padding: '16px', border: '1px solid #f1f5f9', marginBottom: '12px' }}>
                                            <label style={lbl}>From Account</label>
                                            <select value={selfFrom} onChange={(e) => setSelfFrom(e.target.value)} style={{ ...inp, cursor: 'pointer' }} onFocus={fIn} onBlur={fOut}>
                                                {accounts.map(a => <option key={a.Account_No} value={a.Account_No}>{a.Acc_Type} - {a.Account_No} ({formatCurrency(a.Balance)})</option>)}
                                            </select>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '4px 0' }}><div style={{ width: '32px', height: '32px', margin: '0 auto', background: '#fff7ed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="16" height="16" fill="none" stroke="#ea580c" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg></div></div>
                                        <div style={{ background: '#fafafa', borderRadius: '14px', padding: '16px', border: '1px solid #f1f5f9', marginBottom: '16px' }}>
                                            <label style={lbl}>To Account</label>
                                            <select value={selfTo} onChange={(e) => setSelfTo(e.target.value)} style={{ ...inp, cursor: 'pointer' }} onFocus={fIn} onBlur={fOut}>
                                                {accounts.filter(a => a.Account_No !== selfFrom).map(a => <option key={a.Account_No} value={a.Account_No}>{a.Acc_Type} - {a.Account_No} ({formatCurrency(a.Balance)})</option>)}
                                            </select>
                                        </div>
                                        <div style={{ marginBottom: '20px' }}><label style={lbl}>Amount</label><div style={{ position: 'relative' }}><span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', fontWeight: 700, color: '#cbd5e1' }}>₹</span><input type="number" value={selfAmount} onChange={(e) => setSelfAmount(e.target.value)} min="0.01" step="0.01" required style={{ ...inp, paddingLeft: '40px', fontSize: '20px', fontWeight: 800 }} onFocus={fIn} onBlur={fOut} placeholder="0.00" /></div></div>
                                        <button type="submit" disabled={submitting} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #c2410c, #ea580c)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(234,88,12,0.3)', opacity: submitting ? 0.6 : 1 }}>{submitting ? 'Processing...' : 'Transfer Now ✓'}</button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Transfer method info */}
                        <div style={{ ...card, padding: '20px', background: transferType === 'upi' ? '#f5f3ff' : transferType === 'neft' ? '#eff6ff' : '#fff7ed', borderColor: transferType === 'upi' ? '#ddd6fe' : transferType === 'neft' ? '#bfdbfe' : '#fed7aa' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>{transferType === 'upi' ? '📱 About UPI' : transferType === 'neft' ? '🏦 About NEFT' : '⚡ About IMPS'}</h4>
                            {(transferType === 'imps' ? ['Instant 24/7 (even holidays)', 'Limit: ₹5 lakh per transaction', 'Charges: ₹5 + GST', 'Most popular for instant needs'] :
                                transferType === 'neft' ? ['Settles in 30-min batches', 'No upper limit for transfers', 'Charges: Free up to ₹10 lakh', 'Working hours: 8AM - 6PM'] :
                                    ['Instant 24/7', 'Limit: ₹1 lakh per transaction', 'Completely free of charge', 'Works with mobile number too']).map((t, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px', fontSize: '12px', color: '#475569' }}>
                                            <span style={{ color: '#ea580c', flexShrink: 0, marginTop: '1px' }}>✓</span>{t}
                                        </div>
                                    ))}
                        </div>

                        <div style={{ ...card, padding: '20px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '14px' }}>Recent Transfers</h3>
                            {recentTransfers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}><p style={{ fontSize: '12px' }}>No recent transfers</p></div>
                            ) : recentTransfers.map(t => (
                                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                                    <div><p style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{t.details_primary || 'Transfer'}</p><p style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p></div>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>-{formatCurrency(t.amount)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={!!successModal} onClose={() => setSuccessModal(null)}>
                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', maxWidth: '400px', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="32" height="32" fill="none" stroke="#059669" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>Transfer Successful!</h3>
                    {successModal && <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}><p>Amount: <strong style={{ color: '#1e293b' }}>{formatCurrency(successModal.amount)}</strong></p><p>To: <strong style={{ color: '#1e293b' }}>{successModal.recipientName}</strong></p><p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>via {successModal.method || 'IMPS'}</p></div>}
                    <button onClick={() => setSuccessModal(null)} style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #c2410c, #ea580c)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(234,88,12,0.3)' }}>Done</button>
                </div>
            </Modal>
        </>
    );
}
