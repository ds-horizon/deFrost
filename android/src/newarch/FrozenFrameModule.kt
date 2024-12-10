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
    private var frozenFrameModuleImpl: FrozenFrameModuleImpl = FrozenFrameModuleImpl()

    init {
        if (TimerSingleton.getInstance().state == Thread.State.NEW)
            TimerSingleton.getInstance().start()
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    override fun sendPerformanceEvent(timestamp: String?, event: String?, promise: Promise?) {
        frozenFrameModuleImpl.sendPerformanceEvent(timestamp, event, promise)
    }

    @ReactMethod
    override fun writeInLogFiles(timestamp: String?, tree: ReadableMap?, promise: Promise?) {
        frozenFrameModuleImpl.writeInLogFiles(timestamp, tree, promise)
    }

    companion object {
        const val NAME = FrozenFrameModuleImpl.NAME
    }

}
