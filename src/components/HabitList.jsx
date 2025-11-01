import React from "react";
import HabitCard from "./HabitCard";
import './HabitList.css';

function HabitList({
  habits,
  setHabits,
  setEditHabitIndex,
  setEditHabitData,
  setEditModalOpen,
  setNoteModalOpen,
  setNoteData,
  setActiveHabit,
  calculateStreak,
  calculateAverage,
}) {
  const removeHabit = (index) => {
    const newHabits = habits.filter((_, i) => i !== index);
    setHabits(newHabits);
    localStorage.setItem("habits", JSON.stringify(newHabits));
  };

  return (
    <div id="habit-list">
      {habits.map((habit, index) => (
        <HabitCard
          key={habit.name}
          habit={habit}
          index={index}
          habits={habits}
          setHabits={setHabits}
          removeHabit={removeHabit}
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
  );
}

export default HabitList;
