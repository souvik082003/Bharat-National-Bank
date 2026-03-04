import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { label: 'MAIN MENU', type: 'header' },
    { path: '/', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', label: 'Dashboard' },
    { path: '/transfer', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', label: 'Fund Transfer' },
    { path: '/pay-bills', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', label: 'Pay Bills' },
    { path: '/history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'History' },
    { path: '/tips', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', label: 'Banking Guide' },
    { label: 'WEALTH & SERVICES', type: 'header' },
    { path: '/services', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', label: 'Services' },
    { path: '/loans', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', label: 'Loans' },
    { path: '/sip-calculator', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: 'SIP Calculator' },
    { label: 'SETTINGS', type: 'header' },
    { path: '/profile', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', label: 'Profile & Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
    const { logout, user } = useAuth();

    return (
        <>
            {isOpen && <div onClick={onClose} className="lg:hidden" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(4px)' }} />}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                style={{ width: '260px', background: 'linear-gradient(180deg, #1e1e2e, #171723)', display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0 }}>

                {/* Logo */}
                <div style={{ padding: '20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #ea580c, #f97316)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(234,88,12,0.3)', flexShrink: 0 }}>
                            <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <h1 style={{ fontSize: '15px', fontWeight: 800, color: 'white', lineHeight: 1.2, margin: 0 }}>Bharat National</h1>
                            <p style={{ fontSize: '10px', fontWeight: 700, color: '#fb923c', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>Bank</p>
                        </div>
                        <button onClick={onClose} className="lg:hidden" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                    {navItems.map((item, i) => {
                        if (item.type === 'header') {
                            return <p key={i} style={{ padding: '20px 12px 8px', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>{item.label}</p>;
                        }
                        return (
                            <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={onClose}
                                style={({ isActive }) => ({
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '12px',
                                    fontSize: '13px', fontWeight: isActive ? 700 : 500, textDecoration: 'none', marginBottom: '2px',
                                    transition: 'all 0.15s',
                                    background: isActive ? 'rgba(234,88,12,0.12)' : 'transparent',
                                    color: isActive ? '#fb923c' : '#94a3b8',
                                    borderLeft: isActive ? '3px solid #ea580c' : '3px solid transparent',
                                })}>
                                {({ isActive }) => (
                                    <>
                                        <svg width="18" height="18" fill="none" stroke={isActive ? '#fb923c' : '#64748b'} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={item.icon} />
                                        </svg>
                                        <span>{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User + Logout */}
                <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {user && (
                        <div style={{ padding: '10px 12px', marginBottom: '8px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #ea580c, #f97316)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                                    {(user.name || 'U')[0].toUpperCase()}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                                    <p style={{ fontSize: '10px', color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
