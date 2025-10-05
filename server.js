const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION (Updated for new DB name) ---
const dbPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bank_system_india', // IMPORTANT: Use the new DB name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- AUTHENTICATION APIS ---

// POST /api/register
app.post('/api/register', async (req, res) => {
    const { name, email, mobile_number, password, address } = req.body;
    const initialBalance = 100000.00; // Default sign-up amount

    if (!name || !email || !mobile_number || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        const hashedPassword = await bcrypt.hash(password, 10);
        const [customerResult] = await connection.query(
            'INSERT INTO Customer (Name, Email, Mobile_Number, Password, Address) VALUES (?, ?, ?, ?, ?)',
            [name, email, mobile_number, hashedPassword, address || null]
        );
        const newCustomerId = customerResult.insertId;

        const newAccountNumber = `BNB${String(newCustomerId).padStart(6, '0')}`;
        const randomBranchId = Math.floor(Math.random() * 5) + 1;
        await connection.query(
            'INSERT INTO Account (Account_No, Branch_ID, Cust_ID, Acc_Type, Balance) VALUES (?, ?, ?, ?, ?)',
            [newAccountNumber, randomBranchId, newCustomerId, 'Savings', initialBalance]
        );

        await connection.commit();
        res.status(201).json({ message: 'Registration successful!', userId: newCustomerId });

    } catch (error) {
        if (connection) await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email or mobile number already exists.' });
        }
        res.status(500).json({ message: 'Database error during registration.' });
    } finally {
        if (connection) connection.release();
    }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await dbPool.query('SELECT * FROM Customer WHERE Email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        const userPayload = { id: user.Cust_ID, name: user.Name, email: user.Email };
        res.json({ message: 'Login successful', user: userPayload });
    } catch (error) {
        res.status(500).json({ message: 'Database error during login.' });
    }
});

// --- DYNAMIC (LOGGED-IN USER) APIS ---

app.get('/api/user/summary/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [accounts] = await dbPool.query('SELECT Account_No, Acc_Type, Balance FROM Account WHERE Cust_ID = ?', [userId]);
        const expensesQuery = `
            SELECT SUM(T.Amount) AS total FROM (
                SELECT amount AS Amount FROM transfers WHERE sender_account_no IN (SELECT Account_No FROM Account WHERE Cust_ID = ?) AND MONTH(transfer_date) = MONTH(CURRENT_DATE())
                UNION ALL
                SELECT amount AS Amount FROM bill_payments WHERE user_id = ? AND MONTH(payment_date) = MONTH(CURRENT_DATE())
            ) AS T;
        `;
        const [expenseRows] = await dbPool.query(expensesQuery, [userId, userId]);
        
        // Add branch information (you can customize these based on your actual branch data)
        const branchInfo = {
            branchName: 'Mumbai Main Branch',
            ifscCode: 'BNBI0001234'
        };
        
        res.json({ 
            accounts: accounts, 
            monthlyExpenses: expenseRows[0].total || 0,
            branchName: branchInfo.branchName,
            ifscCode: branchInfo.ifscCode
        });
    } catch (error) {
        console.error('User summary error:', error);
        res.status(500).json({ message: 'Failed to fetch user summary.' });
    }
});

