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

function getColor(minutes, habitData, baseColor = '#2ecc71') {
  if (!minutes) return '#222';

  const allValues = Object.values(habitData);
  if (allValues.length === 0) return baseColor;

  const max = Math.max(...allValues);
  const ratio = max ? minutes / max : 0;

  // Converting the color to HSL
  const hsl = hexToHSL(baseColor);
  const lightness = 90 - ratio * 50; // the higher the value, the darker

  return `hsl(${hsl.h}, ${hsl.s}%, ${lightness}%)`;
}

// auxiliary function for HEX → HSL translation
function hexToHSL(H) {
  let r = 0, g = 0, b = 0;
  if (H.length === 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length === 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const cmin = Math.min(r,g,b);
  const cmax = Math.max(r,g,b);
  const delta = cmax - cmin;
  let h = 0, s = 0, l = 0;
  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);
  return { h, s, l };
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

function Quote() {
  const [quote, setQuote] = React.useState({ text: '', author: '' });
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

      setQuote({ text: quoteData[0].q, author: quoteData[0].a });
    } catch (err) {
      console.error(err);
      setError(true);
      setQuote({
        text: "Success is not final, failure is not fatal.",
        author: "Winston Churchill"
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchQuote(); }, []);

  return (
    <div className="quote-container">
      {loading ? (
        <p className="quote-text">Loading...</p>
      ) : (
        <>
          {error && <p className="quote-error">Failed to load, showing fallback</p>}
          <p className="quote-text">“{quote.text}”</p>
          <p className="quote-author">— {quote.author}</p>
        </>
      )}
      <button className="new-quote-btn" onClick={fetchQuote}>New Quote</button>
    </div>
  );
}




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

  function HabitCard({ habit, index, removeHabit }) {
    const [menuOpen, setMenuOpen] = useState(false);
    useEffect(() => {
      function handleClickOutside(event) {
        if (!event.target.closest('.menu-btn') && !event.target.closest('.menu-dropdown')) {
          setMenuOpen(false);
        }
      }

      if (menuOpen) {
        document.addEventListener('click', handleClickOutside);
      }

      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }, [menuOpen]);

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
              <div
                className="menu-item edit"
                onClick={() => {
                  setEditHabitIndex(index);
                  setEditHabitData({ name: habit.name, type: habit.type, color: habit.color });
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
                    title={date ? `${formatHoverDate(date)}\n${habit.type === 'hours' ? 'Hours' : 'Amount'}: ${minutes}` : ''}
                    style={{ backgroundColor: getColor(minutes, habit.data, habit.color) }}
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

      {/* --- МОДАЛКА СОЗДАНИЯ ПРИВЫЧКИ --- */}
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
              value={editHabitData.name}
              onChange={e => setEditHabitData({ ...editHabitData, name: e.target.value })}
              placeholder="Enter habit name"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleEditSave()}
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
    </div> 
  );
}

export default App;
