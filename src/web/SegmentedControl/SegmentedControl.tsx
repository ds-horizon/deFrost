import React, { useState, useEffect, useRef } from 'react';
import './SegmentedControl.css';

interface Segment {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  name: string;
  segments: Segment[];
  callback: (val: string, index: number) => void;
  defaultIndex?: number;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  name,
  segments,
  callback,
  defaultIndex = 0,
}) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeSegment = container.querySelectorAll('.segment')[
      activeIndex
    ] as HTMLElement;
    if (activeSegment) {
      const { offsetWidth, offsetLeft } = activeSegment;
      container.style.setProperty('--highlight-width', `${offsetWidth}px`);
      container.style.setProperty('--highlight-x-pos', `${offsetLeft}px`);
    }
  }, [activeIndex]);

  const onInputChange = (value: string, index: number) => {
    setActiveIndex(index);
    callback(value, index);
  };

  return (
    <div className="controls-container" ref={containerRef}>
      <div className={`controls ready`}>
        {segments.map((item, i) => (
          <div
            key={item.value}
            className={`segment ${i === activeIndex ? 'active' : 'inactive'}`}
          >
            <input
              type="radio"
              value={item.value}
              id={item.label}
              name={name}
              onChange={() => onInputChange(item.value, i)}
              checked={i === activeIndex}
            />
            <label htmlFor={item.label}>{item.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SegmentedControl;
