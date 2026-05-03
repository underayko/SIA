import React from 'react';

export default function InviteFacultyModal({ form, status, loading, onChange, onSubmit, onClose }) {
  return (
    <div className="confirm-overlay" onClick={(e) => e.target.classList.contains('confirm-overlay') && onClose()}>
      <div className="confirm-modal" style={{ alignItems: 'stretch' }}>
        <h3 className="confirm-modal-title" style={{ textAlign: 'left' }}>Invite Faculty</h3>
        <p className="confirm-modal-msg" style={{ textAlign: 'left', marginBottom: '12px' }}>
          This will send an email invitation via Supabase Auth and create a matching record in the <code>public.users</code> table.
          The faculty member will set their own password using the link in the email.
        </p>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="field-group">
            <label>First Name</label>
            <input className="field-input" type="text" value={form.firstName} onChange={(e) => onChange('firstName', e.target.value)} placeholder="Juan" />
          </div>
          <div className="field-group">
            <label>Last Name</label>
            <input className="field-input" type="text" value={form.lastName} onChange={(e) => onChange('lastName', e.target.value)} placeholder="Dela Cruz" />
          </div>
          <div className="field-group">
            <label>Faculty Email (domain_email)</label>
            <input className="field-input" type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)} placeholder="faculty@gordoncollege.edu.ph" />
          </div>
          {status && (
            <p className="panel-error" style={{ marginTop: '4px' }}>{status}</p>
          )}
          <div className="confirm-modal-actions" style={{ marginTop: '12px' }}>
            <button type="button" className="btn btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-apply" disabled={loading}>{loading ? 'Sending…' : 'Send Invitation'}</button>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
            The invite email contains a secure link where the faculty member can set their own password.
          </p>
        </form>
      </div>
    </div>
  );
}
