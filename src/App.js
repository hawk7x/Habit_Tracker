import React, { useState, useEffect } from 'react';
import Quote from './components/Quote';
import Header from './components/Header';
import HabitCard from './components/HabitCard';
import { formatDate, getDatesInRange, formatHoverDate, getColor, monthNames, daysOfWeek } from "./utils/helpers";
import './App.css';


function App() {
  const habitColors = [
  { name: 'Green', value: '#2ecc71' },
  { name: 'Blue', value: '#3498db' },
  { name: 'Orange', value: '#f39c12' },
  { name: 'Red', value: '#e74c3c' },
  { name: 'Purple', value: '#9b59b6' },
];
  const [habits, setHabits] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteData, setNoteData] = useState({ date: null, amount: 0, comment: "" });
  const [newHabitName, setNewHabitName] = useState('');
  const [activeHabit, setActiveHabit] = useState(null);
  const [activeDate, setActiveDate] = useState(null);
  const [inputMinutes, setInputMinutes] = useState('');
  const [newHabitColor, setNewHabitColor] = useState(habitColors[0].value);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editHabitData, setEditHabitData] = useState({ name: '', type: 'hours', color: '' });
  const [editHabitIndex, setEditHabitIndex] = useState(null);



  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  // Load habits from localStorage
  const [newHabitType, setNewHabitType] = useState('hours');
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('habits')) || [];
    setHabits(saved);
  }, []);

  function addHabit() {
    const name = newHabitName.trim();
    if (!name) return alert('Введите имя привычки');
    if (habits.find(h => h.name === name)) return alert('Привычка с таким именем уже есть!');
    const newHabits = [...habits, { name, type: newHabitType, color: newHabitColor, data: {} }];
    setHabits(newHabits);
    localStorage.setItem('habits', JSON.stringify(newHabits));
    setNewHabitName('');
    setNewHabitType('hours');
    setModalOpen(false);
  }
  function handleEditSave() {
    if (editHabitIndex === null) return;
    const updated = [...habits];
    const { name, type, color } = editHabitData;
    if (!name.trim()) return alert('Введите корректное имя привычки');
    updated[editHabitIndex] = {
      ...updated[editHabitIndex],
      name: name.trim(),
      type,
      color
    };
    setHabits(updated);
    localStorage.setItem('habits', JSON.stringify(updated));
    setEditModalOpen(false);
  }


  function updateHabitData(habitIndex, dateKey, minutes) {
    const newHabits = [...habits];
    const habit = { ...newHabits[habitIndex] };
    habit.data = { ...habit.data, [dateKey]: minutes };
    newHabits[habitIndex] = habit;
    setHabits(newHabits);
    localStorage.setItem('habits', JSON.stringify(newHabits));
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
    if (isNaN(min) || min < 0) return alert('Введите корректное число минут');
    updateHabitData(activeHabit, formatDate(activeDate), min);
    setActiveHabit(null);
    setActiveDate(null);
    setInputMinutes('');
  }

  function handleSaveNote() {
  if (activeHabit === null || !noteData.date) return;

  const dateKey = formatDate(noteData.date);
  const updatedHabits = [...habits];
  const habit = { ...updatedHabits[activeHabit] };

  // обновляем значение
  habit.data = { ...habit.data, [dateKey]: noteData.amount };

  // добавляем комментарии, если их ещё нет
  habit.comments = habit.comments || {};
  habit.comments[dateKey] = noteData.comment;

  updatedHabits[activeHabit] = habit;

  setHabits(updatedHabits);
  localStorage.setItem('habits', JSON.stringify(updatedHabits));

  setNoteModalOpen(false);
}


  return (
    <div className="App">
      <Header />
      <Quote />

      <main className="main-container">
        <div className="controls">
          <button onClick={() => setModalOpen(true)}>➕ Create habit</button>
        </div>

        <div id="habit-list">
          {habits.map((habit, index) => (
            <HabitCard
              key={habit.name}
              habit={habit}
              index={index}
              habits={habits}
              setHabits={setHabits}
              removeHabit={(i) => {
                const newHabits = habits.filter((_, idx) => idx !== i);
                setHabits(newHabits);
                localStorage.setItem('habits', JSON.stringify(newHabits));
              }}
              setEditHabitIndex={setEditHabitIndex}
              setEditHabitData={setEditHabitData}
              setEditModalOpen={setEditModalOpen}
              setNoteModalOpen={setNoteModalOpen}
              setNoteData={setNoteData}
              setActiveHabit={setActiveHabit}
              calculateStreak={calculateStreak}   
              calculateAverage={calculateAverage} 
            />
          ))}

        </div>
      </main>

      {/* --- МОДАЛКА СОЗДАНИЯ ПРИВЫЧКИ --- */}
      {modalOpen && (
        <div className="modal" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Create a new habit</h2>
            <input
              type="text"
              defaultValue={newHabitName}
              onBlur={e => setNewHabitName(e.target.value)}
              placeholder="Enter habit name"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setNewHabitName(e.target.value);
                  addHabit();
                }
              }}
            />

            <select
              value={newHabitType}
              onChange={e => setNewHabitType(e.target.value)}
              style={{ marginBottom: '1rem', width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #2f81f7', backgroundColor: '#0e1117', color: '#f0f0f0' }}
            >
              <option value="hours">Hours</option>
              <option value="amount">Amount</option>
            </select>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Choose color:</label>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {habitColors.map(c => (
                  <div
                    key={c.value}
                    onClick={() => setNewHabitColor(c.value)}
                    style={{
                      width: '25px',
                      height: '25px',
                      borderRadius: '50%',
                      backgroundColor: c.value,
                      border: newHabitColor === c.value ? '3px solid #fff' : '2px solid #444',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            <button onClick={addHabit}>Add</button>
            <button onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* --- МОДАЛКА ВВОДА МИНУТ --- */}
      {activeDate !== null && (
        <div className="modal" style={{ backgroundColor: 'rgba(14,17,23,0.8)' }}>
          <div className="modal-content" style={{ width: '250px', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '10px' }}><strong>Date:</strong> {formatHoverDate(activeDate)}</div>
            <div style={{ marginBottom: '10px' }}>
              <strong>{activeHabit !== null ? (habits[activeHabit].type === 'hours' ? 'Hours' : 'Amount') : ''}:</strong>
              <input
                type="number"
                value={inputMinutes}
                onChange={e => setInputMinutes(e.target.value)}
                style={{ width: '100%', marginTop: '5px', padding: '5px', borderRadius: '5px', border: '1px solid #2f81f7' }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setActiveDate(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* --- МОДАЛКА РЕДАКТИРОВАНИЯ ПРИВЫЧКИ --- */}
      {editModalOpen && (
        <div className="modal" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Edit habit</h2>
            <input
              type="text"
              defaultValue={editHabitData.name}
              onBlur={e => setEditHabitData({ ...editHabitData, name: e.target.value })}
              placeholder="Enter habit name"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setEditHabitData({ ...editHabitData, name: e.target.value });
                  handleEditSave();
                }
              }}
            />


            <select
              value={editHabitData.type}
              onChange={e => setEditHabitData({ ...editHabitData, type: e.target.value })}
              style={{
                marginBottom: '1rem',
                width: '100%',
                padding: '0.5rem',
                borderRadius: '5px',
                border: '1px solid #2f81f7',
                backgroundColor: '#0e1117',
                color: '#f0f0f0'
              }}
            >
              <option value="hours">Hours</option>
              <option value="amount">Amount</option>
            </select>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Choose color:</label>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {habitColors.map(c => (
                  <div
                    key={c.value}
                    onClick={() => setEditHabitData({ ...editHabitData, color: c.value })}
                    style={{
                      width: '25px',
                      height: '25px',
                      borderRadius: '50%',
                      backgroundColor: c.value,
                      border: editHabitData.color === c.value ? '3px solid #fff' : '2px solid #444',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            <button onClick={handleEditSave}>Save</button>
            <button onClick={() => setEditModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}


      {/* --- МОДАЛКА НОВОГО ТИПА (Amount + Комментарий) --- */}
      {noteModalOpen && (
        <div className="modal-overlay" onClick={() => setNoteModalOpen(false)}>
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
              <button onClick={handleSaveNote}>💾 Save</button>
              <button onClick={() => setNoteModalOpen(false)}>✖ Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div> 
  );
}

export default App;
