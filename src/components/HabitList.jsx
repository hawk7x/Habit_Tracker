// src/components/HabitList.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HabitCard from "./HabitCard";
import "./HabitList.css";

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
  habitCategories, // ✅
}) {
  const [openCategories, setOpenCategories] = useState({});

  // ✅ Загружаем состояние категорий при первой загрузке
  useEffect(() => {
    const saved = localStorage.getItem("openCategories");
    if (saved) {
      setOpenCategories(JSON.parse(saved));
    } else {
      // по умолчанию все категории открыты
      const initialState = {};
      habitCategories.forEach((cat) => (initialState[cat.value] = true));
      setOpenCategories(initialState);
    }
  }, []); // ✅ безопасно — habitCategories вне компонента

  // ✅ Сохраняем при каждом изменении состояния
  useEffect(() => {
    localStorage.setItem("openCategories", JSON.stringify(openCategories));
  }, [openCategories]);

  const groupedHabits = habits.reduce((acc, habit) => {
    const cat = habit.category || "uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(habit);
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setOpenCategories((prev) => {
      const updated = { ...prev, [category]: !prev[category] };
      localStorage.setItem("openCategories", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div id="habit-list">
      {habitCategories.map((cat) => {
        const categoryHabits = groupedHabits[cat.value] || [];
        if (categoryHabits.length === 0) return null;

        const isOpen = openCategories[cat.value] ?? true;

        return (
          <div key={cat.value} className={`habit-category ${isOpen ? "open" : ""}`}>
            <div
              className="habit-category-header"
              onClick={() => toggleCategory(cat.value)}
            >
              <span className="habit-category-icon">{cat.icon}</span>
              <span className="habit-category-title">{cat.name}</span>
              <span className="habit-category-toggle">
                {isOpen ? "▲" : "▼"}
              </span>
            </div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="habit-category-content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {categoryHabits.map((habit) => (
                    <HabitCard
                      key={habit.name}
                      habit={habit}
                      index={habits.indexOf(habit)}
                      habits={habits}
                      setHabits={setHabits}
                      removeHabit={(i) => {
                        const newHabits = habits.filter((_, idx) => idx !== i);
                        setHabits(newHabits);
                        localStorage.setItem("habits", JSON.stringify(newHabits));
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* ✅ Uncategorized habits */}
      {groupedHabits["uncategorized"] &&
        groupedHabits["uncategorized"].length > 0 && (
          <div className="habit-category">
            <div
              className="habit-category-header"
              onClick={() => toggleCategory("uncategorized")}
            >
              <span className="habit-category-icon">❓</span>
              <span className="habit-category-title">Uncategorized</span>
              <span className="habit-category-toggle">
                {openCategories["uncategorized"] ?? true ? "▲" : "▼"}
              </span>
            </div>

            <AnimatePresence>
              {(openCategories["uncategorized"] ?? true) && (
                <motion.div
                  className="habit-category-content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {groupedHabits["uncategorized"].map((habit) => (
                    <HabitCard
                      key={habit.name}
                      habit={habit}
                      index={habits.indexOf(habit)}
                      habits={habits}
                      setHabits={setHabits}
                      removeHabit={(i) => {
                        const newHabits = habits.filter((_, idx) => idx !== i);
                        setHabits(newHabits);
                        localStorage.setItem("habits", JSON.stringify(newHabits));
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
    </div>
  );
}

export default HabitList;
