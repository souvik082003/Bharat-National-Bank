
<div align="center">

# Bharat National Bank (Learning Banking System) 🏦🇮🇳

Lightweight full‑stack banking simulation app with customer onboarding, account creation, fund transfers, bill payments, and a responsive dashboard UI — built with Node.js, Express, MySQL, and vanilla JS + Tailwind (CDN).

![Status](https://img.shields.io/badge/status-active-success) ![Node](https://img.shields.io/badge/Node.js-18+-brightgreen) ![Express](https://img.shields.io/badge/Express.js-4/5-blue) ![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1) ![Security](https://img.shields.io/badge/Auth-Password%20Hashing-green)  

Author: **Souvik Samanta** (CSE Student)  

</div>

---
## ✨ Current Feature Set (Accurate to Code in Repo)
Implemented today:
1. User registration with automatic account provisioning (default ₹100,000 balance)
2. Secure login (server validated; frontend stores minimal user object in localStorage)
3. Password hashing using bcrypt (10 salt rounds)
4. Multiple accounts supported per customer (code currently uses first account as primary in UI)
5. Fund transfer workflows:
     - Standard transfer (debit sender, credit receiver)
     - Automated validated transfer (`/api/transfer/automated`) with recipient + balance checks
     - Self “deposit” / top‑up via special `SYS_EXTERNAL` sender flag (simulates inward credit)
6. Bill payments with balance lock / validation and unified transaction feed
7. Saved billers retrieval (`/api/billers/:userId`)
8. Unified transaction history merging transfers + bill payments
9. Dashboard account + monthly expense summary
10. Dynamic UI components (tabs, modals, quick amount buttons, success dialogs)
11. Basic branch metadata (static IFSC + branch name in response)

Planned / scaffolded but not yet implemented:
- Scheduled transfers, beneficiaries management, advanced services (placeholders & modals)
- Loan handling, role separation, audit trails, notifications, JWT-based auth

---
## 🧱 Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | HTML, Tailwind CDN, Vanilla JavaScript (`script.js`) |
| Backend | Node.js + Express 5 (app in `server.js`) |
| Database | MySQL (mysql2/promise pool) |
| Auth | bcrypt password hashing (no JWT yet) |
| State (client) | localStorage (stores `{id,name,email}` only) |
| Styling | Tailwind CDN + minimal custom CSS (`style.css`) |

---
## 📂 Actual Project Structure (Current)
```
bank_erd.md          # (Design / notes)
index.html           # Frontend UI (single-page dynamic sections)
script.js            # All frontend logic
style.css            # Minor global styles / brand overrides
server.js            # Express server + REST API endpoints
package.json         # Dependencies & start script
test.html / test.js  # (Ad hoc experimentation)
README.md            # Project documentation
```

> NOTE: This is a “flat” mono-repo. As features grow, consider splitting into `/backend` + `/frontend` or modular folders (controllers, routes, services, middleware).

---
## ⚙️ Environment & Configuration
Create a `.env` file in the project root (same directory as `server.js`):
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bank_system_india   # default used in code if unset
```

Optional additions for future hardening:
```
NODE_ENV=development
LOG_LEVEL=info
```

The code falls back to defaults if variables are missing (see `server.js`).

---
## 🗄️ Database Schema (Minimum Viable Tables)
Below is a schema consistent with the queries used in `server.js` & `script.js`.

```sql
CREATE DATABASE IF NOT EXISTS bank_system_india CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bank_system_india;

-- Customers
CREATE TABLE Customer (
    Cust_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(120) NOT NULL UNIQUE,
    Mobile_Number VARCHAR(20) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Address VARCHAR(255),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts
CREATE TABLE Account (
    Account_No VARCHAR(20) PRIMARY KEY,
    Branch_ID INT NOT NULL,
    Cust_ID INT NOT NULL,
    Acc_Type ENUM('Savings','Current','Salary','NRE','NRO') DEFAULT 'Savings',
    Balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    Opened_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Cust_ID) REFERENCES Customer(Cust_ID)
);

-- Transfers
CREATE TABLE transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_account_no VARCHAR(20) NOT NULL,
    receiver_account_no VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (sender_account_no),
    INDEX (receiver_account_no),
    CONSTRAINT fk_trans_sender FOREIGN KEY (sender_account_no) REFERENCES Account(Account_No),
    CONSTRAINT fk_trans_receiver FOREIGN KEY (receiver_account_no) REFERENCES Account(Account_No)
);

