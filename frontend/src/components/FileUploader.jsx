import React from 'react'
import Button from './ui/Button'

export default function FileUploader({ onFiles }){
  const ref = React.useRef(null)
  function onChange(e){
    const files = Array.from(e.target.files || [])
    if (files.length) onFiles?.(files)
  }
  return (
    <div className="flex items-center gap-2">
      <input ref={ref} type="file" multiple onChange={onChange} className="hidden" />
      <Button onClick={() => ref.current?.click()}>Upload files…</Button>
    </div>
  )
}
