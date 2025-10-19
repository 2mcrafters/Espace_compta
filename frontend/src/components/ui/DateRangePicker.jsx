import Input from './Input'

export default function DateRangePicker({ start, end, onChange, className='' }){
  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <Input label="Start" type="date" value={start ?? ''} onChange={e => onChange?.({ start: e.target.value, end })} />
      <Input label="End" type="date" value={end ?? ''} onChange={e => onChange?.({ start, end: e.target.value })} />
    </div>
  )
}
