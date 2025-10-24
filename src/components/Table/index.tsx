export const Table = <T extends Record<string, unknown>>({
  columns,
  rows,
  title,
}: {
  columns: Array<{
    key: keyof T
    label: string
    formatter?: (value: T[keyof T]) => string
  }>
  rows: T[]
  title: string
}) => {
  return (
    <div className="collection-list__tables" style={{ marginBottom: '2rem' }}>
      <div className="table-wrap">
        <h3 style={{ marginBottom: '1rem' }}>{title}</h3>
        <div className="table">
          <table cellPadding="0" cellSpacing="0">
            <thead>
              <tr>
                {columns.map((column, idx) => (
                  <th key={idx}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr className={`row-${index + 1}`} key={index}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {column.formatter ? column.formatter(row[column.key]) : String(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
