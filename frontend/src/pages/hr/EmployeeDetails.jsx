import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Btn from '../../components/common/Btn';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [emp, setEmp] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, attRes, payRes] = await Promise.all([
          api.get(`/employees/${id}`),
          api.get(`/attendance?employeeId=${id}`),
          api.get(`/payroll?employeeId=${id}`),
        ]);
        setEmp(empRes.data);
        setAttendance(attRes.data.slice(0, 5));
        setPayroll(payRes.data.slice(0, 3));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Loading...</p>;
  if (!emp) return <p style={{ textAlign: 'center', color: '#ef5350', padding: '40px' }}>Employee not found.</p>;

  return (
    <div>
      <PageHeader
        title="Employee Details"
        subtitle={`Viewing profile of ${emp.firstName} ${emp.lastName}`}
        actions={<Btn variant="secondary" onClick={() => navigate('/hr/employees')}>← Back</Btn>}
      />

      <div style={styles.grid}>
        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.avatar}>{emp.firstName.charAt(0)}{emp.lastName.charAt(0)}</div>
          <h2 style={styles.name}>{emp.firstName} {emp.lastName}</h2>
          <p style={styles.position}>{emp.position}</p>
          <Badge value={emp.status} />
          <div style={styles.infoGrid}>
            <InfoRow label="Employee ID" value={emp.id} />
            <InfoRow label="Department" value={emp.department} />
            <InfoRow label="Email" value={emp.email} />
            <InfoRow label="Phone" value={emp.phone} />
            <InfoRow label="Hire Date" value={emp.hireDate} />
            <InfoRow label="Salary" value={`₱${Number(emp.salary).toLocaleString()}`} />
            <InfoRow label="Address" value={emp.address} />
          </div>
        </div>

        <div style={styles.rightCol}>
          {/* Recent Attendance */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Recent Attendance</h3>
            {attendance.length === 0 ? <p style={styles.empty}>No attendance records.</p> : (
              <table style={styles.miniTable}>
                <thead><tr><Th>Date</Th><Th>Time In</Th><Th>Time Out</Th><Th>Status</Th><Th>Hours</Th></tr></thead>
                <tbody>
                  {attendance.map((a) => (
                    <tr key={a.id}>
                      <Td>{a.date}</Td>
                      <Td>{a.timeIn || '—'}</Td>
                      <Td>{a.timeOut || '—'}</Td>
                      <Td><Badge value={a.status} /></Td>
                      <Td>{a.hoursWorked}h</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent Payroll */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Recent Payroll</h3>
            {payroll.length === 0 ? <p style={styles.empty}>No payroll records.</p> : (
              <table style={styles.miniTable}>
                <thead><tr><Th>Period</Th><Th>Gross</Th><Th>Deductions</Th><Th>Net Pay</Th><Th>Status</Th></tr></thead>
                <tbody>
                  {payroll.map((p) => (
                    <tr key={p.id}>
                      <Td>{p.period}</Td>
                      <Td>₱{(p.basicPay + p.overtime + p.allowances).toLocaleString()}</Td>
                      <Td>₱{(p.sss + p.philhealth + p.pagibig + p.tax).toLocaleString()}</Td>
                      <Td>₱{p.netPay.toLocaleString()}</Td>
                      <Td><Badge value={p.status} /></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 0', borderBottom: '1px solid #2a2a2a' }}>
    <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
    <span style={{ fontSize: '14px', color: '#CCCCCC', fontWeight: 500 }}>{value || '—'}</span>
  </div>
);

const Th = ({ children }) => <th style={{ padding: '8px 12px', background: '#222222', fontSize: '11px', fontWeight: 700, color: '#888', textAlign: 'left', textTransform: 'uppercase' }}>{children}</th>;
const Td = ({ children }) => <td style={{ padding: '8px 12px', fontSize: '13px', color: '#CCCCCC', borderBottom: '1px solid #2a2a2a' }}>{children}</td>;

const styles = {
  grid: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' },
  profileCard: { background: '#1a1a1a', borderRadius: '14px', padding: '28px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', textAlign: 'center', border: '1px solid #333333' },
  avatar: { width: '72px', height: '72px', borderRadius: '50%', background: '#8B1A1A', color: '#fff', fontSize: '28px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' },
  name: { margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#FFFFFF' },
  position: { margin: '0 0 10px', fontSize: '14px', color: '#888' },
  infoGrid: { marginTop: '16px', textAlign: 'left' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '16px' },
  section: { background: '#1a1a1a', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', border: '1px solid #333333' },
  sectionTitle: { margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: '#FFFFFF' },
  miniTable: { width: '100%', borderCollapse: 'collapse' },
  empty: { color: '#666', fontSize: '14px', padding: '8px 0' },
};
