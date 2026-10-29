import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import Icon from '../../components/common/Icons';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#2e7d32', '#e63946', '#1565c0', '#f57f17', '#6a1b9a'];

const tooltipStyle = {
  contentStyle: {
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#222',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    fontSize: '13px',
    color: '#CCC',
  },
};

export default function AccountingDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/accounting/stats'),
      api.get('/accounting/transactions'),
      api.get('/accounting/sales'),
      api.get('/accounting/payments'),
    ])
      .then(([sRes, tRes, saRes, pRes]) => {
        setStats(sRes.data);
        setTransactions(tRes.data);
        setSales(saRes.data);
        setPayments(pRes.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load accounting dashboard data.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  // Sales trend chart data
  const salesChart = sales.map((s) => ({ date: s.date.slice(5), Sales: s.totalAmount }));

  // Income vs Expense by category
  const catMap = {};
  transactions.forEach((t) => {
    catMap[t.category] = catMap[t.category] || { category: t.category, Income: 0, Expense: 0 };
    catMap[t.category][t.type === 'income' ? 'Income' : 'Expense'] += t.amount;
  });
  const catChart = Object.values(catMap);

  // Payment status pie
  const pendingPay   = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const completedPay = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const payPie = [
    { name: 'Completed', value: completedPay },
    { name: 'Pending',   value: pendingPay   },
  ];

  // Recent transactions
  const recentTxn = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const quickActions = [
    { label: 'Add Transaction',    NavIcon: Icon.Add,          path: '/accounting/transactions' },
    { label: 'View Sales',         NavIcon: Icon.Sales,         path: '/accounting/sales'        },
    { label: 'Payment Records',    NavIcon: Icon.Payments,      path: '/accounting/payments'     },
    { label: 'Financial Summary',  NavIcon: Icon.Financial,     path: '/accounting/summary'      },
    { label: 'Reports',            NavIcon: Icon.Reports,       path: '/accounting/reports'      },
  ];

  return (
    <div>
      <PageHeader
        title="Accounting Dashboard"
        subtitle="Financial overview and key metrics"
      />

      {/* KPI Cards */}
      {stats && (
        <div style={styles.cardRow}>
          <StatCard
            title="Total Income"
            value={`₱${stats.totalIncome.toLocaleString()}`}
            icon={<Icon.Income size={20} color="#2e7d32" />}
            color="#2e7d32"
          />
          <StatCard
            title="Total Expenses"
            value={`₱${stats.totalExpenses.toLocaleString()}`}
            icon={<Icon.Expense size={20} color="#c62828" />}
            color="#c62828"
          />
          <StatCard
            title="Net Profit"
            value={`₱${stats.netProfit.toLocaleString()}`}
            icon={<Icon.Profit size={20} color={stats.netProfit >= 0 ? '#1565c0' : '#c62828'} />}
            color={stats.netProfit >= 0 ? '#1565c0' : '#c62828'}
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={<Icon.Pending size={20} color="#f57f17" />}
            color="#f57f17"
          />
        </div>
      )}

      {/* Charts Row */}
      <div style={styles.chartRow2}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Daily Sales Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salesChart}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2e7d32" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2e7d32" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} {...tooltipStyle} />
              <Area type="monotone" dataKey="Sales" stroke="#2e7d32" fill="url(#salesGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Payment Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={payPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35}>
                <Cell fill="#2e7d32" />
                <Cell fill="#f57f17" />
              </Pie>
              <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#CCC' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Bar Chart */}
      {catChart.length > 0 && (
        <div style={{ ...styles.chartCard, marginBottom: '16px' }}>
          <h3 style={styles.chartTitle}>Income vs Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catChart} barSize={14}>
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#CCC' }} />
              <Bar dataKey="Income"  fill="#2e7d32" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Expense" fill="#e63946" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Transactions + Quick Actions */}
      <div style={styles.bottomRow}>
        <div style={styles.recentCard}>
          <h3 style={styles.chartTitle}>Recent Transactions</h3>
          {recentTxn.length === 0 && <p style={styles.noData}>No transactions found.</p>}
          {recentTxn.map((t) => (
            <div key={t.id} style={styles.txnRow}>
              <div style={{
                ...styles.txnDot,
                background: t.type === 'income' ? '#2e7d32' : '#e63946',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.txnDesc}>{t.description}</div>
                <div style={styles.txnMeta}>{t.category} · {t.date}</div>
              </div>
              <div style={{ ...styles.txnAmt, color: t.type === 'income' ? '#4caf50' : '#ef5350' }}>
                {t.type === 'income' ? '+' : '-'}₱{t.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.quickCard}>
          <h3 style={styles.chartTitle}>Quick Actions</h3>
          <div style={styles.quickGrid}>
            {quickActions.map((q) => (
              <button key={q.path} style={styles.qBtn} onClick={() => navigate(q.path)}>
                <div style={styles.qIconWrap}>
                  <q.NavIcon size={16} color="#888" />
                </div>
                <span style={styles.qLabel}>{q.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loading: { padding: '40px', textAlign: 'center', color: '#888', fontSize: '14px' },
  cardRow: { display: 'flex', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' },
  chartRow2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  chartCard: { background: '#1a1a1a', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.4)', border: '1px solid #333333' },
  chartTitle: { margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.1px' },
  bottomRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  recentCard: { background: '#1a1a1a', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.4)', border: '1px solid #333333' },
  noData: { textAlign: 'center', color: '#666', padding: '20px 0', fontSize: '13px' },
  txnRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #2a2a2a' },
  txnDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  txnDesc: { fontSize: '13px', fontWeight: 500, color: '#CCCCCC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  txnMeta: { fontSize: '11px', color: '#666', marginTop: '2px' },
  txnAmt: { fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 },
  quickCard: { background: '#1a1a1a', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.4)', border: '1px solid #333333' },
  quickGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  qBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    background: '#222222',
    border: '1px solid #333333',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  qIconWrap: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: '#2a2a2a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  qLabel: { fontSize: '12px', fontWeight: 600, color: '#CCCCCC', textAlign: 'left', lineHeight: 1.3 },
};
