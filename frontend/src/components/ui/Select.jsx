export default function Select({label, error, options=[], className='', ...props}){
  return (
    <label className={`block ${className}`}>
      {label && <div className="mb-1 text-sm text-gray-700">{label}</div>}
      <select className="w-full rounded border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500" {...props}>
        {options.map(opt => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
        ))}
      </select>
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </label>
  )
}
