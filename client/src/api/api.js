const API = '/api';

// ===== AUTH =====
export async function loginUser(email, password) {
    const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
}

export async function registerUser({ name, email, mobile_number, password, address }) {
    const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile_number, password, address }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
}

// ===== USER DATA =====
export async function getUserSummary(userId) {
    const res = await fetch(`${API}/user/summary/${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user data');
    return data;
}

export async function getAllTransactions(userId) {
    const res = await fetch(`${API}/transactions/all/${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch transactions');
    return data;
}

// ===== TRANSFERS =====
export async function validateRecipient(customerId, accountNo) {
    const res = await fetch(`${API}/customers/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, accountNo }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Validation failed');
    return data;
}

export async function transferMoney({ senderAccountNo, receiverAccountNo, receiverCustomerId, amount, note, userId }) {
    const res = await fetch(`${API}/transfer/automated`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderAccountNo, receiverAccountNo, receiverCustomerId, amount, note, userId, automated: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Transfer failed');
    return data;
}

export async function selfTransfer({ senderAccountNo, receiverAccountNo, amount, userId }) {
    const res = await fetch(`${API}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderAccountNo, receiverAccountNo, amount, userId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Transfer failed');
    return data;
}

// ===== BILLS =====
export async function getSavedBillers(userId) {
    const res = await fetch(`${API}/billers/${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch billers');
    return data;
}

export async function payBill({ userId, billerName, category, amount, fromAccount }) {
    const res = await fetch(`${API}/bills/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, billerName, category, amount, fromAccount }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Payment failed');
    return data;
}

// ===== UTILITY =====
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);
}
