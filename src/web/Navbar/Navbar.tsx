import React, { useContext, useState } from 'react';
import { ThemeContext } from '../App';
import Slider from '../Slider/Slider';
import NavbarItem from './NavbarItem';
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

  const navItems = [
    {
      label: 'Dashboard',
      href: '#',
      hasDropdown: false,
    },
    {
      label: 'Data Management',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Record New Data', href: '#' },
        { label: 'Import Data', href: '#' },
        { label: 'Export Results', href: '#' },
      ],
    },
    {
      label: 'Settings',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Visualization', href: '#' },
        { label: 'Performance', href: '#' },
        { label: 'Preferences', href: '#' },
      ],
    },
    {
      label: 'Documentation',
      href: '#',
      hasDropdown: false,
    },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>{title}</h1>
        <button className="menu-toggle" onClick={toggleMenu}>
          <span className={`menu-icon ${menuOpen ? 'open' : ''}`} />
        </button>
      </div>
      <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
        {navItems.map((item, index) => (
          <NavbarItem
            key={index}
            label={item.label}
            href={item.href}
            hasDropdown={item.hasDropdown}
            dropdownItems={item.dropdownItems}
            isMobile={isMobile()}
            activeDropdown={activeDropdown}
            onToggleDropdown={toggleDropdown}
          />
        ))}
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
