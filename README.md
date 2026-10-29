# Viking Grill — HR & Finance Management System

A full-stack internal management system for Viking Grill restaurant, covering HR operations and accounting/finance.

## Tech Stack

- **Frontend**: React (Vite), React Router v6, Axios, Recharts
- **Backend**: Node.js, Express, MySQL (mysql2), JWT authentication

## Modules

### HR & Payroll
- HR Dashboard — overview of employee metrics and HR activity
- Employee Management — create, edit, and manage employee records
- Employee Details — view full employee profile
- Attendance Management — record and monitor daily attendance
- Employee Scheduling — weekly shift scheduling per employee
- Payroll Management — process payroll with PH statutory deductions (SSS, PhilHealth, Pag-IBIG, tax)
- Payslip Detail — printable payslip view
- HR Reports — department, payroll, and attendance analytics
- Staff Activity — management view of staff-related activity

### Accounting & Finance
- Accounting Dashboard — financial overview with charts
- Financial Transactions — manage income and expense ledger
- Sales Records — POS-imported daily sales data
- Payment Records — accounts payable tracking
- Financial Summary — detailed financial performance overview
- Financial Reports — tabbed report with print support

## User Roles

| Role | Access |
|---|---|
| `hr_staff` | Full HR & Payroll management |
| `management` | Read-only HR + financial summary & reports + staff activity |
| `employee` | Own payslips, schedule, and attendance |
| `accounting_staff` | Full accounting & finance management |

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+ (via Laragon or any local MySQL server)

### 1. Database Setup
```bash
cd backend
cp .env.example .env   # fill in your DB credentials
node src/scripts/setup-db.js
```

Default seed account: `admin@vikinggrill.com` / `changeme123` (role: `hr_staff`)  
**Change this password after first login.**

### 2. Backend
```bash
cd backend
npm install
npm run dev       # runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev       # runs on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Vikinggrill/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection pool
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth (JWT) + error handler
│   │   ├── routes/         # Express route definitions
│   │   ├── scripts/        # DB setup script
│   │   └── server.js       # Express entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/            # Axios instance + interceptors
    │   ├── components/     # Reusable UI components & layout
    │   ├── context/        # Auth + Toast context providers
    │   ├── pages/          # HR and Accounting page components
    │   └── App.jsx         # Routes + role guards
    └── package.json
```
