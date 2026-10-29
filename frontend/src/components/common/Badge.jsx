const COLOR_MAP = {
  active: { bg: 'rgba(46,125,50,0.15)', color: '#4caf50' },
  inactive: { bg: 'rgba(139,26,26,0.15)', color: '#ef5350' },
  present: { bg: 'rgba(46,125,50,0.15)', color: '#4caf50' },
  absent: { bg: 'rgba(139,26,26,0.15)', color: '#ef5350' },
  late: { bg: 'rgba(245,127,23,0.15)', color: '#ffa726' },
  paid: { bg: 'rgba(46,125,50,0.15)', color: '#4caf50' },
  pending: { bg: 'rgba(245,127,23,0.15)', color: '#ffa726' },
  completed: { bg: 'rgba(46,125,50,0.15)', color: '#4caf50' },
  income: { bg: 'rgba(46,125,50,0.15)', color: '#4caf50' },
  expense: { bg: 'rgba(139,26,26,0.15)', color: '#ef5350' },
  default: { bg: '#2a2a2a', color: '#888' },
};

export default function Badge({ value }) {
  const key = String(value).toLowerCase();
  const { bg, color } = COLOR_MAP[key] || COLOR_MAP.default;
  return (
    <span style={{ background: bg, color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
      {value}
    </span>
  );
}