app.get('/api/transactions/all/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const transfersQuery = `
            SELECT t.id, t.amount, t.transfer_date as date, 'Fund Transfer' as type, 
                   sender_cust.Name as details_primary, receiver_cust.Name as details_secondary
            FROM transfers t
            JOIN Account sender_acc ON t.sender_account_no = sender_acc.Account_No
            JOIN Customer sender_cust ON sender_acc.Cust_ID = sender_cust.Cust_ID
            JOIN Account receiver_acc ON t.receiver_account_no = receiver_acc.Account_No
            JOIN Customer receiver_cust ON receiver_acc.Cust_ID = receiver_cust.Cust_ID
            WHERE sender_acc.Cust_ID = ? OR receiver_acc.Cust_ID = ?
        `;
        const [transfers] = await dbPool.query(transfersQuery, [userId, userId]);

        const billsQuery = `
            SELECT id, amount, payment_date as date, 'Bill Payment' as type, 
                   biller_name as details_primary, category as details_secondary
            FROM bill_payments WHERE user_id = ?
        `;
        const [bills] = await dbPool.query(billsQuery, [userId]);
        
        const allTransactions = [...transfers, ...bills].sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(allTransactions);

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch transaction history.' });
    }
});

app.get('/api/billers/:userId', async (req, res) => { const { userId } = req.params; try { const [rows] = await dbPool.query('SELECT * FROM saved_billers WHERE user_id = ?', [userId]); res.json(rows); } catch (error) { res.status(500).json({ message: 'Failed to fetch billers' }); } });

app.get('/api/customers/search/:identifier', async (req, res) => { 
    const { identifier } = req.params;
    const query = 'SELECT Cust_ID, Name, Mobile_Number, Email FROM Customer WHERE Cust_ID = ? OR Mobile_Number = ? OR Email = ?'; 
    try { 
        const [rows] = await dbPool.query(query, [identifier, identifier, identifier]); 
        if (rows.length === 0) return res.status(404).json({ message: 'Customer not found' }); 
        
        const [accRows] = await dbPool.query('SELECT Account_No FROM Account WHERE Cust_ID = ? AND Acc_Type = "Savings" LIMIT 1', [rows[0].Cust_ID]);
        if (accRows.length === 0) return res.status(404).json({ message: 'Customer found, but has no savings account.'});

        res.json({ ...rows[0], accountNo: accRows[0].Account_No });
    } catch (error) { 
        res.status(500).json({ message: 'Database query failed' }); 
    } 
});

// POST /api/customers/validate - Validate recipient details for simplified transfer
app.post('/api/customers/validate', async (req, res) => {
    const { customerId, accountNo } = req.body;
    
    if (!customerId || !accountNo) {
        return res.status(400).json({ message: 'Customer ID and Account Number are required.' });
    }

    try {
        // Validate that the customer exists
        const [customerRows] = await dbPool.query('SELECT Cust_ID, Name FROM Customer WHERE Cust_ID = ?', [customerId]);
        if (customerRows.length === 0) {
            return res.status(404).json({ message: 'Customer ID not found.' });
        }

        // Validate that the account belongs to this customer
        const [accountRows] = await dbPool.query('SELECT Account_No, Cust_ID, Acc_Type FROM Account WHERE Account_No = ? AND Cust_ID = ?', [accountNo, customerId]);
        if (accountRows.length === 0) {
            return res.status(404).json({ message: 'Account number does not belong to this customer.' });
        }

        res.json({ 
            message: 'Recipient details validated successfully',
            customerName: customerRows[0].Name,
            accountType: accountRows[0].Acc_Type
        });
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ message: 'Database error during validation.' });
    }
});

app.post('/api/bills/pay', async (req, res) => { const { userId, billerName, category, amount, fromAccount } = req.body; if (!userId || !billerName || !amount || !fromAccount) return res.status(400).json({ message: 'Invalid bill payment data.' }); let connection; try { connection = await dbPool.getConnection(); await connection.beginTransaction(); const [accRows] = await connection.query('SELECT * FROM Account WHERE Account_No = ? AND Cust_ID = ? FOR UPDATE', [fromAccount, userId]); const account = accRows[0]; if (!account || account.Balance < amount) { await connection.rollback(); return res.status(400).json({ message: 'Insufficient funds or invalid account.' }); } await connection.query('UPDATE Account SET Balance = Balance - ? WHERE Account_No = ?', [amount, fromAccount]); await connection.query('INSERT INTO bill_payments (user_id, biller_name, category, amount, status) VALUES (?, ?, ?, ?, ?)', [userId, billerName, category, amount, 'Success']); await connection.commit(); res.status(200).json({ message: `Successfully paid ${billerName} bill.` }); } catch (error) { if (connection) await connection.rollback(); res.status(500).json({ message: 'An internal error occurred.' }); } finally { if (connection) connection.release(); } });

app.post('/api/transfer', async (req, res) => { 
    const { senderAccountNo, receiverAccountNo, amount, userId } = req.body; 
    if (!senderAccountNo || !receiverAccountNo || !amount) return res.status(400).json({ message: 'Invalid transfer data.' }); 
    if (senderAccountNo === receiverAccountNo) return res.status(400).json({ message: 'Cannot transfer to the same account.' });
    
    let connection; 
    try { 
        connection = await dbPool.getConnection(); 
        await connection.beginTransaction(); 
        
        // Handle Self-Deposit
        if (senderAccountNo === 'SYS_EXTERNAL') {
             await connection.query('UPDATE Account SET Balance = Balance + ? WHERE Account_No = ?', [amount, receiverAccountNo]);
             await connection.query('INSERT INTO transfers (sender_account_no, receiver_account_no, amount) VALUES (?, ?, ?)', [senderAccountNo, receiverAccountNo, amount]); 
        } else {
            // Standard Transfer
            const [senderAccRows] = await connection.query('SELECT * FROM Account WHERE Account_No = ? AND Cust_ID = ? FOR UPDATE', [senderAccountNo, userId]); 
            const senderAccount = senderAccRows[0]; 
            if (!senderAccount || senderAccount.Balance < amount) { await connection.rollback(); return res.status(400).json({ message: 'Insufficient funds or invalid sender account.' }); } 
            await connection.query('UPDATE Account SET Balance = Balance - ? WHERE Account_No = ?', [amount, senderAccountNo]); 
            await connection.query('UPDATE Account SET Balance = Balance + ? WHERE Account_No = ?', [amount, receiverAccountNo]); 
            await connection.query('INSERT INTO transfers (sender_account_no, receiver_account_no, amount) VALUES (?, ?, ?)', [senderAccountNo, receiverAccountNo, amount]); 
        }
        
        await connection.commit(); 
        res.status(200).json({ message: 'Transfer successful!' }); 
    } catch (error) { 
        if (connection) await connection.rollback(); 
        res.status(500).json({ message: 'An internal error occurred.' }); 
    } finally { 
        if (connection) connection.release(); 
    } 
});

// POST /api/transfer/automated - Automated transfer with all validations
app.post('/api/transfer/automated', async (req, res) => {
    const { senderAccountNo, receiverAccountNo, receiverCustomerId, amount, note, userId, automated } = req.body;
    
    if (!senderAccountNo || !receiverAccountNo || !amount || !userId) {
        return res.status(400).json({ message: 'Invalid transfer data.' });
    }

    if (senderAccountNo === receiverAccountNo) {
        return res.status(400).json({ message: 'Cannot transfer to the same account.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        // Step 1: Validate sender account and check balance
        const [senderAccRows] = await connection.query(
            'SELECT a.*, c.Name as SenderName FROM Account a JOIN Customer c ON a.Cust_ID = c.Cust_ID WHERE a.Account_No = ? AND a.Cust_ID = ? FOR UPDATE', 
            [senderAccountNo, userId]
        );
        
        if (senderAccRows.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid sender account.' });
        }

        const senderAccount = senderAccRows[0];
        if (senderAccount.Balance < amount) {
            await connection.rollback();
            return res.status(400).json({ message: `Insufficient funds. Available balance: ₹${senderAccount.Balance.toFixed(2)}` });
        }

        // Step 2: Validate receiver account
        const [receiverAccRows] = await connection.query(
            'SELECT a.*, c.Name as ReceiverName FROM Account a JOIN Customer c ON a.Cust_ID = c.Cust_ID WHERE a.Account_No = ? FOR UPDATE', 
            [receiverAccountNo]
        );
        
        if (receiverAccRows.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid receiver account number.' });
        }

        const receiverAccount = receiverAccRows[0];

        // Step 3: Validate receiver customer ID matches
        if (receiverCustomerId && receiverAccount.Cust_ID != receiverCustomerId) {
            await connection.rollback();
            return res.status(400).json({ message: 'Account number does not belong to the specified customer ID.' });
        }

        // Step 4: Process the transfer
        await connection.query('UPDATE Account SET Balance = Balance - ? WHERE Account_No = ?', [amount, senderAccountNo]);
        await connection.query('UPDATE Account SET Balance = Balance + ? WHERE Account_No = ?', [amount, receiverAccountNo]);
        
        // Step 5: Record the transaction with note
        const [transferResult] = await connection.query(
            'INSERT INTO transfers (sender_account_no, receiver_account_no, amount) VALUES (?, ?, ?)', 
            [senderAccountNo, receiverAccountNo, amount]
        );

        await connection.commit();

        // Generate transaction ID
        const transactionId = `TXN${Date.now()}${transferResult.insertId}`;

        res.status(200).json({ 
            message: `Successfully transferred ₹${amount.toFixed(2)} to ${receiverAccount.ReceiverName}`,
            transactionId: transactionId,
            amount: amount,
            recipientName: receiverAccount.ReceiverName,
            senderBalance: senderAccount.Balance - amount,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Automated transfer error:', error);
        res.status(500).json({ message: 'An internal error occurred during transfer processing.' });
    } finally {
        if (connection) connection.release();
    }
});

// --- SERVER START FUNCTION ---
async function startServer() {
    try {
        await dbPool.query('SELECT 1');
        console.log('✅ Database connection successful!');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ FATAL ERROR: Could not connect to the database.', error.message);
        process.exit(1);
    }
}

startServer();

