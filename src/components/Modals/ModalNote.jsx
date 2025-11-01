import React from "react";
import { formatHoverDate } from "../../utils/helpers";
import './ModalNote.css';

function ModalNote({ isOpen, onClose, noteData, setNoteData, onSave }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="note-modal" onClick={(e) => e.stopPropagation()}>
        <h3>📅 {formatHoverDate(noteData.date)}</h3>

        <p style={{ marginTop: "10px" }}>
          <strong>Current:</strong> {noteData.amount}
        </p>

        <label style={{ display: "block", marginTop: "10px" }}>Change:</label>
        <input
          type="number"
          value={noteData.amount}
          onChange={(e) => setNoteData({ ...noteData, amount: parseFloat(e.target.value) || 0 })}
          style={{
            width: "100%",
            marginTop: "5px",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #2f81f7",
          }}
        />

        <label style={{ display: "block", marginTop: "10px" }}>Comment:</label>
        <textarea
          value={noteData.comment}
          onChange={(e) => setNoteData({ ...noteData, comment: e.target.value })}
          placeholder="How was your day?"
          style={{
            width: "100%",
            marginTop: "5px",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #2f81f7",
            resize: "none",
            height: "70px",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
          <button onClick={onSave}>💾 Save</button>
          <button onClick={onClose}>✖ Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ModalNote;
