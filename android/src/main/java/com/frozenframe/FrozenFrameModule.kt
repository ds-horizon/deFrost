package com.frozenframe

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import android.util.Log


class FrozenFrameModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  var logger: FileLogger = FileLogger()
  override fun getName(): String {
    return NAME
  }
  init {
    TimerSingleton.getInstance().start();
  }
  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  fun multiply(a: Double, b: Double, promise: Promise) {
    promise.resolve(a * b)
  }
  @ReactMethod
  fun writeInLogFiles(timestamp: String, tree: ReadableMap?) {
    try {
      val hm: HashMap<String, Long> = TimerSingleton.getInstance().getTimeStampMap()
      // Log.d("TimerThread timestamp", timestamp ? : "")
      val uptimeStamp: Long = (hm.get(timestamp) ?: 0) * 1000000
      Log.d("TimerThread upTime", uptimeStamp.toString() + "")
      logger.log(uptimeStamp, tree)
    } catch (e: Exception) {
      e.printStackTrace()
    }
  }

  @ReactMethod
  fun sendPerformanceEvent(timestamp: String?, event: String?) {
    try {
      val hm: HashMap<String, Long> = TimerSingleton.getInstance().getTimeStampMap()
      // Log.d("TimerThread timestamp", timestamp ? : "")
      val uptimeStamp: Long = (hm.get(timestamp) ?: 0) * 1000000
      logger.log(uptimeStamp.toString() + "", event)
    } catch (e: Exception) {
      e.printStackTrace()
    }
  }

  companion object {
    const val NAME = "Bridge"
  }
}
