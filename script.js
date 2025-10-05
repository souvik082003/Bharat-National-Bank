// --- CONFIG & STATE ---
const API_BASE_URL = 'http://localhost:3000';
let currentUser = null;
let userAccounts = [];

// --- UTILITY FUNCTIONS ---
function showMessage(message, type = 'success') { 
    const popup = document.getElementById('message-popup'), p = document.getElementById('message-text'); 
    p.textContent = message; 
    popup.className = 'fixed bottom-5 right-5 p-4 rounded-md text-white shadow-lg max-w-sm'; 
    
    // Add appropriate background color based on type
    if (type === 'success') {
        popup.classList.add('bg-green-500');
    } else if (type === 'error') {
        popup.classList.add('bg-red-500');
    } else if (type === 'info') {
        popup.classList.add('bg-blue-500');
    } else {
        popup.classList.add('bg-gray-500');
    }
    
    popup.classList.remove('hidden'); 
    
    // Auto-hide after different durations based on type
    const duration = type === 'info' ? 2000 : 3000;
    setTimeout(() => { 
        popup.classList.add('hidden'); 
    }, duration); 
}

// Debug function to test data fetching
async function testFetchData() {
    console.log('=== DEBUG: Testing data fetch ===');
    console.log('Current user:', currentUser);
    console.log('API Base URL:', API_BASE_URL);
    
    if (!currentUser || !currentUser.id) {
        alert('No current user found!');
        return;
    }
    
    try {
        const url = `${API_BASE_URL}/api/user/summary/${currentUser.id}`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Data received:', data);
        
        alert('Data fetch successful! Check console for details.');
        populateBankAccountDetails(data);
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Fetch failed: ' + error.message);
    }
}
function formatCurrency(amount) { if (typeof amount !== 'number' && typeof amount !== 'string') return '₹0.00'; return parseFloat(amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }); }

// --- AUTH & SESSION ---
function checkLoginState() {
    const user = localStorage.getItem('currentUser');
    console.log('Checking login state, stored user:', user);
    
    if (user) {
        currentUser = JSON.parse(user);
        console.log('Current user set to:', currentUser);
        initMainApp();
    } else {
        console.log('No user found, showing auth view');
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('app-view').classList.add('hidden');
    }
}

async function initMainApp() {
    console.log('Initializing main app for user:', currentUser);
    
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');
    
    document.getElementById('welcome-message').textContent = `Welcome, ${currentUser.name}!`;
    document.getElementById('user-avatar').src = `https://placehold.co/100x100/ea580c/white?text=${currentUser.name.charAt(0)}`;
    
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    setupNavigationListeners();
    setupFeatureListeners();
    
    // Wait a bit for DOM to be ready then fetch data
    setTimeout(async () => {
        console.log('About to fetch all data...');
        try {
            await fetchAllData();
            console.log('Data fetch completed');
        } catch (error) {
            console.error('Error fetching data:', error);
            showMessage('Error loading account data. Please refresh the page.', 'error');
        }
    }, 500);
}

function handleLogout() {
    currentUser = null;
    userAccounts = [];
    localStorage.removeItem('currentUser');
    checkLoginState();
}

// --- DATA FETCHING & RENDERING ---
async function fetchAllData() { await fetchUserSummary(); await fetchAllTransactions(); await fetchFavoriteBillers(); }
async function fetchUserSummary() { 
    const summaryExpensesEl = document.getElementById('summary-expenses'); 
    const accountCardsContainer = document.getElementById('account-cards'); 
    
    console.log('Fetching user summary for user:', currentUser.id);
    console.log('API URL:', `${API_BASE_URL}/api/user/summary/${currentUser.id}`);
    
    try { 
        const response = await fetch(`${API_BASE_URL}/api/user/summary/${currentUser.id}`);
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json(); 
        console.log('User summary data received:', data);
        
        userAccounts = data.accounts || []; 
        
        // Populate Bank Account Details Section
        populateBankAccountDetails(data);
        
        // Populate Account Cards
        accountCardsContainer.innerHTML = ''; 
        if (userAccounts.length > 0) { 
            let optionsHTML = ''; 
            userAccounts.forEach(acc => { 
                accountCardsContainer.innerHTML += `<div class="bg-white p-6 rounded-lg shadow"><h3 class="text-sm font-medium text-slate-500">${acc.Acc_Type} Account (${acc.Account_No})</h3><p class="text-3xl font-bold text-slate-800 mt-2">${formatCurrency(acc.Balance)}</p></div>`; 
                optionsHTML += `<option value="${acc.Account_No}">${acc.Acc_Type} - ${acc.Account_No} (${formatCurrency(acc.Balance)})</option>`; 
            }); 
            // Populate transfer form dropdowns
            const transferFromEl = document.getElementById('transfer-from-account');
            const selfTransferToEl = document.getElementById('self-transfer-to');
            
            if (transferFromEl) {
                transferFromEl.innerHTML = optionsHTML;
                console.log('Populated transfer-from-account dropdown');
            } else {
                console.warn('transfer-from-account element not found');
            }
            
            if (selfTransferToEl) {
                selfTransferToEl.innerHTML = optionsHTML;
                console.log('Populated self-transfer-to dropdown');
            } else {
                console.warn('self-transfer-to element not found');
            } 
            
            // Update transfer available balance
            const transferBalanceEl = document.getElementById('transfer-available-balance');
            if (transferBalanceEl && userAccounts.length > 0) {
                transferBalanceEl.textContent = formatCurrency(userAccounts[0].Balance);
            }

            // Add change event listener for account selection
            const transferFromSelect = document.getElementById('transfer-from-account');
            if (transferFromSelect) {
                transferFromSelect.addEventListener('change', function() {
                    const selectedAccountNo = this.value;
                    const selectedAccount = userAccounts.find(acc => acc.Account_No === selectedAccountNo);
                    if (selectedAccount && transferBalanceEl) {
                        transferBalanceEl.textContent = formatCurrency(selectedAccount.Balance);
                    }
                });
            }
        } else { 
            accountCardsContainer.innerHTML = `<p>No accounts found.</p>`; 
        } 
        summaryExpensesEl.textContent = formatCurrency(data.monthlyExpenses); 
    } catch (e) { 
        console.error('Error in fetchUserSummary:', e);
        if (summaryExpensesEl) summaryExpensesEl.textContent = 'Error'; 
        if (accountCardsContainer) accountCardsContainer.innerHTML = '<p class="text-red-500">Error loading account details.</p>'; 
        populateBankAccountDetails(null);
        showMessage('Failed to load account summary. Please check your connection.', 'error');
    } 
}

