import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#e63946', '#2e7d32', '#f57f17', '#1565c0', '#6a1b9a'];

const tooltipStyle = {
  contentStyle: { borderRadius: '8px', border: '1px solid #333', background: '#222', fontSize: '13px', color: '#CCC' },
};

export default function HRReports() {
  const [employees, setEmployees] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/employees'),
      api.get('/payroll'),
      api.get('/attendance/summary'),
      api.get('/employees/stats'),
    ])
      .then(([eRes, pRes, aRes, sRes]) => {
        setEmployees(eRes.data);
        setPayroll(pRes.data);
        setAttendance(aRes.data);
        setSummary(sRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Loading reports...</p>;

  // Department breakdown
  const deptMap = {};
  employees.forEach((e) => {
    deptMap[e.department] = (deptMap[e.department] || 0) + 1;
  });
  const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

  // Payroll by employee
  const payrollChart = payroll.slice(0, 8).map((p) => ({
    name: p.employeeName?.split(' ')[0] || p.employeeId,
    'Net Pay': p.netPay,
    'Gross Pay': p.basicPay + p.overtime + p.allowances,
  }));

  // Attendance chart
  const attChart = attendance.map((a) => ({
    name: a.employeeName?.split(' ')[0] || a.employeeId,
    Present: a.present,
    Absent: a.absent,
    Late: a.late,
  }));

  const empColumns = [
    { key: 'id', label: 'ID', width: '70px' },
    { key: 'firstName', label: 'Name', render: (_, r) => `${r.firstName} ${r.lastName}` },
    { key: 'department', label: 'Department' },
    { key: 'position', label: 'Position' },
    { key: 'hireDate', label: 'Hire Date' },
    { key: 'salary', label: 'Salary', render: (v) => `₱${Number(v).toLocaleString()}` },
    { key: 'status', label: 'Status', render: (v) => <Badge value={v} /> },
  ];

  const payColumns = [
    { key: 'employeeName', label: 'Employee' },
    { key: 'period', label: 'Period' },
    { key: 'basicPay', label: 'Basic', render: (v) => `₱${Number(v).toLocaleString()}` },
    { key: 'netPay', label: 'Net Pay', render: (v) => <strong style={{ color: '#4caf50' }}>₱{Number(v).toLocaleString()}</strong> },
    { key: 'status', label: 'Status', render: (v) => <Badge value={v} /> },
  ];

  return (
    <div>
      <PageHeader title="HR Reports" subtitle="Employee and payroll analytics for management review" />

      {/* KPIs */}
      {summary && (
        <div style={styles.cardRow}>
          <StatCard title="Total Employees" value={summary.totalEmployees} icon={<Icon.TotalEmployees size={20} color="#1565c0" />} color="#1565c0" />
          <StatCard title="Active" value={summary.activeEmployees} icon={<Icon.ActiveEmployees size={20} color="#2e7d32" />} color="#2e7d32" />
          <StatCard title="Departments" value={summary.departments} icon={<Icon.Departments size={20} color="#e63946" />} color="#e63946" />
          <StatCard title="Recent Hires" value={summary.recentHires} icon={<Icon.NewHire size={20} color="#f57f17" />} color="#f57f17" />
        </div>
      )}

      {/* Charts Row */}
      <div style={styles.chartRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Employees by Department</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={deptData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color: '#CCC' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Payroll Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={payrollChart}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} {...tooltipStyle} />
              <Legend wrapperStyle={{ color: '#CCC' }} />
              <Bar dataKey="Gross Pay" fill="#1565c0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Net Pay" fill="#2e7d32" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {attChart.length > 0 && (
        <div style={styles.fullChart}>
          <h3 style={styles.chartTitle}>Attendance Summary</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={attChart}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis tick={{ fontSize: 12, fill: '#888' }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color: '#CCC' }} />
              <Bar dataKey="Present" fill="#2e7d32" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Late" fill="#f57f17" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Absent" fill="#e63946" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tables */}
      <div style={styles.tableSection}>
        <h3 style={styles.tableTitle}>Employee List</h3>
        <Table columns={empColumns} data={employees} />
      </div>
      <div style={{ height: '20px' }} />
      <div style={styles.tableSection}>
        <h3 style={styles.tableTitle}>Payroll Records</h3>
        <Table columns={payColumns} data={payroll} />
      </div>
    </div>
  );
}

const styles = {
  cardRow: { display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' },
  chartRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  chartCard: { background: '#1a1a1a', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', border: '1px solid #333333' },
  fullChart: { background: '#1a1a1a', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', border: '1px solid #333333', marginBottom: '20px' },
  chartTitle: { margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#FFFFFF' },
  tableSection: {},
  tableTitle: { fontSize: '15px', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' },
};
