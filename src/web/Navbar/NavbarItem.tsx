import React from 'react';

interface NavbarItemProps {
  label: string;
  hasDropdown?: boolean;
  dropdownItems?: Array<{ label: string; href: string }>;
  href?: string;
  isMobile: boolean;
  activeDropdown: string | null;
  onToggleDropdown: (dropdown: string) => void;
}

const NavbarItem: React.FC<NavbarItemProps> = ({
  label,
  hasDropdown = false,
  dropdownItems = [],
  href = '#',
  isMobile,
  activeDropdown,
  onToggleDropdown,
}) => {
  const isActive = activeDropdown === label;

  const handleClick = (e: React.MouseEvent) => {
    if (hasDropdown && isMobile) {
      e.preventDefault();
      onToggleDropdown(label);
    }
  };

  return (
    <div
      className={`navbar-item ${hasDropdown ? 'dropdown' : ''} ${isActive ? 'active' : ''}`}
    >
      <a href={href} className="navbar-link" onClick={handleClick}>
        {label}
      </a>
      {hasDropdown && dropdownItems.length > 0 && (
        <div className="dropdown-content">
          {dropdownItems.map((item, index) => (
            <a key={index} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavbarItem;
