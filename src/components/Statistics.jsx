// src/components/Statistics.jsx
import React, { useMemo } from "react";
import './Statistics.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import "./Statistics.css";

function Statistics({ habits }) {
  // 🔹 Подготовка данных для визуализации
  const summary = useMemo(() => {
    if (!habits.length) return { averages: [], streaks: [], total: 0 };

    const averages = habits.map((h) => {
      const values = Object.values(h.data || {});
      const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      return { name: h.name, average: Math.round(avg) };
    });

    const streaks = habits.map((h) => {
      const dates = Object.keys(h.data || {}).sort();
      let best = 0;
      let current = 0;
      dates.forEach((date) => {
        if (h.data[date] > 0) {
          current++;
          if (current > best) best = current;
        } else {
          current = 0;
        }
      });
      return { name: h.name, streak: best };
    });

    const total = averages.reduce((acc, h) => acc + h.average, 0);
    return { averages, streaks, total };
  }, [habits]);

  return (
    <div className="statistics-container">
      <h2 className="title">📊 Прогресс и статистика</h2>

      {habits.length === 0 ? (
        <p className="empty">Нет данных — начни с добавления привычек!</p>
      ) : (
        <>
          <div className="summary">
            <p><b>Всего привычек:</b> {habits.length}</p>
            <p><b>Общий средний прогресс:</b> {summary.total}</p>
            <p>
              <b>Лучшая привычка:</b>{" "}
              {summary.averages.sort((a, b) => b.average - a.average)[0]?.name}
            </p>
          </div>

          <h3 className="chart-title">Средние значения</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary.averages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>

          <h3 className="chart-title">Лучшие Streak'и</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={summary.streaks}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="streak" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}

export default Statistics;
