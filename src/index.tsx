import { NativeModules } from 'react-native';

const FrozenFrame = NativeModules.Bridge
  ? NativeModules.Bridge
  : {
      sendPerformanceData: (timestamp: string, event: string) => {
        console.log(`Native Module for Defrost not found `, timestamp, event);
      },
    };

export function sendPerformanceData(timestamp: string, event: string) {
  FrozenFrame.sendPerformanceData(timestamp, event);
}
