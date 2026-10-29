import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import Icon from '../../components/common/Icons';

export default function StaffActivity() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/employees'),
      api.get('/attendance/summary'),
      api.get('/schedules'),
      api.get('/payroll'),
    ])
      .then(([eRes, aRes, sRes, pRes]) => {
        setEmployees(eRes.data);
        setAttendance(aRes.data);
        setSchedules(sRes.data);
        setPayroll(pRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Loading activity...</p>;

  const activeEmployees = employees.filter((e) => e.status === 'active');
  const totalHours = attendance.reduce((s, a) => s + a.totalHours, 0);
  const pendingPayroll = payroll.filter((p) => p.status === 'pending').length;

  return (
    <div>
      <PageHeader title="Staff Activity" subtitle="Management view of staff-related activities" />

      <div style={styles.cardRow}>
        <StatCard title="Active Staff" value={activeEmployees.length} icon={<Icon.TotalEmployees size={20} color="#1565c0" />} color="#1565c0" />
        <StatCard title="Total Hours Logged" value={`${totalHours.toFixed(1)}h`} icon={<Icon.Pending size={20} color="#2e7d32" />} color="#2e7d32" />
        <StatCard title="Scheduled" value={schedules.length} icon={<Icon.Schedule size={20} color="#f57f17" />} color="#f57f17" />
        <StatCard title="Pending Payroll" value={pendingPayroll} icon={<Icon.Payroll size={20} color="#c62828" />} color="#c62828" />
      </div>

      {/* Employee Status Overview */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Employee Status Overview</h3>
        <div style={styles.empGrid}>
          {employees.map((emp) => {
            const att = attendance.find((a) => a.employeeId === emp.id);
            const pay = payroll.filter((p) => p.employeeId === emp.id);
            return (
              <div key={emp.id} style={styles.empCard}>
                <div style={styles.empHeader}>
                  <div style={styles.avatar}>{emp.firstName.charAt(0)}{emp.lastName.charAt(0)}</div>
                  <div>
                    <div style={styles.empName}>{emp.firstName} {emp.lastName}</div>
                    <div style={styles.empPos}>{emp.position} · {emp.department}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}><Badge value={emp.status} /></div>
                </div>
                <div style={styles.actStats}>
                  <ActStat label="Days Present" value={att?.present ?? '—'} color="#4caf50" />
                  <ActStat label="Days Late" value={att?.late ?? '—'} color="#ffa726" />
                  <ActStat label="Days Absent" value={att?.absent ?? '—'} color="#ef5350" />
                  <ActStat label="Total Hours" value={att ? `${att.totalHours.toFixed(1)}h` : '—'} color="#42a5f5" />
                  <ActStat label="Payroll Records" value={pay.length} color="#ba68c8" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Attendance */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Attendance Summary per Employee</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              {['Employee', 'Present', 'Late', 'Absent', 'Total Hours'].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0 ? (
              <tr><td colSpan={5} style={styles.empty}>No attendance data.</td></tr>
            ) : attendance.map((a) => (
              <tr key={a.employeeId}>
                <td style={styles.td}><strong>{a.employeeName}</strong></td>
                <td style={{ ...styles.td, color: '#4caf50', fontWeight: 600 }}>{a.present}</td>
                <td style={{ ...styles.td, color: '#ffa726', fontWeight: 600 }}>{a.late}</td>
                <td style={{ ...styles.td, color: '#ef5350', fontWeight: 600 }}>{a.absent}</td>
                <td style={styles.td}>{a.totalHours.toFixed(1)}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ActStat = ({ label, value, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '18px', fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{label}</div>
  </div>
);

const styles = {
  cardRow: { display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' },
  section: { background: '#1a1a1a', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', border: '1px solid #333333', marginBottom: '20px' },
  sectionTitle: { margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#FFFFFF' },
  empGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' },
  empCard: { border: '1.5px solid #333333', borderRadius: '10px', padding: '14px', background: '#222222' },
  empHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#8B1A1A', color: '#fff', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  empName: { fontSize: '14px', fontWeight: 700, color: '#FFFFFF' },
  empPos: { fontSize: '12px', color: '#888' },
  actStats: { display: 'flex', gap: '12px', justifyContent: 'space-around', padding: '10px 0', borderTop: '1px solid #333333' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 14px', background: '#222222', fontSize: '12px', fontWeight: 700, color: '#888', textAlign: 'left', textTransform: 'uppercase', borderBottom: '2px solid #333333' },
  td: { padding: '10px 14px', fontSize: '14px', color: '#CCCCCC', borderBottom: '1px solid #2a2a2a' },
  empty: { padding: '24px', textAlign: 'center', color: '#666', fontSize: '14px' },
};
