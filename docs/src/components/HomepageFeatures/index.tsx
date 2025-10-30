import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Detect Frozen Frames',
    icon: '🧊',
    description: (
      <>
        Automatically identify frames taking over 700ms to render. See detailed breakdowns 
        across 9 rendering pipeline stages including animations, draw, GPU, and more.
      </>
    ),
  },
  {
    title: 'Minimal Overhead',
    icon: '⚡',
    description: (
      <>
        Designed to work efficiently without adding unnecessary load, ensuring your 
        app remains smooth and responsive during development and testing.
      </>
    ),
  },
  {
    title: 'Simple CLI Commands',
    icon: '🔌',
    description: (
      <>
        Three easy commands to create builds, record data, and visualize results. 
        No complex setup—just install, run, and analyze your app's performance.
      </>
    ),
  },
  {
    title: 'React Commit Tracking',
    icon: '🎯',
    description: (
      <>
        Track React component state changes and correlate them with frame rendering. 
        See which component updates cause performance bottlenecks in real-time.
      </>
    ),
  },
  {
    title: 'Interactive Dashboard',
    icon: '📊',
    description: (
      <>
        Visual web dashboard with bar graphs and scatter plots. Export data as CSV 
        for further analysis and share reports with your team.
      </>
    ),
  },
  {
    title: 'New Architecture Ready',
    icon: '🏗️',
    description: (
      <>
        Fully compatible with React Native's new architecture including TurboModules 
        and Fabric. Future-proof your performance monitoring.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className={styles.featuresContainer}>
        <Heading as="h2" className={styles.featuresTitle}>
          Why Choose De-frost?
        </Heading>
        <p className={styles.featuresSubtitle}>
          Powerful features designed to help you build butter-smooth React Native applications
        </p>
        <div className="container">
          <div className="row" style={{rowGap: '2rem'}}>
            {FeatureList.map((props, idx) => (
              <Feature key={idx} {...props} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
