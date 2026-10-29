export default function Modal({ open, onClose, title, children, width = '500px' }) {
  if (!open) return null;
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modal, width }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button style={styles.close} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
  modal: { background: '#1a1a1a', borderRadius: '14px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto', maxWidth: '95vw', border: '1px solid #333333' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px', borderBottom: '1px solid #333333' },
  title: { margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFFFFF' },
  close: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888888', lineHeight: 1 },
  body: { padding: '20px 24px 24px' },
};
