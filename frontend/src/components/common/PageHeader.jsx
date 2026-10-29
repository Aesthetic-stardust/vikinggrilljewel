export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={styles.header}>
      <div>
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div style={styles.actions}>{actions}</div>}
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#FFFFFF' },
  subtitle: { margin: '4px 0 0', fontSize: '14px', color: '#888888' },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
};
