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

const EMPTY_FORM = { date: '', type: 'income', category: '', description: '', amount: '', reference: '' };
const CATEGORIES = ['Sales', 'Supplies', 'Utilities', 'Payroll', 'Rent', 'Marketing', 'Maintenance', 'Other'];

export default function FinancialTransactions() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterCat) params.append('category', filterCat);
      const res = await api.get(`/accounting/transactions?${params}`);
      setTransactions(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterType, filterCat]);

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    return !q || t.description.toLowerCase().includes(q) || t.reference.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (txn) => {
    setEditTarget(txn);
    setForm({ date: txn.date, type: txn.type, category: txn.category, description: txn.description, amount: txn.amount, reference: txn.reference });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        await api.put(`/accounting/transactions/${editTarget.id}`, form);
        toast.success('Transaction updated.');
      } else {
        await api.post('/accounting/transactions', form);
        toast.success('Transaction added.');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/accounting/transactions/${id}`);
      toast.success('Transaction deleted.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete transaction.');
    }
  };

  const columns = [
    { key: 'date', label: 'Date', width: '100px' },
    { key: 'type', label: 'Type', render: (v) => <Badge value={v} /> },
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description' },
    { key: 'reference', label: 'Reference', width: '120px' },
    {
      key: 'amount', label: 'Amount', render: (v, row) => (
        <span style={{ fontWeight: 700, color: row.type === 'income' ? '#4caf50' : '#ef5350' }}>
          {row.type === 'income' ? '+' : '-'}₱{Number(v).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions', render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Btn small variant="outline" onClick={() => openEdit(row)}>Edit</Btn>
          <Btn small variant="danger" onClick={() => handleDelete(row.id)}>Delete</Btn>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Financial Transactions"
        subtitle="Manage all income and expense transactions"
        actions={<Btn onClick={openCreate}><Icon.Add size={15} color="#fff" /> Add Transaction</Btn>}
      />

      {/* Summary Cards */}
      <div style={styles.cardRow}>
        <StatCard title="Total Income" value={`₱${totalIncome.toLocaleString()}`} icon={<Icon.Income size={20} color="#2e7d32" />} color="#2e7d32" />
        <StatCard title="Total Expenses" value={`₱${totalExpense.toLocaleString()}`} icon={<Icon.Expense size={20} color="#c62828" />} color="#c62828" />
        <StatCard title="Net" value={`₱${(totalIncome - totalExpense).toLocaleString()}`} icon={<Icon.Profit size={20} color={(totalIncome - totalExpense) >= 0 ? '#1565c0' : '#c62828'} />} color={(totalIncome - totalExpense) >= 0 ? '#1565c0' : '#c62828'} />
        <StatCard title="Records" value={filtered.length} icon={<Icon.Transactions size={20} color="#f57f17" />} color="#f57f17" />
      </div>

      {/* Filters */}
      <div style={styles.toolbar}>
        <input style={styles.search} placeholder="Search description, reference..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select style={styles.sel} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select style={styles.sel} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <Btn variant="secondary" small onClick={() => { setFilterType(''); setFilterCat(''); setSearch(''); }}>Clear</Btn>
      </div>

      {loading ? <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p> : <Table columns={columns} data={filtered} />}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Transaction' : 'New Transaction'} width="520px">
        <form onSubmit={handleSave} style={styles.mForm}>
          <div style={styles.row2}>
            <FField label="Date *">
              <input style={styles.inp} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </FField>
            <FField label="Type *">
              <select style={styles.inp} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </FField>
          </div>
          <div style={styles.row2}>
            <FField label="Category *">
              <select style={styles.inp} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FField>
            <FField label="Amount (₱) *">
              <input style={styles.inp} type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </FField>
          </div>
          <FField label="Description">
            <input style={styles.inp} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Enter description" />
          </FField>
          <FField label="Reference">
            <input style={styles.inp} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. TXN-001" />
          </FField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <Btn variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Transaction'}</Btn>
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
  toolbar: { display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' },
  search: { flex: 1, minWidth: '200px', padding: '9px 12px', border: '1.5px solid #333333', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#1e1e1e', color: '#FFFFFF' },
  sel: { padding: '9px 12px', border: '1.5px solid #333333', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#1e1e1e', color: '#FFFFFF' },
  mForm: { display: 'flex', flexDirection: 'column', gap: '14px' },
  row2: { display: 'flex', gap: '12px' },
  inp: { padding: '9px 12px', border: '1.5px solid #333333', borderRadius: '7px', fontSize: '14px', outline: 'none', background: '#1e1e1e', color: '#FFFFFF' },
};
