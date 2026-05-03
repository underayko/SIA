import React from 'react';

export default function ConfirmDeleteModal({ name, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={(e) => e.target.classList.contains('confirm-overlay') && onCancel()}>
      <div className="confirm-modal">
        <div className="confirm-modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </div>
        <h3 className="confirm-modal-title">Delete Faculty</h3>
        <p className="confirm-modal-msg">
          Are you sure you want to remove <strong>{name}</strong> from the system? This action cannot be undone.
        </p>
        <div className="confirm-modal-actions">
          <button className="btn btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn btn-confirm-delete" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}
