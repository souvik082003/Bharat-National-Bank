import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../api/api';

export default function LoginForm({ onSwitchToRegister }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const data = await loginUser(email, password);
            login(data.user);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };



    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '1050px', display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>

                {/* LEFT BRANDING */}
                <div style={{ background: 'linear-gradient(160deg, #7c2d12, #c2410c, #ea580c)', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}></div>
                    <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>

                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
                            <img src="/logo.png" alt="BNB Logo" style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover' }} />
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>Bharat National</div>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#fed7aa', letterSpacing: '3px', textTransform: 'uppercase' }}>Bank</div>
                            </div>
                        </div>
                        <h2 style={{ fontSize: '34px', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: '16px' }}>Welcome to<br />Digital Banking</h2>
                        <p style={{ fontSize: '15px', color: 'rgba(254,215,170,0.6)', lineHeight: 1.7 }}>Experience secure, fast, and modern banking at your fingertips.</p>
                    </div>

                    <div style={{ position: 'relative', zIndex: 2 }}>
                        {[
                            { text: '256-bit Bank-Grade Encryption', color: '#4ade80' },
                            { text: 'Instant IMPS & UPI Transfers', color: '#60a5fa' },
                            { text: '24/7 Mobile Banking Access', color: '#fbbf24' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                                <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <svg width="16" height="16" fill="none" stroke={item.color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{item.text}</span>
                            </div>
                        ))}

                    </div>
                </div>

                {/* RIGHT FORM */}
                <div style={{ background: '#ffffff', padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Welcome Back</h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '32px' }}>Sign in to access your account</p>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, marginBottom: '20px' }}>{error}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <svg width="18" height="18" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', padding: '14px 16px 14px 48px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '14px', fontSize: '14px', fontWeight: 500, color: '#0f172a', outline: 'none', transition: 'border 0.2s, box-shadow 0.2s', boxSizing: 'border-box' }}
                                    onFocus={(e) => { e.target.style.border = '2px solid #ea580c'; e.target.style.boxShadow = '0 0 0 4px rgba(234,88,12,0.1)'; e.target.style.background = '#fff'; }}
                                    onBlur={(e) => { e.target.style.border = '2px solid #e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                                    placeholder="you@email.com" required />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <svg width="18" height="18" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                    style={{ width: '100%', padding: '14px 48px 14px 48px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '14px', fontSize: '14px', fontWeight: 500, color: '#0f172a', outline: 'none', transition: 'border 0.2s, box-shadow 0.2s', boxSizing: 'border-box' }}
                                    onFocus={(e) => { e.target.style.border = '2px solid #ea580c'; e.target.style.boxShadow = '0 0 0 4px rgba(234,88,12,0.1)'; e.target.style.background = '#fff'; }}
                                    onBlur={(e) => { e.target.style.border = '2px solid #e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                                    placeholder="Enter your password" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                                    <svg width="18" height="18" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                                        {showPassword
                                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.879L21 21" />
                                            : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                                        }
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#64748b' }}>
                                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#ea580c' }} /> Remember me
                            </label>
                            <button type="button" style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: 600, color: '#ea580c', cursor: 'pointer' }}>Forgot Password?</button>
                        </div>

                        <button type="submit" disabled={loading}
                            style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #c2410c, #ea580c)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(234,88,12,0.35)', transition: 'all 0.2s', opacity: loading ? 0.6 : 1 }}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>



                    <p style={{ textAlign: 'center', fontSize: '14px', color: '#94a3b8', marginTop: '28px' }}>
                        Don't have an account?{' '}
                        <button onClick={onSwitchToRegister} style={{ background: 'none', border: 'none', color: '#ea580c', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Create Account</button>
                    </p>
                </div>
            </div>
        </div>
    );
}
