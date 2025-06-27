import { useEffect, useRef } from "react";
import "./ConfirmDialog.scss";

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmation", 
  message = "Êtes-vous sûr de vouloir continuer ?",
  confirmText = "Confirmer",
  cancelText = "Annuler"
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="confirm-dialog__overlay">
      <div className="confirm-dialog" ref={dialogRef}>
        <div className="confirm-dialog__header">
          <h3 className="confirm-dialog__title">{title}</h3>
        </div>
        <div className="confirm-dialog__content">
          <p className="confirm-dialog__message">{message}</p>
        </div>
        <div className="confirm-dialog__actions">
          <button 
            className="confirm-dialog__button confirm-dialog__button--cancel" 
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className="confirm-dialog__button confirm-dialog__button--confirm" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
