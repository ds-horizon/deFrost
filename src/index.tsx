import { NativeModules, Platform } from 'react-native';
import type { DefrostType } from './NativeDefrostModule';
import { getComponentNameFromFiber } from './utils';

const isAndroid = Platform.OS === 'android';
const isTurboModuleEnabled = (global as any).__turboModuleProxy != null;

const FrozenFrameModule = isAndroid
  ? isTurboModuleEnabled
    ? require('./NativeDefrostModule').default
    : NativeModules.DefrostModule
  : null;

const FrozenFrame = FrozenFrameModule
  ? FrozenFrameModule
  : {
      sendPerformanceData: (timestamp: string, event: string) => {
        console.log(`Defrost is not enabled `, timestamp, event);
      },
      writeInLogFiles: (timestamp: string, _: string) => {
        console.log(`Defrost is not enabled `, timestamp);
      },
    };
FrozenFrame.getComponentNameFromFiber = getComponentNameFromFiber;

export default FrozenFrame as DefrostType;
