import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import Icon from '../../components/common/Icons';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#8B1A1A', '#2e7d32', '#f57f17', '#1565c0'];

export default function HRDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [payrollSummary, setPayrollSummary] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, payrollRes, attRes] = await Promise.all([
          api.get('/employees/stats'),
          api.get('/payroll/summary'),
          api.get('/attendance/summary'),
        ]);
        setStats(statsRes.data);
        setPayrollSummary(payrollRes.data);
        setAttendanceSummary(attRes.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  const attChartData = attendanceSummary.map((a) => ({
    name: a.employeeName.split(' ')[0],
    Present: a.present,
    Absent: a.absent,
    Late: a.late,
  }));

  const payrollPie = payrollSummary
    ? [
        { name: 'Gross Pay', value: payrollSummary.totalGross },
        { name: 'Deductions', value: payrollSummary.totalDeductions },
      ]
    : [];

  const quickActions = [
    { label: 'Add Employee',      Icon: Icon.Add,        path: '/hr/employees'  },
    { label: 'Record Attendance', Icon: Icon.Attendance,  path: '/hr/attendance' },
    { label: 'Manage Schedule',   Icon: Icon.Schedule,    path: '/hr/scheduling' },
    { label: 'Process Payroll',   Icon: Icon.Payroll,     path: '/hr/payroll'    },
    { label: 'View Reports',      Icon: Icon.Reports,     path: '/hr/reports'    },
  ];

  const tooltipStyle = {
    contentStyle: {
      borderRadius: '8px',
      border: '1px solid #333',
      background: '#222222',
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      fontSize: '13px',
      color: '#CCCCCC',
    },
  };

  return (
    <div>
      <PageHeader
        title="HR Dashboard"
        subtitle="Overview of employee metrics and HR activity"
      />

      {/* Employee Stat Cards */}
      <div style={styles.cardRow}>
        <StatCard
          title="Total Employees"
          value={stats?.totalEmployees ?? 0}
          icon={<Icon.TotalEmployees size={20} color="#1565c0" />}
          color="#1565c0"
        />
        <StatCard
          title="Active Employees"
          value={stats?.activeEmployees ?? 0}
          icon={<Icon.ActiveEmployees size={20} color="#2e7d32" />}
          color="#2e7d32"
        />
        <StatCard
          title="Departments"
          value={stats?.departments ?? 0}
          icon={<Icon.Departments size={20} color="#8B1A1A" />}
          color="#8B1A1A"
        />
        <StatCard
          title="Recent Hires"
          value={stats?.recentHires ?? 0}
          icon={<Icon.NewHire size={20} color="#f57f17" />}
          color="#f57f17"
          subtitle="Last 3 months"
        />
      </div>

      {/* Payroll Stat Cards */}
      {payrollSummary && (
        <div style={styles.cardRow}>
          <StatCard
            title="Total Gross Pay"
            value={`₱${payrollSummary.totalGross.toLocaleString()}`}
            icon={<Icon.GrossPay size={20} color="#1565c0" />}
            color="#1565c0"
          />
          <StatCard
            title="Total Deductions"
            value={`₱${payrollSummary.totalDeductions.toLocaleString()}`}
            icon={<Icon.Deductions size={20} color="#8B1A1A" />}
            color="#8B1A1A"
          />
          <StatCard
            title="Total Net Pay"
            value={`₱${payrollSummary.totalNetPay.toLocaleString()}`}
            icon={<Icon.NetPay size={20} color="#2e7d32" />}
            color="#2e7d32"
          />
          <StatCard
            title="Pending Payroll"
            value={payrollSummary.pendingCount}
            icon={<Icon.Pending size={20} color="#f57f17" />}
            color="#f57f17"
          />
        </div>
      )}

      {/* Charts */}
      <div style={styles.chartRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Attendance Overview</h3>
          {attChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attChartData} barSize={14}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#CCC' }} />
                <Bar dataKey="Present" fill="#2e7d32" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Late"    fill="#f57f17" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Absent"  fill="#8B1A1A" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={styles.noData}>No attendance data available.</p>
          )}
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Payroll Breakdown</h3>
          {payrollPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={payrollPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                >
                  {payrollPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `₱${v.toLocaleString()}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #333', background: '#222', fontSize: '13px', color: '#CCC' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#CCC' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={styles.noData}>No payroll data available.</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickLinks}>
        <h3 style={styles.sectionTitle}>Quick Actions</h3>
        <div style={styles.linkGrid}>
          {quickActions.map((item) => (
            <button key={item.path} style={styles.linkBtn} onClick={() => navigate(item.path)}>
              <div style={styles.linkIconWrap}>
                <item.Icon size={18} color="#888" />
              </div>
              <span style={styles.linkLabel}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  loading: { padding: '40px', textAlign: 'center', color: '#888', fontSize: '14px' },
  cardRow: { display: 'flex', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' },
  chartRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  chartCard: {
    background: '#1a1a1a',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
    border: '1px solid #333333',
  },
  chartTitle: { margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.1px' },
  sectionTitle: { margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.1px' },
  noData: { textAlign: 'center', color: '#666', padding: '40px 0', fontSize: '13px' },
  quickLinks: {
    background: '#1a1a1a',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
    border: '1px solid #333333',
  },
  linkGrid: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  linkBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    background: '#222222',
    border: '1px solid #333333',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  linkIconWrap: {
    width: '32px',
    height: '32px',
    borderRadius: '7px',
    background: '#2a2a2a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  linkLabel: { fontSize: '13px', fontWeight: 600, color: '#CCCCCC', whiteSpace: 'nowrap' },
};
