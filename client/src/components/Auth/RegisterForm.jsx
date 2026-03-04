import { useState } from 'react';
import { registerUser } from '../../api/api';

const STEPS = ['personal', 'contact', 'security', 'kyc'];
const STEP_LABELS = ['Personal Info', 'Contact Details', 'Security', 'KYC & Identity'];

export default function RegisterForm({ onSwitchToLogin }) {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        name: '', email: '', mobile_number: '', password: '', confirmPassword: '',
        address: '', dob: '', gender: 'Male', pan: '', aadhar: '',
        occupation: '', income: '', nominee: '', nomineeRelation: '', agreeTerms: false,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const handleChange = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const nextStep = () => {
        setError('');
        if (step === 0 && (!form.name || !form.dob || !form.gender)) return setError('Please fill all personal details.');
        if (step === 1 && (!form.email || !form.mobile_number || !form.address)) return setError('Please fill all contact details.');
        if (step === 2) {
            if (!form.password || form.password.length < 6) return setError('Password must be at least 6 characters.');
            if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
        }
        setStep(s => Math.min(s + 1, STEPS.length - 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.agreeTerms) return setError('Please agree to the terms and conditions.');
        setError(''); setSuccess(''); setLoading(true);
        try {
            await registerUser({ name: form.name, email: form.email, mobile_number: form.mobile_number, password: form.password, address: form.address });
            setSuccess('Registration successful! You can now sign in.');
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const inputStyle = {
        width: '100%', padding: '12px 16px', background: '#f8fafc',
        border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '14px',
        fontWeight: 500, color: '#0f172a', outline: 'none', transition: 'border 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
    };
    const iconInput = { ...inputStyle, paddingLeft: '44px' };
    const focusIn = (e) => { e.target.style.border = '2px solid #ea580c'; e.target.style.boxShadow = '0 0 0 4px rgba(234,88,12,0.1)'; e.target.style.background = '#fff'; };
    const focusOut = (e) => { e.target.style.border = '2px solid #e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; };
    const lbl = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '1050px', display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
                {/* LEFT */}
                <div style={{ background: 'linear-gradient(160deg, #7c2d12, #c2410c, #ea580c)', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}></div>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                            </div>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>Bharat National</div>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#fed7aa', letterSpacing: '3px', textTransform: 'uppercase' }}>Bank</div>
                            </div>
                        </div>
                        <h2 style={{ fontSize: '30px', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: '16px' }}>Open Your Free<br />Bank Account</h2>
                        <p style={{ fontSize: '14px', color: 'rgba(254,215,170,0.6)', lineHeight: 1.7 }}>Join millions and start your financial journey with India's most trusted digital bank.</p>
                    </div>

                    {/* Progress Steps */}
                    <div style={{ position: 'relative', zIndex: 2, marginTop: '32px' }}>
                        {STEP_LABELS.map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, background: i <= step ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)', color: i <= step ? 'white' : 'rgba(255,255,255,0.4)', border: i === step ? '2px solid white' : '2px solid transparent' }}>
                                    {i < step ? '✓' : i + 1}
                                </div>
                                <span style={{ fontSize: '13px', color: i <= step ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: i === step ? 700 : 400 }}>{s}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT */}
                <div style={{ background: '#ffffff', padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto', maxHeight: '90vh' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{STEP_LABELS[step]}</h2>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '22px' }}>Step {step + 1} of {STEPS.length}</p>

                    {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}
                    {success && <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '14px' }}>{success}</div>}

                    <form onSubmit={step === STEPS.length - 1 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                        {/* Step 0: Personal */}
                        {step === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div><label style={lbl}>Full Name *</label><input value={form.name} onChange={(e) => handleChange('name', e.target.value)} style={inputStyle} onFocus={focusIn} onBlur={focusOut} placeholder="John Doe" required /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div><label style={lbl}>Date of Birth *</label><input type="date" value={form.dob} onChange={(e) => handleChange('dob', e.target.value)} style={inputStyle} onFocus={focusIn} onBlur={focusOut} required /></div>
                                    <div><label style={lbl}>Gender *</label><select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}><option>Male</option><option>Female</option><option>Other</option></select></div>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Contact */}
                        {step === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div><label style={lbl}>Email Address *</label><input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} style={inputStyle} onFocus={focusIn} onBlur={focusOut} placeholder="you@email.com" required /></div>
                                <div><label style={lbl}>Mobile Number *</label><input type="tel" value={form.mobile_number} onChange={(e) => handleChange('mobile_number', e.target.value)} style={inputStyle} onFocus={focusIn} onBlur={focusOut} placeholder="9876543210" required /></div>
                                <div><label style={lbl}>Address *</label><input value={form.address} onChange={(e) => handleChange('address', e.target.value)} style={inputStyle} onFocus={focusIn} onBlur={focusOut} placeholder="Full address with city and pincode" required /></div>
                            </div>
                        )}

                        {/* Step 2: Security */}
                        {step === 2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label style={lbl}>Password *</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={(e) => handleChange('password', e.target.value)} style={inputStyle} onFocus={focusIn} onBlur={focusOut} placeholder="Min. 6 characters" required minLength={6} />
                                        <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>{showPwd ? 'Hide' : 'Show'}</button>
                                    </div>
                                </div>
                                <div><label style={lbl}>Confirm Password *</label><input type="password" value={form.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} style={inputStyle} onFocus={focusIn} onBlur={focusOut} placeholder="Re-enter password" required /></div>
                                {form.password && (
                                    <div style={{ background: '#fafafa', borderRadius: '12px', padding: '14px', border: '1px solid #f1f5f9' }}>
                                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Password Strength</p>
                                        {[
                                            { test: form.password.length >= 6, text: 'At least 6 characters' },
                                            { test: /[A-Z]/.test(form.password), text: 'Contains uppercase letter' },
                                            { test: /[0-9]/.test(form.password), text: 'Contains a number' },
                                            { test: /[!@#$%^&*]/.test(form.password), text: 'Contains special character' },
                                        ].map(({ test, text }) => (
                                            <p key={text} style={{ fontSize: '11px', color: test ? '#059669' : '#94a3b8', marginBottom: '2px' }}>{test ? '✓' : '○'} {text}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: KYC */}
                        {step === 3 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div><label style={lbl}>PAN Number</label><input value={form.pan} onChange={(e) => handleChange('pan', e.target.value.toUpperCase())} maxLength={10} style={inputStyle} onFocus={focusIn} onBlur={focusOut} placeholder="ABCDE1234F" /></div>
                                    <div><label style={lbl}>Aadhar Number</label><input value={form.aadhar} onChange={(e) => handleChange('aadhar', e.target.value)} maxLength={12} style={inputStyle} onFocus={focusIn} onBlur={focusOut} placeholder="xxxx xxxx xxxx" /></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div><label style={lbl}>Occupation</label><select value={form.occupation} onChange={(e) => handleChange('occupation', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}><option value="">Select</option><option>Salaried</option><option>Self-Employed</option><option>Student</option><option>Business Owner</option><option>Retired</option></select></div>
                                    <div><label style={lbl}>Annual Income</label><select value={form.income} onChange={(e) => handleChange('income', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}><option value="">Select</option><option>Below ₹3 Lakh</option><option>₹3-5 Lakh</option><option>₹5-10 Lakh</option><option>₹10-25 Lakh</option><option>Above ₹25 Lakh</option></select></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div><label style={lbl}>Nominee Name</label><input value={form.nominee} onChange={(e) => handleChange('nominee', e.target.value)} style={inputStyle} onFocus={focusIn} onBlur={focusOut} placeholder="Nominee full name" /></div>
                                    <div><label style={lbl}>Relationship</label><select value={form.nomineeRelation} onChange={(e) => handleChange('nomineeRelation', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}><option value="">Select</option><option>Spouse</option><option>Parent</option><option>Child</option><option>Sibling</option></select></div>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#fafafa', borderRadius: '12px', cursor: 'pointer', border: '1px solid #f1f5f9' }}>
                                    <input type="checkbox" checked={form.agreeTerms} onChange={(e) => handleChange('agreeTerms', e.target.checked)} style={{ accentColor: '#ea580c', width: '18px', height: '18px' }} />
                                    <span style={{ fontSize: '12px', color: '#475569' }}>I agree to the <strong style={{ color: '#ea580c' }}>Terms & Conditions</strong> and <strong style={{ color: '#ea580c' }}>Privacy Policy</strong></span>
                                </label>
                            </div>
                        )}

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            {step > 0 && (
                                <button type="button" onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: '14px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>← Back</button>
                            )}
                            <button type="submit" disabled={loading} style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, #c2410c, #ea580c)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(234,88,12,0.35)', opacity: loading ? 0.6 : 1 }}>
                                {loading ? 'Creating Account...' : step < STEPS.length - 1 ? 'Continue →' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '20px' }}>
                        Already have an account?{' '}
                        <button onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', color: '#ea580c', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Sign In</button>
                    </p>
                </div>
            </div>
        </div>
    );
}
