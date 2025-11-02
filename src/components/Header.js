import React from "react";
import "./Header.css";

function Header({ onShowHome, onShowStats, onShowProfile }) {
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
        <div className="user-avatar">S</div>
      </div>
    </header>
  );
}

export default Header;
