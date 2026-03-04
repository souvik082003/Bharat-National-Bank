import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';

const TOPICS = [
    {
        title: 'Fund Transfer', icon: '💸', color: '#ea580c', bg: '#fff7ed',
        tips: [
            { title: 'NEFT — Batch Settlement', desc: 'NEFT settles in 30-minute batches during business hours (8AM–6PM). Best for non-urgent, larger transfers. No upper limit on amount.' },
            { title: 'IMPS — Instant 24/7', desc: 'IMPS works 24/7 including holidays. Limit is ₹5 lakh per transaction. Small charges (₹5 + GST) apply.' },
            { title: 'UPI — Free & Instant', desc: 'UPI transfers are completely free up to ₹1 lakh per transaction. Works with mobile number or UPI ID.' },
            { title: 'Always Verify Details', desc: 'Double-check the recipient\'s Customer ID and Account Number before confirming. Transfers cannot be reversed once completed.' },
            { title: 'Quick Amounts', desc: 'Use the quick amount buttons (₹500, ₹1K, ₹5K, etc.) on the transfer page to speed up common transactions.' },
            { title: 'Self Transfer', desc: 'Move money between your own accounts using the "Self Transfer" tab. This is instant and has no charges.' },
        ]
    },
    {
        title: 'Pay Bills', icon: '📋', color: '#059669', bg: '#ecfdf5',
        tips: [
            { title: 'Quick Bill Fetch', desc: 'Enter your consumer number at the top of the Pay Bills page to instantly fetch your pending bill amount from the biller.' },
            { title: 'Save Your Billers', desc: 'Add frequently used billers using "Add Biller" to save time. Your saved billers appear for one-tap payment next time.' },
            { title: 'Categories Available', desc: 'Pay bills across categories: Electricity, Water, Gas, Internet, DTH, Mobile Recharge, Insurance, and more.' },
            { title: 'Payment Confirmation', desc: 'After every bill payment, you get an instant confirmation with transaction ID. Save this for your records.' },
            { title: 'Set Reminders', desc: 'Note your bill due dates and pay 2-3 days early to avoid late charges. Banks process payments within 24 hours.' },
            { title: 'Bill History', desc: 'All your bill payments appear in the Transaction History page under "Bill Payment" type for easy tracking.' },
        ]
    },
    {
        title: 'Loans & EMI', icon: '🏦', color: '#2563eb', bg: '#eff6ff',
        tips: [
            { title: 'Home Loan (8.5% p.a.)', desc: 'Home loans offer the lowest interest rates. Max ₹5 Cr. Tax benefits under Section 80C on principal and 24(b) on interest.' },
            { title: 'Personal Loan (11% p.a.)', desc: 'No collateral needed. Max ₹40 Lakh. Approval in 24-48 hours. Best for emergencies and short-term needs.' },
            { title: 'Car Loan (9.25% p.a.)', desc: 'Finance up to 90% of your car\'s value. Max ₹1 Cr. Tenure up to 7 years. New and used car options available.' },
            { title: 'Education Loan (7.5% p.a.)', desc: 'Lowest rates for students. Max ₹75 Lakh. Moratorium period until course completion + 6 months.' },
            { title: 'EMI Calculator', desc: 'Use our Loans & EMI page calculator to compare EMIs across different loan amounts and tenures before applying.' },
            { title: 'Product EMI', desc: 'Planning a big purchase? Use the Product EMI calculator to see monthly costs for phones, laptops, appliances, etc.' },
            { title: 'Higher Down Payment = Lower EMI', desc: 'Paying more upfront reduces your loan principal, resulting in significantly lower monthly EMI payments.' },
            { title: 'Prepayment Benefits', desc: 'No prepayment charges on floating rate loans. Prepaying even small amounts can save lakhs in interest over the tenure.' },
        ]
    },
    {
        title: 'Security', icon: '🔒', color: '#dc2626', bg: '#fef2f2',
        tips: [
            { title: 'MPIN Protection', desc: 'Your 6-digit MPIN protects sensitive account information. Never share it. Use "Enter MPIN" on Dashboard to view account details.' },
            { title: 'Hide/Show Balance', desc: 'Use the eye icon (👁) on Dashboard to toggle balance visibility. Useful when viewing your screen in public places.' },
            { title: 'Two-Factor Authentication', desc: 'Enable 2FA from Profile → Security Settings. Adds SMS verification on every login for extra protection.' },
            { title: 'Login Alerts', desc: 'Enable login alerts to receive email notifications whenever your account is accessed from a new device.' },
            { title: 'Password Best Practices', desc: 'Use 8+ characters with uppercase, lowercase, numbers, and symbols. Change your password every 90 days.' },
            { title: 'Never Share Credentials', desc: 'Bank employees will NEVER ask for your password, OTP, or MPIN. Report any such calls to our helpline immediately.' },
            { title: 'Secure Sessions', desc: 'Always log out after banking on shared devices. Your session is protected with 256-bit SSL encryption.' },
            { title: 'Monitor Activity', desc: 'Check Profile → Account Activity regularly for unauthorized access. Report suspicious activity within 24 hours for full protection.' },
        ]
    },
    {
        title: 'Investments', icon: '📈', color: '#8b5cf6', bg: '#f5f3ff',
        tips: [
            { title: 'SIP — Start Small', desc: 'Systematic Investment Plans allow investing as low as ₹500/month. Start early — even small amounts grow significantly with compounding.' },
            { title: 'SIP Calculator', desc: 'Use our SIP Calculator page to plan your corpus. Enter monthly amount, expected return, and years to see projected growth.' },
            { title: 'Fixed Deposits', desc: 'FDs offer guaranteed returns up to 7.5% p.a. Available from 7 days to 10 years. Senior citizens get 0.5% extra.' },
            { title: 'Recurring Deposits', desc: 'Auto-debit a fixed amount monthly into an RD. Like a SIP but with guaranteed returns. Great for disciplined saving.' },
            { title: 'Diversification', desc: 'Don\'t put all eggs in one basket. Split investments across FD (safe), SIP (growth), and PPF (tax-saving) for balance.' },
            { title: 'Tax-Saving Investments', desc: 'Invest in ELSS mutual funds, PPF, or 5-year FD to claim deduction up to ₹1.5 lakh under Section 80C.' },
            { title: 'Review Quarterly', desc: 'Check your portfolio performance every 3 months. Rebalance if any asset class has deviated significantly from your target allocation.' },
        ]
    },
    {
        title: 'Account', icon: '👤', color: '#06b6d4', bg: '#ecfeff',
        tips: [
            { title: 'KYC Compliance', desc: 'Keep your KYC (PAN, Aadhar) updated for uninterrupted banking. Visit Profile → KYC Details to update your documents.' },
            { title: 'Add a Nominee', desc: 'Adding a nominee ensures your funds are transferred to your family smoothly. Update via Profile → Nominee Details.' },
            { title: 'Profile Management', desc: 'Update your personal info, contact details, and preferences from the Profile & Settings page in the sidebar.' },
            { title: 'Account Statement', desc: 'Download your account statement from Transaction History. Filter by date range and transaction type for specific records.' },
            { title: 'Branch & IFSC', desc: 'Your branch details and IFSC code are shown on Dashboard after entering MPIN. Use these for receiving transfers from other banks.' },
            { title: 'Multiple Accounts', desc: 'You can have both Savings and Current accounts. Use Self Transfer to move money between them instantly.' },
            { title: 'Customer ID', desc: 'Your unique Customer ID is displayed in Dashboard and Profile. Share this (not account number) when receiving internal transfers.' },
            { title: 'Account Status', desc: 'Your account status shows as Active, Inactive, or Frozen. Contact the branch if your account shows any status other than Active.' },
        ]
    },
];

