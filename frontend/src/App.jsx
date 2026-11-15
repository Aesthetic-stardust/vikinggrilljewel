import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './components/layout/AppLayout';

// HR Pages
import HRDashboard from './pages/hr/HRDashboard';
import EmployeeManagement from './pages/hr/EmployeeManagement';
import EmployeeDetails from './pages/hr/EmployeeDetails';
import AttendanceManagement from './pages/hr/AttendanceManagement';
import EmployeeScheduling from './pages/hr/EmployeeScheduling';
import PayrollManagement from './pages/hr/PayrollManagement';
import PayslipDetail from './pages/hr/PayslipDetail';
import HRReports from './pages/hr/HRReports';
import StaffActivity from './pages/hr/StaffActivity';

// Accounting Pages
import AccountingDashboard from './pages/accounting/AccountingDashboard';
import FinancialTransactions from './pages/accounting/FinancialTransactions';  
import SalesRecords from './pages/accounting/SalesRecords';
import PaymentRecords from './pages/accounting/PaymentRecords';
import FinancialSummary from './pages/accounting/FinancialSummary';
import FinancialReports from './pages/accounting/FinancialReports';

/** Redirect to central VikingsERP login gateway */
function CentralLoginRedirect() {
  useEffect(() => {
    window.location.href = 'http://localhost:5173/login?redirect=jewel';
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      background: '#121212',
      color: '#FFFFFF',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: '#8B1A1A',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ margin: 0, color: '#888888', fontSize: '13px' }}>
        Redirecting to VikingsERP Central Unified Login...
      </p>
    </div>
  );
}

/** Redirect to central login if not authenticated */
function RoleRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) {
    window.location.href = 'http://localhost:5173/login?redirect=jewel';
    return null;
  }
  if (!roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}

/** Send each role to their default home page */
function DefaultRedirect() {
  const { user } = useAuth();
  if (!user) {
    window.location.href = 'http://localhost:5173/login?redirect=jewel';
    return null;
  }
  switch (user.role) {
    case 'hr_staff':         return <Navigate to="/hr/dashboard" replace />;
    case 'management':       return <Navigate to="/hr/dashboard" replace />;
    case 'employee':         return <Navigate to="/hr/payroll" replace />;
    case 'accounting_staff': return <Navigate to="/accounting/dashboard" replace />;
    default:
      window.location.href = 'http://localhost:5173/login?redirect=jewel';
      return null;
  }
}

function UnauthorizedPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: '#121212' }}>
      <div style={{ fontSize: '48px' }}>🚫</div>
      <h2 style={{ margin: 0, color: '#FFFFFF' }}>Access Denied</h2>
      <p style={{ color: '#888888', margin: 0 }}>You don't have permission to view this page.</p>
      <button onClick={() => window.history.back()} style={{ padding: '10px 24px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
        Go Back
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<CentralLoginRedirect />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/" element={<DefaultRedirect />} />

          {/* Protected Layout */}
          <Route element={<AppLayout />}>

            {/* ── HR Module ───────────────────────────────── */}
            <Route path="/hr/dashboard" element={<RoleRoute roles={['hr_staff', 'management']}><HRDashboard /></RoleRoute>} />
            <Route path="/hr/employees" element={<RoleRoute roles={['hr_staff', 'management']}><EmployeeManagement /></RoleRoute>} />
            <Route path="/hr/employees/:id" element={<RoleRoute roles={['hr_staff', 'management', 'employee']}><EmployeeDetails /></RoleRoute>} />
            <Route path="/hr/attendance" element={<RoleRoute roles={['hr_staff', 'management', 'employee', 'accounting_staff']}><AttendanceManagement /></RoleRoute>} />
            <Route path="/hr/scheduling" element={<RoleRoute roles={['hr_staff', 'management', 'employee']}><EmployeeScheduling /></RoleRoute>} />
            <Route path="/hr/payroll" element={<RoleRoute roles={['hr_staff', 'management', 'employee', 'accounting_staff']}><PayrollManagement /></RoleRoute>} />
            <Route path="/hr/payroll/:id" element={<RoleRoute roles={['hr_staff', 'management', 'employee', 'accounting_staff']}><PayslipDetail /></RoleRoute>} />
            <Route path="/hr/reports" element={<RoleRoute roles={['hr_staff', 'management', 'accounting_staff']}><HRReports /></RoleRoute>} />
            <Route path="/hr/staff-activity" element={<RoleRoute roles={['management']}><StaffActivity /></RoleRoute>} />

            {/* ── Accounting Module ────────────────────────── */}
            <Route path="/accounting/dashboard" element={<RoleRoute roles={['accounting_staff', 'management']}><AccountingDashboard /></RoleRoute>} />
            <Route path="/accounting/transactions" element={<RoleRoute roles={['accounting_staff', 'management']}><FinancialTransactions /></RoleRoute>} />
            <Route path="/accounting/sales" element={<RoleRoute roles={['accounting_staff', 'management']}><SalesRecords /></RoleRoute>} />
            <Route path="/accounting/payments" element={<RoleRoute roles={['accounting_staff', 'management']}><PaymentRecords /></RoleRoute>} />
            <Route path="/accounting/summary" element={<RoleRoute roles={['accounting_staff', 'management']}><FinancialSummary /></RoleRoute>} />
            <Route path="/accounting/reports" element={<RoleRoute roles={['accounting_staff', 'management']}><FinancialReports /></RoleRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ToastProvider>
  );
}