function populateBankAccountDetails(data) {
    console.log('populateBankAccountDetails called with data:', data);
    
    // Try multiple times with increasing delays to ensure DOM is ready
    let attempts = 0;
    const maxAttempts = 5;
    
    function tryPopulate() {
        attempts++;
        console.log(`Attempt ${attempts} to populate bank account details`);
        
        const customerIdEl = document.getElementById('customer-id');
        const customerNameEl = document.getElementById('customer-name');
        const accountNumberEl = document.getElementById('account-number');
        const accountTypeEl = document.getElementById('account-type');
        const currentBalanceEl = document.getElementById('current-balance');
        const branchNameEl = document.getElementById('branch-name');
        const ifscCodeEl = document.getElementById('ifsc-code');
        
        console.log('Elements found:', {
            customerIdEl: !!customerIdEl,
            customerNameEl: !!customerNameEl,
            accountNumberEl: !!accountNumberEl,
            accountTypeEl: !!accountTypeEl,
            currentBalanceEl: !!currentBalanceEl,
            branchNameEl: !!branchNameEl,
            ifscCodeEl: !!ifscCodeEl
        });
        
        // If key elements don't exist yet and we haven't tried too many times, try again
        if ((!customerIdEl || !accountNumberEl) && attempts < maxAttempts) {
            console.log('Key elements not found, retrying in 200ms...');
            setTimeout(tryPopulate, 200);
            return;
        }
        
        if (data && currentUser) {
            console.log('Populating with real data:', currentUser, data);
            
            if (customerIdEl) {
                customerIdEl.textContent = currentUser.id || 'N/A';
                console.log('Set customer ID:', currentUser.id);
            }
            if (customerNameEl) {
                customerNameEl.textContent = currentUser.name || 'N/A';
                console.log('Set customer name:', currentUser.name);
            }
            
            if (data.accounts && data.accounts.length > 0) {
                const primaryAccount = data.accounts[0];
                console.log('Primary account:', primaryAccount);
                
                if (accountNumberEl) {
                    accountNumberEl.textContent = primaryAccount.Account_No || 'N/A';
                    console.log('Set account number:', primaryAccount.Account_No);
                }
                if (accountTypeEl) {
                    accountTypeEl.textContent = primaryAccount.Acc_Type || 'N/A';
                    console.log('Set account type:', primaryAccount.Acc_Type);
                }
                if (currentBalanceEl) {
                    currentBalanceEl.textContent = formatCurrency(primaryAccount.Balance);
                    console.log('Set balance:', formatCurrency(primaryAccount.Balance));
                }
            }
            
            // Branch and IFSC information
            if (branchNameEl) {
                branchNameEl.textContent = data.branchName || 'Mumbai Main Branch';
                console.log('Set branch name:', data.branchName || 'Mumbai Main Branch');
            }
            if (ifscCodeEl) {
                ifscCodeEl.textContent = data.ifscCode || 'BNBI0001234';
                console.log('Set IFSC code:', data.ifscCode || 'BNBI0001234');
            }
        } else {
            console.log('Setting loading/error text');
            // Set loading or error text if no data
            const loadingText = data === null ? 'Error loading' : 'Loading...';
            if (customerIdEl) customerIdEl.textContent = loadingText;
            if (customerNameEl) customerNameEl.textContent = loadingText;
            if (accountNumberEl) accountNumberEl.textContent = loadingText;
            if (accountTypeEl) accountTypeEl.textContent = loadingText;
            if (currentBalanceEl) currentBalanceEl.textContent = loadingText;
            if (branchNameEl) branchNameEl.textContent = loadingText;
            if (ifscCodeEl) ifscCodeEl.textContent = loadingText;
        }
        
        console.log('Bank account details population completed');
    }
    
    // Start the first attempt after a small delay
    setTimeout(tryPopulate, 100);
}
async function fetchAllTransactions() { const allTransactionsList = document.getElementById('all-transactions-list'); try { const response = await fetch(`${API_BASE_URL}/api/transactions/all/${currentUser.id}`); const transactions = await response.json(); displayTransactions(transactions); } catch (error) { allTransactionsList.innerHTML = `<p>Error loading transactions.</p>`; } }
async function fetchFavoriteBillers() { const favoriteBillersList = document.getElementById('favorite-billers-list'); try { const response = await fetch(`${API_BASE_URL}/api/billers/${currentUser.id}`); const billers = await response.json(); favoriteBillersList.innerHTML = ''; if (!billers || billers.length === 0) { favoriteBillersList.innerHTML = '<p>No favorite billers saved.</p>'; return; } billers.forEach(biller => { const billerHTML = `<div class="flex items-center justify-between bg-slate-50 p-3 rounded-lg"><div class="flex items-center"><span class="text-2xl mr-4">🧾</span><div><p class="font-semibold text-slate-800">${biller.biller_name}</p><p class="text-sm text-slate-500">${biller.category}</p></div></div><button data-biller-name="${biller.biller_name}" data-biller-category="${biller.category}" class="pay-now-btn px-4 py-2 text-sm brand-bg text-white rounded-md brand-bg-hover">Pay Now</button></div>`; favoriteBillersList.insertAdjacentHTML('beforeend', billerHTML); }); } catch (error) { favoriteBillersList.innerHTML = '<p>Error loading billers.</p>'; } }

function displayTransactions(transactions) {
    const allTransactionsList = document.getElementById('all-transactions-list');
    const transactionSummaryList = document.getElementById('transaction-summary-list');
    allTransactionsList.innerHTML = ''; transactionSummaryList.innerHTML = '';
    if (!transactions || transactions.length === 0) { const noTxMsg = '<p>No transactions found.</p>'; allTransactionsList.innerHTML = noTxMsg; transactionSummaryList.innerHTML = noTxMsg; return; }
    const summaryItems = transactions.slice(0, 5);
    summaryItems.forEach(tx => transactionSummaryList.insertAdjacentHTML('beforeend', createTransactionHTML(tx)));
    transactions.forEach(tx => allTransactionsList.insertAdjacentHTML('beforeend', createTransactionHTML(tx)));
}

function createTransactionHTML(tx) { const date = new Date(tx.date).toLocaleString('en-IN'); const isDebit = (tx.type === 'Fund Transfer' && tx.details_primary === currentUser.name) || tx.type === 'Bill Payment'; const amountClass = isDebit ? 'text-red-600' : 'text-green-600'; const amountPrefix = isDebit ? '-' : '+'; let details = tx.type === 'Fund Transfer' ? (isDebit ? `To: ${tx.details_secondary}` : `From: ${tx.details_primary}`) : `Paid for ${tx.details_primary} (${tx.details_secondary})`; return `<div class="border-b border-slate-200 pb-3"><div class="flex justify-between items-center"><div><p class="font-semibold text-slate-800">${tx.type}</p><p class="text-sm text-slate-500">${details}</p></div><div class="text-right"><p class="font-bold ${amountClass}">${amountPrefix}${formatCurrency(tx.amount)}</p><p class="text-xs text-slate-500">${date}</p></div></div></div>`; }

// --- EVENT LISTENERS SETUP ---
function setupNavigationListeners() { const navLinks = document.querySelectorAll("#app-view .sidebar-link"); const pages = document.querySelectorAll("#app-view .page-content"); const headerTitle = document.getElementById("header-title"); navLinks.forEach(link => { link.addEventListener('click', () => { if (link.id === 'logout-btn') return; const targetId = link.dataset.target; headerTitle.textContent = link.textContent.trim(); navLinks.forEach(navLink => navLink.classList.remove('active')); link.classList.add('active'); pages.forEach(page => { page.id === targetId ? page.classList.remove('hidden') : page.classList.add('hidden'); }); }); }); }

