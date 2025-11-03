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

function USPSection() {
  return (
    <section className={styles.uspSection}>
      <div className={styles.uspContainer}>
        <Heading as="h2" className={styles.uspTitle}>
          The React Native Performance Gap
        </Heading>
        <p className={styles.uspSubtitle}>
          Traditional Android tools detect frozen frames but can't tell you which React component caused them
        </p>
        
        <div className={styles.problemSolutionGrid}>
          {/* Problem Side */}
          <div className={styles.problemSide}>
            <div className={styles.sideTag + ' ' + styles.problemTag}>
              ❌ Traditional Tools
            </div>
            
            <p className={styles.explanationText}>
              Standard profilers detect frozen frames and provide stack traces, 
              but they only point to native rendering code—not your JavaScript components.
            </p>
            
            <div className={styles.splitWorld}>
              <div className={styles.worldHalf}>
                <div className={styles.halfIcon}>⚛️</div>
                <div className={styles.halfLabel}>JavaScript</div>
                <div className={styles.halfDesc}>Your Code</div>
              </div>
              <div className={styles.dividerLine}></div>
              <div className={styles.worldHalf}>
                <div className={styles.halfIcon}>🤖</div>
                <div className={styles.halfLabel}>Native</div>
                <div className={styles.halfDesc}>Rendering</div>
              </div>
            </div>
            
            <div className={styles.disconnectIndicator}>
              <div className={styles.disconnectIcon}>💔</div>
              <div className={styles.disconnectText}>No Connection</div>
              <div className={styles.indicatorSubtext}>Stack traces are useless</div>
            </div>
            
            <div className={styles.outcomeCard + ' ' + styles.badOutcome}>
              😵 Can't identify which JavaScript component caused the frozen frame
            </div>
          </div>

          {/* Solution Side */}
          <div className={styles.solutionSide}>
            <div className={styles.sideTag + ' ' + styles.solutionTag}>
              ✅ With De-frost
            </div>
            
            <p className={styles.explanationText}>
              De-frost tracks React component state changes (commits) and correlates them 
              with native frame rendering—bridging the JavaScript ↔ Native gap.
            </p>
            
            <div className={styles.splitWorld}>
              <div className={styles.worldHalf}>
                <div className={styles.halfIcon}>⚛️</div>
                <div className={styles.halfLabel}>JavaScript</div>
                <div className={styles.halfDesc}>Your Code</div>
              </div>
              <div className={styles.bridgeLine}>
                <div className={styles.bridgeBadge}>
                  <span className={styles.bridgeIcon}>❄️</span>
                  De-frost
                </div>
              </div>
              <div className={styles.worldHalf}>
                <div className={styles.halfIcon}>🤖</div>
                <div className={styles.halfLabel}>Native</div>
                <div className={styles.halfDesc}>Rendering</div>
              </div>
            </div>
            
            <div className={styles.connectIndicator}>
              <div className={styles.connectIcon}>🌉</div>
              <div className={styles.connectText}>React Commit Tracking</div>
              <div className={styles.indicatorSubtext}>Links JS changes to frames</div>
            </div>
            
            <div className={styles.outcomeCard + ' ' + styles.goodOutcome}>
              🎯 Identifies the exact JavaScript component that caused the frozen frame
            </div>
          </div>
        </div>
      </div>
    </section>
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
      <USPSection />
      <DemoSection />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
