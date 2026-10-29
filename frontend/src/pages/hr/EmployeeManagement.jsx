import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Btn from '../../components/common/Btn';
import Modal from '../../components/common/Modal';
import Icon from '../../components/common/Icons';

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', position: '', department: '', hireDate: '', salary: '', address: '' };

export default function EmployeeManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  });

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (emp) => {
    setEditTarget(emp);
    setForm({ firstName: emp.firstName, lastName: emp.lastName, email: emp.email, phone: emp.phone, position: emp.position, department: emp.department, hireDate: emp.hireDate, salary: emp.salary, address: emp.address });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        await api.put(`/employees/${editTarget.id}`, form);
        toast.success(`${form.firstName} ${form.lastName}'s record updated.`);
      } else {
        await api.post('/employees', form);
        toast.success(`Employee ${form.firstName} ${form.lastName} added.`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save employee.');
    } finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Employee deactivated.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate employee.');
    }
  };

  const columns = [
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'firstName', label: 'Name', render: (_, row) => `${row.firstName} ${row.lastName}` },
    { key: 'position', label: 'Position' },
    { key: 'department', label: 'Department' },
    { key: 'hireDate', label: 'Hire Date' },
    { key: 'salary', label: 'Salary', render: (v) => `₱${Number(v).toLocaleString()}` },
    { key: 'status', label: 'Status', render: (v) => <Badge value={v} /> },
    {
      key: 'actions', label: 'Actions', render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Btn small variant="secondary" onClick={() => navigate(`/hr/employees/${row.id}`)}>View</Btn>
          <Btn small variant="outline" onClick={() => openEdit(row)}>Edit</Btn>
          {row.status === 'active' && <Btn small variant="danger" onClick={() => handleDeactivate(row.id)}>Deactivate</Btn>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Employee Management"
        subtitle="Create and manage employee records"
        actions={<Btn onClick={openCreate}><Icon.Add size={15} color="#fff" /> Add Employee</Btn>}
      />

      {/* Search */}
      <div style={styles.toolbar}>
        <input
          style={styles.search}
          placeholder="Search by name, position, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span style={styles.count}>{filtered.length} employee{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p> : <Table columns={columns} data={filtered} />}

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Employee' : 'Add New Employee'} width="560px">
        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.row2}>
            <Field label="First Name *" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} required />
            <Field label="Last Name *" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} required />
          </div>
          <div style={styles.row2}>
            <Field label="Email *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </div>
          <div style={styles.row2}>
            <Field label="Position *" value={form.position} onChange={(v) => setForm({ ...form, position: v })} required />
            <Field label="Department *" value={form.department} onChange={(v) => setForm({ ...form, department: v })} required />
          </div>
          <div style={styles.row2}>
            <Field label="Hire Date" type="date" value={form.hireDate} onChange={(v) => setForm({ ...form, hireDate: v })} />
            <Field label="Salary (₱)" type="number" value={form.salary} onChange={(v) => setForm({ ...form, salary: v })} />
          </div>
          <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <Btn variant="secondary" onClick={() => setModalOpen(false)} type="button">Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Employee'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
      <label style={{ fontSize: '13px', fontWeight: 600, color: '#CCCCCC' }}>{label}</label>
      <input
        style={{ padding: '9px 12px', border: '1.5px solid #333333', borderRadius: '7px', fontSize: '14px', outline: 'none', background: '#1e1e1e', color: '#FFFFFF' }}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}

const styles = {
  toolbar: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  search: { flex: 1, padding: '10px 14px', border: '1.5px solid #333333', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#1e1e1e', color: '#FFFFFF' },
  count: { fontSize: '13px', color: '#888', whiteSpace: 'nowrap' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  row2: { display: 'flex', gap: '12px' },
};
