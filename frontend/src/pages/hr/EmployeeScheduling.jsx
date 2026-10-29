import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Btn from '../../components/common/Btn';
import Modal from '../../components/common/Modal';
import Icon from '../../components/common/Icons';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const SHIFTS = ['Morning', 'Afternoon', 'Evening', 'Off'];
const SHIFT_COLORS = { Morning: 'rgba(21,101,192,0.15)', Afternoon: 'rgba(245,127,23,0.15)', Evening: 'rgba(106,27,154,0.15)', Off: '#2a2a2a' };
const SHIFT_TEXT = { Morning: '#42a5f5', Afternoon: '#ffa726', Evening: '#ba68c8', Off: '#666' };

const currentWeek = () => {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
};

const EMPTY_FORM = () => ({ employeeId: '', week: currentWeek(), monday: 'Off', tuesday: 'Off', wednesday: 'Off', thursday: 'Off', friday: 'Off', saturday: 'Off', sunday: 'Off' });

export default function EmployeeScheduling() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isHR = user?.role === 'hr_staff' || user?.role === 'management';
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [week, setWeek] = useState(currentWeek());
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const params = new URLSearchParams({ week });
      if (!isHR) params.append('employeeId', user.employeeId);
      const res = await api.get(`/schedules?${params}`);
      setSchedules(res.data);
      if (isHR) {
        const empRes = await api.get('/employees');
        setEmployees(empRes.data.filter((e) => e.status === 'active'));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [week]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/schedules', form);
      toast.success('Schedule saved successfully.');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save schedule.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      toast.success('Schedule deleted.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete schedule.');
    }
  };

  const openEdit = (sched) => {
    setForm({ employeeId: sched.employeeId, week: sched.week, monday: sched.monday, tuesday: sched.tuesday, wednesday: sched.wednesday, thursday: sched.thursday, friday: sched.friday, saturday: sched.saturday, sunday: sched.sunday });
    setModalOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Employee Scheduling"
        subtitle="Create and manage weekly staff schedules"
        actions={isHR && <Btn onClick={() => { setForm(EMPTY_FORM()); setModalOpen(true); }}><Icon.Add size={15} color="#fff" /> Add Schedule</Btn>}
      />

      {/* Week Picker */}
      <div style={styles.weekRow}>
        <label style={styles.weekLabel}>Week:</label>
        <input style={styles.weekInput} type="week" value={week} onChange={(e) => setWeek(e.target.value)} />
        <span style={styles.weekCount}>{schedules.length} schedule{schedules.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p> : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Employee</th>
                {DAYS.map((d) => <th key={d} style={styles.th}>{d.charAt(0).toUpperCase() + d.slice(1)}</th>)}
                {isHR && <th style={styles.th}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr><td colSpan={9} style={styles.empty}>No schedules for this week.</td></tr>
              ) : schedules.map((s) => (
                <tr key={s.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{s.employeeName}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{s.position}</div>
                  </td>
                  {DAYS.map((d) => (
                    <td key={d} style={{ ...styles.td, textAlign: 'center' }}>
                      <span style={{ background: SHIFT_COLORS[s[d]] || '#2a2a2a', color: SHIFT_TEXT[s[d]] || '#CCC', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                        {s[d]}
                      </span>
                    </td>
                  ))}
                  {isHR && (
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Btn small variant="outline" onClick={() => openEdit(s)}>Edit</Btn>
                        <Btn small variant="danger" onClick={() => handleDelete(s.id)}>Del</Btn>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Assignment" width="580px">
        <form onSubmit={handleSave} style={styles.mForm}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={styles.fField}>
              <label style={styles.label}>Employee *</label>
              <select style={styles.input} value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required>
                <option value="">Select employee</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
            <div style={styles.fField}>
              <label style={styles.label}>Week *</label>
              <input style={styles.input} type="week" value={form.week} onChange={(e) => setForm({ ...form, week: e.target.value })} required />
            </div>
          </div>
          <div style={styles.shiftGrid}>
            {DAYS.map((d) => (
              <div key={d} style={styles.fField}>
                <label style={styles.label}>{d.charAt(0).toUpperCase() + d.slice(1)}</label>
                <select style={{ ...styles.input, background: SHIFT_COLORS[form[d]] || '#1e1e1e', color: SHIFT_TEXT[form[d]] || '#CCC', fontWeight: 600 }} value={form[d]} onChange={(e) => setForm({ ...form, [d]: e.target.value })}>
                  {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Btn variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Schedule'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const styles = {
  weekRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  weekLabel: { fontSize: '14px', fontWeight: 600, color: '#CCCCCC' },
  weekInput: { padding: '8px 12px', border: '1.5px solid #333333', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#1e1e1e', color: '#FFFFFF' },
  weekCount: { fontSize: '13px', color: '#888' },
  tableWrap: { background: '#1a1a1a', borderRadius: '12px', overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', border: '1px solid #333333' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' },
  th: { padding: '11px 14px', background: '#222222', fontSize: '12px', fontWeight: 700, color: '#888', textAlign: 'left', textTransform: 'uppercase', borderBottom: '2px solid #333333' },
  td: { padding: '10px 14px', fontSize: '14px', color: '#CCCCCC', borderBottom: '1px solid #2a2a2a' },
  empty: { padding: '32px', textAlign: 'center', color: '#666', fontSize: '14px' },
  mForm: { display: 'flex', flexDirection: 'column', gap: '14px' },
  shiftGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  fField: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  label: { fontSize: '13px', fontWeight: 600, color: '#CCCCCC' },
  input: { padding: '9px 12px', border: '1.5px solid #333333', borderRadius: '7px', fontSize: '14px', outline: 'none', background: '#1e1e1e', color: '#FFFFFF' },
};
