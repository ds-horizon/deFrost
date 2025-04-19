package com.frozenframe

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap

class FrozenFrameModuleImpl {
    private var logger: NetworkLogger = NetworkLogger()
    fun sendPerformanceEvent(timestamp: String?, event: String?, promise: Promise?){
        try {
            val systemTimeToUptimeMapping: HashMap<String, Long> =
                TimerSingleton.getInstance().getTimeStampMap()
            val uptimeStamp: Long = (systemTimeToUptimeMapping[timestamp] ?: 0) * 1000000
            logger.sendLogs(uptimeStamp.toString(), event)
        } catch (e: Exception) {
            e.printStackTrace()
        }
        promise?.resolve(null)
    }

    fun writeInLogFiles(timestamp: String?, tree: ReadableMap?, promise: Promise?) {
        try {
            val systemTimeToUptimeMapping: HashMap<String, Long> =
                TimerSingleton.getInstance().getTimeStampMap()
            val uptimeStamp: Long = (systemTimeToUptimeMapping[timestamp] ?: 0) * 1000000
            logger.sendLogs(uptimeStamp, tree)
        } catch (e: Exception) {
            e.printStackTrace()
        }
        promise?.resolve(null)
    }
    companion object {
        const val NAME = "DefrostModule"
    }
}