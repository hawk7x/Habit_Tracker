import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Quote from "./components/Quote";
import HabitList from "./components/HabitList";
import Statistics from "./components/Statistics";
import ModalCreateHabit from "./components/Modals/ModalCreateHabit";
import ModalEditHabit from "./components/Modals/ModalEditHabit";
import ModalMinutesInput from "./components/Modals/ModalMinutesInput";
import ModalNote from "./components/Modals/ModalNote";
import { formatDate, getDatesInRange } from "./utils/helpers";
import { auth, signOut } from "./firebase";
import Login from "./components/Login";
import "./App.css";

function App() {
  const habitColors = [
    { name: "Green", value: "#2ecc71" },
    { name: "Blue", value: "#3498db" },
    { name: "Orange", value: "#f39c12" },
    { name: "Red", value: "#e74c3c" },
    { name: "Purple", value: "#9b59b6" },
  ];

  const [habits, setHabits] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteData, setNoteData] = useState({ date: null, amount: 0, comment: "" });
  const [newHabitName, setNewHabitName] = useState("");
  const [activeHabit, setActiveHabit] = useState(null);
  const [activeDate, setActiveDate] = useState(null);
  const [inputMinutes, setInputMinutes] = useState("");
  const [newHabitColor, setNewHabitColor] = useState(habitColors[0].value);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editHabitData, setEditHabitData] = useState({ name: "", type: "hours", color: "" });
  const [editHabitIndex, setEditHabitIndex] = useState(null);
  const [newHabitType, setNewHabitType] = useState("hours");
  const [showStats, setShowStats] = useState(false);


  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });


  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("habits")) || [];
    setHabits(saved);
  }, []);

  function addHabit() {
    const name = newHabitName.trim();
    if (!name) return alert("Enter the name of the habit");
    if (habits.find((h) => h.name === name)) return alert("There is already a habit with that name!");
    const newHabits = [...habits, { name, type: newHabitType, color: newHabitColor, data: {} }];
    setHabits(newHabits);
    localStorage.setItem("habits", JSON.stringify(newHabits));
    setNewHabitName("");
    setNewHabitType("hours");
    setModalOpen(false);
  }

  function handleEditSave() {
    if (editHabitIndex === null) return;
    const updated = [...habits];
    const { name, type, color } = editHabitData;
    if (!name.trim()) return alert("Enter the correct habit name");
    updated[editHabitIndex] = { ...updated[editHabitIndex], name: name.trim(), type, color };
    setHabits(updated);
    localStorage.setItem("habits", JSON.stringify(updated));
    setEditModalOpen(false);
  }

  function updateHabitData(habitIndex, dateKey, minutes) {
    const newHabits = [...habits];
    const habit = { ...newHabits[habitIndex] };
    habit.data = { ...habit.data, [dateKey]: minutes };
    newHabits[habitIndex] = habit;
    setHabits(newHabits);
    localStorage.setItem("habits", JSON.stringify(newHabits));
  }

  function calculateStreak(data) {
    let streak = 0;
    const dates = getDatesInRange(oneYearAgo, today);
    for (let i = dates.length - 1; i >= 0; i--) {
      const key = formatDate(dates[i]);
      if (data[key] && data[key] > 0) streak++;
      else break;
    }
    return streak;
  }

  function calculateAverage(data) {
    const values = Object.values(data);
    if (!values.length) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  function handleSave() {
    if (activeHabit === null || !activeDate) return;
    const min = parseInt(inputMinutes);
    if (isNaN(min) || min < 0) return alert("Enter the correct number of minutes");
    updateHabitData(activeHabit, formatDate(activeDate), min);
    setActiveHabit(null);
    setActiveDate(null);
    setInputMinutes("");
  }

  function handleSaveNote() {
    if (activeHabit === null || !noteData.date) return;
    const dateKey = formatDate(noteData.date);
    const updatedHabits = [...habits];
    const habit = { ...updatedHabits[activeHabit] };
    habit.data = { ...habit.data, [dateKey]: noteData.amount };
    habit.comments = habit.comments || {};
    habit.comments[dateKey] = noteData.comment;
    updatedHabits[activeHabit] = habit;
    setHabits(updatedHabits);
    localStorage.setItem("habits", JSON.stringify(updatedHabits));
    setNoteModalOpen(false);
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="App">
      <Header />

      {user && (
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
          <button
            onClick={() => {
              signOut(auth);
              localStorage.removeItem("user");
              setUser(null);
            }}
            style={{
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            🚪 Logout
          </button>
        </div>
      )}


      <Quote />

      <main className="main-container">
        <div className="controls">
          <button onClick={() => setModalOpen(true)}>➕ Create habit</button>
        </div>
        <button onClick={() => setShowStats(!showStats)}>
          {showStats ? "🏠 Home" : "📊 Statistics"}
        </button>

        {showStats ? (
          <Statistics habits={habits} />
        ) : (
          <HabitList
            habits={habits}
            setHabits={setHabits}
            setEditHabitIndex={setEditHabitIndex}
            setEditHabitData={setEditHabitData}
            setEditModalOpen={setEditModalOpen}
            setNoteModalOpen={setNoteModalOpen}
            setNoteData={setNoteData}
            setActiveHabit={setActiveHabit}
            calculateStreak={calculateStreak}
            calculateAverage={calculateAverage}
          />
        )}



      </main>

      {modalOpen && (
        <ModalCreateHabit
          habitColors={habitColors}
          newHabitName={newHabitName}
          setNewHabitName={setNewHabitName}
          newHabitType={newHabitType}
          setNewHabitType={setNewHabitType}
          newHabitColor={newHabitColor}
          setNewHabitColor={setNewHabitColor}
          addHabit={addHabit}
          onClose={() => setModalOpen(false)}
        />
      )}

      {activeDate !== null && (
        <ModalMinutesInput
          activeDate={activeDate}
          activeHabit={activeHabit}
          habits={habits}
          inputMinutes={inputMinutes}
          setInputMinutes={setInputMinutes}
          onSave={handleSave}
          onClose={() => setActiveDate(null)}
        />
      )}

      {editModalOpen && (
        <ModalEditHabit
          habitColors={habitColors}
          editHabitData={editHabitData}
          setEditHabitData={setEditHabitData}
          onSave={handleEditSave}
          onClose={() => setEditModalOpen(false)}
        />
      )}

      {noteModalOpen && (
        <ModalNote
          isOpen={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
          noteData={noteData}
          setNoteData={setNoteData}
          onSave={handleSaveNote}
        />
      )}
    </div>
  );
}

export default App;
