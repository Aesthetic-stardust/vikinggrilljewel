const VARIANTS = {
  primary: { background: '#8B1A1A', color: '#fff', border: 'none' },
  secondary: { background: '#2a2a2a', color: '#CCCCCC', border: '1px solid #333333' },
  success: { background: '#2e7d32', color: '#fff', border: 'none' },
  danger: { background: '#6B1010', color: '#fff', border: 'none' },
  outline: { background: 'transparent', color: '#B03030', border: '1.5px solid #8B1A1A' },
};

export default function Btn({ children, variant = 'primary', onClick, type = 'button', disabled, small, style }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.base,
        ...VARIANTS[variant],
        ...(small ? styles.small : {}),
        ...(disabled ? styles.disabled : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}

const styles = {
  base: { padding: '9px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  small: { padding: '5px 12px', fontSize: '12px' },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
};
