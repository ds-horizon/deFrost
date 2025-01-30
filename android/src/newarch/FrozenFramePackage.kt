package com.frozenframe

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider


class FrozenFramePackage : TurboReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name.equals(FrozenFrameModule.NAME)) {
            if (BuildConfig.defrost_enable) {
                FrozenFrameModule(reactContext);
            } else null
        } else {
            null;
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
            val isTurboModule: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            moduleInfos[FrozenFrameModule.NAME] = ReactModuleInfo(
                FrozenFrameModule.NAME,
                FrozenFrameModule.NAME,
                false,
                false,
                true,
                false,
                isTurboModule
            )
            moduleInfos
        }
    }
}
