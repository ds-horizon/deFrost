package com.frozenframe

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap


class FrozenFrameModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    private var frozenFrameModuleImpl: FrozenFrameModuleImpl = FrozenFrameModuleImpl()
    override fun getName(): String {
        return NAME
    }

    init {
        if (TimerSingleton.getInstance().state == Thread.State.NEW)
            TimerSingleton.getInstance().start();
    }

    @ReactMethod
    fun writeInLogFiles(timestamp: String?, tree: ReadableMap?) {
        frozenFrameModuleImpl.writeInLogFiles(timestamp, tree, null);
    }

    @ReactMethod
    fun sendPerformanceEvent(timestamp: String?, event: String?) {
        frozenFrameModuleImpl.sendPerformanceEvent(timestamp, event, null);
    }

    companion object {
        const val NAME = FrozenFrameModuleImpl.NAME
    }
}
