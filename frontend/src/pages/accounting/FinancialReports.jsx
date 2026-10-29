import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Btn from '../../components/common/Btn';
import Icon from '../../components/common/Icons';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#2e7d32', '#e63946', '#1565c0', '#f57f17', '#6a1b9a'];

const tooltipStyle = {
  contentStyle: { borderRadius: '8px', border: '1px solid #333', background: '#222', fontSize: '13px', color: '#CCC' },
};

export default function FinancialReports() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      api.get('/accounting/summary'),
      api.get('/accounting/transactions'),
      api.get('/accounting/sales'),
      api.get('/accounting/payments'),
    ])
      .then(([sRes, tRes, saRes, pRes]) => {
        setSummary(sRes.data);
        setTransactions(tRes.data);
        setSales(saRes.data);
        setPayments(pRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Generating reports...</p>;

  // Monthly sales aggregation
  const salesByDay = sales.map((s) => ({ date: s.date.slice(5), Revenue: s.totalAmount, Orders: s.ordersCount }));

  // Income vs expense chart
  const dayMap = {};
  transactions.forEach((t) => {
    dayMap[t.date] = dayMap[t.date] || { date: t.date.slice(5), Income: 0, Expense: 0 };
    if (t.type === 'income') dayMap[t.date].Income += t.amount;
    else dayMap[t.date].Expense += t.amount;
  });
  const incExpData = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

  // Category pie
  const catMap = {};
  transactions.filter((t) => t.type === 'expense').forEach((t) => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const expensePie = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  // Payment method breakdown
  const methodMap = {};
  payments.forEach((p) => { methodMap[p.method] = (methodMap[p.method] || 0) + p.amount; });
  const methodData = Object.entries(methodMap).map(([name, value]) => ({ name, value }));

  const profitMargin = summary.totalIncome > 0 ? ((summary.netProfit / summary.totalIncome) * 100).toFixed(1) : 0;

  const txnColumns = [
    { key: 'date', label: 'Date', width: '100px' },
    { key: 'type', label: 'Type', render: (v) => <Badge value={v} /> },
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description' },
    { key: 'reference', label: 'Reference', width: '115px' },
    {
      key: 'amount', label: 'Amount', render: (v, row) => (
        <span style={{ fontWeight: 700, color: row.type === 'income' ? '#4caf50' : '#ef5350' }}>
          {row.type === 'income' ? '+' : '-'}₱{Number(v).toLocaleString()}
        </span>
      ),
    },
  ];

  const salesColumns = [
    { key: 'date', label: 'Date' },
    { key: 'type', label: 'Type' },
    { key: 'ordersCount', label: 'Orders' },
    { key: 'avgOrderValue', label: 'Avg. Order', render: (v) => `₱${Number(v).toFixed(2)}` },
    { key: 'totalAmount', label: 'Revenue', render: (v) => <strong style={{ color: '#4caf50' }}>₱{Number(v).toLocaleString()}</strong> },
    { key: 'posRef', label: 'POS Ref' },
  ];

  const payColumns = [
    { key: 'date', label: 'Date' },
    { key: 'payee', label: 'Payee' },
    { key: 'category', label: 'Category' },
    { key: 'method', label: 'Method' },
    { key: 'amount', label: 'Amount', render: (v) => <span style={{ color: '#ef5350', fontWeight: 700 }}>₱{Number(v).toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge value={v} /> },
  ];

  const TABS = [
    { key: 'overview',      label: 'Overview'      },
    { key: 'transactions',  label: 'Transactions'  },
    { key: 'sales',         label: 'Sales'         },
    { key: 'payments',      label: 'Payments'      },
  ];

  return (
    <div>
      <PageHeader
        title="Financial Reports"
        subtitle="Generate and review detailed financial reports"
        actions={<Btn onClick={() => window.print()}><Icon.Download size={14} color="#fff" /> Print Report</Btn>}
      />

      {/* KPI Cards */}
      <div style={styles.cardRow}>
        <StatCard title="Total Income" value={`₱${summary.totalIncome.toLocaleString()}`} icon={<Icon.Income size={20} color="#2e7d32" />} color="#2e7d32" />
        <StatCard title="Total Expenses" value={`₱${summary.totalExpenses.toLocaleString()}`} icon={<Icon.Expense size={20} color="#c62828" />} color="#c62828" />
        <StatCard title="Net Profit" value={`₱${summary.netProfit.toLocaleString()}`} icon={<Icon.Profit size={20} color={summary.netProfit >= 0 ? '#1565c0' : '#c62828'} />} color={summary.netProfit >= 0 ? '#1565c0' : '#c62828'} />
        <StatCard title="Profit Margin" value={`${profitMargin}%`} icon={<Icon.Reports size={20} color="#f57f17" />} color="#f57f17" />
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            style={{ ...styles.tab, ...(activeTab === t.key ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div style={styles.chartRow}>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Income vs Expenses by Day</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={incExpData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} {...tooltipStyle} />
                  <Legend wrapperStyle={{ color: '#CCC' }} />
                  <Bar dataKey="Income" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" fill="#e63946" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Expense by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={expensePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {expensePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} {...tooltipStyle} />
                  <Legend wrapperStyle={{ color: '#CCC' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={styles.chartRow}>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Daily Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={salesByDay}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} {...tooltipStyle} />
                  <Line type="monotone" dataKey="Revenue" stroke="#1565c0" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Payment Method Breakdown</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={methodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                    {methodData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} {...tooltipStyle} />
                  <Legend wrapperStyle={{ color: '#CCC' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Table */}
          <div style={styles.summaryBox}>
            <h3 style={styles.chartTitle}>Financial Summary by Category</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Category', 'Type', 'Total Amount'].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary.byCategory || {}).map(([cat, val], i) => (
                  <>
                    {val.income > 0 && (
                      <tr key={`${cat}-inc`}>
                        <td style={styles.td}>{cat}</td>
                        <td style={styles.td}><Badge value="income" /></td>
                        <td style={{ ...styles.td, color: '#4caf50', fontWeight: 700 }}>₱{val.income.toLocaleString()}</td>
                      </tr>
                    )}
                    {val.expense > 0 && (
                      <tr key={`${cat}-exp`}>
                        <td style={styles.td}>{cat}</td>
                        <td style={styles.td}><Badge value="expense" /></td>
                        <td style={{ ...styles.td, color: '#ef5350', fontWeight: 700 }}>₱{val.expense.toLocaleString()}</td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div style={styles.tableWrap}>
          <h3 style={styles.tableTitle}>All Financial Transactions ({transactions.length})</h3>
          <Table columns={txnColumns} data={transactions} />
        </div>
      )}

      {activeTab === 'sales' && (
        <div style={styles.tableWrap}>
          <h3 style={styles.tableTitle}>All Sales Records ({sales.length})</h3>
          <Table columns={salesColumns} data={sales} />
        </div>
      )}

      {activeTab === 'payments' && (
        <div style={styles.tableWrap}>
          <h3 style={styles.tableTitle}>All Payment Records ({payments.length})</h3>
          <Table columns={payColumns} data={payments} />
        </div>
      )}
    </div>
  );
}

const styles = {
  cardRow: { display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '20px', background: '#1a1a1a', padding: '4px', borderRadius: '10px', width: 'fit-content', border: '1px solid #333333' },
  tab: { padding: '8px 18px', borderRadius: '7px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#888' },
  tabActive: { background: '#2a2a2a', color: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' },
  chartRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  chartCard: { background: '#1a1a1a', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', border: '1px solid #333333' },
  chartTitle: { margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: '#FFFFFF' },
  summaryBox: { background: '#1a1a1a', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', border: '1px solid #333333', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 14px', background: '#222222', fontSize: '12px', fontWeight: 700, color: '#888', textAlign: 'left', textTransform: 'uppercase', borderBottom: '2px solid #333333' },
  td: { padding: '10px 14px', fontSize: '14px', color: '#CCCCCC', borderBottom: '1px solid #2a2a2a' },
  tableWrap: {},
  tableTitle: { fontSize: '15px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' },
};
