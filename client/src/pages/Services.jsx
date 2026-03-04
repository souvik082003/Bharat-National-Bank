import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Modal from '../components/common/Modal';

const SERVICES = [
    { name: 'Open Fixed Deposit', desc: 'Lock in high interest rates up to 7.5% p.a.', emoji: '🏦', color: '#ea580c', popular: true },
    { name: 'Recurring Deposit', desc: 'Save monthly with auto-debit facility', emoji: '📅', color: '#059669' },
    { name: 'Mutual Funds', desc: 'Invest in diversified portfolios with SIP', emoji: '📈', color: '#2563eb', popular: true },
    { name: 'Insurance', desc: 'Life, health & vehicle insurance plans', emoji: '🛡️', color: '#8b5cf6' },
    { name: 'PPF Account', desc: 'Tax-saving with 7.1% guaranteed interest', emoji: '💰', color: '#f59e0b' },
    { name: 'NPS', desc: 'National Pension Scheme enrollment', emoji: '🏛️', color: '#06b6d4' },
    { name: 'Demat Account', desc: 'Trade stocks & securities online', emoji: '📊', color: '#ec4899', popular: true },
    { name: 'Locker Service', desc: 'Secure vault for valuables & documents', emoji: '🔐', color: '#14b8a6' },
    { name: 'Cheque Book', desc: 'Request new cheque book delivery', emoji: '📝', color: '#6366f1' },
    { name: 'Credit Card', desc: 'Apply for premium rewards cards', emoji: '💳', color: '#dc2626' },
    { name: 'Travel Card', desc: 'Forex & international travel prepaid', emoji: '✈️', color: '#0ea5e9' },
    { name: 'Gold Investment', desc: 'Buy digital gold at live market rates', emoji: '🥇', color: '#d97706' },
];

export default function Services() {
    const { onToggleSidebar } = useOutletContext();
    const [selectedService, setSelectedService] = useState(null);

    return (
        <>
            <Header title="Services" subtitle="Explore banking services" onToggleSidebar={onToggleSidebar} />
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>


                {/* Hero */}
                <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b4e, #1a1a2e)', borderRadius: '20px', padding: '28px 32px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(234,88,12,0.12)' }}></div>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Banking Services</h2>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Explore our comprehensive range of financial products and services</p>
                    </div>
                </div>

                {/* Services Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {SERVICES.map(s => (
                        <div key={s.name} onClick={() => setSelectedService(s)} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '22px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${s.color}15`; e.currentTarget.style.borderColor = `${s.color}40`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                            {s.popular && <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }}>Popular</span>}
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '14px', boxShadow: `0 4px 14px ${s.color}25` }}>{s.emoji}</div>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{s.name}</h3>
                            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>{s.desc}</p>
                            <button style={{ background: 'none', border: 'none', color: s.color, fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Learn More <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Coming Soon Modal */}
            <Modal isOpen={!!selectedService} onClose={() => setSelectedService(null)}>
                <div style={{ background: 'white', borderRadius: '24px', padding: '40px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', margin: '0 auto 20px', borderRadius: '20px', background: `linear-gradient(135deg, ${selectedService?.color || '#ea580c'}, ${selectedService?.color || '#ea580c'}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', boxShadow: `0 8px 24px ${selectedService?.color || '#ea580c'}30` }}>
                        {selectedService?.emoji}
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>{selectedService?.name}</h3>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>{selectedService?.desc}</p>

                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>🚧</div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>Coming Soon!</h4>
                        <p style={{ fontSize: '13px', color: '#b45309' }}>This service is under development and will be available in the next update.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setSelectedService(null)} style={{ flex: 1, padding: '12px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Close</button>
                        <button onClick={() => { setSelectedService(null); }} style={{ flex: 1, padding: '12px', background: `linear-gradient(135deg, ${selectedService?.color || '#ea580c'}, ${selectedService?.color || '#ea580c'}cc)`, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 12px ${selectedService?.color || '#ea580c'}30` }}>Notify Me</button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
