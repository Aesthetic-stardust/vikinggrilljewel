import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import StatCard from '../../components/common/StatCard';
import Btn from '../../components/common/Btn';
import Icon from '../../components/common/Icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';

const tooltipStyle = {
  contentStyle: { borderRadius: '8px', border: '1px solid #333', background: '#222', fontSize: '13px', color: '#CCC' },
};

export default function SalesRecords() {
  const { toast } = useToast();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const res = await api.get(`/accounting/sales?${params}`);
      setSales(res.data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load sales records.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterType, startDate, endDate]);

  const totalRevenue = sales.reduce((s, r) => s + r.totalAmount, 0);
  const totalOrders = sales.reduce((s, r) => s + r.ordersCount, 0);
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Charts
  const trendData = sales.map((s) => ({ date: s.date.slice(5), Revenue: s.totalAmount, Orders: s.ordersCount }));
  const typeMap = {};
  sales.forEach((s) => { typeMap[s.type] = (typeMap[s.type] || 0) + s.totalAmount; });
  const typeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  const columns = [
    { key: 'date', label: 'Date', width: '110px' },
    { key: 'type', label: 'Type', render: (v) => <span style={{ background: v === 'Dine-in' ? 'rgba(21,101,192,0.15)' : 'rgba(106,27,154,0.15)', color: v === 'Dine-in' ? '#42a5f5' : '#ba68c8', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{v}</span> },
    { key: 'ordersCount', label: 'Orders', render: (v) => v.toLocaleString() },
    { key: 'avgOrderValue', label: 'Avg. Order', render: (v) => `₱${Number(v).toFixed(2)}` },
    { key: 'totalAmount', label: 'Total Revenue', render: (v) => <strong style={{ color: '#4caf50' }}>₱{Number(v).toLocaleString()}</strong> },
    { key: 'posRef', label: 'POS Reference' },
  ];

  return (
    <div>
      <PageHeader title="Sales Records" subtitle="Review sales data received from POS system" />

      <div style={styles.cardRow}>
        <StatCard title="Total Revenue" value={`₱${totalRevenue.toLocaleString()}`} icon={<Icon.Income size={20} color="#2e7d32" />} color="#2e7d32" />
        <StatCard title="Total Orders" value={totalOrders.toLocaleString()} icon={<Icon.Sales size={20} color="#1565c0" />} color="#1565c0" />
        <StatCard title="Avg. Order Value" value={`₱${avgOrder.toFixed(2)}`} icon={<Icon.Reports size={20} color="#f57f17" />} color="#f57f17" />
        <StatCard title="Records" value={sales.length} icon={<Icon.Attendance size={20} color="#e63946" />} color="#e63946" />
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <select style={styles.sel} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="Dine-in">Dine-in</option>
          <option value="Takeout">Takeout</option>
        </select>
        <input style={styles.dateInput} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start date" />
        <input style={styles.dateInput} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End date" />
        <Btn variant="secondary" small onClick={() => { setFilterType(''); setStartDate(''); setEndDate(''); }}>Clear</Btn>
      </div>

      {/* Charts */}
      <div style={styles.chartRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} {...tooltipStyle} />
              <Line type="monotone" dataKey="Revenue" stroke="#2e7d32" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Revenue by Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} {...tooltipStyle} />
              <Bar dataKey="value" fill="#1565c0" radius={[6, 6, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {loading ? <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p> : <Table columns={columns} data={sales} />}
    </div>
  );
}

const styles = {
  cardRow: { display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' },
  filters: { display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' },
  sel: { padding: '9px 12px', border: '1.5px solid #333333', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#1e1e1e', color: '#FFFFFF' },
  dateInput: { padding: '9px 12px', border: '1.5px solid #333333', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#1e1e1e', color: '#FFFFFF' },
  chartRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  chartCard: { background: '#1a1a1a', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', border: '1px solid #333333' },
  chartTitle: { margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: '#FFFFFF' },
};