export default function Tips() {
    const { onToggleSidebar } = useOutletContext();
    const [activeTopic, setActiveTopic] = useState(0);
    const topic = TOPICS[activeTopic];

    return (
        <>
            <Header title="Banking Guide" subtitle="Learn how everything works" onToggleSidebar={onToggleSidebar} />
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                {/* Hero */}
                <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b4e, #1a1a2e)', borderRadius: '20px', padding: '28px 32px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(234,88,12,0.12)' }}></div>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <p style={{ color: '#fb923c', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>📖 Banking Guide</p>
                        <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>Master Your Banking</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', maxWidth: '500px' }}>Comprehensive topic-wise guides on how to use every feature of Bharat National Bank. Select a topic below to get started.</p>
                    </div>
                </div>

                {/* Topic Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {TOPICS.map((t, i) => (
                        <button key={t.title} onClick={() => setActiveTopic(i)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '14px', fontSize: '13px', fontWeight: 700, border: activeTopic === i ? `2px solid ${t.color}` : '2px solid #e5e7eb', background: activeTopic === i ? t.bg : '#fff', color: activeTopic === i ? t.color : '#64748b', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: activeTopic === i ? `0 4px 16px ${t.color}20` : 'none' }}
                            onMouseEnter={(e) => { if (activeTopic !== i) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; } }}
                            onMouseLeave={(e) => { if (activeTopic !== i) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; } }}>
                            <span style={{ fontSize: '18px' }}>{t.icon}</span>{t.title}
                        </button>
                    ))}
                </div>

                {/* Topic Content */}
                <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    {/* Topic Header */}
                    <div style={{ padding: '24px 28px', background: topic.bg, borderBottom: `2px solid ${topic.color}20` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: `0 4px 12px ${topic.color}20` }}>{topic.icon}</div>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '2px' }}>{topic.title}</h3>
                                <p style={{ fontSize: '13px', color: '#64748b' }}>{topic.tips.length} tips & guides</p>
                            </div>
                        </div>
                    </div>

                    {/* Tips Grid */}
                    <div style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            {topic.tips.map((tip, i) => (
                                <div key={i} style={{ padding: '18px 20px', background: '#fafafa', borderRadius: '14px', border: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = topic.bg; e.currentTarget.style.borderColor = `${topic.color}30`; e.currentTarget.style.boxShadow = `0 4px 16px ${topic.color}10`; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = 'none'; }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: topic.bg, border: `1px solid ${topic.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '13px', fontWeight: 800, color: topic.color }}>{i + 1}</div>
                                        <div>
                                            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{tip.title}</h4>
                                            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.7, margin: 0 }}>{tip.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Nav */}
                <div style={{ marginTop: '20px', padding: '16px 20px', background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button onClick={() => setActiveTopic(Math.max(0, activeTopic - 1))} disabled={activeTopic === 0}
                        style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, border: '1px solid #e2e8f0', background: activeTopic === 0 ? '#f8fafc' : '#fff', color: activeTopic === 0 ? '#cbd5e1' : '#475569', cursor: activeTopic === 0 ? 'default' : 'pointer' }}>
                        ← Previous Topic
                    </button>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{activeTopic + 1} / {TOPICS.length}</span>
                    <button onClick={() => setActiveTopic(Math.min(TOPICS.length - 1, activeTopic + 1))} disabled={activeTopic === TOPICS.length - 1}
                        style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, border: '1px solid #e2e8f0', background: activeTopic === TOPICS.length - 1 ? '#f8fafc' : '#fff', color: activeTopic === TOPICS.length - 1 ? '#cbd5e1' : '#475569', cursor: activeTopic === TOPICS.length - 1 ? 'default' : 'pointer' }}>
                        Next Topic →
                    </button>
                </div>
            </div>
        </>
    );
}
