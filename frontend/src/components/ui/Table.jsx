export default function Table({ columns=[], data=[], keyField='id', empty='No data', onRowClick }){
  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-full text-xs sm:text-sm">
        <thead className="bg-gray-50 text-left text-gray-700">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key ?? col.accessor}
                className="px-2 sm:px-3 py-2 font-medium whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-gray-500" colSpan={columns.length}>
                {empty}
              </td>
            </tr>
          )}
          {data.map((row) => (
            <tr
              key={row[keyField]}
              className={`border-t hover:bg-gray-50 ${
                onRowClick ? "cursor-pointer" : ""
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={col.key ?? col.accessor}
                  className="px-2 sm:px-3 py-2 align-top whitespace-pre-wrap break-words"
                >
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
