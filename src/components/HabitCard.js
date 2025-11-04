import React, { useState, useEffect } from "react";
import { formatDate, getDatesInRange, formatHoverDate, getColor, monthNames, daysOfWeek } from "../utils/helpers";
import './HabitCard.css';

function HabitCard({
  habit,
  index,
  habits,
  setHabits,
  removeHabit,
  setEditHabitIndex,
  setEditHabitData,
  setEditModalOpen,
  setNoteModalOpen,
  setNoteData,
  setActiveHabit,
  calculateStreak,
  calculateAverage,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        !event.target.closest(".menu-btn") &&
        !event.target.closest(".menu-dropdown")
      ) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  const dates = getDatesInRange(oneYearAgo, today);

  const weeks = [];
  let currentWeek = [];
  dates.forEach((date) => {
    const dow = date.getDay() || 7;
    if (dow === 1 && currentWeek.length) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  });
  if (currentWeek.length) weeks.push(currentWeek);

  const weeksCount = weeks.length;
  const daysCount = 7;

  const matrix = [];
  for (let day = 1; day <= daysCount; day++) {
    const row = [];
    for (let week = 0; week < weeksCount; week++) {
      const dayObj = weeks[week].find((d) => (d.getDay() || 7) === day);
      row.push(dayObj || null);
    }
    matrix.push(row);
  }

  const monthLabels = [];
  const addedMonths = new Set();
  weeks.forEach((week, weekIndex) => {
    week.forEach((date) => {
      const month = date.getMonth();
      if (date.getDay() === 1 && !addedMonths.has(month)) {
        monthLabels.push({ name: monthNames[month], col: weekIndex + 2 });
        addedMonths.add(month);
      }
    });
  });

  function handleDelete() {
    if (!window.confirm(`Удалить привычку "${habit.name}"?`)) return;
    setIsRemoving(true);
    setTimeout(() => removeHabit(index), 300);
    setMenuOpen(false);
  }

  return (
    <div className={`habit ${isRemoving ? "removing" : ""}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{habit.name}</h2>
        <p style={{
          fontSize: "0.8rem",
          color: "#ccc",
          marginTop: "-5px",
          marginBottom: "8px",
        }}>
        </p>
        <div style={{ position: "relative" }}>
          <button className="menu-btn" onClick={() => setMenuOpen((prev) => !prev)}>
            ⋮
          </button>
          {menuOpen && (
            <div className="menu-dropdown">
              <div
                className="menu-item edit"
                onClick={() => {
                  setEditHabitIndex(index);
                  setEditHabitData({
                    name: habit.name,
                    type: habit.type,
                    color: habit.color,
                  });
                  setEditModalOpen(true);
                  setMenuOpen(false);
                }}
              >
                ✏️ Edit
              </div>
              <div className="menu-item delete" onClick={handleDelete}>
                🗑️ Delete
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="months-row"
        style={{
          display: "grid",
          gridTemplateColumns: `30px repeat(${weeksCount}, 16px)`,
          columnGap: "2px",
          marginBottom: "5px",
        }}
      >
        <div></div>
        {monthLabels.map((m, idx) => (
          <div key={idx} className="month-label" style={{ gridColumnStart: m.col }}>
            {m.name}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "4px" }}>
        <div className="days-column">
          {daysOfWeek.map((d, i) => (
            <div key={i} className="day-label">
              {d}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateRows: `repeat(7,16px)`,
            gridTemplateColumns: `repeat(${weeksCount},16px)`,
            columnGap: "2px",
            rowGap: "2px",
          }}
        >
          {Array.from({ length: daysCount }).flatMap((_, dayIndex) =>
            Array.from({ length: weeksCount }).map((_, weekIndex) => {
              const date = matrix[dayIndex][weekIndex];
              const key = date ? formatDate(date) : null;
              const minutes = key && habit.data[key] ? habit.data[key] : 0;
              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className="day"
                  title={
                    date
                      ? `${formatHoverDate(date)}\n${habit.type === "hours" ? "Hours" : "Amount"}: ${minutes}`
                      : ""
                  }
                  style={{
                    backgroundColor: getColor(minutes, habit.data, habit.color),
                  }}
                  onClick={() => {
                    if (!date) return;
                    const key = formatDate(date);
                    const currentAmount = habit.data[key] || 0;
                    const currentComment = habit.comments?.[key] || "";
                    setActiveHabit(index);
                    setNoteData({
                      date,
                      amount: currentAmount,
                      comment: currentComment,
                    });
                    setNoteModalOpen(true);
                  }}
                />
              );
            })
          )}
        </div>
      </div>

      <div className="stats">
        <p>
          <span className="label">Streak:</span>{" "}
          <span className="value">{calculateStreak(habit.data)} days</span>
        </p>
        <p>
          <span className="label">Average:</span>{" "}
          <span className="value">{calculateAverage(habit.data)} minutes</span>
        </p>
      </div>
    </div>
  );
}

export default HabitCard;
