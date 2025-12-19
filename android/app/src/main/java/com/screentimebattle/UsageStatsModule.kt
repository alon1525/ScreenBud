package com.screentimebattle

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.ReactPackage
import com.facebook.react.uimanager.ViewManager

/**
 * React Native module bridge for UsageStats tracking
 * Exposes native Android UsageStats API to React Native
 */
class UsageStatsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    
    private val usageStatsTracker = UsageStatsTracker(reactContext)
    
    override fun getName(): String = "UsageStatsModule"
    
    /**
     * Get today's usage stats
     */
    @ReactMethod
    fun getTodayUsageStats(promise: Promise) {
        try {
            if (!usageStatsTracker.hasUsageStatsPermission()) {
                promise.reject("PERMISSION_DENIED", "Usage stats permission not granted")
                return
            }
            
            val stats = usageStatsTracker.getTodayUsageStats()
            val result = Arguments.createMap()
            stats.forEach { (app, minutes) ->
                result.putDouble("${app}Minutes", minutes.toDouble())
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }
    
    /**
     * Check if usage stats permission is granted
     */
    @ReactMethod
    fun hasUsageStatsPermission(promise: Promise) {
        promise.resolve(usageStatsTracker.hasUsageStatsPermission())
    }
    
    /**
     * Get current date string
     */
    @ReactMethod
    fun getCurrentDateString(promise: Promise) {
        promise.resolve(usageStatsTracker.getCurrentDateString())
    }
    
    /**
     * Check if new day (midnight rollover)
     */
    @ReactMethod
    fun isNewDay(lastCheckDate: String, promise: Promise) {
        promise.resolve(usageStatsTracker.isNewDay(lastCheckDate))
    }
    
    /**
     * Start the background usage tracking service
     */
    @ReactMethod
    fun startService() {
        try {
            UsageTrackingService.startService(reactApplicationContext)
        } catch (e: Exception) {
            // Service start error - will be handled by service itself
        }
    }
    
    /**
     * Open Usage Access Settings
     * Opens the system page with the list of apps allowed to access Usage Stats
     * On some devices, if the system can't resolve it properly, it might fallback to App Info
     */
    @ReactMethod
    fun openUsageAccessSettings() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        
        // Try to use current activity if available, otherwise use application context
        val activity = reactApplicationContext.currentActivity
        if (activity != null) {
            activity.startActivity(intent)
        } else {
            reactApplicationContext.startActivity(intent)
        }
    }
    
    /**
     * Upload usage stats to Firestore
     * Called from native service, triggers React Native upload
     */
    fun uploadUsageStats(dataMap: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("usageStatsUpdate", dataMap)
    }
    
    companion object {
        // Singleton instance for service to call
        @Volatile
        private var instance: UsageStatsModule? = null
        
        fun getInstance(): UsageStatsModule? = instance
        
        fun setInstance(module: UsageStatsModule) {
            instance = module
        }
    }
    
    init {
        setInstance(this)
    }
}

/**
 * Package for React Native module
 */
class UsageStatsPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(UsageStatsModule(reactContext))
    }
    
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}

