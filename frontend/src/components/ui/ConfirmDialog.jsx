import Modal from './Modal'
import { motion } from "framer-motion";

export default function ConfirmDialog({
  open,
  title = "Êtes-vous sûr ?",
  description = "Cette action est irréversible.",
  confirmText = "Supprimer",
  cancelText = "Annuler",
  variant = "danger", // 'danger' | 'primary'
  onConfirm,
  onCancel,
}) {
  const confirmBtnClass =
    variant === "primary"
      ? "from-primary-600 to-primary-700"
      : "from-rose-500 to-red-600";
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-100"
          >
            {cancelText}
          </button>
          <motion.button
            whileHover={{
              scale: 1.03,
              y: -1,
              boxShadow: "0 10px 20px rgba(244, 63, 94, 0.35)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg bg-gradient-to-r ${confirmBtnClass} text-white font-semibold`}
          >
            {confirmText}
          </motion.button>
        </div>
      }
    >
      <div className="space-y-3 text-gray-700">
        <p>{description}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Vérifiez bien avant de confirmer.</span>
        </div>
      </div>
    </Modal>
  );
}
