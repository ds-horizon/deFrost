import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  sendPerformanceEvent: (timestamp: string, event: string) => Promise<void>;
  writeInLogFiles: (
    timestamp: string,
    tree: {
      change: string;
      list: Array<{ componentName: string; flags: number; key: string }>;
    }
  ) => Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('Bridge');
