import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Btn from '../../components/common/Btn';
import Modal from '../../components/common/Modal';
import StatCard from '../../components/common/StatCard';
import Icon from '../../components/common/Icons';

const CATEGORIES = ['Food Cost', 'Utilities', 'Payroll', 'Supplies', 'Rent', 'Marketing', 'Maintenance', 'Other'];
const METHODS = ['Cash', 'Bank Transfer', 'Online Banking', 'Check', 'Credit Card'];
const EMPTY_FORM = { date: '', payee: '', method: 'Cash', amount: '', category: '', reference: '' };

export default function PaymentRecords() {
  const { toast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterCat) params.append('category', filterCat);
      const res = await api.get(`/accounting/payments?${params}`);
      setPayments(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus, filterCat]);

  const totalPaid = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/accounting/payments', form);
      toast.success('Payment recorded successfully.');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment.');
    } finally { setSaving(false); }
  };

  const handleMarkCompleted = async (id) => {
    try {
      await api.patch(`/accounting/payments/${id}/status`, { status: 'completed' });
      toast.success('Payment marked as completed.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update payment status.');
    }
  };

  const columns = [
    { key: 'date', label: 'Date', width: '105px' },
    { key: 'payee', label: 'Payee' },
    { key: 'category', label: 'Category' },
    { key: 'method', label: 'Method' },
    { key: 'amount', label: 'Amount', render: (v) => <span style={{ fontWeight: 700, color: '#ef5350' }}>₱{Number(v).toLocaleString()}</span> },
    { key: 'reference', label: 'Reference', width: '110px' },
    { key: 'status', label: 'Status', render: (v) => <Badge value={v} /> },
    {
      key: 'actions', label: 'Actions', render: (_, row) => (
        row.status === 'pending'
          ? <Btn small variant="success" onClick={() => handleMarkCompleted(row.id)}>Mark Completed</Btn>
          : <span style={{ color: '#666', fontSize: '12px' }}>Completed</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payment Records"
        subtitle="Review and manage all recorded payments"
        actions={<Btn onClick={() => { setForm(EMPTY_FORM); setModalOpen(true); }}><Icon.Add size={15} color="#fff" /> Add Payment</Btn>}
      />

      <div style={styles.cardRow}>
        <StatCard title="Total Paid" value={`₱${totalPaid.toLocaleString()}`} icon={<Icon.ActiveEmployees size={20} color="#2e7d32" />} color="#2e7d32" />
        <StatCard title="Pending Amount" value={`₱${totalPending.toLocaleString()}`} icon={<Icon.Pending size={20} color="#f57f17" />} color="#f57f17" />
        <StatCard title="Total Payments" value={payments.length} icon={<Icon.Payments size={20} color="#1565c0" />} color="#1565c0" />
        <StatCard title="Pending Count" value={payments.filter((p) => p.status === 'pending').length} icon={<Icon.Pending size={20} color="#c62828" />} color="#c62828" />
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <select style={styles.sel} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
        <select style={styles.sel} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <Btn variant="secondary" small onClick={() => { setFilterStatus(''); setFilterCat(''); }}>Clear</Btn>
      </div>

      {loading ? <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p> : <Table columns={columns} data={payments} />}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record New Payment" width="520px">
        <form onSubmit={handleAddPayment} style={styles.mForm}>
          <div style={styles.row2}>
            <FField label="Date *">
              <input style={styles.inp} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </FField>
            <FField label="Amount (₱) *">
              <input style={styles.inp} type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </FField>
          </div>
          <FField label="Payee *">
            <input style={styles.inp} value={form.payee} onChange={(e) => setForm({ ...form, payee: e.target.value })} placeholder="Enter payee name" required />
          </FField>
          <div style={styles.row2}>
            <FField label="Category *">
              <select style={styles.inp} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FField>
            <FField label="Payment Method">
              <select style={styles.inp} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </FField>
          </div>
          <FField label="Reference">
            <input style={styles.inp} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. PAY-001" />
          </FField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <Btn variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Record Payment'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const FField = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
    <label style={{ fontSize: '13px', fontWeight: 600, color: '#CCCCCC' }}>{label}</label>
    {children}
  </div>
);

const styles = {
  cardRow: { display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' },
  filters: { display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' },
  sel: { padding: '9px 12px', border: '1.5px solid #333333', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#1e1e1e', color: '#FFFFFF' },
  mForm: { display: 'flex', flexDirection: 'column', gap: '14px' },
  row2: { display: 'flex', gap: '12px' },
  inp: { padding: '9px 12px', border: '1.5px solid #333333', borderRadius: '7px', fontSize: '14px', outline: 'none', background: '#1e1e1e', color: '#FFFFFF' },
};
