import React from "react";
import './Modal.css';

function ModalEditHabit({
  habitColors,
  editHabitData,
  setEditHabitData,
  onSave,
  onClose,
}) {
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit habit</h2>
        <input
          type="text"
          defaultValue={editHabitData.name}
          onBlur={(e) => setEditHabitData({ ...editHabitData, name: e.target.value })}
          placeholder="Enter habit name"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setEditHabitData({ ...editHabitData, name: e.target.value });
              onSave();
            }
          }}
        />

        <select
          value={editHabitData.type}
          onChange={(e) => setEditHabitData({ ...editHabitData, type: e.target.value })}
          style={{
            marginBottom: "1rem",
            width: "100%",
            padding: "0.5rem",
            borderRadius: "5px",
            border: "1px solid #2f81f7",
            backgroundColor: "#0e1117",
            color: "#f0f0f0",
          }}
        >
          <option value="hours">Hours</option>
          <option value="amount">Amount</option>
        </select>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Choose color:</label>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            {habitColors.map((c) => (
              <div
                key={c.value}
                onClick={() => setEditHabitData({ ...editHabitData, color: c.value })}
                style={{
                  width: "25px",
                  height: "25px",
                  borderRadius: "50%",
                  backgroundColor: c.value,
                  border: editHabitData.color === c.value ? "3px solid #fff" : "2px solid #444",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>

        <button onClick={onSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default ModalEditHabit;
