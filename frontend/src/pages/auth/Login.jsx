import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      const role = result.user.role;
      if (role === 'hr_staff')              navigate('/hr/dashboard');
      else if (role === 'management')       navigate('/hr/dashboard');
      else if (role === 'employee')         navigate('/hr/payroll');
      else if (role === 'accounting_staff') navigate('/accounting/dashboard');
      else navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoArea}>
          <div style={styles.logoMark}>
            <svg width="40" height="40" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="28" height="28" rx="7" fill="#8B1A1A" />
              <path d="M8 20 C8 14 14 14 14 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <path d="M14 20 C14 14 20 14 20 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="21" x2="22" y2="21" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={styles.brand}>Viking Grill</h1>
          <p style={styles.subtitle}>HR &amp; Finance Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter your email"
              required
              autoFocus
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #121212 50%, #2a0a0a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    background: '#1a1a1a',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(139,26,26,0.1)',
    border: '1px solid #333333',
  },
  logoArea: { textAlign: 'center', marginBottom: '32px' },
  logoMark: { display: 'flex', justifyContent: 'center', marginBottom: '12px' },
  brand:    { margin: 0, fontSize: '26px', fontWeight: 700, color: '#FFFFFF' },
  subtitle: { margin: '6px 0 0', fontSize: '13px', color: '#888888' },
  form:     { display: 'flex', flexDirection: 'column', gap: '16px' },
  field:    { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:    { fontSize: '13px', fontWeight: 600, color: '#CCCCCC' },
  input: {
    padding: '11px 14px',
    border: '1.5px solid #333333',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#1e1e1e',
    color: '#FFFFFF',
  },
  btn: {
    marginTop: '4px',
    padding: '13px',
    background: 'linear-gradient(135deg, #8B1A1A, #6B1010)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  errorBox: {
    background: 'rgba(139,26,26,0.15)',
    color: '#ef5350',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    border: '1px solid rgba(139,26,26,0.3)',
  },
};
