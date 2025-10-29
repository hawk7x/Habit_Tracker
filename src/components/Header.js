import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="top-bar">
      <div className="logo-area">
        <div className="logo-icon"></div>
        <h1 className="logo-text">My Habits</h1>
      </div>

      <nav className="nav-links">
        <a href="#profile">Profile</a>
        <a href="#premium">Premium</a>
        <a href="#notion">Notion</a>
        <a href="#settings">Settings</a>
      </nav>

      <div className="header-actions">
        <button className="upgrade-btn">Upgrade</button>
        <div className="user-avatar">S</div>
      </div>
    </header>
  );
}

export default Header;
