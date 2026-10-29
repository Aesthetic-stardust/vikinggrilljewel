import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import Icon from '../common/Icons';

const HR_STAFF_NAV = [
  { path: '/hr/dashboard',   label: 'HR Dashboard',        icon: Icon.Dashboard },
  { path: '/hr/employees',   label: 'Employee Management', icon: Icon.Employees },
  { path: '/hr/attendance',  label: 'Attendance',          icon: Icon.Attendance },
  { path: '/hr/scheduling',  label: 'Scheduling',          icon: Icon.Schedule },
  { path: '/hr/payroll',     label: 'Payroll Management',  icon: Icon.Payroll },
  { path: '/hr/reports',     label: 'HR Reports',          icon: Icon.Reports },
];

const MANAGEMENT_NAV = [
  { path: '/hr/dashboard',         label: 'HR Overview',       icon: Icon.Dashboard },
  { path: '/hr/employees',         label: 'Employees',         icon: Icon.Employees },
  { path: '/hr/reports',           label: 'HR Reports',        icon: Icon.Reports },
  { path: '/hr/staff-activity',    label: 'Staff Activity',    icon: Icon.Activity },
  { path: '/accounting/summary',   label: 'Financial Summary', icon: Icon.Financial },
  { path: '/accounting/reports',   label: 'Financial Reports', icon: Icon.Reports },
];

const EMPLOYEE_NAV = [
  { path: '/hr/payroll',    label: 'My Payslips',  icon: Icon.Payroll },
  { path: '/hr/scheduling', label: 'My Schedule',  icon: Icon.Schedule },
  { path: '/hr/attendance', label: 'My Attendance', icon: Icon.Attendance },
];

const ACCOUNTING_NAV = [
  { path: '/accounting/dashboard',    label: 'Accounting Dashboard', icon: Icon.Dashboard },
  { path: '/accounting/transactions', label: 'Transactions',         icon: Icon.Transactions },
  { path: '/accounting/sales',        label: 'Sales Records',        icon: Icon.Sales },
  { path: '/accounting/payments',     label: 'Payment Records',      icon: Icon.Payments },
  { path: '/accounting/summary',      label: 'Financial Summary',    icon: Icon.Financial },
  { path: '/accounting/reports',      label: 'Financial Reports',    icon: Icon.Reports },
];

const NAV_MAP = {
  hr_staff:        HR_STAFF_NAV,
  management:      MANAGEMENT_NAV,
  employee:        EMPLOYEE_NAV,
  accounting_staff: ACCOUNTING_NAV,
};

const ROLE_LABELS = {
  hr_staff:        'HR Staff',
  management:      'Management',
  employee:        'Employee',
  accounting_staff: 'Accounting Staff',
};

/* Small brand mark — two interlocking arcs suggesting a grill / flame */
function BrandMark({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect width="28" height="28" rx="6" fill="#8B1A1A" />
      <path d="M8 20 C8 14 14 14 14 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 20 C14 14 20 14 20 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="21" x2="22" y2="21" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = NAV_MAP[user?.role] || [];
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{ ...styles.sidebar, width: collapsed ? '64px' : '240px' }}>

      {/* Header */}
      <div style={{ ...styles.header, justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <div style={styles.brandWrap}>
            <BrandMark size={28} />
            <div>
              <div style={styles.brandName}>Viking Grill</div>
              <div style={styles.brandRole}>{ROLE_LABELS[user?.role] || ''}</div>
            </div>
          </div>
        )}
        {collapsed && <BrandMark size={28} />}
        {!collapsed && (
          <button style={styles.toggleBtn} onClick={onToggle} aria-label="Collapse sidebar">
            <Icon.ChevronLeft size={16} color="rgba(255,255,255,0.7)" />
          </button>
        )}
      </div>

      {/* Collapsed expand button */}
      {collapsed && (
        <div style={styles.collapsedToggleWrap}>
          <button style={styles.toggleBtn} onClick={onToggle} aria-label="Expand sidebar">
            <Icon.ChevronRight size={16} color="rgba(255,255,255,0.7)" />
          </button>
        </div>
      )}

      {/* User Badge */}
      {!collapsed && (
        <div style={styles.userBadge}>
          <div style={styles.avatar}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const NavIcon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
                justifyContent: collapsed ? 'center' : 'flex-start',
                paddingLeft: collapsed ? '0' : '16px',
              })}
              title={item.label}
            >
              <NavIcon size={18} color="currentColor" />
              {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={styles.footer}>
        <button
          style={{
            ...styles.logoutBtn,
            justifyContent: collapsed ? 'center' : 'flex-start',
            paddingLeft: collapsed ? '0' : '16px',
          }}
          onClick={() => setShowLogoutConfirm(true)}
          title="Sign Out"
        >
          <Icon.Logout size={18} color="currentColor" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Sign-out Confirmation Modal */}
      <Modal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Sign Out"
        width="360px"
      >
        <p style={{ margin: '0 0 24px', color: '#CCCCCC', fontSize: '14px', lineHeight: 1.7 }}>
          Are you sure you want to sign out of your session?
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button style={styles.cancelBtn} onClick={() => setShowLogoutConfirm(false)}>
            Cancel
          </button>
          <button style={styles.confirmBtn} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </Modal>
    </aside>
  );
}

const styles = {
  sidebar: {
    height: '100vh',
    background: '#0e0e0e',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.25s ease',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 100,
    overflow: 'hidden',
    borderRight: '1px solid #222222',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 14px',
    borderBottom: '1px solid #222222',
    height: '64px',
    flexShrink: 0,
  },
  collapsedToggleWrap: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #222222',
  },
  brandWrap: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 },
  brandName: { fontSize: '15px', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.2px' },
  brandRole: { fontSize: '10px', color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginTop: '1px' },
  toggleBtn: {
    background: 'rgba(255,255,255,0.07)',
    border: 'none',
    color: '#fff',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.15s',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    borderBottom: '1px solid #222222',
    flexShrink: 0,
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    background: '#8B1A1A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '14px',
    flexShrink: 0,
    letterSpacing: '0.5px',
  },
  userInfo: { overflow: 'hidden', flex: 1, minWidth: 0 },
  userName: { fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#f0f0f0' },
  userEmail: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' },
  nav: { flex: 1, overflowY: 'auto', padding: '6px 0' },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 16px',
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    fontSize: '13.5px',
    fontWeight: 500,
    transition: 'background 0.15s, color 0.15s',
    borderLeft: '2px solid transparent',
    margin: '1px 0',
  },
  navItemActive: {
    background: 'rgba(139,26,26,0.15)',
    color: '#fff',
    borderLeft: '2px solid #8B1A1A',
  },
  navLabel: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  footer: { borderTop: '1px solid #222222', padding: '6px 0', flexShrink: 0 },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 16px',
    color: 'rgba(255,255,255,0.4)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    fontSize: '13.5px',
    fontWeight: 500,
    transition: 'color 0.15s',
  },
  cancelBtn: {
    padding: '8px 18px',
    borderRadius: '8px',
    border: '1px solid #333333',
    background: '#2a2a2a',
    color: '#CCCCCC',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  confirmBtn: {
    padding: '8px 18px',
    borderRadius: '8px',
    border: 'none',
    background: '#8B1A1A',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 600,
  },
};
