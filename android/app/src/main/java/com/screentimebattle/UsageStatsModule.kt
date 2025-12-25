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
            
            val statsResult = usageStatsTracker.getTodayUsageStatsWithEntrances()
            val result = Arguments.createMap()
            
            // Log what we're returning for debugging
            android.util.Log.d("UsageStatsModule", "=== Returning stats to React Native ===")
            android.util.Log.d("UsageStatsModule", "Time stats: ${statsResult.timeMinutes}")
            android.util.Log.d("UsageStatsModule", "Entrance counts: ${statsResult.entranceCounts}")
            
            // Add time stats
            statsResult.timeMinutes.forEach { (app, minutes) ->
                val key = "${app}Minutes"
                val value = minutes.toDouble()
                android.util.Log.d("UsageStatsModule", "📤 $key = $value minutes (from $app)")
                result.putDouble(key, value)
            }
            
            // Add entrance counts
            statsResult.entranceCounts.forEach { (app, count) ->
                val key = "${app}Entrances"
                android.util.Log.d("UsageStatsModule", "📤 $key = $count (from $app)")
                result.putInt(key, count)
            }
            
            // Log all keys in result
            val resultKeys = mutableListOf<String>()
            val keyIterator = result.keySetIterator()
            while (keyIterator.hasNextKey()) {
                resultKeys.add(keyIterator.nextKey())
            }
            android.util.Log.d("UsageStatsModule", "Result map keys: $resultKeys")
            android.util.Log.d("UsageStatsModule", "Total apps in result: ${statsResult.timeMinutes.size + statsResult.entranceCounts.size}")
            
            // Log what React Native will receive
            android.util.Log.d("UsageStatsModule", "=== FINAL DATA BEING SENT TO REACT NATIVE ===")
            statsResult.timeMinutes.forEach { (app, minutes) ->
                android.util.Log.d("UsageStatsModule", "🎯 $app: ${minutes}Minutes = $minutes minutes, ${statsResult.entranceCounts[app] ?: 0} entrances")
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
     * Get device timezone info for debugging
     */
    @ReactMethod
    fun getDeviceTimezone(promise: Promise) {
        val timezone = java.util.TimeZone.getDefault()
        val result = Arguments.createMap()
        result.putString("id", timezone.id)
        result.putString("displayName", timezone.displayName)
        result.putInt("rawOffset", timezone.rawOffset / 1000 / 60) // offset in minutes
        result.putInt("dstSavings", timezone.dstSavings / 1000 / 60) // DST savings in minutes
        result.putBoolean("useDaylightTime", timezone.useDaylightTime())
        promise.resolve(result)
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