function setupFeatureListeners() {
    // Fill page content
    document.getElementById("dashboard-view").innerHTML=`
    <!-- Bank Account Details Section -->
    <section class="mb-8">
        <h2 class="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
            <span class="text-3xl mr-3">🏦</span>
            Bank Account Details
        </h2>
        <div id="bank-account-details" class="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-lg border border-blue-200">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Customer Info -->
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <div class="flex items-center mb-2">
                        <span class="text-2xl mr-2">👤</span>
                        <h3 class="font-semibold text-slate-800">Customer Information</h3>
                    </div>
                    <div class="space-y-2">
                        <p class="text-sm"><span class="text-slate-600">Customer ID:</span> <span id="customer-id" class="font-bold text-slate-800"></span></p>
                        <p class="text-sm"><span class="text-slate-600">Name:</span> <span id="customer-name" class="font-bold text-slate-800"></span></p>
                    </div>
                </div>
                
                <!-- Account Info -->
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <div class="flex items-center mb-2">
                        <span class="text-2xl mr-2">💳</span>
                        <h3 class="font-semibold text-slate-800">Account Information</h3>
                    </div>
                    <div class="space-y-2">
                        <p class="text-sm"><span class="text-slate-600">Account Number:</span> <span id="account-number" class="font-bold text-slate-800"></span></p>
                        <p class="text-sm"><span class="text-slate-600">Account Type:</span> <span id="account-type" class="font-bold text-slate-800"></span></p>
                    </div>
                </div>
                
                <!-- Balance & Branch -->
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <div class="flex items-center mb-2">
                        <span class="text-2xl mr-2">🏢</span>
                        <h3 class="font-semibold text-slate-800">Branch & Balance</h3>
                    </div>
                    <div class="space-y-2">
                        <p class="text-sm"><span class="text-slate-600">Current Balance:</span> <span id="current-balance" class="font-bold text-green-600 text-lg"></span></p>
                        <p class="text-sm"><span class="text-slate-600">Branch:</span> <span id="branch-name" class="font-bold text-slate-800"></span></p>
                        <p class="text-sm"><span class="text-slate-600">IFSC Code:</span> <span id="ifsc-code" class="font-bold text-slate-800"></span></p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Account Cards Section -->
    <section id="account-cards" class="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6"></section>
    
    <!-- Monthly Expenses -->
    <section class="mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-sm font-medium text-slate-500">This Month's Expenses</h3>
            <p id="summary-expenses" class="text-3xl font-bold text-slate-800 mt-2">₹0.00</p>
        </div>
    </section>
    
    <!-- Recent Transactions -->
    <section class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold text-slate-800 mb-4">Recent Transactions Summary</h2>
        <div id="transaction-summary-list" class="space-y-4 max-h-[50vh] overflow-y-auto"></div>
    </section>`;
    document.getElementById("transfer-view").innerHTML=`
    <!-- Quick Transfer Options -->
    <section class="mb-6">
        <h2 class="text-xl font-semibold text-slate-800 mb-4">Quick Transfer Options</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="quick-transfer-card bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105" data-type="instant">
                <div class="text-center">
                    <div class="text-3xl mb-2">⚡</div>
                    <h3 class="font-semibold text-sm">Instant Transfer</h3>
                    <p class="text-xs opacity-80">Real-time payment</p>
                </div>
            </div>
            <div class="quick-transfer-card bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105" data-type="upi">
                <div class="text-center">
                    <div class="text-3xl mb-2">📱</div>
                    <h3 class="font-semibold text-sm">UPI Transfer</h3>
                    <p class="text-xs opacity-80">Via UPI ID</p>
                </div>
            </div>
            <div class="quick-transfer-card bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105" data-type="neft">
                <div class="text-center">
                    <div class="text-3xl mb-2">🏦</div>
                    <h3 class="font-semibold text-sm">NEFT/RTGS</h3>
                    <p class="text-xs opacity-80">Bank transfer</p>
                </div>
            </div>
            <div class="quick-transfer-card bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105" data-type="international">
                <div class="text-center">
                    <div class="text-3xl mb-2">🌍</div>
                    <h3 class="font-semibold text-sm">International</h3>
                    <p class="text-xs opacity-80">Global transfer</p>
                </div>
            </div>
        </div>
    </section>

    <section class="bg-white p-6 rounded-lg shadow-md">
        <div class="border-b border-slate-200 mb-6">
            <nav id="transfer-tabs" class="flex space-x-4" aria-label="Tabs">
                <button data-target="transfer-content" class="tab-button active">💸 Transfer Money</button>
                <button data-target="self-transfer-content" class="tab-button">🔄 Self Transfer</button>
                <button data-target="scheduled-transfer-content" class="tab-button">⏰ Schedule Transfer</button>
                <button data-target="beneficiary-content" class="tab-button">👥 Manage Beneficiaries</button>
            </nav>
        </div>

        <div id="transfer-content" class="tab-content">
            <div class="max-w-2xl mx-auto">
                <!-- Transfer Info Banner -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 mb-6">
                    <div class="flex items-center mb-3">
                        <span class="text-3xl mr-3">💸</span>
                        <h3 class="text-xl font-semibold text-slate-800">Simple Fund Transfer</h3>
                    </div>
                    <p class="text-slate-600 text-sm">Enter recipient details and transfer amount. The system will automatically validate and process your transfer securely.</p>
                </div>

                <!-- Transfer Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg">
                        <div class="flex items-center">
                            <div class="text-2xl mr-3">📊</div>
                            <div>
                                <h4 class="font-semibold text-slate-700">Daily Limit</h4>
                                <p class="text-sm text-slate-600">₹2,00,000 remaining</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-lg">
                        <div class="flex items-center">
                            <div class="text-2xl mr-3">💰</div>
                            <div>
                                <h4 class="font-semibold text-slate-700">Available Balance</h4>
                                <p class="text-sm text-slate-600" id="transfer-available-balance">Loading...</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg">
                        <div class="flex items-center">
                            <div class="text-2xl mr-3">⚡</div>
                            <div>
                                <h4 class="font-semibold text-slate-700">Transfer Type</h4>
                                <p class="text-sm text-slate-600">Instant & Secure</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Simplified Transfer Form -->
                <div class="bg-white p-6 rounded-xl shadow-lg border">
                    <form id="simple-transfer-form" class="space-y-6">
                        <!-- From Account -->
                        <div class="bg-slate-50 p-4 rounded-lg">
                            <label for="transfer-from-account" class="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                                <span class="text-lg mr-2">🏦</span>
                                From Account
                            </label>
                            <select id="transfer-from-account" class="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-orange-500 transition-colors" required></select>
                        </div>

                        <!-- Recipient Details -->
                        <div class="bg-slate-50 p-4 rounded-lg">
                            <h4 class="font-medium text-slate-700 mb-3 flex items-center">
                                <span class="text-lg mr-2">👤</span>
                                Recipient Information
                            </h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="recipient-customer-id" class="block text-sm font-medium text-slate-700 mb-1">Customer ID</label>
                                    <input type="text" id="recipient-customer-id" class="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-orange-500 transition-colors" placeholder="Enter Customer ID" required>
                                </div>
                                <div>
                                    <label for="recipient-account-number" class="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                                    <input type="text" id="recipient-account-number" class="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-orange-500 transition-colors" placeholder="Enter Account Number" required>
                                </div>
                            </div>
                            <div id="recipient-validation-message" class="mt-2 text-sm hidden"></div>
                        </div>

                        <!-- Transfer Amount -->
                        <div class="bg-slate-50 p-4 rounded-lg">
                            <label for="simple-transfer-amount" class="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                                <span class="text-lg mr-2">💰</span>
                                Transfer Amount
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span class="text-slate-500 text-lg font-semibold">₹</span>
                                </div>
                                <input type="number" id="simple-transfer-amount" min="1" step="0.01" class="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-orange-500 transition-colors text-lg font-semibold" required placeholder="0.00">
                            </div>
                            
                            <!-- Quick Amount Buttons -->
                            <div class="mt-3">
                                <p class="text-xs text-slate-600 mb-2">Quick amounts:</p>
                                <div class="grid grid-cols-3 gap-2">
                                    <button type="button" class="simple-quick-amount-btn py-2 px-3 bg-white border-2 border-slate-200 rounded-lg text-sm font-medium hover:border-orange-400 hover:bg-orange-50 transition-all" data-amount="500">₹500</button>
                                    <button type="button" class="simple-quick-amount-btn py-2 px-3 bg-white border-2 border-slate-200 rounded-lg text-sm font-medium hover:border-orange-400 hover:bg-orange-50 transition-all" data-amount="1000">₹1,000</button>
                                    <button type="button" class="simple-quick-amount-btn py-2 px-3 bg-white border-2 border-slate-200 rounded-lg text-sm font-medium hover:border-orange-400 hover:bg-orange-50 transition-all" data-amount="2000">₹2,000</button>
                                    <button type="button" class="simple-quick-amount-btn py-2 px-3 bg-white border-2 border-slate-200 rounded-lg text-sm font-medium hover:border-orange-400 hover:bg-orange-50 transition-all" data-amount="5000">₹5,000</button>
                                    <button type="button" class="simple-quick-amount-btn py-2 px-3 bg-white border-2 border-slate-200 rounded-lg text-sm font-medium hover:border-orange-400 hover:bg-orange-50 transition-all" data-amount="10000">₹10,000</button>
                                    <button type="button" class="simple-quick-amount-btn py-2 px-3 bg-white border-2 border-slate-200 rounded-lg text-sm font-medium hover:border-orange-400 hover:bg-orange-50 transition-all" data-amount="25000">₹25,000</button>
                                </div>
                            </div>
                            
                            <p class="text-xs text-slate-500 mt-2">💡 Minimum: ₹1, Maximum: ₹2,00,000 per day</p>
                        </div>

                        <!-- Transfer Note -->
                        <div class="bg-slate-50 p-4 rounded-lg">
                            <label for="simple-transfer-note" class="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                                <span class="text-lg mr-2">📝</span>
                                Transfer Note (Optional)
                            </label>
                            <input type="text" id="simple-transfer-note" class="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-orange-500 transition-colors" placeholder="Add a note for this transfer (optional)" maxlength="100">
                        </div>

                        <!-- Transfer Button -->
                        <button type="submit" class="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg">
                            <span class="flex items-center justify-center">
                                <span class="text-2xl mr-2">💸</span>
                                Process Transfer Securely
                            </span>
                        </button>
                    </form>
                </div>

                <!-- Security Notice -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                    <div class="flex items-center">
                        <span class="text-2xl mr-3">🔒</span>
                        <div>
                            <h4 class="font-semibold text-green-800">Automated Security Process</h4>
                            <p class="text-green-700 text-sm">The system will automatically validate recipient details, check your balance, and process the transfer securely.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="self-transfer-content" class="tab-content hidden">
            <div class="max-w-md mx-auto">
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
                    <div class="text-center">
                        <div class="text-4xl mb-3">🔄</div>
                        <h3 class="text-lg font-semibold text-slate-800 mb-2">Self Account Transfer</h3>
                        <p class="text-sm text-slate-600">Move money between your own accounts instantly</p>
                    </div>
                </div>
                
                <form id="self-transfer-form" class="space-y-6">
                    <div class="bg-slate-50 p-4 rounded-lg">
                        <label for="self-transfer-to" class="block text-sm font-medium text-slate-700 mb-2">Deposit To Account</label>
                        <select id="self-transfer-to" class="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-orange-500 transition-colors"></select>
                    </div>
                    
                    <div class="bg-slate-50 p-4 rounded-lg">
                        <label for="self-transfer-amount" class="block text-sm font-medium text-slate-700 mb-2">Amount to Transfer</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span class="text-slate-500 text-lg font-semibold">₹</span>
                            </div>
                            <input type="number" id="self-transfer-amount" min="0.01" step="0.01" class="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-orange-500 transition-colors text-lg font-semibold" required placeholder="0.00">
                        </div>
                    </div>
                    
                    <button type="submit" class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg">
                        🔄 Transfer Between Accounts
                    </button>
                </form>
            </div>
        </div>

        <div id="scheduled-transfer-content" class="tab-content hidden">
            <div class="text-center py-12">
                <div class="text-6xl mb-4">⏰</div>
                <h3 class="text-2xl font-semibold text-slate-800 mb-2">Scheduled Transfers</h3>
                <p class="text-slate-600 mb-4">Set up recurring transfers and future-dated payments</p>
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                    <p class="text-amber-800 font-medium">🚧 This feature is under construction</p>
                    <p class="text-amber-700 text-sm mt-1">Coming soon to help you automate your transfers!</p>
                </div>
            </div>
        </div>

        <div id="beneficiary-content" class="tab-content hidden">
            <div class="text-center py-12">
                <div class="text-6xl mb-4">👥</div>
                <h3 class="text-2xl font-semibold text-slate-800 mb-2">Manage Beneficiaries</h3>
                <p class="text-slate-600 mb-4">Add, edit, and manage your frequent transfer recipients</p>
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                    <p class="text-amber-800 font-medium">🚧 This feature is under construction</p>
                    <p class="text-amber-700 text-sm mt-1">Soon you'll be able to save and manage beneficiaries!</p>
                </div>
            </div>
        </div>
    </section>`;
    document.getElementById("pay-bills-view").innerHTML=`
    <section class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
            <span class="text-3xl mr-3">💳</span>
            Pay Your Bills
        </h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Favorite Billers Section -->
            <div>
                <h3 class="text-lg font-medium text-slate-700 mb-4 flex items-center">
                    <span class="text-2xl mr-2">⭐</span>
                    Your Favorite Billers
                </h3>
                <div id="favorite-billers-list" class="space-y-3 min-h-[200px]">
                    <div class="text-center py-8 text-slate-500">
                        <div class="text-4xl mb-2">📋</div>
                        <p>No favorite billers yet</p>
                        <p class="text-sm">Add billers from categories below</p>
                    </div>
                </div>
            </div>

            <!-- Bill Categories Section -->
            <div>
                <h3 class="text-lg font-medium text-slate-700 mb-4 flex items-center">
                    <span class="text-2xl mr-2">🏷️</span>
                    Bill Categories
                </h3>
                <div class="grid grid-cols-2 gap-3">
                    <!-- Utilities -->
                    <div class="bill-category-card bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg text-center border-2 border-yellow-200 hover:border-yellow-400 cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg" data-category="utilities">
                        <div class="text-3xl mb-2">⚡</div>
                        <p class="font-semibold text-sm text-slate-800">Electricity</p>
                        <p class="text-xs text-slate-600">Power bills</p>
                    </div>

                    <!-- Water -->
                    <div class="bill-category-card bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg text-center border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg" data-category="water">
                        <div class="text-3xl mb-2">💧</div>
                        <p class="font-semibold text-sm text-slate-800">Water</p>
                        <p class="text-xs text-slate-600">Municipal water</p>
                    </div>

                    <!-- Gas -->
                    <div class="bill-category-card bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg text-center border-2 border-red-200 hover:border-red-400 cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg" data-category="gas">
                        <div class="text-3xl mb-2">🔥</div>
                        <p class="font-semibold text-sm text-slate-800">Gas</p>
                        <p class="text-xs text-slate-600">LPG & PNG</p>
                    </div>

                    <!-- Mobile -->
                    <div class="bill-category-card bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg text-center border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg" data-category="mobile">
                        <div class="text-3xl mb-2">📱</div>
                        <p class="font-semibold text-sm text-slate-800">Mobile</p>
                        <p class="text-xs text-slate-600">Postpaid bills</p>
                    </div>

                    <!-- DTH/Cable -->
                    <div class="bill-category-card bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg text-center border-2 border-purple-200 hover:border-purple-400 cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg" data-category="entertainment">
                        <div class="text-3xl mb-2">📺</div>
                        <p class="font-semibold text-sm text-slate-800">DTH/Cable</p>
                        <p class="text-xs text-slate-600">TV services</p>
                    </div>

                    <!-- Internet -->
                    <div class="bill-category-card bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg text-center border-2 border-teal-200 hover:border-teal-400 cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg" data-category="internet">
                        <div class="text-3xl mb-2">🌐</div>
                        <p class="font-semibold text-sm text-slate-800">Internet</p>
                        <p class="text-xs text-slate-600">Broadband bills</p>
                    </div>

                    <!-- Credit Cards -->
                    <div class="bill-category-card bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-lg text-center border-2 border-slate-200 hover:border-slate-400 cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg" data-category="creditcard">
                        <div class="text-3xl mb-2">💳</div>
                        <p class="font-semibold text-sm text-slate-800">Credit Cards</p>
                        <p class="text-xs text-slate-600">Card payments</p>
                    </div>

                    <!-- Insurance -->
                    <div class="bill-category-card bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg text-center border-2 border-indigo-200 hover:border-indigo-400 cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg" data-category="insurance">
                        <div class="text-3xl mb-2">🛡️</div>
                        <p class="font-semibold text-sm text-slate-800">Insurance</p>
                        <p class="text-xs text-slate-600">Premium payments</p>
                    </div>

                    <!-- Loans & EMI -->
                    <div class="bill-category-card bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg text-center border-2 border-amber-200 hover:border-amber-400 cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg" data-category="loans">
                        <div class="text-3xl mb-2">🏠</div>
                        <p class="font-semibold text-sm text-slate-800">Loans & EMI</p>
                        <p class="text-xs text-slate-600">Monthly EMIs</p>
                    </div>

                    <!-- Education -->
                    <div class="bill-category-card bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-lg text-center border-2 border-rose-200 hover:border-rose-400 cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg" data-category="education">
                        <div class="text-3xl mb-2">🎓</div>
                        <p class="font-semibold text-sm text-slate-800">Education</p>
                        <p class="text-xs text-slate-600">Fees & tuition</p>
                    </div>

                    <!-- Municipal Tax -->
                    <div class="bill-category-card bg-gradient-to-br from-lime-50 to-green-50 p-4 rounded-lg text-center border-2 border-lime-200 hover:border-lime-400 cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg" data-category="municipal">
                        <div class="text-3xl mb-2">🏛️</div>
                        <p class="font-semibold text-sm text-slate-800">Municipal Tax</p>
                        <p class="text-xs text-slate-600">Property tax</p>
                    </div>

                    <!-- Subscriptions -->
                    <div class="bill-category-card bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-lg text-center border-2 border-violet-200 hover:border-violet-400 cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg" data-category="subscriptions">
                        <div class="text-3xl mb-2">📱</div>
                        <p class="font-semibold text-sm text-slate-800">Subscriptions</p>
                        <p class="text-xs text-slate-600">OTT, apps & more</p>
                    </div>
                </div>

                <!-- Quick Bill Pay Section -->
                <div class="mt-6 bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                    <h4 class="font-semibold text-slate-800 mb-2 flex items-center">
                        <span class="text-xl mr-2">⚡</span>
                        Quick Bill Pay
                    </h4>
                    <p class="text-sm text-slate-600 mb-3">Enter your consumer number for instant bill fetch</p>
                    <div class="flex gap-2">
                        <input type="text" id="quick-consumer-number" placeholder="Consumer/Account Number" class="flex-1 p-2 border border-slate-300 rounded-md text-sm">
                        <button id="fetch-bill-btn" class="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-md hover:from-orange-600 hover:to-red-600 transition-all">
                            Fetch Bill
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
    document.getElementById("transactions-view").innerHTML=`<section class="bg-white p-6 rounded-lg shadow-md"><h2 class="text-xl font-semibold text-slate-800 mb-4">Unified Transaction History</h2><div id="all-transactions-list" class="space-y-4 max-h-[70vh] overflow-y-auto"></div></section>`;
    document.getElementById("services-view").innerHTML = `
    <section class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
            <span class="text-3xl mr-3">🏦</span>
            Banking Services
        </h2>

        <!-- Account Services -->
        <div class="mb-8">
            <h3 class="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                <span class="text-2xl mr-2">👤</span>
                Account Services
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="service-card bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg text-center border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all transform hover:scale-105" data-service="account-statement">
                    <div class="text-3xl mb-2">📄</div>
                    <p class="font-semibold text-sm">Account Statement</p>
                </div>
                <div class="service-card bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg text-center border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all transform hover:scale-105" data-service="checkbook-request">
                    <div class="text-3xl mb-2">📖</div>
                    <p class="font-semibold text-sm">Checkbook Request</p>
                </div>
                <div class="service-card bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg text-center border-2 border-purple-200 hover:border-purple-400 cursor-pointer transition-all transform hover:scale-105" data-service="debit-card">
                    <div class="text-3xl mb-2">💳</div>
                    <p class="font-semibold text-sm">Debit Card Services</p>
                </div>
                <div class="service-card bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg text-center border-2 border-orange-200 hover:border-orange-400 cursor-pointer transition-all transform hover:scale-105" data-service="account-closure">
                    <div class="text-3xl mb-2">❌</div>
                    <p class="font-semibold text-sm">Account Closure</p>
                </div>
            </div>
        </div>

        <!-- Loan Services -->
        <div class="mb-8">
            <h3 class="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                <span class="text-2xl mr-2">🏠</span>
                Loan Services
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="service-card bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg text-center border-2 border-amber-200 hover:border-amber-400 cursor-pointer transition-all transform hover:scale-105" data-service="home-loan">
                    <div class="text-3xl mb-2">🏡</div>
                    <p class="font-semibold text-sm">Home Loan</p>
                </div>
                <div class="service-card bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg text-center border-2 border-teal-200 hover:border-teal-400 cursor-pointer transition-all transform hover:scale-105" data-service="personal-loan">
                    <div class="text-3xl mb-2">💰</div>
                    <p class="font-semibold text-sm">Personal Loan</p>
                </div>
                <div class="service-card bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-lg text-center border-2 border-pink-200 hover:border-pink-400 cursor-pointer transition-all transform hover:scale-105" data-service="car-loan">
                    <div class="text-3xl mb-2">🚗</div>
                    <p class="font-semibold text-sm">Car Loan</p>
                </div>
                <div class="service-card bg-gradient-to-br from-lime-50 to-green-50 p-4 rounded-lg text-center border-2 border-lime-200 hover:border-lime-400 cursor-pointer transition-all transform hover:scale-105" data-service="education-loan">
                    <div class="text-3xl mb-2">🎓</div>
                    <p class="font-semibold text-sm">Education Loan</p>
                </div>
            </div>
        </div>

        <!-- Investment Services -->
        <div class="mb-8">
            <h3 class="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                <span class="text-2xl mr-2">📈</span>
                Investment & Wealth Management
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="service-card bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg text-center border-2 border-indigo-200 hover:border-indigo-400 cursor-pointer transition-all transform hover:scale-105" data-service="fixed-deposit">
                    <div class="text-3xl mb-2">💎</div>
                    <p class="font-semibold text-sm">Fixed Deposits</p>
                </div>
                <div class="service-card bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-lg text-center border-2 border-emerald-200 hover:border-emerald-400 cursor-pointer transition-all transform hover:scale-105" data-service="mutual-funds">
                    <div class="text-3xl mb-2">📊</div>
                    <p class="font-semibold text-sm">Mutual Funds</p>
                </div>
                <div class="service-card bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-lg text-center border-2 border-yellow-200 hover:border-yellow-400 cursor-pointer transition-all transform hover:scale-105" data-service="recurring-deposit">
                    <div class="text-3xl mb-2">🔄</div>
                    <p class="font-semibold text-sm">Recurring Deposits</p>
                </div>
                <div class="service-card bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg text-center border-2 border-red-200 hover:border-red-400 cursor-pointer transition-all transform hover:scale-105" data-service="insurance">
                    <div class="text-3xl mb-2">🛡️</div>
                    <p class="font-semibold text-sm">Insurance Plans</p>
                </div>
            </div>
        </div>

        <!-- Digital Banking -->
        <div class="mb-8">
            <h3 class="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                <span class="text-2xl mr-2">📱</span>
                Digital Banking
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="service-card bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg text-center border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all transform hover:scale-105" data-service="mobile-banking">
                    <div class="text-3xl mb-2">📲</div>
                    <p class="font-semibold text-sm">Mobile Banking</p>
                </div>
                <div class="service-card bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-lg text-center border-2 border-violet-200 hover:border-violet-400 cursor-pointer transition-all transform hover:scale-105" data-service="internet-banking">
                    <div class="text-3xl mb-2">💻</div>
                    <p class="font-semibold text-sm">Internet Banking</p>
                </div>
                <div class="service-card bg-gradient-to-br from-green-50 to-lime-50 p-4 rounded-lg text-center border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all transform hover:scale-105" data-service="upi-services">
                    <div class="text-3xl mb-2">⚡</div>
                    <p class="font-semibold text-sm">UPI Services</p>
                </div>
                <div class="service-card bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg text-center border-2 border-orange-200 hover:border-orange-400 cursor-pointer transition-all transform hover:scale-105" data-service="sms-banking">
                    <div class="text-3xl mb-2">💬</div>
                    <p class="font-semibold text-sm">SMS Banking</p>
                </div>
            </div>
        </div>

        <!-- Trade & Forex -->
        <div class="mb-8">
            <h3 class="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                <span class="text-2xl mr-2">🌍</span>
                Trade & Forex Services
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="service-card bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-lg text-center border-2 border-slate-200 hover:border-slate-400 cursor-pointer transition-all transform hover:scale-105" data-service="forex-services">
                    <div class="text-3xl mb-2">💱</div>
                    <p class="font-semibold text-sm">Forex Services</p>
                </div>
                <div class="service-card bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-lg text-center border-2 border-teal-200 hover:border-teal-400 cursor-pointer transition-all transform hover:scale-105" data-service="trade-finance">
                    <div class="text-3xl mb-2">🚢</div>
                    <p class="font-semibold text-sm">Trade Finance</p>
                </div>
                <div class="service-card bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg text-center border-2 border-purple-200 hover:border-purple-400 cursor-pointer transition-all transform hover:scale-105" data-service="nri-services">
                    <div class="text-3xl mb-2">✈️</div>
                    <p class="font-semibold text-sm">NRI Services</p>
                </div>
                <div class="service-card bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-lg text-center border-2 border-rose-200 hover:border-rose-400 cursor-pointer transition-all transform hover:scale-105" data-service="remittance">
                    <div class="text-3xl mb-2">💸</div>
                    <p class="font-semibold text-sm">Money Remittance</p>
                </div>
            </div>
        </div>

        <!-- Support Services -->
        <div class="mb-8">
            <h3 class="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                <span class="text-2xl mr-2">🎧</span>
                Customer Support
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="service-card bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg text-center border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all transform hover:scale-105" data-service="customer-care">
                    <div class="text-3xl mb-2">☎️</div>
                    <p class="font-semibold text-sm">24/7 Customer Care</p>
                </div>
                <div class="service-card bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg text-center border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all transform hover:scale-105" data-service="branch-locator">
                    <div class="text-3xl mb-2">📍</div>
                    <p class="font-semibold text-sm">Branch Locator</p>
                </div>
                <div class="service-card bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg text-center border-2 border-purple-200 hover:border-purple-400 cursor-pointer transition-all transform hover:scale-105" data-service="atm-locator">
                    <div class="text-3xl mb-2">🏧</div>
                    <p class="font-semibold text-sm">ATM Locator</p>
                </div>
                <div class="service-card bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg text-center border-2 border-orange-200 hover:border-orange-400 cursor-pointer transition-all transform hover:scale-105" data-service="grievance">
                    <div class="text-3xl mb-2">📝</div>
                    <p class="font-semibold text-sm">File Grievance</p>
                </div>
            </div>
        </div>
    </section>`;

    // Global click handlers for dynamic content
    document.addEventListener('click', (e) => {
        // Pay Now buttons
        if (e.target.classList.contains('pay-now-btn')) {
            openBillPayModal(e.target.dataset.billerName, e.target.dataset.billerCategory);
        }
        
        // Service Card Click Handlers
        if (e.target.closest('.service-card')) {
            const service = e.target.closest('.service-card').dataset.service;
            const serviceName = e.target.closest('.service-card').querySelector('p').textContent;
            showUnderConstructionModal('Banking Service', serviceName);
        }

        // Quick Transfer Card Handlers
        if (e.target.closest('.quick-transfer-card')) {
            const type = e.target.closest('.quick-transfer-card').dataset.type;
            const typeName = e.target.closest('.quick-transfer-card').querySelector('h3').textContent;
            showUnderConstructionModal('Transfer Type', typeName);
        }
    });

    // Under Construction Modal Function
    function showUnderConstructionModal(featureType, featureName) {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = `
            <div class="fixed inset-0 z-50 flex items-center justify-center modal-bg">
                <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
                    <div class="text-center">
                        <div class="text-6xl mb-4">🚧</div>
                        <h3 class="text-2xl font-bold text-slate-800 mb-2">Under Construction</h3>
                        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                            <p class="text-amber-800 font-medium">${featureType}: ${featureName}</p>
                            <p class="text-amber-700 text-sm mt-1">This feature is currently being developed and will be available soon!</p>
                        </div>
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p class="text-blue-800 text-sm">🔔 We'll notify you when this feature is ready</p>
                        </div>
                        <button id="close-construction-modal" class="w-full px-4 py-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-md hover:from-slate-600 hover:to-slate-700 transition-all">
                            Got it, Thanks!
                        </button>
                    </div>
                </div>
            </div>
        `;
        modalContainer.classList.remove('hidden');
        
        document.getElementById('close-construction-modal').addEventListener('click', () => {
            modalContainer.classList.add('hidden');
            modalContainer.innerHTML = '';
        });
    }
    function openBillPayModal(billerName, category) { const modalContainer = document.getElementById('modal-container'); let accountOptions = `<option value="">Select Account</option>`; userAccounts.forEach(acc => { accountOptions += `<option value="${acc.Account_No}">${acc.Acc_Type} - ${acc.Account_No} (${formatCurrency(acc.Balance)})</option>`; }); modalContainer.innerHTML = `<div class="fixed inset-0 z-50 flex items-center justify-center modal-bg"><div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"><h3 class="text-2xl font-bold mb-2">Pay Bill</h3><p class="mb-4">Biller: <span class="font-semibold">${billerName}</span></p><form id="bill-pay-form"><div class="mb-4"><label for="bill-from-account" class="block text-sm font-medium text-slate-700">Pay From</label><select id="bill-from-account" class="mt-1 block w-full p-2 border-slate-300 rounded-md" required>${accountOptions}</select></div><div class="mb-6"><label for="bill-amount" class="block text-sm font-medium text-slate-700">Amount to Pay</label><div class="mt-1 relative"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span class="text-slate-500 sm:text-sm">₹</span></div><input type="number" id="bill-amount" min="0.01" step="0.01" class="block w-full pl-7 p-2 border-slate-300 rounded-md" required></div></div><div class="flex justify-end space-x-4"><button type="button" id="cancel-bill-pay-btn" class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button><button type="submit" class="px-4 py-2 brand-bg text-white rounded-md brand-bg-hover">Confirm Payment</button></div></form></div></div>`; modalContainer.classList.remove('hidden'); document.getElementById('cancel-bill-pay-btn').addEventListener('click', () => { modalContainer.classList.add('hidden'); modalContainer.innerHTML = ''; }); document.getElementById('bill-pay-form').addEventListener('submit', handleBillPay); }
    async function handleBillPay(e) { e.preventDefault(); const modalContainer = document.getElementById('modal-container'); const billerName = modalContainer.querySelector('.font-semibold').textContent; const fromAccount = document.getElementById('bill-from-account').value; const amount = parseFloat(document.getElementById('bill-amount').value); try { const response = await fetch(`${API_BASE_URL}/api/bills/pay`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id, billerName, category: 'Utilities', amount, fromAccount }) }); const result = await response.json(); showMessage(result.message, response.ok ? 'success' : 'error'); if (response.ok) { modalContainer.classList.add('hidden'); modalContainer.innerHTML = ''; fetchAllData(); } } catch (err) { showMessage('Network error during bill payment.', 'error'); } }
    // Setup transfer tabs (with delay to ensure elements exist)
    setTimeout(() => {
        const transferTabs = document.querySelectorAll('#transfer-tabs .tab-button'); 
        const tabContents = document.querySelectorAll('#transfer-view .tab-content');
        
        console.log('Setting up transfer tabs:', transferTabs.length, 'tabs found');
        console.log('Tab contents found:', tabContents.length);
        
        transferTabs.forEach(tab => { 
            if (!tab.hasAttribute('data-tab-listener-added')) {
                tab.addEventListener('click', () => { 
                    const targetId = tab.dataset.target;
                    console.log('Tab clicked:', targetId);
                    
                    // Hide all tab contents
                    tabContents.forEach(c => {
                        if (c.id === targetId) {
                            c.classList.remove('hidden');
                            console.log('Showing content:', c.id);
                        } else {
                            c.classList.add('hidden');
                            console.log('Hiding content:', c.id);
                        }
                    });
                    
                    // Update active tab
                    transferTabs.forEach(t => t.classList.remove('active')); 
                    tab.classList.add('active');
                    console.log('Active tab set to:', tab.textContent);
                    
                    // Setup event listeners for the active tab content
                    if (targetId === 'transfer-content') {
                        setTimeout(setupTransferEventListeners, 200);
                    }
                }); 
                tab.setAttribute('data-tab-listener-added', 'true');
            }
        });
        
        // Initially setup event listeners for the default active tab
        setTimeout(setupTransferEventListeners, 300);
    }, 500);
    document.getElementById('self-transfer-form').addEventListener('submit', async(e) => { e.preventDefault(); const toAccount = document.getElementById('self-transfer-to').value; const amount = parseFloat(document.getElementById('self-transfer-amount').value); if (!toAccount || !amount || amount <= 0) return showMessage('Please select an account and enter a valid amount.', 'error'); const transferData = { senderAccountNo: 'SYS_EXTERNAL', receiverAccountNo: toAccount, amount, userId: currentUser.id }; try { const response = await fetch(`${API_BASE_URL}/api/transfer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(transferData) }); const result = await response.json(); showMessage(result.message, response.ok ? 'success' : 'error'); if (response.ok) { e.target.reset(); fetchAllData(); } } catch (err) { showMessage('Could not connect to server.', 'error'); } });
    // Legacy transfer form handlers (with delay)
    setTimeout(() => {
        const findBtn = document.getElementById('find-customer-btn');
        const searchInput = document.getElementById('search-identifier'); 
        const detailsSection = document.getElementById('customer-details-section');
        const transferForm = document.getElementById('transfer-form-new');
        const errorEl = document.getElementById('search-error');
        
        if (findBtn && !findBtn.hasAttribute('data-listener-added')) {
            findBtn.addEventListener('click', async () => { 
                const identifier = searchInput.value.trim(); 
                if (!identifier) return; 
                detailsSection.classList.add('hidden'); 
                transferForm.classList.add('hidden'); 
                errorEl.classList.add('hidden'); 
                try { 
                    const response = await fetch(`${API_BASE_URL}/api/customers/search/${identifier}`); 
                    const result = await response.json(); 
                    if (!response.ok || result.Cust_ID === currentUser.id) { 
                        errorEl.textContent = result.Cust_ID === currentUser.id ? 'You cannot select yourself as a recipient.' : (result.message || 'Customer not found.'); 
                        errorEl.classList.remove('hidden'); 
                    } else { 
                        document.getElementById('recipient-name').textContent = result.Name; 
                        document.getElementById('recipient-account').textContent = result.accountNo; 
                        document.getElementById('receiver-account-hidden').value = result.accountNo; 
                        detailsSection.classList.remove('hidden'); 
                        transferForm.classList.remove('hidden'); 
                    } 
                } catch (err) { 
                    errorEl.textContent = 'A network error occurred.'; 
                    errorEl.classList.remove('hidden'); 
                } 
            });
            findBtn.setAttribute('data-listener-added', 'true');
        }
        
        if (transferForm && !transferForm.hasAttribute('data-listener-added')) {
            transferForm.addEventListener('submit', async(e) => { 
                e.preventDefault(); 
                const transferData = { 
                    senderAccountNo: document.getElementById('transfer-from-account').value, 
                    receiverAccountNo: document.getElementById('receiver-account-hidden').value, 
                    amount: parseFloat(document.getElementById('transfer-amount').value), 
                    userId: currentUser.id 
                }; 
                try { 
                    const response = await fetch(`${API_BASE_URL}/api/transfer`, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify(transferData) 
                    }); 
                    const result = await response.json(); 
                    showMessage(result.message, response.ok ? 'success' : 'error'); 
                    if (response.ok) { 
                        e.target.reset(); 
                        transferForm.classList.add('hidden'); 
                        detailsSection.classList.add('hidden'); 
                        searchInput.value = ''; 
                        fetchAllData(); 
                    } 
                } catch (err) { 
                    showMessage('Could not connect to server.', 'error'); 
                } 
            });
            transferForm.setAttribute('data-listener-added', 'true');
        }
    }, 1000);

    // Setup event listeners after DOM elements are created
    setTimeout(() => {
        setupTransferEventListeners();
        setupBillEventListeners();
    }, 300);
}

function setupBillEventListeners() {
    // Bill Category Click Handlers
    document.querySelectorAll('.bill-category-card').forEach(card => {
        if (!card.hasAttribute('data-listener-added')) {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                showUnderConstructionModal('Bill Category', `${category.charAt(0).toUpperCase() + category.slice(1)} bill payment feature`);
            });
            card.setAttribute('data-listener-added', 'true');
        }
    });

    // Quick Bill Fetch Handler
    const fetchBillBtn = document.getElementById('fetch-bill-btn');
    if (fetchBillBtn && !fetchBillBtn.hasAttribute('data-listener-added')) {
        fetchBillBtn.addEventListener('click', () => {
            const consumerNumber = document.getElementById('quick-consumer-number').value.trim();
            if (!consumerNumber) {
                showMessage('Please enter a consumer number', 'error');
                return;
            }
            showUnderConstructionModal('Quick Bill Fetch', 'Instant bill fetch by consumer number');
        });
        fetchBillBtn.setAttribute('data-listener-added', 'true');
    }
}

function setupTransferEventListeners() {
    console.log('Setting up transfer event listeners...');
    
    // Wait for elements to be available
    setTimeout(() => {
        // Simple Transfer Form Handler
        const simpleTransferForm = document.getElementById('simple-transfer-form');
        console.log('Simple transfer form found:', !!simpleTransferForm);
        
        if (simpleTransferForm && !simpleTransferForm.hasAttribute('data-listener-added')) {
        simpleTransferForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const senderAccountNo = document.getElementById('transfer-from-account').value;
            const recipientCustomerId = document.getElementById('recipient-customer-id').value.trim();
            const recipientAccountNo = document.getElementById('recipient-account-number').value.trim();
            const amount = parseFloat(document.getElementById('simple-transfer-amount').value);
            const note = document.getElementById('simple-transfer-note').value.trim();
            
            // Basic validation
            if (!senderAccountNo || !recipientCustomerId || !recipientAccountNo || !amount || amount <= 0) {
                showMessage('Please fill in all required fields with valid values.', 'error');
                return;
            }

            // Check if trying to transfer to self
            if (recipientCustomerId == currentUser.id) {
                showMessage('You cannot transfer money to yourself. Use Self Transfer instead.', 'error');
                return;
            }

            // Check daily limit
            if (amount > 200000) {
                showMessage('Transfer amount exceeds daily limit of ₹2,00,000.', 'error');
                return;
            }

            // Show loading state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="flex items-center justify-center"><span class="animate-spin text-2xl mr-2">⏳</span>Processing Transfer...</span>';
            submitBtn.disabled = true;

            try {
                // Step 1: Validate recipient details
                showMessage('Validating recipient details...', 'info');
                const validateResponse = await fetch(`${API_BASE_URL}/api/customers/validate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        customerId: recipientCustomerId, 
                        accountNo: recipientAccountNo 
                    })
                });
                
                const validateResult = await validateResponse.json();
                
                if (!validateResponse.ok) {
                    throw new Error(validateResult.message || 'Recipient validation failed');
                }

                // Step 2: Process the transfer with automated steps
                showMessage('Processing secure transfer...', 'info');
                const transferData = {
                    senderAccountNo: senderAccountNo,
                    receiverAccountNo: recipientAccountNo,
                    receiverCustomerId: recipientCustomerId,
                    amount: amount,
                    note: note,
                    userId: currentUser.id,
                    automated: true // Flag to indicate this is an automated transfer
                };

                const transferResponse = await fetch(`${API_BASE_URL}/api/transfer/automated`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transferData)
                });

                const transferResult = await transferResponse.json();
                
                if (transferResponse.ok) {
                    showMessage(`✅ Transfer Successful! ${transferResult.message}`, 'success');
                    
                    // Reset form
                    e.target.reset();
                    document.querySelectorAll('.simple-quick-amount-btn').forEach(btn => {
                        btn.classList.remove('bg-orange-100', 'border-orange-400', 'text-orange-600');
                        btn.classList.add('bg-white', 'border-slate-200');
                    });
                    
                    // Refresh all data
                    await fetchAllData();
                    
                    // Show success details
                    setTimeout(() => {
                        showTransferSuccessModal(transferResult);
                    }, 1000);
                } else {
                    throw new Error(transferResult.message || 'Transfer failed');
                }
                
            } catch (error) {
                console.error('Transfer error:', error);
                showMessage(`❌ Transfer Failed: ${error.message}`, 'error');
            } finally {
                // Restore button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
        
            // Mark as listener added
            simpleTransferForm.setAttribute('data-listener-added', 'true');
        }

        // Quick Amount Button Handler for Simple Transfer
        document.querySelectorAll('.simple-quick-amount-btn').forEach(btn => {
            if (!btn.hasAttribute('data-listener-added')) {
                btn.addEventListener('click', (e) => {
                    const amount = e.target.dataset.amount;
                    const amountInput = document.getElementById('simple-transfer-amount');
                    if (amountInput) {
                        amountInput.value = amount;
                        // Add visual feedback
                        document.querySelectorAll('.simple-quick-amount-btn').forEach(button => {
                            button.classList.remove('bg-orange-100', 'border-orange-400', 'text-orange-600');
                            button.classList.add('bg-white', 'border-slate-200');
                        });
                        e.target.classList.remove('bg-white', 'border-slate-200');
                        e.target.classList.add('bg-orange-100', 'border-orange-400', 'text-orange-600');
                    }
                });
                btn.setAttribute('data-listener-added', 'true');
            }
        });
    }, 500);
}

