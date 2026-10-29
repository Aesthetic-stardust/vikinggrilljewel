export default function Table({ columns, data, emptyMessage = 'No records found.' }) {
  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ ...styles.th, width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={styles.empty}>{emptyMessage}</td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                {columns.map((col) => (
                  <td key={col.key} style={styles.td}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  wrapper: { background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', border: '1px solid #333333' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', background: '#222222', fontSize: '12px', fontWeight: 700, color: '#888888', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #333333' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#CCCCCC', borderBottom: '1px solid #2a2a2a' },
  rowEven: { background: '#1a1a1a' },
  rowOdd: { background: '#1e1e1e' },
  empty: { padding: '32px', textAlign: 'center', color: '#666', fontSize: '14px' },
};
