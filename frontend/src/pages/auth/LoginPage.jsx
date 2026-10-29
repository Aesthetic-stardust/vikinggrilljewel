import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
      return;
    }

    // Redirect based on role
    const { role } = result.user;
    if (role === 'accounting_staff') {
      navigate('/accounting/dashboard', { replace: true });
    } else {
      navigate('/hr/dashboard', { replace: true });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo / Brand */}
        <div style={styles.brand}>
          <div style={styles.logoCircle}>🍖</div>
          <h1 style={styles.brandName}>Viking Grill</h1>
          <p style={styles.brandSub}>HR &amp; Finance System</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@vikinggrill.com"
              required
              autoComplete="email"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={styles.input}
            />
          </div>

          {error && (
            <div style={styles.errorBox} role="alert">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials hint */}
        <details style={styles.demo}>
          <summary style={styles.demoSummary}>Demo credentials</summary>
          <table style={styles.demoTable}>
            <thead>
              <tr>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Password</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['HR Staff',         'hr@vikinggrill.com',         'password123'],
                ['Management',       'manager@vikinggrill.com',    'password123'],
                ['Employee',         'employee@vikinggrill.com',   'password123'],
                ['Accounting Staff', 'accounting@vikinggrill.com', 'password123'],
              ].map(([role, em, pw]) => (
                <tr key={role}>
                  <td style={styles.td}>{role}</td>
                  <td style={styles.td}>
                    <button
                      type="button"
                      style={styles.fillBtn}
                      onClick={() => { setEmail(em); setPassword(pw); }}
                    >
                      {em}
                    </button>
                  </td>
                  <td style={styles.td}>{pw}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '24px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '40px 36px 32px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  brand: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoCircle: {
    fontSize: '48px',
    lineHeight: 1,
    marginBottom: '8px',
  },
  brandName: {
    margin: '0 0 4px',
    fontSize: '24px',
    fontWeight: 700,
    color: '#1a1a2e',
  },
  brandSub: {
    margin: 0,
    fontSize: '14px',
    color: '#888',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#444',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid #ddd',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  errorBox: {
    background: '#fff0f0',
    border: '1px solid #fca5a5',
    color: '#dc2626',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
  },
  btn: {
    padding: '12px',
    background: '#e63946',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginTop: '4px',
  },
  demo: {
    marginTop: '24px',
    fontSize: '13px',
    color: '#666',
  },
  demoSummary: {
    cursor: 'pointer',
    color: '#888',
    fontSize: '13px',
    userSelect: 'none',
  },
  demoTable: {
    marginTop: '10px',
    borderCollapse: 'collapse',
    width: '100%',
    fontSize: '12px',
  },
  th: {
    textAlign: 'left',
    padding: '4px 8px',
    color: '#555',
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '4px 8px',
    color: '#333',
    borderBottom: '1px solid #f5f5f5',
    verticalAlign: 'middle',
  },
  fillBtn: {
    background: 'none',
    border: 'none',
    color: '#e63946',
    cursor: 'pointer',
    padding: 0,
    fontSize: '12px',
    textDecoration: 'underline',
  },
};
