import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Btn from '../../components/common/Btn';
import Icon from '../../components/common/Icons';

export default function PayslipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/payroll/${id}`)
      .then((res) => setPayslip(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Loading...</p>;
  if (!payslip) return <p style={{ textAlign: 'center', color: '#ef5350', padding: '40px' }}>Payslip not found.</p>;

  const { employee: emp } = payslip;
  const grossPay = payslip.basicPay + payslip.overtime + payslip.allowances;
  const totalDeductions = payslip.sss + payslip.philhealth + payslip.pagibig + payslip.tax;

  return (
    <div>
      <PageHeader
        title="Payslip"
        subtitle={`Pay Period: ${payslip.period}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Btn variant="secondary" onClick={() => navigate(-1)}>← Back</Btn>
            <Btn onClick={() => window.print()}><Icon.Download size={14} color="#fff" /> Print</Btn>
          </div>
        }
      />

      <div style={styles.slip} id="payslip-print">
        {/* Header */}
        <div style={styles.slipHeader}>
          <div>
            <div style={styles.companyName}>Viking Grill</div>
            <div style={styles.companyInfo}>Official Payslip</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={styles.period}>{payslip.period}</div>
            <div style={styles.processedDate}>Processed: {payslip.processedDate}</div>
            <Badge value={payslip.status} />
          </div>
        </div>

        <hr style={styles.divider} />

        {/* Employee Info */}
        <div style={styles.empSection}>
          <div style={styles.empGrid}>
            <InfoRow label="Employee Name" value={emp ? `${emp.firstName} ${emp.lastName}` : '—'} />
            <InfoRow label="Employee ID" value={payslip.employeeId} />
            <InfoRow label="Position" value={emp?.position || '—'} />
            <InfoRow label="Department" value={emp?.department || '—'} />
          </div>
        </div>

        <hr style={styles.divider} />

        {/* Pay Details */}
        <div style={styles.payGrid}>
          {/* Earnings */}
          <div>
            <h3 style={styles.payTitle}>Earnings</h3>
            <PayRow label="Basic Pay" amount={payslip.basicPay} />
            <PayRow label="Overtime Pay" amount={payslip.overtime} />
            <PayRow label="Allowances" amount={payslip.allowances} />
            <PayRow label="Gross Pay" amount={grossPay} bold accent="#42a5f5" />
          </div>

          {/* Deductions */}
          <div>
            <h3 style={styles.payTitle}>Deductions</h3>
            <PayRow label="SSS" amount={payslip.sss} />
            <PayRow label="PhilHealth" amount={payslip.philhealth} />
            <PayRow label="Pag-IBIG" amount={payslip.pagibig} />
            <PayRow label="Withholding Tax" amount={payslip.tax} />
            <PayRow label="Total Deductions" amount={totalDeductions} bold accent="#ef5350" />
          </div>
        </div>

        <hr style={styles.divider} />

        {/* Net Pay */}
        <div style={styles.netPay}>
          <span style={styles.netLabel}>NET PAY</span>
          <span style={styles.netAmount}>₱{payslip.netPay.toLocaleString()}</span>
        </div>

        <div style={styles.footer}>
          This is a system-generated payslip and does not require a signature.
        </div>
      </div>
    </div>
  );
}

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
    <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 600 }}>{value}</span>
  </div>
);

const PayRow = ({ label, amount, bold, accent }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #2a2a2a' }}>
    <span style={{ fontSize: '14px', color: bold ? '#FFFFFF' : '#CCCCCC', fontWeight: bold ? 700 : 400 }}>{label}</span>
    <span style={{ fontSize: '14px', fontWeight: bold ? 700 : 500, color: accent || '#CCCCCC' }}>₱{Number(amount).toLocaleString()}</span>
  </div>
);

const styles = {
  slip: { background: '#1a1a1a', borderRadius: '16px', padding: '32px', maxWidth: '720px', margin: '0 auto', boxShadow: '0 2px 12px rgba(0,0,0,0.4)', border: '1px solid #333333' },
  slipHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  companyName: { fontSize: '22px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' },
  companyInfo: { fontSize: '13px', color: '#888' },
  period: { fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' },
  processedDate: { fontSize: '13px', color: '#888', marginBottom: '6px' },
  divider: { border: 'none', borderTop: '1px solid #333333', margin: '20px 0' },
  empSection: { padding: '4px 0' },
  empGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  payGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' },
  payTitle: { fontSize: '13px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' },
  netPay: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #8B1A1A, #6B1010)', color: '#fff', padding: '20px 24px', borderRadius: '10px', margin: '4px 0' },
  netLabel: { fontSize: '16px', fontWeight: 700, letterSpacing: '1px' },
  netAmount: { fontSize: '28px', fontWeight: 800 },
  footer: { textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '20px' },
};
