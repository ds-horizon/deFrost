import React from 'react';
import styles from './styles.module.css';

const DemoChart: React.FC = () => {
  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartWrapper}>
        <div className={styles.chartTitle}>Frame Rendering Performance Analysis</div>
        <div className={styles.chartImage}>
          <img 
            src="/img/dashboard.gif" 
            alt="Frame Rendering Performance Analysis" 
            className={styles.chartImg}
          />
        </div>
      </div>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ background: '#6b8e95' }}></span>
          <span>Misc/Vsync</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ background: '#5eb3e4' }}></span>
          <span>Input</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ background: '#ff1456' }}></span>
          <span>Animations</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ background: '#4bc0c0' }}></span>
          <span>Measure</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ background: '#9966ff' }}></span>
          <span>Draw</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ background: '#ffe140' }}></span>
          <span>Sync</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ background: '#666666' }}></span>
          <span>GPU</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ background: '#61dafb' }}></span>
          <span>React</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ background: '#8b7355' }}></span>
          <span>Log</span>
        </div>
      </div>
      <div className={styles.thresholdLegend}>
        <div className={styles.legendItem}>
          <span className={styles.dashedLine} style={{ borderColor: '#ef4444' }}></span>
          <span>Frozen Frame (&gt;700ms)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dashedLine} style={{ borderColor: '#10b981' }}></span>
          <span>Slow Frame (&gt;16ms)</span>
        </div>
      </div>
    </div>
  );
};

export default DemoChart;

