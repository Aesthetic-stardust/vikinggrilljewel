import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Icon from '../../components/common/Icons';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, AreaChart, Area,
} from 'recharts';

const INCOME_COLOR = '#2e7d32';
const EXPENSE_COLOR = '#e63946';
const COLORS = ['#e63946', '#2e7d32', '#1565c0', '#f57f17', '#6a1b9a', '#00838f'];

const tooltipStyle = {
  contentStyle: { borderRadius: '8px', border: '1px solid #333', background: '#222', fontSize: '13px', color: '#CCC' },
};

export default function FinancialSummary() {
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/accounting/summary'),
      api.get('/accounting/sales'),
      api.get('/accounting/transactions'),
    ])
      .then(([sRes, saRes, tRes]) => {
        setSummary(sRes.data);
        setSales(saRes.data);
        setTransactions(tRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Loading summary...</p>;

  // Category breakdown for pie
  const catData = Object.entries(summary.byCategory || {}).map(([cat, val]) => ({
    name: cat,
    Income: val.income,
    Expense: val.expense,
  }));

  const incomeCategories = catData.filter((c) => c.Income > 0).map((c) => ({ name: c.name, value: c.Income }));
  const expenseCategories = catData.filter((c) => c.Expense > 0).map((c) => ({ name: c.name, value: c.Expense }));

  // Sales trend
  const salesTrend = sales.map((s) => ({ date: s.date.slice(5), Revenue: s.totalAmount }));

  // Net daily (income - expense per day grouped)
  const dayMap = {};
  transactions.forEach((t) => {
    dayMap[t.date] = dayMap[t.date] || { date: t.date.slice(5), Income: 0, Expense: 0 };
    if (t.type === 'income') dayMap[t.date].Income += t.amount;
    else dayMap[t.date].Expense += t.amount;
  });
  const dailyData = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

  const profitMargin = summary.totalIncome > 0 ? ((summary.netProfit / summary.totalIncome) * 100).toFixed(1) : 0;

  return (
    <div>
      <PageHeader title="Financial Summary" subtitle="Overall financial performance overview" />

      {/* KPIs */}
      <div style={styles.cardRow}>
        <StatCard title="Total Income" value={`₱${summary.totalIncome.toLocaleString()}`} icon={<Icon.Income size={20} color={INCOME_COLOR} />} color={INCOME_COLOR} />
        <StatCard title="Total Expenses" value={`₱${summary.totalExpenses.toLocaleString()}`} icon={<Icon.Expense size={20} color={EXPENSE_COLOR} />} color={EXPENSE_COLOR} />
        <StatCard title="Net Profit" value={`₱${summary.netProfit.toLocaleString()}`} icon={<Icon.Profit size={20} color={summary.netProfit >= 0 ? '#1565c0' : '#c62828'} />} color={summary.netProfit >= 0 ? '#1565c0' : '#c62828'} />
        <StatCard title="Profit Margin" value={`${profitMargin}%`} icon={<Icon.Reports size={20} color="#f57f17" />} color="#f57f17" subtitle={summary.netProfit >= 0 ? 'Profitable' : 'Loss'} />
      </div>
      <div style={styles.cardRow}>
        <StatCard title="Total Sales" value={`₱${summary.totalSales.toLocaleString()}`} icon={<Icon.Sales size={20} color="#1565c0" />} color="#1565c0" />
        <StatCard title="Total Payments" value={`₱${summary.totalPayments.toLocaleString()}`} icon={<Icon.Payments size={20} color="#c62828" />} color="#c62828" />
      </div>

      {/* Income vs Expense Area Chart */}
      <div style={{ ...styles.chartCard, marginBottom: '20px' }}>
        <h3 style={styles.chartTitle}>Daily Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={INCOME_COLOR} stopOpacity={0.25} />
                <stop offset="95%" stopColor={INCOME_COLOR} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={EXPENSE_COLOR} stopOpacity={0.25} />
                <stop offset="95%" stopColor={EXPENSE_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} />
            <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} {...tooltipStyle} />
            <Legend wrapperStyle={{ color: '#CCC' }} />
            <Area type="monotone" dataKey="Income" stroke={INCOME_COLOR} fill="url(#incGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="Expense" stroke={EXPENSE_COLOR} fill="url(#expGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Charts */}
      <div style={styles.chartRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Income Breakdown</h3>
          {incomeCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={incomeCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {incomeCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} {...tooltipStyle} />
                <Legend wrapperStyle={{ color: '#CCC' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={styles.empty}>No income data.</p>}
        </div>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Expense Breakdown</h3>
          {expenseCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={expenseCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {expenseCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} {...tooltipStyle} />
                <Legend wrapperStyle={{ color: '#CCC' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={styles.empty}>No expense data.</p>}
        </div>
      </div>

      {/* Category Table */}
      <div style={styles.tableCard}>
        <h3 style={styles.chartTitle}>Summary by Category</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              {['Category', 'Income', 'Expense', 'Net'].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {catData.length === 0 ? (
              <tr><td colSpan={4} style={styles.empty}>No data.</td></tr>
            ) : catData.map((c, i) => {
              const net = c.Income - c.Expense;
              return (
                <tr key={i}>
                  <td style={styles.td}><strong>{c.name}</strong></td>
                  <td style={{ ...styles.td, color: '#4caf50', fontWeight: 600 }}>₱{c.Income.toLocaleString()}</td>
                  <td style={{ ...styles.td, color: '#ef5350', fontWeight: 600 }}>₱{c.Expense.toLocaleString()}</td>
                  <td style={{ ...styles.td, color: net >= 0 ? '#42a5f5' : '#ef5350', fontWeight: 700 }}>
                    {net >= 0 ? '+' : ''}₱{net.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  cardRow: { display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' },
  chartRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  chartCard: { background: '#1a1a1a', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', border: '1px solid #333333' },
  chartTitle: { margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: '#FFFFFF' },
  tableCard: { background: '#1a1a1a', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', border: '1px solid #333333', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 14px', background: '#222222', fontSize: '12px', fontWeight: 700, color: '#888', textAlign: 'left', textTransform: 'uppercase', borderBottom: '2px solid #333333' },
  td: { padding: '10px 14px', fontSize: '14px', color: '#CCCCCC', borderBottom: '1px solid #2a2a2a' },
  empty: { padding: '24px', textAlign: 'center', color: '#666', fontSize: '14px' },
};
