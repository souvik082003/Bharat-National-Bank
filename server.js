const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bank_system_india';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Database connection successful!'))
    .catch((err) => {
        console.error('❌ FATAL ERROR: Could not connect to the database.', err.message);
        process.exit(1);
    });

// ==================== SCHEMAS ====================

const branchSchema = new mongoose.Schema({
    Branch_ID: { type: Number, unique: true, required: true },
    Branch_Name: { type: String, required: true },
    IFSC_Code: { type: String, required: true, unique: true },
    Branch_Code: { type: String, required: true },
    City: { type: String, required: true },
    State: { type: String, required: true },
    Address: { type: String },
    Phone: { type: String },
});

const customerSchema = new mongoose.Schema({
    Cust_ID: { type: Number, unique: true },
    Name: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Mobile_Number: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    Address: { type: String },
    City: { type: String },
    State: { type: String },
    Pincode: { type: String },
    Date_of_Birth: { type: String },
    Gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    PAN: { type: String },
    Aadhar: { type: String },
    Occupation: { type: String },
    Annual_Income: { type: String },
    Nominee_Name: { type: String },
    Nominee_Relation: { type: String },
    MPIN: { type: String },
    Account_Status: { type: String, enum: ['Active', 'Inactive', 'Frozen'], default: 'Active' },
    KYC_Status: { type: String, enum: ['Verified', 'Pending', 'Rejected'], default: 'Pending' },
    Created_At: { type: Date, default: Date.now },
});

const accountSchema = new mongoose.Schema({
    Account_No: { type: String, required: true, unique: true },
    Branch_ID: { type: Number, required: true },
    Cust_ID: { type: Number, required: true },
    Acc_Type: { type: String, default: 'Savings' },
    Balance: { type: Number, default: 0 },
    Opening_Date: { type: Date, default: Date.now },
    Account_Status: { type: String, enum: ['Active', 'Dormant', 'Closed'], default: 'Active' },
});

const transferSchema = new mongoose.Schema({
    sender_account_no: String,
    receiver_account_no: String,
    amount: Number,
    transfer_date: { type: Date, default: Date.now },
    transfer_type: { type: String, default: 'IMPS' },
    note: String
});

const billPaymentSchema = new mongoose.Schema({
    user_id: Number,
    biller_name: String,
    category: String,
    amount: Number,
    payment_date: { type: Date, default: Date.now },
    status: { type: String, default: 'Success' }
});

const savedBillerSchema = new mongoose.Schema({
    user_id: Number,
    biller_name: String,
    category: String,
    biller_account_no: String
});

