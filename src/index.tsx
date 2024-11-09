import { NativeModules } from 'react-native';

const isTurboModuleEnabled = (global as any).__turboModuleProxy != null;

const FrozenFrameModule = isTurboModuleEnabled
  ? require('./NativeBridge')
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

export default FrozenFrame;
