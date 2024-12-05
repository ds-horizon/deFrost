import { NativeModules } from 'react-native';
import type { DefrostType } from './NativeBridge';

const isTurboModuleEnabled = (global as any).__turboModuleProxy != null;

const FrozenFrameModule = isTurboModuleEnabled
  ? require('./NativeBridge').default
  : NativeModules.Bridge;

const FrozenFrame = FrozenFrameModule
  ? FrozenFrameModule
  : {
      sendPerformanceData: (timestamp: string, event: string) => {
        console.log(`Defrost is not enabled `, timestamp, event);
      },
      writeInLogFiles: (timestamp: string, tree: any) => {
        console.log(`Defrost is not enabled `, timestamp, tree);
      },
    };

export default FrozenFrame as DefrostType;
