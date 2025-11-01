import React from "react";
import { formatHoverDate } from "../../utils/helpers";
import './Modal.css';

function ModalMinutesInput({
  activeDate,
  activeHabit,
  habits,
  inputMinutes,
  setInputMinutes,
  onSave,
  onClose,
}) {
  if (activeDate === null) return null;

  const habitType =
    activeHabit !== null ? (habits[activeHabit].type === "hours" ? "Hours" : "Amount") : "";

  return (
    <div className="modal" style={{ backgroundColor: "rgba(14,17,23,0.8)" }}>
      <div
        className="modal-content"
        style={{ width: "250px", textAlign: "left" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: "10px" }}>
          <strong>Date:</strong> {formatHoverDate(activeDate)}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <strong>{habitType}:</strong>
          <input
            type="number"
            value={inputMinutes}
            onChange={(e) => setInputMinutes(e.target.value)}
            style={{
              width: "100%",
              marginTop: "5px",
              padding: "5px",
              borderRadius: "5px",
              border: "1px solid #2f81f7",
            }}
            autoFocus
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={onSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ModalMinutesInput;