// Transfer Success Modal
    function showTransferSuccessModal(transferResult) {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = `
            <div class="fixed inset-0 z-50 flex items-center justify-center modal-bg">
                <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
                    <div class="text-center">
                        <div class="text-6xl mb-4">✅</div>
                        <h3 class="text-2xl font-bold text-green-600 mb-2">Transfer Successful!</h3>
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-left">
                            <p class="text-green-800 font-medium mb-2">Transaction Details:</p>
                            <div class="text-green-700 text-sm space-y-1">
                                <p><strong>Amount:</strong> ${formatCurrency(transferResult.amount || 0)}</p>
                                <p><strong>To:</strong> ${transferResult.recipientName || 'Recipient'}</p>
                                <p><strong>Transaction ID:</strong> ${transferResult.transactionId || 'TXN' + Date.now()}</p>
                                <p><strong>Date:</strong> ${new Date().toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p class="text-blue-800 text-sm">📧 Transaction receipt sent to your registered email</p>
                        </div>
                        <button id="close-success-modal" class="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md hover:from-green-600 hover:to-green-700 transition-all">
                            Done
                        </button>
                    </div>
                </div>
            </div>
        `;
        modalContainer.classList.remove('hidden');
        
        document.getElementById('close-success-modal').addEventListener('click', () => {
            modalContainer.classList.add('hidden');
            modalContainer.innerHTML = '';
        });
    }

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');
    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');

    showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); loginContainer.classList.add('hidden'); registerContainer.classList.remove('hidden'); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); registerContainer.classList.add('hidden'); loginContainer.classList.remove('hidden'); });
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const loginError = document.getElementById('login-error');
        loginError.classList.add('hidden');
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            checkLoginState();
        } catch (error) {
            loginError.textContent = error.message || 'A network error occurred.';
            loginError.classList.remove('hidden');
        }
    });

    registerForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const mobile_number = document.getElementById('register-mobile').value;
        const password = document.getElementById('register-password').value;
        const registerError = document.getElementById('register-error');
        const registerSuccess = document.getElementById('register-success');
        registerError.classList.add('hidden');
        registerSuccess.classList.add('hidden');
        try {
            const response = await fetch(`${API_BASE_URL}/api/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, mobile_number, password }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            registerSuccess.textContent = 'Registration successful! Please log in.';
            registerSuccess.classList.remove('hidden');
            setTimeout(() => { showLoginLink.click(); }, 2000);
            registerForm.reset();
        } catch (error) {
            registerError.textContent = error.message || 'A network error occurred.';
            registerError.classList.remove('hidden');
        }
    });
    checkLoginState();
});
