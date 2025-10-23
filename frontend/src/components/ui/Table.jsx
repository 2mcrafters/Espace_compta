export default function Table({
  columns = [],
  data = [],
  keyField = "id",
  empty = "Aucune donnée",
  onRowClick,
}) {
  return (
    <div className="overflow-x-auto border rounded bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <table className="min-w-full text-xs sm:text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-700 dark:text-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key ?? col.accessor}
                className="px-2 sm:px-3 py-2 font-medium whitespace-nowrap border-b border-gray-200 dark:border-gray-700"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {data.length === 0 && (
            <tr>
              <td
                className="px-3 py-4 text-gray-500 dark:text-gray-400"
                colSpan={columns.length}
              >
                {empty}
              </td>
            </tr>
          )}
          {data.map((row) => (
            <tr
              key={row[keyField]}
              className={`hover:bg-gray-50 dark:hover:bg-gray-700/60 ${
                onRowClick ? "cursor-pointer" : ""
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={col.key ?? col.accessor}
                  className="px-2 sm:px-3 py-2 align-top whitespace-pre-wrap break-words text-gray-800 dark:text-gray-100"
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
