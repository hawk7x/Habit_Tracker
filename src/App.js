import React, { useState, useEffect } from 'react';
import './App.css';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getDatesInRange(startDate, endDate) {
  const dates = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
}

function getColor(minutes) {
  if (!minutes) return '#222';
  const maxMinutes = 60;
  const hue = 120;
  const lightness = 90 - Math.min(minutes / maxMinutes, 1) * 50;
  return `hsl(${hue}, 70%, ${lightness}%)`;
}

function formatHoverDate(date) {
  if (!date) return '';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = days[date.getDay()];
  const day = date.getDate().toString().padStart(2, '0');
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName} ${day} ${month} ${year}`;
}

// Quote Component с кнопкой "New Quote"
// в App.js
function Quote() {
  const [quote, setQuote] = React.useState('');
  const [author, setAuthor] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const fetchQuote = async () => {
  setLoading(true);
  setError(false);
  try {
    const randomParam = Math.random();
    const res = await fetch(
      'https://api.allorigins.win/get?url=' +
      encodeURIComponent('https://zenquotes.io/api/random') +
      `?r=${randomParam}`
    );
    if (!res.ok) throw new Error('Network response was not ok');

    const data = await res.json();
    const quoteData = JSON.parse(data.contents);
    setQuote(quoteData[0].q);
    setAuthor(quoteData[0].a);
    setLoading(false);
  } catch (err) {
    console.error(err);
    setError(true);
    setLoading(false);
  }
  };


  React.useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="quote-box">
      {loading && <p className="quote-text">Loading...</p>}
      {error && <p className="quote-text error">Failed to load quote</p>}
      {!loading && !error && (
        <>
          <p className="quote-text">“{quote}”</p>
          <p className="quote-author">— {author}</p>
        </>
      )}
      <button className="new-quote-btn" onClick={fetchQuote}>New Quote</button>
    </div>
  );
}


function App() {
  const [habits, setHabits] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [activeHabit, setActiveHabit] = useState(null);
  const [activeDate, setActiveDate] = useState(null);
  const [inputMinutes, setInputMinutes] = useState('');

  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  // Load habits from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('habits')) || [];
    setHabits(saved);
  }, []);

  function addHabit() {
    const name = newHabitName.trim();
    if (!name) return alert('Введите имя привычки');
    if (habits.find(h => h.name === name)) return alert('Привычка с таким именем уже есть!');
    const newHabits = [...habits, { name, data: {} }];
    setHabits(newHabits);
    localStorage.setItem('habits', JSON.stringify(newHabits));
    setNewHabitName('');
    setModalOpen(false);
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

  function HabitCard({ habit, index, removeHabit }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editedName, setEditedName] = useState(habit.name);
    const [isRemoving, setIsRemoving] = useState(false);

    const dates = getDatesInRange(oneYearAgo, today);

    const weeks = [];
    let currentWeek = [];
    dates.forEach(date => {
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
        const dayObj = weeks[week].find(d => (d.getDay() || 7) === day);
        row.push(dayObj || null);
      }
      matrix.push(row);
    }

    const monthLabels = [];
    const addedMonths = new Set();
    weeks.forEach((week, weekIndex) => {
      week.forEach(date => {
        const month = date.getMonth();
        if (date.getDay() === 1 && !addedMonths.has(month)) {
          monthLabels.push({ name: monthNames[month], col: weekIndex + 2 });
          addedMonths.add(month);
        }
      });
    });

    function handleEdit() {
      if (!editedName.trim()) return alert('Введите корректное имя');
      const newHabits = [...habits];
      newHabits[index].name = editedName.trim();
      setHabits(newHabits);
      localStorage.setItem('habits', JSON.stringify(newHabits));
      setEditMode(false);
      setMenuOpen(false);
    }

    function handleDelete() {
      if (!window.confirm(`Удалить привычку "${habit.name}"?`)) return;
      setIsRemoving(true);
      setTimeout(() => removeHabit(index), 300);
      setMenuOpen(false);
    }

    return (
      <div className={`habit ${isRemoving ? 'removing' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editMode ? (
            <input
              type="text"
              value={editedName}
              onChange={e => setEditedName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEdit()}
              autoFocus
              style={{ flex: 1, marginRight: '5px', padding: '3px 5px', borderRadius: '5px', border: '1px solid #2f81f7' }}
            />
          ) : (
            <h2>{habit.name}</h2>
          )}
          <div style={{ position: 'relative' }}>
            <button className="menu-btn" onClick={() => setMenuOpen(prev => !prev)}>⋮</button>
            {menuOpen && (
              <div className="menu-dropdown">
                <div onClick={() => setEditMode(true)}>Edit</div>
                <div onClick={handleDelete}>Delete</div>
              </div>
            )}
          </div>
        </div>

        <div className="months-row" style={{ display: 'grid', gridTemplateColumns: `30px repeat(${weeksCount}, 16px)`, columnGap: '2px', marginBottom: '5px' }}>
          <div></div>
          {monthLabels.map((m, idx) => (
            <div key={idx} className="month-label" style={{ gridColumnStart: m.col }}>{m.name}</div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <div className="days-column">
            {daysOfWeek.map((d, i) => <div key={i} className="day-label">{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateRows: `repeat(7,16px)`, gridTemplateColumns: `repeat(${weeksCount},16px)`, columnGap: '2px', rowGap: '2px' }}>
            {Array.from({ length: daysCount }).flatMap((_, dayIndex) =>
              Array.from({ length: weeksCount }).map((_, weekIndex) => {
                const date = matrix[dayIndex][weekIndex];
                const key = date ? formatDate(date) : null;
                const minutes = key && habit.data[key] ? habit.data[key] : 0;
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="day"
                    title={date ? `${formatHoverDate(date)}\nMinutes: ${minutes}` : ''}
                    style={{ backgroundColor: getColor(minutes) }}
                    onClick={() => date && (setActiveHabit(index), setActiveDate(date), setInputMinutes(''))}
                  />
                );
              })
            )}
          </div>
        </div>

        <div className="stats">
          <p><span className="label">Streak:</span> <span className="value">{calculateStreak(habit.data)} days</span></p>
          <p><span className="label">Average:</span> <span className="value">{calculateAverage(habit.data)} minutes</span></p>
        </div>
      </div>
    );
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

  return (
    <div className="App">
      <header className="top-bar">
        <div>
          <h1>✅ My habits</h1>
        </div>
        <nav>
          <a href="#profile">Profile</a>
          <a href="#premium">Premium</a>
          <a href="#notion">Notion embeds</a>
          <a href="#settings">Settings</a>
        </nav>
      </header>

      {/* Quote сразу под меню */}
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
              removeHabit={(i) => {
                const newHabits = habits.filter((_, idx) => idx !== i);
                setHabits(newHabits);
                localStorage.setItem('habits', JSON.stringify(newHabits));
              }}
            />
          ))}
        </div>
      </main>

      {modalOpen && (
        <div className="modal" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Create a new habit</h2>
            <input
              type="text"
              value={newHabitName}
              onChange={e => setNewHabitName(e.target.value)}
              placeholder="Enter habit name"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && addHabit()}
            />
            <button onClick={addHabit}>Add</button>
            <button onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {activeDate !== null && (
        <div className="modal" style={{ backgroundColor: 'rgba(14,17,23,0.8)' }}>
          <div className="modal-content" style={{ width: '250px', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '10px' }}><strong>Date:</strong> {formatHoverDate(activeDate)}</div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Minutes:</strong>
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
    </div>
  );
}

export default App;
