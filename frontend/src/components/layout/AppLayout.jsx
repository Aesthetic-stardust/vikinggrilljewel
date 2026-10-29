import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const sidebarWidth = collapsed ? '64px' : '240px';

  return (
    <div style={styles.root}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div style={{ ...styles.main, marginLeft: sidebarWidth, transition: 'margin-left 0.25s ease' }}>
        <Topbar sidebarWidth={sidebarWidth} />
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles = {
  root: { display: 'flex', minHeight: '100vh', background: '#121212' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  content: { marginTop: '56px', padding: '24px', flex: 1 },
};
