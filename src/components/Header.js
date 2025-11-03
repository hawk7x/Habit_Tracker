import React from "react";
import "./Header.css";

function Header({ onShowHome, onShowStats, onShowProfile, user }) {
  // to get the first digit of an email or displayName
  const initial =
    (user?.displayName?.[0] || user?.email?.[0] || "?").toUpperCase();

  return (
    <header className="top-bar">
      <div className="logo-area">
        <div className="logo-icon"></div>
        <h1 className="logo-text">My Habits</h1>
      </div>

      <nav className="nav-links">
        <button onClick={onShowHome}>🏠 Home</button>
        <button onClick={onShowStats}>📊 Statistics</button>
        <button onClick={onShowProfile}>👤 Profile</button>
      </nav>

      <div className="header-actions">
        <button className="upgrade-btn">Upgrade</button>
        <div className="user-avatar" onClick={onShowProfile}>
          {initial}
        </div>
      </div>
    </header>
  );
}

export default Header;