-- Bill Payments
CREATE TABLE bill_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    biller_name VARCHAR(150) NOT NULL,
    category VARCHAR(60),
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'Success',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Customer(Cust_ID)
);

-- Saved Billers
CREATE TABLE saved_billers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    biller_name VARCHAR(150) NOT NULL,
    category VARCHAR(60),
    reference_no VARCHAR(120),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Customer(Cust_ID)
);

-- (Optional) Seed a few billers
INSERT INTO saved_billers (user_id, biller_name, category) VALUES
    (1,'State Electricity Board','utilities'),
    (1,'Airtel Postpaid','mobile');
```

> The application also references a random `Branch_ID` (1–5). Create a simple `branches` table if you need referential integrity.

---
## 🚀 Running the Project (Windows PowerShell Friendly)

```powershell
# 1. Install dependencies
npm install

# 2. (Optional) Create .env if customizing
New-Item -ItemType File -Path .env -Force | Out-Null

# 3. Start MySQL & create schema (see SQL above)
#    Use your MySQL client or Workbench

# 4. Run the server
npm start   # runs: node server.js

# 5. Open the frontend
start index.html   # or open manually in browser
```

Make sure the backend is running before logging in or registering from the UI.

---
## 🔌 API Endpoints (Implemented)
| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| POST | /api/register | Create user + base account | Returns userId & initial balance (100000) |
| POST | /api/login | Authenticate user | Returns basic user payload (no JWT yet) |
| GET | /api/user/summary/:userId | Accounts + monthly expenses + branch info | Used for dashboard cards |
| GET | /api/transactions/all/:userId | Unified transfers + bill payments | Sorted newest first |
| GET | /api/billers/:userId | Retrieve saved billers | For quick pay list |
| GET | /api/customers/search/:identifier | Lookup by Cust_ID / Mobile / Email | Used legacy transfer flow |
| POST | /api/customers/validate | Validate recipient customer/account pair | Used in automated transfer form |
| POST | /api/bills/pay | Pay a bill and debit account | Checks balance (FOR UPDATE) |
| POST | /api/transfer | Standard/self transfer | `SYS_EXTERNAL` sender means credit only |
| POST | /api/transfer/automated | Full validated transfer | Additional recipient verification |

Error Responses: JSON object with `{ message: string }` and appropriate HTTP status codes (400/401/404/409/500).

---
## 🔐 Security (Current vs Needed)
Current:
- Passwords hashed with bcrypt
- Parameterized SQL queries reduce injection risk
- Basic transaction safety via MySQL transactions & SELECT ... FOR UPDATE

Not Yet Implemented (HIGH PRIORITY for real use):
- JWT / session tokens (currently relying only on client localStorage user object)
- Rate limiting / IP throttling
- Input validation (Joi/Zod) & sanitization
- CSRF protection (not critical for pure SPA + token, but relevant later)
- Centralized error/logger abstraction (currently console-based)
- Password complexity checks & account lockouts

Do NOT deploy this as-is for real banking scenarios.

---
## 🖥️ Frontend Overview
The app is a single HTML file (`index.html`) whose sections are dynamically populated by `script.js` after login. Key UI areas:
- Auth view (login/register toggle)
- Dashboard (accounts, expenses, recent transactions)
- Transfer center (standard, self, upcoming scheduled/beneficiary placeholders)
- Bill payment (favorite billers + category cards + quick pay modal)
- Services (informational placeholders with under‑construction modals)

UI Enhancements:
- Animated quick amount buttons
- Success/error toasts (`showMessage`)
- Modal-based confirmations & under‑construction notices

---
## 💳 Transfer Logic Notes
- Self top‑ups: `senderAccountNo === 'SYS_EXTERNAL'` path only credits target account.
- Automated route validates: sender ownership, sufficient balance, receiver existence, optional receiverCustID match.
- Daily limit messaging exists in UI (₹2,00,000) but server does NOT enforce yet — future enhancement required.

---
## 🧾 Bill Payments
- Debits chosen account after balance lock (transaction) then inserts a record in `bill_payments`.
- Category value is currently passed as provided (defaults 'Utilities').
- Success updates dashboard + transactions after refresh.

---
## 🔄 Data Refresh Cycle
`fetchAllData()` calls:
1. `fetchUserSummary()` → accounts + expenses + branch
2. `fetchAllTransactions()` → merged history
3. `fetchFavoriteBillers()` → saved billers list

Called at login and after state-changing actions (transfer, bill payment, self deposit).

---
## 🛣️ Roadmap / Next Steps
Priority (Short Term):
- Add Joi/Zod validation layer
- Introduce JWT access + refresh tokens
- Split backend logic (routes/controllers/services)
- Central error middleware + structured logging (pino/winston)
- Implement real daily transfer limits

Medium Term:
- Beneficiary management & scheduled transfers
- Swagger / OpenAPI documentation
- Role-based admin panel (view users, freeze accounts)
- Email notifications (transaction receipts actually sent)

Long Term / Stretch:
- Loan module (applications, EMI schedule)
- 2FA (TOTP) & device recognition
- Transaction reconciliation & immutable audit ledger
- Caching frequently read summaries (Redis)
- Sharding / read replicas for scale

---
## 🧪 Testing (Not Yet Implemented)
Suggested Stack:
| Level | Tool | Target |
|-------|------|--------|
| Unit | Jest / Vitest | Utility & service functions |
| Integration | Supertest | API endpoints (with test DB) |
| E2E | Playwright/Cypress | Full UI flows |

Example skeleton (future):
```js
// tests/auth.test.js
// import request from 'supertest';
// const app = require('../server');
// describe('Auth', () => { /* ... */ });
```

---
## 🧑‍💻 Developer Tips
- Use MySQL Workbench or `mysql` CLI to inspect balances in real time.
- If you manually delete a Customer row, also delete dependent Account / transfers / bill_payments rows to avoid orphan references.
- For quick demo: register two users, copy one account number, perform a transfer between them, then view unified history.

---
## ⚠️ Disclaimer
Educational project — NOT production-ready banking software. Missing: encryption at rest, PCI-DSS alignment, regulatory compliance, fraud monitoring, full trace/audit, penetration hardening.

---
## 🤝 Contributing
1. Fork
2. Create branch: `git checkout -b feature/xyz`
3. Commit: `git commit -m "feat: add xyz"`
4. Push: `git push origin feature/xyz`
5. Open PR with description & screenshots (if UI)

Conventional Commits style encouraged (feat, fix, refactor, docs, chore, test).

---
## 📄 License
No explicit license file yet. Add one (MIT recommended) if you intend public collaboration.

---
## 📬 Contact
| Channel | Value |
|---------|-------|
| Email | work03.souvik@gmail.com |
| GitHub | https://github.com/souvik082003 |
| LinkedIn | https://www.linkedin.com/in/souvik-samanta-660130211/ |

Feel free to open Issues for bugs or feature ideas.

---
## ⭐ Support
If this helped your learning:
- Star the repo
- Share with classmates
- Suggest improvements

---
### 🧭 Quick Commands
| Action | Command |
|--------|--------|
| Install deps | `npm install` |
| Start server | `npm start` |
| Lint (future) | `npm run lint` |

---
Happy Building! 💡

| Install deps | `npm install` |
| Lint (future) | `npm run lint` |
| Run tests (future) | `npm test` |

---
> Built with passion for learning modern web architecture & secure backend design.
