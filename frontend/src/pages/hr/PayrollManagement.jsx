import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const EMPTY_FORM = { employeeId: '', period: '', basicPay: '', overtime: '', allowances: '', sss: '', philhealth: '', pagibig: '', tax: '' };

export default function PayrollManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isHR = user?.role === 'hr_staff';
  const isManagement = user?.role === 'management';
  const isEmployee = user?.role === 'employee';
  const [payroll, setPayroll] = useState([]);
  const [summary, setSummary] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const params = isEmployee ? `?employeeId=${user.employeeId}` : '';

      const [payRes, sumRes] = await Promise.all([
        api.get(`/payroll${params}`),
        api.get('/payroll/summary'),
      ]);
      setPayroll(payRes.data);
      setSummary(sumRes.data);
      if (isHR) {
        const empRes = await api.get('/employees');
        setEmployees(empRes.data.filter((e) => e.status === 'active'));
      }

    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleProcess = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/payroll', {
        ...form,
        basicPay: Number(form.basicPay),
        overtime: Number(form.overtime),
        allowances: Number(form.allowances),
        sss: Number(form.sss),
        philhealth: Number(form.philhealth),
        pagibig: Number(form.pagibig),
        tax: Number(form.tax),
      });
      toast.success('Payroll processed successfully.');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process payroll.');
    } finally { setSaving(false); }
  };

  const handleMarkPaid = async (id) => {
    try {
      await api.patch(`/payroll/${id}/status`, { status: 'paid' });
      toast.success('Payroll marked as paid.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const columns = [
    { key: 'employeeName', label: 'Employee' },
    { key: 'period', label: 'Period' },
    { key: 'basicPay', label: 'Basic Pay', render: (v) => `₱${Number(v).toLocaleString()}` },
    { key: 'netPay', label: 'Net Pay', render: (v) => <strong style={{ color: '#4caf50' }}>₱{Number(v).toLocaleString()}</strong> },
    { key: 'processedDate', label: 'Date Processed' },
    { key: 'status', label: 'Status', render: (v) => <Badge value={v} /> },
    {
      key: 'actions', label: 'Actions', render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Btn small variant="secondary" onClick={() => navigate(`/hr/payroll/${row.id}`)}>Payslip</Btn>
          {isHR && row.status === 'pending' && (
            <Btn small variant="success" onClick={() => handleMarkPaid(row.id)}>Mark Paid</Btn>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={isEmployee ? 'My Payslips' : 'Payroll Management'}
        subtitle={isEmployee ? 'View your payroll records' : 'Process and manage employee payroll'}
        actions={isHR && !isManagement && <Btn onClick={() => { setForm(EMPTY_FORM); setModalOpen(true); }}><Icon.Add size={15} color="#fff" /> Process Payroll</Btn>}
      />

      {/* Summary */}
      {summary && (isHR || isManagement) && (
        <div style={styles.cardRow}>
          <StatCard title="Total Gross" value={`₱${summary.totalGross.toLocaleString()}`} icon={<Icon.GrossPay size={20} color="#1565c0" />} color="#1565c0" />
          <StatCard title="Total Deductions" value={`₱${summary.totalDeductions.toLocaleString()}`} icon={<Icon.Deductions size={20} color="#c62828" />} color="#c62828" />
          <StatCard title="Total Net Pay" value={`₱${summary.totalNetPay.toLocaleString()}`} icon={<Icon.NetPay size={20} color="#2e7d32" />} color="#2e7d32" />
          <StatCard title="Paid" value={summary.paidCount} icon={<Icon.ActiveEmployees size={20} color="#2e7d32" />} color="#2e7d32" subtitle={`${summary.pendingCount} pending`} />
        </div>
      )}

      {loading ? <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p> : <Table columns={columns} data={payroll} />}

      {/* Process Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Process Payroll" width="560px">
        <form onSubmit={handleProcess} style={styles.mForm}>
          <div style={styles.row2}>
            <FField label="Employee *" flex>
              <select style={styles.input} value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required>
                <option value="">Select employee</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </FField>
            <FField label="Pay Period *" flex>
              <input style={styles.input} value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="e.g. Oct 1-15, 2026" required />
            </FField>
          </div>
          <div style={styles.sectionHead}>Earnings (₱)</div>
          <div style={styles.row3}>
            <FNum label="Basic Pay" val={form.basicPay} onChange={(v) => setForm({ ...form, basicPay: v })} />
            <FNum label="Overtime" val={form.overtime} onChange={(v) => setForm({ ...form, overtime: v })} />
            <FNum label="Allowances" val={form.allowances} onChange={(v) => setForm({ ...form, allowances: v })} />
          </div>
          <div style={styles.sectionHead}>Deductions (₱)</div>
          <div style={styles.row4}>
            <FNum label="SSS" val={form.sss} onChange={(v) => setForm({ ...form, sss: v })} />
            <FNum label="PhilHealth" val={form.philhealth} onChange={(v) => setForm({ ...form, philhealth: v })} />
            <FNum label="Pag-IBIG" val={form.pagibig} onChange={(v) => setForm({ ...form, pagibig: v })} />
            <FNum label="Tax" val={form.tax} onChange={(v) => setForm({ ...form, tax: v })} />
          </div>
          {/* Preview Net */}
          <div style={styles.netPreview}>
            <span>Estimated Net Pay:</span>
            <strong style={{ color: '#4caf50', fontSize: '18px' }}>
              ₱{(
                (Number(form.basicPay) + Number(form.overtime) + Number(form.allowances)) -
                (Number(form.sss) + Number(form.philhealth) + Number(form.pagibig) + Number(form.tax))
              ).toLocaleString()}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Btn variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Processing...' : 'Process Payroll'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const FField = ({ label, children, flex }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', ...(flex ? { flex: 1 } : {}) }}>
    <label style={{ fontSize: '13px', fontWeight: 600, color: '#CCCCCC' }}>{label}</label>
    {children}
  </div>
);

const FNum = ({ label, val, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
    <label style={{ fontSize: '13px', fontWeight: 600, color: '#CCCCCC' }}>{label}</label>
    <input style={{ padding: '8px 10px', border: '1.5px solid #333333', borderRadius: '7px', fontSize: '14px', outline: 'none', background: '#1e1e1e', color: '#FFFFFF' }} type="number" min="0" value={val} onChange={(e) => onChange(e.target.value)} placeholder="0" />
  </div>
);

const styles = {
  cardRow: { display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' },
  mForm: { display: 'flex', flexDirection: 'column', gap: '14px' },
  row2: { display: 'flex', gap: '12px' },
  row3: { display: 'flex', gap: '10px' },
  row4: { display: 'flex', gap: '10px' },
  sectionHead: { fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #333333', paddingBottom: '4px' },
  netPreview: { background: 'rgba(46,125,50,0.1)', border: '1px solid rgba(46,125,50,0.3)', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600, color: '#CCCCCC' },
  input: { padding: '9px 12px', border: '1.5px solid #333333', borderRadius: '7px', fontSize: '14px', outline: 'none', background: '#1e1e1e', color: '#FFFFFF' },
};
