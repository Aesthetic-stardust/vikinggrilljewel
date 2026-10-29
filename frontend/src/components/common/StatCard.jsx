/**
 * StatCard — KPI summary card.
 * `icon` should be a rendered SVG element (e.g. <Icon.Employees size={20} color={color} />)
 */
export default function StatCard({ title, value, icon, color = '#8B1A1A', subtitle }) {
  return (
    <div style={{ ...styles.card, borderLeft: `3px solid ${color}` }}>
      <div style={styles.top}>
        <div style={styles.left}>
          <div style={styles.title}>{title}</div>
          <div style={{ ...styles.value, color }}>{value}</div>
          {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
        </div>
        <div style={{ ...styles.iconWrap, background: `${color}18` }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#1a1a1a',
    borderRadius: '10px',
    padding: '18px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
    flex: 1,
    minWidth: '180px',
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none',
  },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  left: { flex: 1, minWidth: 0 },
  title: {
    fontSize: '11px',
    color: '#888888',
    fontWeight: 600,
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: { fontSize: '26px', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.5px' },
  subtitle: { fontSize: '11px', color: '#666', marginTop: '5px', fontWeight: 400 },
  iconWrap: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: '12px',
  },
};
