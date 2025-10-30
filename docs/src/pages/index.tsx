import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import DemoChart from '@site/src/components/DemoChart';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroContent}>
        <Heading as="h1" className={styles.heroTitle}>
          ❄️ De-frost
        </Heading>
        <p className={styles.heroSubtitle}>
          Detect, analyze, and eliminate frozen frames in your React Native apps with precision. 
          Track performance bottlenecks at the component level and optimize your app's rendering pipeline.
        </p>
        <div className={styles.buttons}>
          <Link
            className={clsx(styles.heroButton, styles.heroPrimary)}
            to="/docs/project/quick-start">
            Get Started →
          </Link>
          <Link
            className={clsx(styles.heroButton, styles.heroSecondary)}
            to="/docs/project/introduction">
            Learn More
          </Link>
        </div>
      </div>
    </header>
  );
}

function DemoSection() {
  return (
    <section className={styles.demoSection}>
      <div className={styles.demoContainer}>
        <Heading as="h2" className={styles.demoTitle}>
          See It In Action
        </Heading>
        <p className={styles.demoSubtitle}>
          Visualize frame rendering performance with detailed breakdowns of each pipeline stage. 
          Instantly identify frozen frames (red line at 700ms) and optimize your app's rendering.
        </p>
        <DemoChart />
        <div className={styles.demoCallout}>
          <p>
            <strong>🎯 Pro Tip:</strong> Look for bars crossing the red threshold line—those are frozen frames! 
            The chart breaks down each frame by rendering stage (animations, draw, GPU, etc.) so you know exactly where to optimize.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Frozen Frame Detection`}
      description="Track and optimize your React Native app's frozen frames with ease. Detect performance issues at the component level.">
      <HomepageHeader />
      <DemoSection />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
