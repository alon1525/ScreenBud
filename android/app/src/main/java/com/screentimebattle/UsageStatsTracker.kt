package com.screentimebattle

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.annotation.RequiresApi
import java.util.concurrent.TimeUnit

/**
 * Social Media App Package Names
 */
object SocialMediaPackages {
    const val TIKTOK = "com.zhiliaoapp.musically"
    const val INSTAGRAM = "com.instagram.android"
    const val YOUTUBE = "com.google.android.youtube"
    const val FACEBOOK = "com.facebook.katana"
    const val SNAPCHAT = "com.snapchat.android"
    
    val ALL_PACKAGES = listOf(TIKTOK, INSTAGRAM, YOUTUBE, FACEBOOK, SNAPCHAT)
}

/**
 * Maps package name to app name
 */
fun getAppNameFromPackage(packageName: String): String? {
    return when (packageName) {
        SocialMediaPackages.TIKTOK -> "tiktok"
        SocialMediaPackages.INSTAGRAM -> "instagram"
        SocialMediaPackages.YOUTUBE -> "youtube"
        SocialMediaPackages.FACEBOOK -> "facebook"
        SocialMediaPackages.SNAPCHAT -> "snapchat"
        else -> null
    }
}

/**
 * Usage Stats Tracker
 * Tracks screen time for social media apps using Android UsageStats API
 */
@RequiresApi(Build.VERSION_CODES.LOLLIPOP_MR1)
class UsageStatsTracker(private val context: Context) {
    
    private val usageStatsManager: UsageStatsManager =
        context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    
    /**
     * Get usage stats for all tracked apps for today
     * Returns minutes spent per app
     */
    fun getTodayUsageStats(): Map<String, Long> {
        val stats = mutableMapOf<String, Long>()
        
        val endTime = System.currentTimeMillis()
        val startTime = getStartOfDay(endTime)
        
        val usageStatsMap = usageStatsManager.queryAndAggregateUsageStats(
            startTime,
            endTime
        )
        
        SocialMediaPackages.ALL_PACKAGES.forEach { packageName ->
            val appName = getAppNameFromPackage(packageName)
            if (appName != null) {
                val usageStats = usageStatsMap[packageName]
                val minutes = if (usageStats != null) {
                    TimeUnit.MILLISECONDS.toMinutes(usageStats.totalTimeInForeground)
                } else {
                    0L
                }
                stats[appName] = minutes
            }
        }
        
        return stats
    }
    
    /**
     * Get usage stats for a specific time range
     */
    fun getUsageStatsForRange(startTime: Long, endTime: Long): Map<String, Long> {
        val stats = mutableMapOf<String, Long>()
        
        val usageStatsMap = usageStatsManager.queryAndAggregateUsageStats(
            startTime,
            endTime
        )
        
        SocialMediaPackages.ALL_PACKAGES.forEach { packageName ->
            val appName = getAppNameFromPackage(packageName)
            if (appName != null) {
                val usageStats = usageStatsMap[packageName]
                val minutes = if (usageStats != null) {
                    TimeUnit.MILLISECONDS.toMinutes(usageStats.totalTimeInForeground)
                } else {
                    0L
                }
                stats[appName] = minutes
            }
        }
        
        return stats
    }
    
    /**
     * Get usage stats since last check (for incremental updates)
     */
    fun getUsageStatsSince(lastCheckTime: Long): Map<String, Long> {
        val endTime = System.currentTimeMillis()
        return getUsageStatsForRange(lastCheckTime, endTime)
    }
    
    /**
     * Check if UsageStats permission is granted
     */
    fun hasUsageStatsPermission(): Boolean {
        val appOpsManager = context.getSystemService(Context.APP_OPS_SERVICE) as android.app.AppOpsManager
        val mode = appOpsManager.checkOpNoThrow(
            android.app.AppOpsManager.OPSTR_GET_USAGE_STATS,
            android.os.Process.myUid(),
            context.packageName
        )
        return mode == android.app.AppOpsManager.MODE_ALLOWED
    }
    
    /**
     * Get start of day timestamp (midnight)
     */
    private fun getStartOfDay(timestamp: Long): Long {
        val calendar = java.util.Calendar.getInstance()
        calendar.timeInMillis = timestamp
        calendar.set(java.util.Calendar.HOUR_OF_DAY, 0)
        calendar.set(java.util.Calendar.MINUTE, 0)
        calendar.set(java.util.Calendar.SECOND, 0)
        calendar.set(java.util.Calendar.MILLISECOND, 0)
        return calendar.timeInMillis
    }
    
    /**
     * Check if we've crossed midnight (new day)
     */
    fun isNewDay(lastCheckDate: String): Boolean {
        val today = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
            .format(java.util.Date())
        return today != lastCheckDate
    }
    
    /**
     * Get current date string (YYYY-MM-DD)
     */
    fun getCurrentDateString(): String {
        return java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
            .format(java.util.Date())
    }
}

