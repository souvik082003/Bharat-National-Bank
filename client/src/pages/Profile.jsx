import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user } = useAuth();
    const { onToggleSidebar } = useOutletContext();
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: user?.name || '', email: user?.email || '', mobile: user?.mobile || '',
        address: user?.address || '', pan: '', aadhar: '', dob: '', gender: 'Male', occupation: '', income: '',
        nominee: '', nomineeRelation: '',
    });
    const [saved, setSaved] = useState(false);
    const [twoFa, setTwoFa] = useState(false);
    const [loginAlerts, setLoginAlerts] = useState(true);

    const handleSave = () => { setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 3000); };
    const handleChange = (k, v) => setProfile(p => ({ ...p, [k]: v }));

    const card = { background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '24px' };
    const inp = { width: '100%', padding: '12px 16px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 500, color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' };
    const inpDisabled = { ...inp, background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' };
    const lbl = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' };
    const fIn = (e) => { e.target.style.border = '2px solid #ea580c'; e.target.style.boxShadow = '0 0 0 3px rgba(234,88,12,0.1)'; };
    const fOut = (e) => { e.target.style.border = '2px solid #e2e8f0'; e.target.style.boxShadow = 'none'; };

    return (
        <>
            <Header title="My Profile" subtitle="Manage your account" onToggleSidebar={onToggleSidebar} />
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>


                {saved && <div style={{ padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, marginBottom: '16px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>Profile updated successfully!</div>}

                {/* Profile Header */}
                <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b4e, #1a1a2e)', borderRadius: '20px', padding: '28px 32px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(234,88,12,0.12)' }}></div>
                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #ea580c, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', fontWeight: 800, boxShadow: '0 8px 24px rgba(234,88,12,0.3)' }}>{(profile.name || 'U')[0].toUpperCase()}</div>
                        <div>
                            <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>{profile.name}</h2>
                            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Customer ID: {user?.id} · {profile.email}</p>
                        </div>
                        <button onClick={() => setEditing(!editing)} style={{ marginLeft: 'auto', padding: '10px 20px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', background: editing ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.1)', color: editing ? '#ef4444' : 'white' }}>{editing ? '✕ Cancel' : '✏️ Edit Profile'}</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
                    {/* Left — Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Personal */}
                        <div style={card}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>👤 Personal Information</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div><label style={lbl}>Full Name</label><input value={profile.name} onChange={(e) => handleChange('name', e.target.value)} style={editing ? inp : inpDisabled} disabled={!editing} onFocus={editing ? fIn : undefined} onBlur={editing ? fOut : undefined} /></div>
                                <div><label style={lbl}>Email</label><input value={profile.email} style={inpDisabled} disabled /></div>
                                <div><label style={lbl}>Mobile Number</label><input value={profile.mobile} onChange={(e) => handleChange('mobile', e.target.value)} style={editing ? inp : inpDisabled} disabled={!editing} onFocus={editing ? fIn : undefined} onBlur={editing ? fOut : undefined} placeholder="+91 98765 43210" /></div>
                                <div><label style={lbl}>Date of Birth</label><input type="date" value={profile.dob} onChange={(e) => handleChange('dob', e.target.value)} style={editing ? inp : inpDisabled} disabled={!editing} /></div>
                                <div><label style={lbl}>Gender</label><select value={profile.gender} onChange={(e) => handleChange('gender', e.target.value)} style={editing ? { ...inp, cursor: 'pointer' } : inpDisabled} disabled={!editing}><option>Male</option><option>Female</option><option>Other</option></select></div>
                                <div><label style={lbl}>Address</label><input value={profile.address} onChange={(e) => handleChange('address', e.target.value)} style={editing ? inp : inpDisabled} disabled={!editing} onFocus={editing ? fIn : undefined} onBlur={editing ? fOut : undefined} placeholder="Mumbai, India" /></div>
                            </div>
                        </div>

                        {/* KYC */}
                        <div style={card}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>📋 KYC Details</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div><label style={lbl}>PAN Number</label><input value={profile.pan} onChange={(e) => handleChange('pan', e.target.value.toUpperCase())} maxLength={10} style={editing ? inp : inpDisabled} disabled={!editing} onFocus={editing ? fIn : undefined} onBlur={editing ? fOut : undefined} placeholder="ABCDE1234F" /></div>
                                <div><label style={lbl}>Aadhar Number</label><input value={profile.aadhar} onChange={(e) => handleChange('aadhar', e.target.value)} maxLength={12} style={editing ? inp : inpDisabled} disabled={!editing} onFocus={editing ? fIn : undefined} onBlur={editing ? fOut : undefined} placeholder="xxxx xxxx xxxx" /></div>
                                <div><label style={lbl}>Occupation</label><select value={profile.occupation} onChange={(e) => handleChange('occupation', e.target.value)} style={editing ? { ...inp, cursor: 'pointer' } : inpDisabled} disabled={!editing}><option value="">Select</option><option>Salaried</option><option>Self-Employed</option><option>Student</option><option>Business Owner</option><option>Retired</option><option>Homemaker</option></select></div>
                                <div><label style={lbl}>Annual Income</label><select value={profile.income} onChange={(e) => handleChange('income', e.target.value)} style={editing ? { ...inp, cursor: 'pointer' } : inpDisabled} disabled={!editing}><option value="">Select</option><option>Below ₹3 Lakh</option><option>₹3-5 Lakh</option><option>₹5-10 Lakh</option><option>₹10-25 Lakh</option><option>₹25-50 Lakh</option><option>Above ₹50 Lakh</option></select></div>
                            </div>
                        </div>

                        {/* Nominee */}
                        <div style={card}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>👥 Nominee Details</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div><label style={lbl}>Nominee Name</label><input value={profile.nominee} onChange={(e) => handleChange('nominee', e.target.value)} style={editing ? inp : inpDisabled} disabled={!editing} onFocus={editing ? fIn : undefined} onBlur={editing ? fOut : undefined} placeholder="Full name" /></div>
                                <div><label style={lbl}>Relationship</label><select value={profile.nomineeRelation} onChange={(e) => handleChange('nomineeRelation', e.target.value)} style={editing ? { ...inp, cursor: 'pointer' } : inpDisabled} disabled={!editing}><option value="">Select</option><option>Spouse</option><option>Parent</option><option>Child</option><option>Sibling</option><option>Other</option></select></div>
                            </div>
                        </div>

                        {editing && (
                            <button onClick={handleSave} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #c2410c, #ea580c)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(234,88,12,0.3)' }}>Save Changes</button>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Account Summary */}
                        <div style={{ ...card, background: 'linear-gradient(135deg, #ea580c, #f97316)', color: 'white', border: 'none' }}>
                            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.7, marginBottom: '4px' }}>Customer ID</p>
                            <p style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>{user?.id}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                                <span style={{ fontSize: '11px' }}>Member Since: 2024</span>
                                <span style={{ fontSize: '11px' }}>Active ✓</span>
                            </div>
                        </div>

                        {/* Security Settings */}
                        <div style={card}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>🔒 Security Settings</h3>

                            <div style={{ padding: '14px', background: '#fafafa', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div><p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Two-Factor Auth</p><p style={{ fontSize: '11px', color: '#94a3b8' }}>SMS verification on login</p></div>
                                <button onClick={() => setTwoFa(!twoFa)} style={{ width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', background: twoFa ? '#ea580c' : '#e2e8f0', position: 'relative', transition: 'background 0.2s' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: twoFa ? '25px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                                </button>
                            </div>

                            <div style={{ padding: '14px', background: '#fafafa', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div><p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Login Alerts</p><p style={{ fontSize: '11px', color: '#94a3b8' }}>Email alert on new logins</p></div>
                                <button onClick={() => setLoginAlerts(!loginAlerts)} style={{ width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', background: loginAlerts ? '#ea580c' : '#e2e8f0', position: 'relative', transition: 'background 0.2s' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: loginAlerts ? '25px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                                </button>
                            </div>

                            <button style={{ width: '100%', padding: '12px', background: '#fafafa', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '8px' }}>🔑 Change Password</button>
                            <button style={{ width: '100%', padding: '12px', background: '#fafafa', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>📱 Update Mobile Number</button>
                        </div>

                        {/* Activity */}
                        <div style={card}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>📊 Account Activity</h3>
                            {[
                                { l: 'Last Login', v: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), c: '#1e293b' },
                                { l: 'Login Device', v: 'Chrome / Windows', c: '#475569' },
                                { l: 'IP Address', v: '103.xx.xx.xxx', c: '#475569' },
                                { l: 'Account Status', v: 'Active', c: '#059669' },
                            ].map(({ l, v, c }) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{l}</span>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: c }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
