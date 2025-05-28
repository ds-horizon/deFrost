import React, { useContext, useState } from 'react';
import { ThemeContext } from '../App';
import Slider from '../Slider/Slider';
import './Navbar.css';

interface NavbarProps {
  title?: string;
  barThickness?: number;
  onBarThicknessChange?: (value: number) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  title = 'De-Frost',
  barThickness = 14,
  onBarThicknessChange,
}) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleDropdown = (dropdown: string) => {
    if (activeDropdown === dropdown) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdown);
    }
  };

  // Check if we're on mobile (smaller screen)
  const isMobile = () => window.innerWidth <= 768;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>{title}</h1>
        <button className="menu-toggle" onClick={toggleMenu}>
          <span className={`menu-icon ${menuOpen ? 'open' : ''}`} />
        </button>
      </div>
      <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
        <div className="navbar-item">
          <a href="#" className="navbar-link">
            Dashboard
          </a>
        </div>
        <div
          className={`navbar-item dropdown ${activeDropdown === 'data' ? 'active' : ''}`}
        >
          <a
            href="#"
            className="navbar-link"
            onClick={(e) => {
              e.preventDefault();
              if (isMobile()) {
                toggleDropdown('data');
              }
            }}
          >
            Data Management
          </a>
          <div className="dropdown-content">
            <a href="#">Record New Data</a>
            <a href="#">Import Data</a>
            <a href="#">Export Results</a>
          </div>
        </div>
        <div
          className={`navbar-item dropdown ${activeDropdown === 'settings' ? 'active' : ''}`}
        >
          <a
            href="#"
            className="navbar-link"
            onClick={(e) => {
              e.preventDefault();
              if (isMobile()) {
                toggleDropdown('settings');
              }
            }}
          >
            Settings
          </a>
          <div className="dropdown-content">
            <a href="#">Visualization</a>
            <a href="#">Performance</a>
            <a href="#">Preferences</a>
          </div>
        </div>
        <div className="navbar-item">
          <a href="#" className="navbar-link">
            Documentation
          </a>
        </div>
      </div>
      <div className={`navbar-end ${menuOpen ? 'open' : ''}`}>
        {onBarThicknessChange && (
          <div className="navbar-slider">
            <span className="slider-label">
              Bar Thickness: {barThickness}px
            </span>
            <Slider
              value={barThickness}
              onChange={onBarThicknessChange}
              min={8}
              max={30}
            />
          </div>
        )}
        <button onClick={toggleTheme} className="theme-toggle-button">
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
