import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({ open, title='Confirm', description, confirmText='Confirm', cancelText='Cancel', onConfirm, onCancel }){
  return (
    <Modal open={open} title={title} onClose={onCancel}
      footer={
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-2 rounded border" onClick={onCancel}>{cancelText}</button>
          <Button onClick={onConfirm}>{confirmText}</Button>
        </div>
      }
    >
      <p className="text-gray-700">{description}</p>
    </Modal>
  )
}
