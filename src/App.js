// src/App.js
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Quote from "./components/Quote";
import HabitList from "./components/HabitList";
import Statistics from "./components/Statistics";
import ModalCreateHabit from "./components/Modals/ModalCreateHabit";
import ModalEditHabit from "./components/Modals/ModalEditHabit";
import ModalMinutesInput from "./components/Modals/ModalMinutesInput";
import ModalNote from "./components/Modals/ModalNote";
import Login from "./components/Login"; // Login component
import Profile from "./components/Profile";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { formatDate, getDatesInRange } from "./utils/helpers";
import "./App.css";

function App() {
  const habitColors = [
    { name: "Green", value: "#2ecc71" },
    { name: "Blue", value: "#3498db" },
    { name: "Orange", value: "#f39c12" },
    { name: "Red", value: "#e74c3c" },
    { name: "Purple", value: "#9b59b6" },
  ];

  const habitCategories = [
    { name: "Health", value: "health" },
    { name: "Study", value: "study" },
    { name: "Work", value: "work" },
    { name: "Finance", value: "finance" },
    { name: "Self-development", value: "self" },
  ];

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

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
  const [newHabitCategory, setNewHabitCategory] = useState(habitCategories[0].value);
  const [showStats, setShowStats] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  // 🔹 Загружаем привычки из Firestore после логина
  useEffect(() => {
    if (!user) return;

    const loadHabits = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const oldHabits = docSnap.data().habits || [];
            // удалить привычки со старыми категориями
            const filtered = oldHabits.filter(h => h.category && habitCategories.some(c => c.value === h.category));
            setHabits(filtered);
          }
          setHabits(docSnap.data().habits || []);
        } else {
          await setDoc(docRef, { habits: [] });
          setHabits([]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadHabits();
  }, [user]);

  // 🔹 Сохраняем привычки в Firestore
  const saveHabitsToFirestore = async (newHabits) => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { habits: newHabits }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  };

  function addHabit() {
    const name = newHabitName.trim();
    if (!name) return alert("Enter the name of the habit");
    if (habits.find((h) => h.name === name)) return alert("There is already a habit with that name!");

    const newHabits = [
      ...habits,
      { name, type: newHabitType, color: newHabitColor, category: newHabitCategory, data: {} }
    ];

    setHabits(newHabits);
    saveHabitsToFirestore(newHabits);
    setNewHabitName("");
    setNewHabitType("hours");
    setModalOpen(false);
  }

  function handleEditSave() {
    if (editHabitIndex === null) return;
    const updated = [...habits];
    const { name, type, color, category } = editHabitData;
    if (!name.trim()) return alert("Enter the correct habit name");
    updated[editHabitIndex] = { ...updated[editHabitIndex], name: name.trim(), type, color, category };
    setHabits(updated);
    saveHabitsToFirestore(updated);
    setEditModalOpen(false);
  }

  function updateHabitData(habitIndex, dateKey, minutes) {
    const newHabits = [...habits];
    const habit = { ...newHabits[habitIndex] };
    habit.data = { ...habit.data, [dateKey]: minutes };
    newHabits[habitIndex] = habit;
    setHabits(newHabits);
    saveHabitsToFirestore(newHabits);
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
    saveHabitsToFirestore(updatedHabits);
    setNoteModalOpen(false);
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

  // 🔹 Logout
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    setUser(null);
  };

  // 🔹 Если не залогинен, показываем Login
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="App">
      <Header 
        user={user}
        onShowHome={() => { setShowStats(false); setShowProfile(false); }}
        onShowStats={() => { setShowStats(true); setShowProfile(false); }}
        onShowProfile={() => { setShowProfile(true); }}
      />

      <div style={{ textAlign: "right", padding: "10px" }}>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Показываем цитату и кнопку "Create habit" только на Home */}
      {!showStats && !showProfile && <Quote />}

      <main className="main-container">
        {!showStats && !showProfile && (
          <div className="controls">
            <button onClick={() => setModalOpen(true)}>➕ Create habit</button>
          </div>
        )}


        {showProfile ? (
          <Profile user={user} />
        ) : showStats ? (
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
            habitCategories={habitCategories} // ✅
          />
        )}

      </main>

      {modalOpen && (
        <ModalCreateHabit
          habitColors={habitColors}
          habitCategories={habitCategories}  // ✅ category
          newHabitName={newHabitName}
          setNewHabitName={setNewHabitName}
          newHabitType={newHabitType}
          setNewHabitType={setNewHabitType}
          newHabitColor={newHabitColor}
          setNewHabitColor={setNewHabitColor}
          newHabitCategory={newHabitCategory}  // ✅ category
          setNewHabitCategory={setNewHabitCategory}  // ✅ category
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
          habitCategories={habitCategories}  // ✅ category
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
