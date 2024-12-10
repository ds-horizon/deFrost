package com.frozenframe

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.turbomodule.core.interfaces.TurboModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import android.util.Log
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = FrozenFrameModule.NAME)
class FrozenFrameModule(reactContext: ReactApplicationContext) :
    NativeDefrostModuleSpec(reactContext) {
    private var logger: FileLogger = FileLogger()

    init {
        TimerSingleton.getInstance().start()
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    override fun sendPerformanceEvent(timestamp: String?, event: String?, promise: Promise?) {
        try {
            val systemTimeToUptimeMapping: HashMap<String, Long> =
                TimerSingleton.getInstance().getTimeStampMap()
            val uptimeStamp: Long = (systemTimeToUptimeMapping[timestamp] ?: 0) * 1000000
            logger.writeToLogFile(uptimeStamp.toString(), event)
        } catch (e: Exception) {
            e.printStackTrace()
        }
        promise?.resolve(null)
    }

    @ReactMethod
    override fun writeInLogFiles(timestamp: String?, tree: ReadableMap?, promise: Promise?) {
        try {
            val systemTimeToUptimeMapping: HashMap<String, Long> =
                TimerSingleton.getInstance().getTimeStampMap()
            val uptimeStamp: Long = (systemTimeToUptimeMapping[timestamp] ?: 0) * 1000000
            logger.writeToLogFile(uptimeStamp, tree)
        } catch (e: Exception) {
            e.printStackTrace()
        }
        promise?.resolve(null)
    }

    companion object {
        const val NAME = "DefrostModule"
    }

}
