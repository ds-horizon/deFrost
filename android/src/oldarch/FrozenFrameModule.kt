package com.frozenframe

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap


class FrozenFrameModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    private var logger: FileLogger = FileLogger()
    override fun getName(): String {
        return NAME
    }

    init {
        if (TimerSingleton.getInstance().state == Thread.State.NEW)
            TimerSingleton.getInstance().start();
    }

    @ReactMethod
    fun writeInLogFiles(timestamp: String?, tree: ReadableMap?) {
        try {
            val systemTimeToUptimeMapping: HashMap<String, Long> = TimerSingleton.getInstance().getTimeStampMap()
            val uptimeStamp: Long = (systemTimeToUptimeMapping[timestamp] ?: 0) * 1000000
            logger.writeToLogFile(uptimeStamp, tree)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun sendPerformanceEvent(timestamp: String?, event: String?) {
        try {
            val systemTimeToUptimeMapping: HashMap<String, Long> = TimerSingleton.getInstance().getTimeStampMap()
            val uptimeStamp: Long = (systemTimeToUptimeMapping[timestamp] ?: 0) * 1000000
            logger.writeToLogFile(uptimeStamp.toString() + "", event)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    companion object {
        const val NAME = "DefrostModule"
    }
}
