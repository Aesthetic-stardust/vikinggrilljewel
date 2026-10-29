import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Btn from '../../components/common/Btn';
import Modal from '../../components/common/Modal';
import StatCard from '../../components/common/StatCard';
import Icon from '../../components/common/Icons';

const EMPTY_FORM = { employeeId: '', date: '', timeIn: '', timeOut: '', status: 'present' };

export default function AttendanceManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isHR = user?.role === 'hr_staff' || user?.role === 'management';
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (!isHR) params.append('employeeId', user.employeeId);
      if (filterDate) params.append('date', filterDate);
      if (filterStatus) params.append('status', filterStatus);

      const [recRes, sumRes] = await Promise.all([
        api.get(`/attendance?${params}`),
        api.get('/attendance/summary'),
      ]);
      setRecords(recRes.data);
      setSummary(sumRes.data);

      if (isHR) {
        const empRes = await api.get('/employees');
        setEmployees(empRes.data.filter((e) => e.status === 'active'));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterDate, filterStatus]);

  const handleRecord = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/attendance', form);
      toast.success('Attendance recorded successfully.');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record attendance.');
    } finally { setSaving(false); }
  };

  const totalPresent = summary.reduce((s, a) => s + a.present, 0);
  const totalAbsent = summary.reduce((s, a) => s + a.absent, 0);
  const totalLate = summary.reduce((s, a) => s + a.late, 0);

  const columns = [
    { key: 'employeeName', label: 'Employee' },
    { key: 'date', label: 'Date' },
    { key: 'timeIn', label: 'Time In', render: (v) => v || '—' },
    { key: 'timeOut', label: 'Time Out', render: (v) => v || '—' },
    { key: 'hoursWorked', label: 'Hours', render: (v) => `${v}h` },
    { key: 'status', label: 'Status', render: (v) => <Badge value={v} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Attendance Management"
        subtitle="Monitor and record employee attendance"
        actions={isHR && <Btn onClick={() => { setForm(EMPTY_FORM); setModalOpen(true); }}><Icon.Add size={15} color="#fff" /> Record Attendance</Btn>}
      />

      {/* Summary Cards */}
      <div style={styles.cardRow}>
        <StatCard title="Present" value={totalPresent} icon={<Icon.ActiveEmployees size={20} color="#2e7d32" />} color="#2e7d32" />
        <StatCard title="Absent" value={totalAbsent} icon={<Icon.Deductions size={20} color="#c62828" />} color="#c62828" />
        <StatCard title="Late" value={totalLate} icon={<Icon.Pending size={20} color="#f57f17" />} color="#f57f17" />
        <StatCard title="Total Records" value={records.length} icon={<Icon.Attendance size={20} color="#1565c0" />} color="#1565c0" />
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input style={styles.filterInput} type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        <select style={styles.filterInput} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>
        <Btn variant="secondary" small onClick={() => { setFilterDate(''); setFilterStatus(''); }}>Clear</Btn>
      </div>

      {loading ? <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p> : <Table columns={columns} data={records} />}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Attendance">
        <form onSubmit={handleRecord} style={styles.mForm}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={styles.label}>Employee *</label>
            <select style={styles.input} value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required>
              <option value="">Select employee</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={styles.label}>Date *</label>
            <input style={styles.input} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div style={styles.row2}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <label style={styles.label}>Time In</label>
              <input style={styles.input} type="time" value={form.timeIn} onChange={(e) => setForm({ ...form, timeIn: e.target.value })} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <label style={styles.label}>Time Out</label>
              <input style={styles.input} type="time" value={form.timeOut} onChange={(e) => setForm({ ...form, timeOut: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={styles.label}>Status *</label>
            <select style={styles.input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} required>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <Btn variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Record'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const styles = {
  cardRow: { display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' },
  filters: { display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' },
  filterInput: { padding: '9px 12px', border: '1.5px solid #333333', borderRadius: '8px', fontSize: '14px', background: '#1e1e1e', color: '#FFFFFF', outline: 'none' },
  mForm: { display: 'flex', flexDirection: 'column', gap: '14px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#CCCCCC' },
  input: { padding: '9px 12px', border: '1.5px solid #333333', borderRadius: '7px', fontSize: '14px', outline: 'none', background: '#1e1e1e', color: '#FFFFFF' },
  row2: { display: 'flex', gap: '12px' },
};
