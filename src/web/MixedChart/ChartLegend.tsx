import React from 'react';
import './ChartLegend.css';

interface LegendItem {
  label: string;
  color: string;
  borderColor: string;
  hidden?: boolean;
}

interface ChartLegendProps {
  items: LegendItem[];
  onItemClick?: (index: number) => void;
}

const ChartLegend: React.FC<ChartLegendProps> = ({ items, onItemClick }) => {
  const handleItemClick = (index: number) => {
    if (onItemClick) {
      onItemClick(index);
    }
  };

  return (
    <div className="chart-legend">
      <div className="legend-container">
        {items.map((item, index) => (
          <div
            key={index}
            className="legend-item"
            onClick={() => handleItemClick(index)}
          >
            <span
              className="legend-color-box"
              style={{
                backgroundColor: item.color,
                borderColor: item.borderColor,
                opacity: item.hidden ? 0.2 : 1,
              }}
            />
            <span className={`legend-label ${item.hidden ? 'hidden' : ''}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartLegend;