const counterSchema = new mongoose.Schema({
    id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

// ==================== MODELS ====================
const Branch = mongoose.model('Branch', branchSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Account = mongoose.model('Account', accountSchema);
const Transfer = mongoose.model('Transfer', transferSchema);
const BillPayment = mongoose.model('BillPayment', billPaymentSchema);
const SavedBiller = mongoose.model('SavedBiller', savedBillerSchema);
const Counter = mongoose.model('Counter', counterSchema);

// ==================== HELPERS ====================
async function getNextSequenceValue(sequenceName) {
    const doc = await Counter.findOneAndUpdate(
        { id: sequenceName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return doc.seq;
}

// Generate 14-digit account number: 3010 + branchCode(3) + padded ID(7)
function generateAccountNo(branchId, custId) {
    return `3010${String(branchId).padStart(3, '0')}${String(custId).padStart(7, '0')}`;
}

// ==================== BRANCHES DATA ====================
const BRANCHES = [
    { Branch_ID: 1, Branch_Name: 'Mumbai Main Branch', IFSC_Code: 'BNBI0001001', Branch_Code: '001', City: 'Mumbai', State: 'Maharashtra', Address: '123 Dalal Street, Fort, Mumbai - 400001', Phone: '022-22001001' },
    { Branch_ID: 2, Branch_Name: 'Delhi Central Branch', IFSC_Code: 'BNBI0002001', Branch_Code: '002', City: 'New Delhi', State: 'Delhi', Address: '45 Connaught Place, New Delhi - 110001', Phone: '011-23002001' },
    { Branch_ID: 3, Branch_Name: 'Bangalore Tech Park Branch', IFSC_Code: 'BNBI0003001', Branch_Code: '003', City: 'Bangalore', State: 'Karnataka', Address: '78 Electronic City, Bangalore - 560100', Phone: '080-25003001' },
    { Branch_ID: 4, Branch_Name: 'Chennai Marina Branch', IFSC_Code: 'BNBI0004001', Branch_Code: '004', City: 'Chennai', State: 'Tamil Nadu', Address: '12 Anna Salai, Chennai - 600002', Phone: '044-28004001' },
    { Branch_ID: 5, Branch_Name: 'Kolkata Park Street Branch', IFSC_Code: 'BNBI0005001', Branch_Code: '005', City: 'Kolkata', State: 'West Bengal', Address: '56 Park Street, Kolkata - 700016', Phone: '033-22005001' },
];

// ==================== 30 PRE-SEEDED USERS ====================
const SEED_USERS = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh.kumar@email.com', mobile: '9876543001', gender: 'Male', dob: '1985-03-15', city: 'Mumbai', state: 'Maharashtra', pin: '400001', pan: 'ABCPK1234A', aadhar: '234567890001', occupation: 'Salaried', income: '₹10-25 Lakh', nominee: 'Sunita Kumar', rel: 'Spouse', branch: 1, balance: 485000 },
    { id: 2, name: 'Priya Sharma', email: 'priya.sharma@email.com', mobile: '9876543002', gender: 'Female', dob: '1990-07-22', city: 'Delhi', state: 'Delhi', pin: '110001', pan: 'BCDPS2345B', aadhar: '234567890002', occupation: 'Self-Employed', income: '₹5-10 Lakh', nominee: 'Amit Sharma', rel: 'Spouse', branch: 2, balance: 225000 },
    { id: 3, name: 'Arjun Patel', email: 'arjun.patel@email.com', mobile: '9876543003', gender: 'Male', dob: '1988-11-05', city: 'Bangalore', state: 'Karnataka', pin: '560100', pan: 'CDEAP3456C', aadhar: '234567890003', occupation: 'Business Owner', income: '₹25-50 Lakh', nominee: 'Meera Patel', rel: 'Spouse', branch: 3, balance: 450000 },
    { id: 4, name: 'Sneha Reddy', email: 'sneha.reddy@email.com', mobile: '9876543004', gender: 'Female', dob: '1992-01-30', city: 'Chennai', state: 'Tamil Nadu', pin: '600002', pan: 'DEFSR4567D', aadhar: '234567890004', occupation: 'Salaried', income: '₹5-10 Lakh', nominee: 'Venkat Reddy', rel: 'Parent', branch: 4, balance: 178000 },
    { id: 5, name: 'Vikram Singh', email: 'vikram.singh@email.com', mobile: '9876543005', gender: 'Male', dob: '1980-06-18', city: 'Kolkata', state: 'West Bengal', pin: '700016', pan: 'EFGVS5678E', aadhar: '234567890005', occupation: 'Retired', income: 'Below ₹3 Lakh', nominee: 'Kavita Singh', rel: 'Spouse', branch: 5, balance: 320000 },
    { id: 6, name: 'Ananya Gupta', email: 'ananya.gupta@email.com', mobile: '9876543006', gender: 'Female', dob: '1995-04-12', city: 'Mumbai', state: 'Maharashtra', pin: '400050', pan: 'FGHAG6789F', aadhar: '234567890006', occupation: 'Salaried', income: '₹3-5 Lakh', nominee: 'Ramesh Gupta', rel: 'Parent', branch: 1, balance: 95000 },
    { id: 7, name: 'Rohit Mehra', email: 'rohit.mehra@email.com', mobile: '9876543007', gender: 'Male', dob: '1987-09-25', city: 'Delhi', state: 'Delhi', pin: '110025', pan: 'GHIRM7890G', aadhar: '234567890007', occupation: 'Self-Employed', income: '₹10-25 Lakh', nominee: 'Pooja Mehra', rel: 'Spouse', branch: 2, balance: 367000 },
    { id: 8, name: 'Kavitha Nair', email: 'kavitha.nair@email.com', mobile: '9876543008', gender: 'Female', dob: '1991-12-08', city: 'Bangalore', state: 'Karnataka', pin: '560001', pan: 'HIJKN8901H', aadhar: '234567890008', occupation: 'Salaried', income: '₹5-10 Lakh', nominee: 'Suresh Nair', rel: 'Parent', branch: 3, balance: 210000 },
    { id: 9, name: 'Suresh Iyer', email: 'suresh.iyer@email.com', mobile: '9876543009', gender: 'Male', dob: '1975-02-14', city: 'Chennai', state: 'Tamil Nadu', pin: '600018', pan: 'IJKSI9012I', aadhar: '234567890009', occupation: 'Business Owner', income: 'Above ₹50 Lakh', nominee: 'Lakshmi Iyer', rel: 'Spouse', branch: 4, balance: 498000 },
    { id: 10, name: 'Deepika Das', email: 'deepika.das@email.com', mobile: '9876543010', gender: 'Female', dob: '1993-08-20', city: 'Kolkata', state: 'West Bengal', pin: '700001', pan: 'JKLDD0123J', aadhar: '234567890010', occupation: 'Student', income: 'Below ₹3 Lakh', nominee: 'Anil Das', rel: 'Parent', branch: 5, balance: 45000 },
    { id: 11, name: 'Amit Joshi', email: 'amit.joshi@email.com', mobile: '9876543011', gender: 'Male', dob: '1986-05-03', city: 'Mumbai', state: 'Maharashtra', pin: '400066', pan: 'KLMAJ1234K', aadhar: '234567890011', occupation: 'Salaried', income: '₹10-25 Lakh', nominee: 'Neha Joshi', rel: 'Spouse', branch: 1, balance: 275000 },
    { id: 12, name: 'Ritu Verma', email: 'ritu.verma@email.com', mobile: '9876543012', gender: 'Female', dob: '1989-10-17', city: 'Delhi', state: 'Delhi', pin: '110048', pan: 'LMNRV2345L', aadhar: '234567890012', occupation: 'Homemaker', income: 'Below ₹3 Lakh', nominee: 'Sanjay Verma', rel: 'Spouse', branch: 2, balance: 156000 },
    { id: 13, name: 'Karthik Rajan', email: 'karthik.rajan@email.com', mobile: '9876543013', gender: 'Male', dob: '1982-07-29', city: 'Bangalore', state: 'Karnataka', pin: '560034', pan: 'MNOKR3456M', aadhar: '234567890013', occupation: 'Self-Employed', income: '₹25-50 Lakh', nominee: 'Divya Rajan', rel: 'Spouse', branch: 3, balance: 380000 },
    { id: 14, name: 'Meera Krishnan', email: 'meera.krishnan@email.com', mobile: '9876543014', gender: 'Female', dob: '1994-03-06', city: 'Chennai', state: 'Tamil Nadu', pin: '600040', pan: 'NOPMK4567N', aadhar: '234567890014', occupation: 'Salaried', income: '₹3-5 Lakh', nominee: 'Ramya Krishnan', rel: 'Sibling', branch: 4, balance: 87000 },
    { id: 15, name: 'Saurabh Tiwari', email: 'saurabh.tiwari@email.com', mobile: '9876543015', gender: 'Male', dob: '1978-11-22', city: 'Kolkata', state: 'West Bengal', pin: '700020', pan: 'OPQST5678O', aadhar: '234567890015', occupation: 'Business Owner', income: '₹10-25 Lakh', nominee: 'Asha Tiwari', rel: 'Spouse', branch: 5, balance: 290000 },
    { id: 16, name: 'Pooja Malhotra', email: 'pooja.malhotra@email.com', mobile: '9876543016', gender: 'Female', dob: '1991-06-14', city: 'Mumbai', state: 'Maharashtra', pin: '400093', pan: 'PQRPM6789P', aadhar: '234567890016', occupation: 'Salaried', income: '₹5-10 Lakh', nominee: 'Raj Malhotra', rel: 'Spouse', branch: 1, balance: 198000 },
    { id: 17, name: 'Nikhil Agarwal', email: 'nikhil.agarwal@email.com', mobile: '9876543017', gender: 'Male', dob: '1984-01-09', city: 'Delhi', state: 'Delhi', pin: '110019', pan: 'QRSNA7890Q', aadhar: '234567890017', occupation: 'Self-Employed', income: '₹25-50 Lakh', nominee: 'Shalini Agarwal', rel: 'Spouse', branch: 2, balance: 420000 },
    { id: 18, name: 'Lakshmi Rao', email: 'lakshmi.rao@email.com', mobile: '9876543018', gender: 'Female', dob: '1996-09-01', city: 'Bangalore', state: 'Karnataka', pin: '560078', pan: 'RSTLR8901R', aadhar: '234567890018', occupation: 'Student', income: 'Below ₹3 Lakh', nominee: 'Naresh Rao', rel: 'Parent', branch: 3, balance: 32000 },
    { id: 19, name: 'Manish Dubey', email: 'manish.dubey@email.com', mobile: '9876543019', gender: 'Male', dob: '1979-04-27', city: 'Chennai', state: 'Tamil Nadu', pin: '600015', pan: 'STUMD9012S', aadhar: '234567890019', occupation: 'Retired', income: '₹3-5 Lakh', nominee: 'Pushpa Dubey', rel: 'Spouse', branch: 4, balance: 265000 },
    { id: 20, name: 'Swati Banerjee', email: 'swati.banerjee@email.com', mobile: '9876543020', gender: 'Female', dob: '1990-12-31', city: 'Kolkata', state: 'West Bengal', pin: '700029', pan: 'TUVSB0123T', aadhar: '234567890020', occupation: 'Salaried', income: '₹5-10 Lakh', nominee: 'Dipak Banerjee', rel: 'Spouse', branch: 5, balance: 172000 },
    { id: 21, name: 'Gaurav Saxena', email: 'gaurav.saxena@email.com', mobile: '9876543021', gender: 'Male', dob: '1983-08-11', city: 'Mumbai', state: 'Maharashtra', pin: '400070', pan: 'UVWGS1234U', aadhar: '234567890021', occupation: 'Salaried', income: '₹10-25 Lakh', nominee: 'Prachi Saxena', rel: 'Spouse', branch: 1, balance: 305000 },
    { id: 22, name: 'Tanvi Choudhury', email: 'tanvi.choudhury@email.com', mobile: '9876543022', gender: 'Female', dob: '1997-02-18', city: 'Delhi', state: 'Delhi', pin: '110055', pan: 'VWXTC2345V', aadhar: '234567890022', occupation: 'Salaried', income: '₹3-5 Lakh', nominee: 'Manoj Choudhury', rel: 'Parent', branch: 2, balance: 78000 },
    { id: 23, name: 'Aditya Hegde', email: 'aditya.hegde@email.com', mobile: '9876543023', gender: 'Male', dob: '1981-05-24', city: 'Bangalore', state: 'Karnataka', pin: '560011', pan: 'WXYAH3456W', aadhar: '234567890023', occupation: 'Business Owner', income: 'Above ₹50 Lakh', nominee: 'Smita Hegde', rel: 'Spouse', branch: 3, balance: 500000 },
    { id: 24, name: 'Nithya Sundaram', email: 'nithya.sundaram@email.com', mobile: '9876543024', gender: 'Female', dob: '1993-07-07', city: 'Chennai', state: 'Tamil Nadu', pin: '600006', pan: 'XYZNS4567X', aadhar: '234567890024', occupation: 'Salaried', income: '₹5-10 Lakh', nominee: 'Gopal Sundaram', rel: 'Parent', branch: 4, balance: 143000 },
    { id: 25, name: 'Prakash Chatterjee', email: 'prakash.chatterjee@email.com', mobile: '9876543025', gender: 'Male', dob: '1976-10-13', city: 'Kolkata', state: 'West Bengal', pin: '700032', pan: 'YZAPC5678Y', aadhar: '234567890025', occupation: 'Self-Employed', income: '₹10-25 Lakh', nominee: 'Rita Chatterjee', rel: 'Spouse', branch: 5, balance: 338000 },
    { id: 26, name: 'Ishita Kapoor', email: 'ishita.kapoor@email.com', mobile: '9876543026', gender: 'Female', dob: '1994-11-28', city: 'Mumbai', state: 'Maharashtra', pin: '400053', pan: 'ZABIK6789Z', aadhar: '234567890026', occupation: 'Salaried', income: '₹5-10 Lakh', nominee: 'Rajiv Kapoor', rel: 'Parent', branch: 1, balance: 189000 },
    { id: 27, name: 'Varun Bhatia', email: 'varun.bhatia@email.com', mobile: '9876543027', gender: 'Male', dob: '1989-03-19', city: 'Delhi', state: 'Delhi', pin: '110029', pan: 'ABCVB7890A', aadhar: '234567890027', occupation: 'Self-Employed', income: '₹10-25 Lakh', nominee: 'Nisha Bhatia', rel: 'Spouse', branch: 2, balance: 256000 },
    { id: 28, name: 'Shruti Menon', email: 'shruti.menon@email.com', mobile: '9876543028', gender: 'Female', dob: '1992-08-05', city: 'Bangalore', state: 'Karnataka', pin: '560045', pan: 'BCDSM8901B', aadhar: '234567890028', occupation: 'Salaried', income: '₹3-5 Lakh', nominee: 'Krishnan Menon', rel: 'Parent', branch: 3, balance: 112000 },
    { id: 29, name: 'Sanjay Pillai', email: 'sanjay.pillai@email.com', mobile: '9876543029', gender: 'Male', dob: '1977-12-02', city: 'Chennai', state: 'Tamil Nadu', pin: '600028', pan: 'CDESP9012C', aadhar: '234567890029', occupation: 'Business Owner', income: '₹25-50 Lakh', nominee: 'Geetha Pillai', rel: 'Spouse', branch: 4, balance: 415000 },
    { id: 30, name: 'Anita Sen', email: 'anita.sen@email.com', mobile: '9876543030', gender: 'Female', dob: '1988-06-16', city: 'Kolkata', state: 'West Bengal', pin: '700019', pan: 'DEFAS0123D', aadhar: '234567890030', occupation: 'Homemaker', income: 'Below ₹3 Lakh', nominee: 'Bimal Sen', rel: 'Spouse', branch: 5, balance: 67000 },
];

// ==================== SEED ENDPOINT ====================
app.post('/api/seed', async (req, res) => {
    try {
        console.log('🌱 Starting database seed...');

        // Clear existing data
        await Promise.all([
            Customer.deleteMany({}), Account.deleteMany({}), Branch.deleteMany({}),
            Transfer.deleteMany({}), BillPayment.deleteMany({}), SavedBiller.deleteMany({}),
            Counter.deleteMany({})
        ]);

        // Seed branches
        await Branch.insertMany(BRANCHES);
        console.log('✅ 5 branches seeded');

        // Hash password and MPIN once
        const hashedPassword = await bcrypt.hash('password123', 10);
        const hashedMPIN = await bcrypt.hash('123456', 10);

        // Seed 30 customers
        const customers = [];
        const accounts = [];

        for (const u of SEED_USERS) {
            customers.push({
                Cust_ID: u.id,
                Name: u.name,
                Email: u.email,
                Mobile_Number: u.mobile,
                Password: hashedPassword,
                Address: `${u.city}, ${u.state}`,
                City: u.city,
                State: u.state,
                Pincode: u.pin,
                Date_of_Birth: u.dob,
                Gender: u.gender,
                PAN: u.pan,
                Aadhar: u.aadhar,
                Occupation: u.occupation,
                Annual_Income: u.income,
                Nominee_Name: u.nominee,
                Nominee_Relation: u.rel,
                MPIN: hashedMPIN,
                Account_Status: 'Active',
                KYC_Status: 'Verified',
                Created_At: new Date(2024, 0, u.id), // staggered creation dates
            });

            accounts.push({
                Account_No: generateAccountNo(u.branch, u.id),
                Branch_ID: u.branch,
                Cust_ID: u.id,
                Acc_Type: 'Savings',
                Balance: u.balance,
                Opening_Date: new Date(2024, 0, u.id),
                Account_Status: 'Active',
            });
        }

        await Customer.insertMany(customers);
        await Account.insertMany(accounts);
        console.log('✅ 30 customers and accounts seeded');

        // Set counter to 100 so next registration starts at 101
        await Counter.findOneAndUpdate(
            { id: 'cust_id' },
            { seq: 100 },
            { upsert: true }
        );
        console.log('✅ Counter set to 100 (new users start from 101)');

        // Create some sample transactions between users
        const sampleTransfers = [
            { sender_account_no: generateAccountNo(1, 1), receiver_account_no: generateAccountNo(2, 2), amount: 5000, note: 'Dinner payment', transfer_date: new Date(Date.now() - 2 * 86400000) },
            { sender_account_no: generateAccountNo(3, 3), receiver_account_no: generateAccountNo(1, 1), amount: 15000, note: 'Project payment', transfer_date: new Date(Date.now() - 5 * 86400000) },
            { sender_account_no: generateAccountNo(2, 2), receiver_account_no: generateAccountNo(4, 4), amount: 3000, note: 'Birthday gift', transfer_date: new Date(Date.now() - 1 * 86400000) },
            { sender_account_no: generateAccountNo(1, 1), receiver_account_no: generateAccountNo(5, 5), amount: 25000, note: 'Rent payment', transfer_date: new Date(Date.now() - 10 * 86400000) },
            { sender_account_no: generateAccountNo(4, 4), receiver_account_no: generateAccountNo(1, 1), amount: 8000, note: 'Freelance work', transfer_date: new Date(Date.now() - 3 * 86400000) },
        ];
        await Transfer.insertMany(sampleTransfers);

        const sampleBills = [
            { user_id: 1, biller_name: 'Tata Power', category: 'Electricity', amount: 2450, payment_date: new Date(Date.now() - 7 * 86400000) },
            { user_id: 1, biller_name: 'Airtel Broadband', category: 'Internet', amount: 999, payment_date: new Date(Date.now() - 15 * 86400000) },
            { user_id: 2, biller_name: 'BSES Delhi', category: 'Electricity', amount: 1800, payment_date: new Date(Date.now() - 5 * 86400000) },
        ];
        await BillPayment.insertMany(sampleBills);
        console.log('✅ Sample transactions seeded');

        res.json({
            message: '🌱 Database seeded successfully!',
            summary: {
                branches: 5,
                customers: 30,
                accounts: 30,
                sampleTransfers: sampleTransfers.length,
                sampleBills: sampleBills.length,
                nextNewUserId: 101,
                defaultPassword: 'password123',
                defaultMPIN: '123456',
            }
        });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ message: 'Seed failed: ' + error.message });
    }
});

// ==================== AUTH APIS ====================

// POST /api/register
app.post('/api/register', async (req, res) => {
    const { name, email, mobile_number, password, address, dob, gender, pan, aadhar, occupation, income, nominee, nomineeRelation } = req.body;
    const initialBalance = 100000.00;

    if (!name || !email || !mobile_number || !password) {
        return res.status(400).json({ message: 'Name, email, mobile number, and password are required.' });
    }

    try {
        const existing = await Customer.findOne({ $or: [{ Email: email }, { Mobile_Number: mobile_number }] });
        if (existing) return res.status(409).json({ message: 'Email or mobile number already exists.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedMPIN = await bcrypt.hash('123456', 10);
        const nextCustId = await getNextSequenceValue('cust_id');

        const randomBranch = BRANCHES[Math.floor(Math.random() * BRANCHES.length)];

        const newCustomer = new Customer({
            Cust_ID: nextCustId,
            Name: name,
            Email: email,
            Mobile_Number: mobile_number,
            Password: hashedPassword,
            Address: address || '',
            Date_of_Birth: dob || '',
            Gender: gender || 'Male',
            PAN: pan || '',
            Aadhar: aadhar || '',
            Occupation: occupation || '',
            Annual_Income: income || '',
            Nominee_Name: nominee || '',
            Nominee_Relation: nomineeRelation || '',
            MPIN: hashedMPIN,
            Account_Status: 'Active',
            KYC_Status: pan && aadhar ? 'Verified' : 'Pending',
        });
        await newCustomer.save();

        const newAccount = new Account({
            Account_No: generateAccountNo(randomBranch.Branch_ID, nextCustId),
            Branch_ID: randomBranch.Branch_ID,
            Cust_ID: nextCustId,
            Acc_Type: 'Savings',
            Balance: initialBalance,
        });
        await newAccount.save();

        res.status(201).json({
            message: 'Registration successful!',
            userId: nextCustId,
            accountNo: newAccount.Account_No,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Database error during registration.' });
    }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Customer.findOne({ Email: email });
        if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

        if (user.Account_Status === 'Frozen') return res.status(403).json({ message: 'Account is frozen. Contact branch.' });

        res.json({
            message: 'Login successful',
            user: { id: user.Cust_ID, name: user.Name, email: user.Email, mobile: user.Mobile_Number }
        });
    } catch (error) {
        res.status(500).json({ message: 'Database error during login.' });
    }
});

// ==================== USER DATA APIS ====================

// GET /api/user/summary/:userId
app.get('/api/user/summary/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const accounts = await Account.find({ Cust_ID: Number(userId) }, 'Account_No Acc_Type Balance Branch_ID Account_Status');
        const accountNumbers = accounts.map(a => a.Account_No);

        // Get the branch info from the user's primary account
        const primaryBranchId = accounts[0]?.Branch_ID || 1;
        const branch = await Branch.findOne({ Branch_ID: primaryBranchId });

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const transfers = await Transfer.aggregate([
            { $match: { sender_account_no: { $in: accountNumbers }, transfer_date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const bills = await BillPayment.aggregate([
            { $match: { user_id: Number(userId), payment_date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const monthlyExpenses = (transfers[0]?.total || 0) + (bills[0]?.total || 0);

        res.json({
            accounts,
            monthlyExpenses,
            branchName: branch?.Branch_Name || 'Mumbai Main Branch',
            ifscCode: branch?.IFSC_Code || 'BNBI0001001',
            branchCity: branch?.City || 'Mumbai',
            branchAddress: branch?.Address || '',
            branchPhone: branch?.Phone || '',
        });
    } catch (error) {
        console.error('User summary error:', error);
        res.status(500).json({ message: 'Failed to fetch user summary.' });
    }
});

// GET /api/user/profile/:userId
app.get('/api/user/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const customer = await Customer.findOne({ Cust_ID: Number(userId) }, '-Password -MPIN');
        if (!customer) return res.status(404).json({ message: 'User not found.' });

        const accounts = await Account.find({ Cust_ID: Number(userId) });
        const branches = await Branch.find({ Branch_ID: { $in: accounts.map(a => a.Branch_ID) } });

        res.json({ customer, accounts, branches });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile.' });
    }
});

// PUT /api/user/profile/:userId
app.put('/api/user/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    const { name, mobile, address, city, state, pincode, dob, gender, occupation, income, nominee, nomineeRelation } = req.body;

    try {
        const update = {};
        if (name) update.Name = name;
        if (mobile) update.Mobile_Number = mobile;
        if (address) update.Address = address;
        if (city) update.City = city;
        if (state) update.State = state;
        if (pincode) update.Pincode = pincode;
        if (dob) update.Date_of_Birth = dob;
        if (gender) update.Gender = gender;
        if (occupation) update.Occupation = occupation;
        if (income) update.Annual_Income = income;
        if (nominee) update.Nominee_Name = nominee;
        if (nomineeRelation) update.Nominee_Relation = nomineeRelation;

        const updated = await Customer.findOneAndUpdate({ Cust_ID: Number(userId) }, update, { new: true, select: '-Password -MPIN' });
        if (!updated) return res.status(404).json({ message: 'User not found.' });

        res.json({ message: 'Profile updated successfully!', customer: updated });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile.' });
    }
});

// POST /api/user/mpin/verify
app.post('/api/user/mpin/verify', async (req, res) => {
    const { userId, mpin } = req.body;
    if (!userId || !mpin) return res.status(400).json({ message: 'User ID and MPIN required.' });

    try {
        const customer = await Customer.findOne({ Cust_ID: Number(userId) });
        if (!customer) return res.status(404).json({ message: 'User not found.' });
        if (!customer.MPIN) return res.status(400).json({ message: 'MPIN not set. Please set your MPIN first.' });

        const isMatch = await bcrypt.compare(mpin, customer.MPIN);
        if (!isMatch) return res.status(401).json({ message: 'Invalid MPIN.' });

        res.json({ message: 'MPIN verified successfully.', verified: true });
    } catch (error) {
        res.status(500).json({ message: 'MPIN verification failed.' });
    }
});

// POST /api/user/mpin/set
app.post('/api/user/mpin/set', async (req, res) => {
    const { userId, currentMpin, newMpin } = req.body;
    if (!userId || !newMpin || newMpin.length !== 6) return res.status(400).json({ message: 'Valid 6-digit MPIN required.' });

    try {
        const customer = await Customer.findOne({ Cust_ID: Number(userId) });
        if (!customer) return res.status(404).json({ message: 'User not found.' });

        // If MPIN exists, verify current one
        if (customer.MPIN && currentMpin) {
            const isMatch = await bcrypt.compare(currentMpin, customer.MPIN);
            if (!isMatch) return res.status(401).json({ message: 'Current MPIN is incorrect.' });
        }

        const hashedMPIN = await bcrypt.hash(newMpin, 10);
        customer.MPIN = hashedMPIN;
        await customer.save();

        res.json({ message: 'MPIN updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to set MPIN.' });
    }
});

// ==================== TRANSACTION APIS ====================

app.get('/api/transactions/all/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const accounts = await Account.find({ Cust_ID: Number(userId) }, 'Account_No');
        const accountNumbers = accounts.map(a => a.Account_No);

        const transfers = await Transfer.find({
            $or: [{ sender_account_no: { $in: accountNumbers } }, { receiver_account_no: { $in: accountNumbers } }]
        }).sort({ transfer_date: -1 }).lean();

        const formattedTransfers = await Promise.all(transfers.map(async (t) => {
            const senderAcc = await Account.findOne({ Account_No: t.sender_account_no });
            const receiverAcc = await Account.findOne({ Account_No: t.receiver_account_no });
            const senderCust = senderAcc ? await Customer.findOne({ Cust_ID: senderAcc.Cust_ID }) : null;
            const receiverCust = receiverAcc ? await Customer.findOne({ Cust_ID: receiverAcc.Cust_ID }) : null;

            const isSender = accountNumbers.includes(t.sender_account_no);

            return {
                id: t._id.toString(),
                amount: t.amount,
                date: t.transfer_date,
                type: 'Fund Transfer',
                transfer_type: t.transfer_type || 'IMPS',
                direction: isSender ? 'debit' : 'credit',
                details_primary: isSender ? (receiverCust?.Name || 'Unknown') : (senderCust?.Name || 'External'),
                details_secondary: isSender ? t.receiver_account_no : t.sender_account_no,
                note: t.note || '',
            };
        }));

        const bills = await BillPayment.find({ user_id: Number(userId) }).sort({ payment_date: -1 }).lean();
        const formattedBills = bills.map(b => ({
            id: b._id.toString(),
            amount: b.amount,
            date: b.payment_date,
            type: 'Bill Payment',
            direction: 'debit',
            details_primary: b.biller_name,
            details_secondary: b.category,
        }));

        const all = [...formattedTransfers, ...formattedBills].sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(all);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch transaction history.' });
    }
});

// ==================== BILLER APIS ====================

app.get('/api/billers/:userId', async (req, res) => {
    try {
        const billers = await SavedBiller.find({ user_id: Number(req.params.userId) });
        res.json(billers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch billers' });
    }
});

app.post('/api/billers/save', async (req, res) => {
    const { userId, billerName, category, consumerNo } = req.body;
    if (!userId || !billerName) return res.status(400).json({ message: 'Invalid biller data.' });

    try {
        const biller = new SavedBiller({ user_id: Number(userId), biller_name: billerName, category, biller_account_no: consumerNo });
        await biller.save();
        res.status(201).json({ message: 'Biller saved!', biller });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save biller.' });
    }
});

// ==================== CUSTOMER SEARCH / VALIDATE ====================

app.get('/api/customers/search/:identifier', async (req, res) => {
    const { identifier } = req.params;
    try {
        const query = { $or: [{ Email: identifier }, { Mobile_Number: identifier }] };
        if (!isNaN(identifier)) query.$or.push({ Cust_ID: Number(identifier) });

        const customer = await Customer.findOne(query);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        const account = await Account.findOne({ Cust_ID: customer.Cust_ID, Acc_Type: 'Savings' });
        if (!account) return res.status(404).json({ message: 'Customer found, but has no savings account.' });

        res.json({
            Cust_ID: customer.Cust_ID,
            Name: customer.Name,
            Mobile_Number: customer.Mobile_Number,
            Email: customer.Email,
            accountNo: account.Account_No
        });
    } catch (error) {
        res.status(500).json({ message: 'Database query failed' });
    }
});

app.post('/api/customers/validate', async (req, res) => {
    const { customerId, accountNo } = req.body;
    if (!customerId || !accountNo) return res.status(400).json({ message: 'Customer ID and Account Number are required.' });

    try {
        const customer = await Customer.findOne({ Cust_ID: Number(customerId) });
        if (!customer) return res.status(404).json({ message: 'Customer ID not found.' });

        const account = await Account.findOne({ Account_No: accountNo, Cust_ID: Number(customerId) });
        if (!account) return res.status(404).json({ message: 'Account number does not belong to this customer.' });

        res.json({ message: 'Recipient details validated successfully', customerName: customer.Name, accountType: account.Acc_Type });
    } catch (error) {
        res.status(500).json({ message: 'Database error during validation.' });
    }
});

// ==================== BILL PAYMENT ====================

app.post('/api/bills/pay', async (req, res) => {
    const { userId, billerName, category, amount, fromAccount } = req.body;
    if (!userId || !billerName || !amount || !fromAccount) return res.status(400).json({ message: 'Invalid bill payment data.' });

    try {
        const account = await Account.findOne({ Account_No: fromAccount, Cust_ID: Number(userId) });
        if (!account || account.Balance < amount) return res.status(400).json({ message: 'Insufficient funds or invalid account.' });

        account.Balance -= amount;
        await account.save();

        const payment = new BillPayment({ user_id: Number(userId), biller_name: billerName, category, amount, status: 'Success' });
        await payment.save();

        res.status(200).json({ message: `Successfully paid ${billerName} bill.`, newBalance: account.Balance });
    } catch (error) {
        res.status(500).json({ message: 'An internal error occurred.' });
    }
});

// ==================== TRANSFER APIS ====================

app.post('/api/transfer', async (req, res) => {
    const { senderAccountNo, receiverAccountNo, amount, userId } = req.body;
    if (!senderAccountNo || !receiverAccountNo || !amount) return res.status(400).json({ message: 'Invalid transfer data.' });
    if (senderAccountNo === receiverAccountNo) return res.status(400).json({ message: 'Cannot transfer to the same account.' });

    try {
        if (senderAccountNo === 'SYS_EXTERNAL') {
            const receiverAcc = await Account.findOne({ Account_No: receiverAccountNo });
            if (!receiverAcc) return res.status(400).json({ message: 'Invalid receiver account.' });
            receiverAcc.Balance += Number(amount);
            await receiverAcc.save();
            await new Transfer({ sender_account_no: senderAccountNo, receiver_account_no: receiverAccountNo, amount }).save();
        } else {
            const senderAcc = await Account.findOne({ Account_No: senderAccountNo, Cust_ID: Number(userId) });
            if (!senderAcc || senderAcc.Balance < amount) return res.status(400).json({ message: 'Insufficient funds or invalid sender account.' });

            const receiverAcc = await Account.findOne({ Account_No: receiverAccountNo });
            if (!receiverAcc) return res.status(400).json({ message: 'Invalid receiver account.' });

            senderAcc.Balance -= Number(amount);
            receiverAcc.Balance += Number(amount);
            await senderAcc.save();
            await receiverAcc.save();

            await new Transfer({ sender_account_no: senderAccountNo, receiver_account_no: receiverAccountNo, amount }).save();
        }
        res.status(200).json({ message: 'Transfer successful!' });
    } catch (error) {
        res.status(500).json({ message: 'An internal error occurred.' });
    }
});

app.post('/api/transfer/automated', async (req, res) => {
    const { senderAccountNo, receiverAccountNo, receiverCustomerId, amount, note, userId, transferType } = req.body;
    if (!senderAccountNo || !receiverAccountNo || !amount || !userId) return res.status(400).json({ message: 'Invalid transfer data.' });
    if (senderAccountNo === receiverAccountNo) return res.status(400).json({ message: 'Cannot transfer to the same account.' });

    try {
        const senderAcc = await Account.findOne({ Account_No: senderAccountNo, Cust_ID: Number(userId) });
        if (!senderAcc) return res.status(400).json({ message: 'Invalid sender account.' });
        if (senderAcc.Balance < amount) return res.status(400).json({ message: `Insufficient funds. Available balance: ₹${senderAcc.Balance.toFixed(2)}` });

        const receiverAcc = await Account.findOne({ Account_No: receiverAccountNo });
        if (!receiverAcc) return res.status(400).json({ message: 'Invalid receiver account number.' });

        if (receiverCustomerId && receiverAcc.Cust_ID != receiverCustomerId) {
            return res.status(400).json({ message: 'Account number does not belong to the specified customer ID.' });
        }

        senderAcc.Balance -= Number(amount);
        receiverAcc.Balance += Number(amount);
        await senderAcc.save();
        await receiverAcc.save();

        const transfer = new Transfer({
            sender_account_no: senderAccountNo,
            receiver_account_no: receiverAccountNo,
            amount,
            note,
            transfer_type: transferType || 'IMPS',
        });
        await transfer.save();

        const receiverCust = await Customer.findOne({ Cust_ID: receiverAcc.Cust_ID });

        res.status(200).json({
            message: `Successfully transferred ₹${Number(amount).toFixed(2)} to ${receiverCust?.Name || 'Recipient'}`,
            transactionId: transfer._id,
            amount,
            recipientName: receiverCust?.Name || 'Recipient',
            senderBalance: senderAcc.Balance,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({ message: 'An internal error occurred during transfer processing.' });
    }
});

// ==================== BRANCH INFO ====================

app.get('/api/branches', async (req, res) => {
    try {
        const branches = await Branch.find({});
        res.json(branches);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch branches.' });
    }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📋 Seed the database: POST http://localhost:${PORT}/api/seed`);
});
