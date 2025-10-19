import Input from './Input'

export default function DateRangePicker({ start, end, onChange, className='' }){
  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <Input
        label="Du"
        type="date"
        value={start ?? ""}
        onChange={(e) => onChange?.({ start: e.target.value, end })}
      />
      <Input
        label="Au"
        type="date"
        value={end ?? ""}
        onChange={(e) => onChange?.({ start, end: e.target.value })}
      />
    </div>
  );
}
