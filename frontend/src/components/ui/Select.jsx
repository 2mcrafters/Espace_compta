export default function Select({label, error, options=[], className='', ...props}){
  return (
    <label className={`block ${className}`}>
      {label && (
        <div className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </div>
      )}
      <select
        className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && (
        <div className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </label>
  );
}
