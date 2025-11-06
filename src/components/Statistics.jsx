// src/components/Statistics.jsx
import React, { useMemo } from "react";
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
import { formatDate, getDatesInRange } from "../utils/helpers";
import "./Statistics.css";

function Statistics({ habits }) {
  const summary = useMemo(() => {
    if (!habits.length) return { streaks: [], monthlyActivity: [] };

    // 🏆 Счёт streak'ов
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

    // ✅ Сортируем streak'и по убыванию
    streaks.sort((a, b) => b.streak - a.streak);

    // 📆 Активность за последний месяц
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const dates = getDatesInRange(oneMonthAgo, today);

    const monthlyActivity = dates.map((d) => {
      const key = formatDate(d);
      let activeCount = 0;
      habits.forEach((h) => {
        if (h.data && h.data[key] && h.data[key] > 0) activeCount++;
      });
      return { date: key, count: activeCount };
    });

    return { streaks, monthlyActivity };
  }, [habits]);

  // Ограничение длинных названий с многоточием
  const formatName = (name) => (name.length > 15 ? name.slice(0, 15) + "…" : name);

  return (
    <div className="statistics-container">
      <h2 className="title">📊 Progress & Statistics</h2>

      {habits.length === 0 ? (
        <p className="empty">No data — start by adding some habits!</p>
      ) : (
        <>
          <div className="summary">
            <p><b>Total habits:</b> {habits.length}</p>
          </div>

          {/* Лучшие Streak'и */}
          <h3 className="chart-title">🏆 Best Streaks</h3>
          <div className="chart-animate">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary.streaks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-30}          // наклон для длинных названий
                  textAnchor="end"     // выравнивание подписи
                  interval={0}         // показывать все подписи
                  height={60}          // увеличиваем высоту оси
                  tickFormatter={formatName} // обрезка с …
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="streak" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Активность за последний месяц */}
          <h3 className="chart-title">📅 Monthly Activity (Number of Habits per Day)</h3>
          <div className="chart-animate">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={summary.monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#2ecc71" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

export default Statistics;
