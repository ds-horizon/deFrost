import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import './CommitPanel.css';
import Dropdown from '../Dropdown/Dropdown';
import type { ModalDataType } from '../AppInterface';
import { blackListedComponents } from './CommitPanelUtils';

interface CommitPanelProps {
  isOpen: boolean;
  commitData: ModalDataType[];
  onClose: () => void;
}

const CommitPanel: React.FC<CommitPanelProps> = ({
  isOpen,
  commitData,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [panelHeight, setPanelHeight] = useState<number>(40); // Default height in vh
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const startDragPosRef = useRef<number>(0);
  const startHeightRef = useRef<number>(40);

  // Handle mouse movement during drag - memoized to avoid stale closures
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      // When moving up (negative deltaY), panel height should increase
      // When moving down (positive deltaY), panel height should decrease
      const deltaY = e.clientY - startDragPosRef.current;
      const windowHeight = window.innerHeight;

      // Calculate new height as vh percentage (inverse relationship)
      // Moving down (positive deltaY) decreases height
      let newHeight = startHeightRef.current - (deltaY / windowHeight) * 100;

      // Constrain height between 20vh and 80vh
      newHeight = Math.max(20, Math.min(80, newHeight));

      setPanelHeight(newHeight);
    },
    [isDragging]
  );

  // End drag operation - memoized to avoid stale closures
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.classList.remove('cursor-ns-resize');
  }, []);

  // Start drag operation
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      startDragPosRef.current = e.clientY;
      startHeightRef.current = panelHeight;
      setIsDragging(true);
      document.body.classList.add('cursor-ns-resize');
    },
    [panelHeight]
  );

  // Handle touch events for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        e.preventDefault();
        const touchY = e.touches[0]?.clientY;

        if (typeof touchY === 'number') {
          startDragPosRef.current = touchY;
          startHeightRef.current = panelHeight;
          setIsDragging(true);
          document.body.classList.add('cursor-ns-resize');
        }
      }
    },
    [panelHeight]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !e.touches || e.touches.length === 0) return;

      const touchY = e.touches[0]?.clientY;

      if (typeof touchY === 'number') {
        // When moving up (negative deltaY), panel height should increase
        // When moving down (positive deltaY), panel height should decrease
        const deltaY = touchY - startDragPosRef.current;
        const windowHeight = window.innerHeight;

        // Calculate new height as vh percentage (inverse relationship)
        let newHeight = startHeightRef.current - (deltaY / windowHeight) * 100;
        newHeight = Math.max(20, Math.min(80, newHeight));

        setPanelHeight(newHeight);
      }
    },
    [isDragging]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    document.body.classList.remove('cursor-ns-resize');
  }, []);

  // Set up and clean up event listeners
  useEffect(() => {
    const handleMouseMoveEvent = (e: MouseEvent) => handleMouseMove(e);
    const handleMouseUpEvent = () => handleMouseUp();
    const handleTouchMoveEvent = (e: TouchEvent) => handleTouchMove(e);
    const handleTouchEndEvent = () => handleTouchEnd();

    if (isDragging) {
      // Add event listeners for drag operation
      window.addEventListener('mousemove', handleMouseMoveEvent);
      window.addEventListener('mouseup', handleMouseUpEvent);
      window.addEventListener('touchmove', handleTouchMoveEvent, {
        passive: false,
      });
      window.addEventListener('touchend', handleTouchEndEvent);
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveEvent);
      window.removeEventListener('mouseup', handleMouseUpEvent);
      window.removeEventListener('touchmove', handleTouchMoveEvent);
      window.removeEventListener('touchend', handleTouchEndEvent);
      document.body.classList.remove('cursor-ns-resize');
    };
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // Save the panel height to localStorage when it changes
  useEffect(() => {
    if (panelHeight && isOpen) {
      localStorage.setItem('commitPanelHeight', panelHeight.toString());
    }
  }, [panelHeight, isOpen]);

  // Load the saved panel height from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const savedHeight = localStorage.getItem('commitPanelHeight');
      if (savedHeight) {
        const parsedHeight = parseFloat(savedHeight);
        if (!isNaN(parsedHeight) && parsedHeight >= 20 && parsedHeight <= 80) {
          setPanelHeight(parsedHeight);
          startHeightRef.current = parsedHeight;
        }
      }
    }
  }, [isOpen]);

  // Process data for dropdown and component list
  const { processedOptions, processedComponentList } = useProcessData(
    commitData,
    selectedIndex
  );

  // Handle dropdown selection
  const onSelect = useCallback(
    (element: string) => {
      const index = processedOptions.indexOf(element);
      if (index >= 0) {
        setSelectedIndex(index);
      }
    },
    [processedOptions]
  );

  // If the panel is not open or there's no data, render an empty div instead of null
  if (!isOpen || commitData.length === 0) {
    return <div className="commit-panel" style={{ display: 'none' }} />;
  }

  return (
    <div
      className={`commit-panel ${isOpen ? 'open' : ''} ${isDragging ? 'dragging' : ''}`}
      ref={panelRef}
      style={{ minHeight: `${panelHeight}vh` }}
    >
      <div
        className="resize-handle"
        ref={handleRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="drag-indicator" />
      </div>

      <div className="commit-panel-header">
        <h3>React Commit Details</h3>
        <button
          className="close-panel-button"
          onClick={onClose}
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      <div className="commit-panel-content">
        {commitData.length > 1 && (
          <div className="commit-dropdown">
            <Dropdown
              options={processedOptions}
              onSelect={onSelect}
              placeholder={processedOptions[0] || ''}
            />
          </div>
        )}

        <div className="commit-details">
          <div className="commit-title">
            {`Component: ${commitData[selectedIndex]?.label}`}
          </div>
          <div className="commit-components">
            <p>{`Component Tree:`}</p>
            <div className="commit-components-list">
              {processedComponentList.length > 0 ? (
                processedComponentList.map((compStr: string, idx: number) => (
                  <div key={idx} className="component-item">
                    {compStr ? compStr : 'Unknown component'}
                  </div>
                ))
              ) : (
                <div className="component-item">
                  No children components found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom hook to process data
function useProcessData(commitData: ModalDataType[], selectedIndex: number) {
  // Memoize processed data to avoid unnecessary recalculations
  return useMemo(() => {
    const componentList: string[] = [];

    const options = commitData.map((ele) => {
      return ele.label || '';
    });

    // Populate component list if data exists
    if (commitData.length > 0 && commitData[selectedIndex]?.data) {
      commitData[selectedIndex].data?.forEach((component) => {
        if (!blackListedComponents.includes(component.componentName || '')) {
          componentList.push(component.componentName || '');
        }
      });
    }

    return {
      processedOptions: options,
      processedComponentList: [...componentList].reverse(),
    };
  }, [commitData, selectedIndex]);
}

export default CommitPanel;
