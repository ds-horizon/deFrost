import React, { useContext } from 'react';
import { ThemeContext } from '../App';
import './Slider.css';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 5,
  max = 30,
  label = 'Bar Thickness',
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="slider-container">
      <label htmlFor="barThickness" className="slider-label">
        {label}:
      </label>
      <input
        type="range"
        id="barThickness"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-input"
        style={{
          accentColor: theme === 'dark' ? '#404040' : '#007bff',
        }}
      />
      <span className="slider-value">{value}px</span>
    </div>
  );
};

export default Slider;
