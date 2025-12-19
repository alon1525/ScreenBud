package com.screentimebattle

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

/**
 * Background service for periodic usage stats tracking and upload
 * Runs every 5-10 minutes to track and upload usage data
 */
class UsageTrackingService : Service() {
    
    private val executor = Executors.newScheduledThreadPool(1)
    private var scheduledTask: ScheduledFuture<*>? = null
    private var lastCheckTime: Long = System.currentTimeMillis()
    private var lastCheckDate: String = ""
    private lateinit var usageStatsTracker: UsageStatsTracker
    
    companion object {
        private const val NOTIFICATION_ID = 1001
        private const val CHANNEL_ID = "usage_tracking_channel"
        private const val UPLOAD_INTERVAL_MINUTES = 5L // Upload every 5 minutes
        
        fun startService(context: Context) {
            try {
                val intent = Intent(context, UsageTrackingService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
            } catch (e: SecurityException) {
                // Permission not granted - that's OK, tracking will work without foreground service
            } catch (e: Exception) {
                // Other errors - log but don't crash
            }
        }
        
        fun stopService(context: Context) {
            val intent = Intent(context, UsageTrackingService::class.java)
            context.stopService(intent)
        }
    }
    
    override fun onCreate() {
        super.onCreate()
        usageStatsTracker = UsageStatsTracker(this)
        lastCheckDate = usageStatsTracker.getCurrentDateString()
        createNotificationChannel()
        
        // Try to start as foreground service, but don't crash if permission is missing
        try {
            startForeground(NOTIFICATION_ID, createNotification())
        } catch (e: SecurityException) {
            // Permission not granted - service will run as background service
            // This is OK, tracking will still work
        } catch (e: Exception) {
            // Other errors - log but don't crash
        }
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startPeriodicTracking()
        return START_STICKY
    }
    
    override fun onBind(intent: Intent?): IBinder? = null
    
    override fun onDestroy() {
        super.onDestroy()
        scheduledTask?.cancel(false)
    }
    
    /**
     * Start periodic tracking and upload
     */
    private fun startPeriodicTracking() {
        scheduledTask?.cancel(false)
        
        scheduledTask = executor.scheduleAtFixedRate(
            {
                try {
                    trackAndUpload()
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            },
            0,
            UPLOAD_INTERVAL_MINUTES,
            TimeUnit.MINUTES
        )
    }
    
    /**
     * Track usage and upload to Firestore
     */
    private fun trackAndUpload() {
        if (!usageStatsTracker.hasUsageStatsPermission()) {
            return
        }
        
        val currentDate = usageStatsTracker.getCurrentDateString()
        
        // Check if new day (midnight rollover)
        if (currentDate != lastCheckDate) {
            handleNewDay()
            lastCheckDate = currentDate
        }
        
        // Get usage stats since last check
        val usageStats = usageStatsTracker.getUsageStatsSince(lastCheckTime)
        
        // Upload to Firestore via React Native bridge
        uploadToFirestore(usageStats, currentDate)
        
        lastCheckTime = System.currentTimeMillis()
    }
    
    /**
     * Handle midnight rollover - ensure previous day is uploaded
     */
    private fun handleNewDay() {
        // Upload final stats for previous day
        val previousDate = getPreviousDateString()
        val endOfPreviousDay = System.currentTimeMillis()
        val startOfPreviousDay = getStartOfDay(endOfPreviousDay)
        
        val previousDayStats = usageStatsTracker.getUsageStatsForRange(
            startOfPreviousDay,
            endOfPreviousDay
        )
        
        uploadToFirestore(previousDayStats, previousDate, isFinalUpload = true)
        
        // Reset for new day
        lastCheckTime = getStartOfDay(System.currentTimeMillis())
    }
    
    /**
     * Upload usage stats to Firestore
     * This should call React Native module to upload via Firestore SDK
     */
    private fun uploadToFirestore(
        stats: Map<String, Long>,
        date: String,
        isFinalUpload: Boolean = false
    ) {
        // Create data map for React Native
        val dataMap = Arguments.createMap()
        stats.forEach { (app, minutes) ->
            dataMap.putDouble("${app}Minutes", minutes.toDouble())
        }
        dataMap.putString("date", date)
        dataMap.putBoolean("isFinalUpload", isFinalUpload)
        
        // Send to React Native module via singleton instance
        UsageStatsModule.getInstance()?.uploadUsageStats(dataMap)
    }
    
    private fun getPreviousDateString(): String {
        val calendar = java.util.Calendar.getInstance()
        calendar.add(java.util.Calendar.DAY_OF_YEAR, -1)
        return java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
            .format(calendar.time)
    }
    
    private fun getStartOfDay(timestamp: Long): Long {
        val calendar = java.util.Calendar.getInstance()
        calendar.timeInMillis = timestamp
        calendar.set(java.util.Calendar.HOUR_OF_DAY, 0)
        calendar.set(java.util.Calendar.MINUTE, 0)
        calendar.set(java.util.Calendar.SECOND, 0)
        calendar.set(java.util.Calendar.MILLISECOND, 0)
        return calendar.timeInMillis
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Usage Tracking",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Tracks social media usage in the background"
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Tracking Usage")
            .setContentText("Monitoring social media usage")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setOngoing(true)
            .build()
    }
}

