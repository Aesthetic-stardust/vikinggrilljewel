import { useAuth } from '../../context/AuthContext';
import Icon from '../common/Icons';

const ROLE_LABELS = {
  hr_staff:        'HR Staff',
  management:      'Management',
  employee:        'Employee',
  accounting_staff: 'Accounting Staff',
};

export default function Topbar({ sidebarWidth }) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header style={{ ...styles.topbar, left: sidebarWidth }}>
      <div style={styles.left}>
        <span style={styles.date}>{today}</span>
      </div>
      <div style={styles.right}>
        <div style={styles.userChip}>
          <div style={styles.userIconWrap}>
            <Icon.User size={14} color="#888" />
          </div>
          <div style={styles.userMeta}>
            <span style={styles.userName}>{user?.name}</span>
            <span style={styles.divider}>·</span>
            <span style={styles.roleTag}>{ROLE_LABELS[user?.role] || 'User'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  topbar: {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '56px',
    background: '#1a1a1a',
    borderBottom: '1px solid #333333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    zIndex: 90,
    transition: 'left 0.25s ease',
  },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
  date: { fontSize: '13px', color: '#888888', fontWeight: 400, letterSpacing: '0.1px' },
  right: { display: 'flex', alignItems: 'center', gap: '16px' },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '5px 10px 5px 8px',
    borderRadius: '8px',
    background: '#222222',
    border: '1px solid #333333',
  },
  userIconWrap: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: '#2a2a2a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMeta: { display: 'flex', alignItems: 'center', gap: '6px' },
  userName: { fontSize: '13px', fontWeight: 600, color: '#FFFFFF' },
  divider: { fontSize: '13px', color: '#555' },
  roleTag: {
    fontSize: '11px',
    color: '#8B1A1A',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
};
