import { useAuth } from '../../context/AuthContext';

export default function Header({ title, subtitle, onToggleSidebar }) {
    const { user } = useAuth();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <header style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={onToggleSidebar} className="lg:hidden" style={{ padding: '8px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '10px' }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</h2>
                    {subtitle && <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{subtitle}</p>}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', fontWeight: 500, background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {dateStr}
                </span>
                <button style={{ position: 'relative', padding: '8px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '10px' }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '12px', borderLeft: '1px solid #e5e7eb' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#334155', margin: 0, lineHeight: 1.3 }}>{user?.name || 'User'}</p>
                        <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>Personal Account</p>
                    </div>
                    <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #ea580c, #f97316)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px', boxShadow: '0 2px 8px rgba(234,88,12,0.25)' }}>
                        {(user?.name || 'U')[0].toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
}
