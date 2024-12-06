import { NativeModules, Platform } from 'react-native';
import type { DefrostType } from './NativeBridge';

const isAndroid = Platform.OS === 'android';
const isTurboModuleEnabled = (global as any).__turboModuleProxy != null;

const FrozenFrameModule = isAndroid
  ? isTurboModuleEnabled
    ? require('./NativeBridge').default
    : NativeModules.Bridge
  : null;

const FrozenFrame = FrozenFrameModule
  ? FrozenFrameModule
  : {
      sendPerformanceData: (timestamp: string, event: string) => {
        console.log(`Defrost is not enabled `, timestamp, event);
      },
      writeInLogFiles: (timestamp: string, tree: string) => {
        console.log(`Defrost is not enabled `, timestamp, tree);
      },
    };

export default FrozenFrame as DefrostType;
