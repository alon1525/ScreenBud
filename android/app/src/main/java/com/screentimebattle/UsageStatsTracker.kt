package com.screentimebattle

import android.app.usage.UsageEvents
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
     * Uses queryEvents for more accurate tracking (API 28+)
     * Falls back to queryAndAggregateUsageStats for older APIs
     */
    fun getTodayUsageStats(): Map<String, Long> {
        val stats = mutableMapOf<String, Long>()
        
        // Initialize all apps to 0 FIRST
        SocialMediaPackages.ALL_PACKAGES.forEach { packageName ->
            val appName = getAppNameFromPackage(packageName)
            if (appName != null) {
                stats[appName] = 0L
            }
        }
        
        // Get current time and device timezone
        val now = System.currentTimeMillis()
        val deviceTimezone = java.util.TimeZone.getDefault()
        val calendar = java.util.Calendar.getInstance(deviceTimezone)
        calendar.timeInMillis = now
        
        // Calculate start of day in device's local timezone
        calendar.set(java.util.Calendar.HOUR_OF_DAY, 0)
        calendar.set(java.util.Calendar.MINUTE, 0)
        calendar.set(java.util.Calendar.SECOND, 0)
        calendar.set(java.util.Calendar.MILLISECOND, 0)
        val startOfDayLocal = calendar.timeInMillis
        
        // Use start of day for the query
        val startTime = startOfDayLocal
        val endTime = now
        
        // Log time range for debugging
        val dateFormat = java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss z", java.util.Locale.getDefault())
        dateFormat.timeZone = deviceTimezone
        android.util.Log.d("UsageStatsTracker", "=== Getting Today's Usage Stats ===")
        android.util.Log.d("UsageStatsTracker", "Device timezone: ${deviceTimezone.id}")
        android.util.Log.d("UsageStatsTracker", "Current time: ${dateFormat.format(java.util.Date(now))}")
        android.util.Log.d("UsageStatsTracker", "Start of day: ${dateFormat.format(java.util.Date(startTime))}")
        android.util.Log.d("UsageStatsTracker", "Time range: ${(endTime - startTime) / 1000 / 60} minutes since midnight")
        
        // PRIMARY METHOD: Use queryEvents for accurate tracking (API 28+)
        // Following Digital Wellbeing rules:
        // 1. ONLY count ACTIVITY_RESUMED/ACTIVITY_PAUSED (ignore other events)
        // 2. Cap sessions at 60 minutes max (Instagram/Facebook often miss PAUSE events)
        // 3. Don't count overlapping sessions
        // 4. Hard stop on missing PAUSE events
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            try {
                android.util.Log.d("UsageStatsTracker", "=== Using queryEvents method (API 28+) ===")
                android.util.Log.d("UsageStatsTracker", "Querying events from ${dateFormat.format(java.util.Date(startTime))} to ${dateFormat.format(java.util.Date(endTime))}")
                
                val usageEvents = usageStatsManager.queryEvents(startTime, endTime)
                val appResumeTimes = mutableMapOf<String, Long>() // packageName -> resume timestamp
                val appTotalTimes = mutableMapOf<String, Long>() // packageName -> total milliseconds
                val maxSessionMinutes = 60L // Cap sessions at 60 minutes
                val maxSessionMs = maxSessionMinutes * 60 * 1000L
                
                var eventCount = 0
                var ignoredEventCount = 0
                val allEvents = mutableListOf<String>() // Log ALL events for debugging
                
                while (usageEvents.hasNextEvent()) {
                    val event = UsageEvents.Event()
                    usageEvents.getNextEvent(event)
                    eventCount++
                    
                    val packageName = event.packageName
                    val eventTypeName = when (event.eventType) {
                        UsageEvents.Event.ACTIVITY_RESUMED -> "ACTIVITY_RESUMED"
                        UsageEvents.Event.ACTIVITY_PAUSED -> "ACTIVITY_PAUSED"
                        UsageEvents.Event.MOVE_TO_FOREGROUND -> "MOVE_TO_FOREGROUND"
                        UsageEvents.Event.MOVE_TO_BACKGROUND -> "MOVE_TO_BACKGROUND"
                        UsageEvents.Event.FOREGROUND_SERVICE_START -> "FOREGROUND_SERVICE_START"
                        UsageEvents.Event.FOREGROUND_SERVICE_STOP -> "FOREGROUND_SERVICE_STOP"
                        UsageEvents.Event.CONFIGURATION_CHANGE -> "CONFIGURATION_CHANGE"
                        UsageEvents.Event.SHORTCUT_INVOCATION -> "SHORTCUT_INVOCATION"
                        UsageEvents.Event.USER_INTERACTION -> "USER_INTERACTION"
                        else -> "UNKNOWN(${event.eventType})"
                    }
                    
                    // Log EVERY event for tracked apps
                    if (SocialMediaPackages.ALL_PACKAGES.contains(packageName)) {
                        val appName = getAppNameFromPackage(packageName) ?: "UNKNOWN"
                        val eventTime = dateFormat.format(java.util.Date(event.timeStamp))
                        val eventLog = "[EVENT #$eventCount] $appName: $eventTypeName at $eventTime (timestamp: ${event.timeStamp})"
                        allEvents.add(eventLog)
                        android.util.Log.d("UsageStatsTracker", eventLog)
                    }
                    
                    if (!SocialMediaPackages.ALL_PACKAGES.contains(packageName)) {
                        continue
                    }
                    
                    val appName = getAppNameFromPackage(packageName) ?: continue
                    
                    // ONLY process ACTIVITY_RESUMED and ACTIVITY_PAUSED
                    // Ignore: FOREGROUND_SERVICE_START, MOVE_TO_FOREGROUND, CONFIGURATION_CHANGE, etc.
                    when (event.eventType) {
                        UsageEvents.Event.ACTIVITY_RESUMED -> {
                            // Only track resumes on or after start of day
                            if (event.timeStamp >= startTime) {
                                // If app already has an active session, close it first (prevent overlapping)
                                val existingResume = appResumeTimes[packageName]
                                if (existingResume != null && existingResume > 0) {
                                    // Close previous session - but be VERY conservative
                                    // If there's no PAUSE event, the app was likely in background or a weird state
                                    val timeSinceResume = event.timeStamp - existingResume
                                    val timeSinceResumeMinutes = TimeUnit.MILLISECONDS.toMinutes(timeSinceResume)
                                    val timeSinceResumeSeconds = timeSinceResume / 1000
                                    
                                    // STRICT RULE: Only count if BOTH conditions are met:
                                    // 1. Gap is very short (< 2 minutes) - likely app switching or quick return
                                    // 2. Gap is at least 10 seconds - ignore very brief flashes
                                    // If gap is > 2 minutes, it's definitely background time - DON'T COUNT
                                    if (timeSinceResumeSeconds >= 10 && timeSinceResumeMinutes <= 2) {
                                        // Reasonable gap - count it
                                        appTotalTimes[packageName] = (appTotalTimes[packageName] ?: 0L) + timeSinceResume
                                        android.util.Log.d("UsageStatsTracker", "✅ $appName RESUMED again without PAUSE but gap is reasonable (${timeSinceResumeSeconds}s), counting it")
                                    } else if (timeSinceResumeSeconds < 10) {
                                        // Too short - ignore
                                        android.util.Log.d("UsageStatsTracker", "⏭️ $appName RESUMED again without PAUSE but gap too short (${timeSinceResumeSeconds}s), ignoring")
                                    } else {
                                        // Gap too long - definitely background time, don't count it
                                        android.util.Log.w("UsageStatsTracker", "⚠️ $appName RESUMED again without PAUSE! Gap too long (${timeSinceResumeMinutes} min), NOT counting - definitely background time")
                                    }
                                }
                                
                                appResumeTimes[packageName] = event.timeStamp
                                if (!appTotalTimes.containsKey(packageName)) {
                                    appTotalTimes[packageName] = 0L
                                }
                                android.util.Log.d("UsageStatsTracker", "✅ $appName RESUMED at ${dateFormat.format(java.util.Date(event.timeStamp))} (timestamp: ${event.timeStamp})")
                            } else {
                                android.util.Log.d("UsageStatsTracker", "⏭️ $appName RESUMED before start of day, ignoring")
                            }
                        }
                        UsageEvents.Event.ACTIVITY_PAUSED -> {
                            val resumeTime = appResumeTimes[packageName]
                            if (resumeTime != null && resumeTime > 0 && event.timeStamp >= resumeTime) {
                                val pauseTime = if (event.timeStamp > endTime) endTime else event.timeStamp
                                var timeSpent = pauseTime - resumeTime
                                val timeSpentMinutes = TimeUnit.MILLISECONDS.toMinutes(timeSpent)
                                
                                android.util.Log.d("UsageStatsTracker", "📊 $appName PAUSED calculation: resume=${dateFormat.format(java.util.Date(resumeTime))} pause=${dateFormat.format(java.util.Date(event.timeStamp))} rawTime=$timeSpentMinutes min")
                                
                                // Only count sessions that are reasonable:
                                // 1. Must be at least 10 seconds (ignore very brief flashes)
                                // 2. Must be less than 60 minutes (cap long sessions)
                                val minSessionMs = 10 * 1000L // 10 seconds minimum
                                
                                if (timeSpent < minSessionMs) {
                                    android.util.Log.d("UsageStatsTracker", "⏭️ $appName session too short (${timeSpent / 1000} seconds), ignoring")
                                } else if (timeSpent > maxSessionMs) {
                                    android.util.Log.w("UsageStatsTracker", "⚠️ $appName session too long ($timeSpentMinutes min), capping at $maxSessionMinutes min")
                                    timeSpent = maxSessionMs
                                    val beforeTotal = appTotalTimes[packageName] ?: 0L
                                    appTotalTimes[packageName] = beforeTotal + timeSpent
                                    android.util.Log.d("UsageStatsTracker", "✅ $appName PAUSED: added ${TimeUnit.MILLISECONDS.toMinutes(timeSpent)} min (capped), total now: ${TimeUnit.MILLISECONDS.toMinutes(beforeTotal + timeSpent)} min")
                                } else {
                                    val beforeTotal = appTotalTimes[packageName] ?: 0L
                                    appTotalTimes[packageName] = beforeTotal + timeSpent
                                    android.util.Log.d("UsageStatsTracker", "✅ $appName PAUSED: added $timeSpentMinutes min, total now: ${TimeUnit.MILLISECONDS.toMinutes(beforeTotal + timeSpent)} min")
                                }
                                appResumeTimes[packageName] = 0L // Reset
                            } else {
                                android.util.Log.d("UsageStatsTracker", "⏭️ $appName PAUSED but no matching RESUME (resumeTime=$resumeTime)")
                            }
                        }
                        else -> {
                            // Ignore all other event types (FOREGROUND_SERVICE, MOVE_TO_FOREGROUND, etc.)
                            ignoredEventCount++
                        }
                    }
                }
                
                android.util.Log.d("UsageStatsTracker", "=== EVENT SUMMARY ===")
                android.util.Log.d("UsageStatsTracker", "Total events processed: $eventCount")
                android.util.Log.d("UsageStatsTracker", "Events ignored (not RESUME/PAUSE): $ignoredEventCount")
                android.util.Log.d("UsageStatsTracker", "Events for tracked apps: ${allEvents.size}")
                allEvents.forEach { android.util.Log.d("UsageStatsTracker", it) }
                
                android.util.Log.d("UsageStatsTracker", "Processed $eventCount events ($ignoredEventCount ignored)")
                
                // Handle apps still in foreground (resumed but not paused)
                // CRITICAL: Be VERY conservative - if app never paused, it's likely background
                android.util.Log.d("UsageStatsTracker", "=== Checking apps still in foreground ===")
                appResumeTimes.forEach { (packageName, resumeTime) ->
                    if (resumeTime > 0 && resumeTime >= startTime) {
                        val appName = getAppNameFromPackage(packageName)
                        if (appName != null) {
                            val timeSpent = endTime - resumeTime
                            val rawMinutes = TimeUnit.MILLISECONDS.toMinutes(timeSpent)
                            
                            android.util.Log.d("UsageStatsTracker", "📱 $appName still active: resumed at ${dateFormat.format(java.util.Date(resumeTime))}, now is ${dateFormat.format(java.util.Date(endTime))}, raw time: $rawMinutes min")
                            
                            // If app has been "active" for more than 5 minutes without a pause,
                            // it's likely in background or a weird state - DON'T count it
                            if (rawMinutes <= 5) {
                                // Reasonable - app is probably actually active
                                val beforeTotal = appTotalTimes[packageName] ?: 0L
                                appTotalTimes[packageName] = beforeTotal + timeSpent
                                android.util.Log.d("UsageStatsTracker", "✅ $appName still active: adding ${rawMinutes} min (reasonable), total now: ${TimeUnit.MILLISECONDS.toMinutes(beforeTotal + timeSpent)} min")
                            } else {
                                // Too long without pause - likely background, don't count
                                android.util.Log.w("UsageStatsTracker", "⚠️ $appName still active but no pause for $rawMinutes min - NOT counting (likely background)")
                            }
                        }
                    }
                }
                
                // Update stats with event-based times
                android.util.Log.d("UsageStatsTracker", "=== CALCULATING FINAL STATS ===")
                var hasAnyData = false
                appTotalTimes.forEach { (packageName, totalMs) ->
                    val appName = getAppNameFromPackage(packageName)
                    if (appName != null) {
                        val minutes = TimeUnit.MILLISECONDS.toMinutes(totalMs)
                        stats[appName] = minutes
                        android.util.Log.d("UsageStatsTracker", "📊 $appName: $totalMs ms = $minutes minutes")
                        if (totalMs > 0) {
                            hasAnyData = true
                        }
                    }
                }
                
                // Log apps with no data
                SocialMediaPackages.ALL_PACKAGES.forEach { packageName ->
                    val appName = getAppNameFromPackage(packageName)
                    if (appName != null && !appTotalTimes.containsKey(packageName)) {
                        android.util.Log.d("UsageStatsTracker", "📊 $appName: 0 ms = 0 minutes (no events)")
                    }
                }
                
                if (hasAnyData) {
                    android.util.Log.d("UsageStatsTracker", "✅ Using event-based tracking")
                    android.util.Log.d("UsageStatsTracker", "=== FINAL RESULTS ===")
                    stats.forEach { (app, minutes) ->
                        android.util.Log.d("UsageStatsTracker", "🎯 FINAL: $app = $minutes minutes")
                    }
                    return stats
                } else {
                    android.util.Log.w("UsageStatsTracker", "⚠️ No event data found for any tracked apps, falling back to queryAndAggregateUsageStats")
                }
            } catch (e: Exception) {
                android.util.Log.e("UsageStatsTracker", "❌ Error in queryEvents: ${e.message}", e)
            }
        } else {
            android.util.Log.d("UsageStatsTracker", "API level ${Build.VERSION.SDK_INT} < 28, using queryAndAggregateUsageStats")
        }
        
        // FALLBACK: Use queryAndAggregateUsageStats (for API < 28 or if queryEvents fails)
        // NOTE: This method is less accurate because it includes background/foreground service time
        // We apply aggressive caps to prevent overcounting
        android.util.Log.d("UsageStatsTracker", "=== Using queryAndAggregateUsageStats (fallback) ===")
        val usageStatsMap = usageStatsManager.queryAndAggregateUsageStats(startTime, endTime)
        
        android.util.Log.d("UsageStatsTracker", "Found ${usageStatsMap.size} apps total in usage stats")
        
        val maxPossibleMinutes = (endTime - startTime) / 1000 / 60
        val maxSessionMinutes = 60L // Cap individual sessions
        
        // Process aggregated stats for tracked apps
        SocialMediaPackages.ALL_PACKAGES.forEach { packageName ->
            val appName = getAppNameFromPackage(packageName)
            if (appName != null) {
                val usageStat = usageStatsMap[packageName]
                if (usageStat != null) {
                    val milliseconds = usageStat.totalTimeInForeground
                    var minutes = TimeUnit.MILLISECONDS.toMinutes(milliseconds)
                    
                    android.util.Log.d("UsageStatsTracker", "$appName ($packageName):")
                    android.util.Log.d("UsageStatsTracker", "  Raw time: $milliseconds ms = $minutes minutes")
                    android.util.Log.d("UsageStatsTracker", "  First used: ${dateFormat.format(java.util.Date(usageStat.firstTimeStamp))}")
                    android.util.Log.d("UsageStatsTracker", "  Last used: ${dateFormat.format(java.util.Date(usageStat.lastTimeUsed))}")
                    
                    // Validate and cap the data
                    if (usageStat.firstTimeStamp < startTime) {
                        android.util.Log.w("UsageStatsTracker", "  ⚠️ WARNING: First timestamp before start of day - may include pre-midnight time")
                    }
                    if (usageStat.lastTimeUsed > endTime) {
                        android.util.Log.w("UsageStatsTracker", "  ⚠️ WARNING: Last used after current time")
                    }
                    
                    // Apply caps: can't exceed time elapsed today, and cap per-session at 60 min
                    // Estimate: if time > maxPossibleMinutes, it's likely including background time
                    // If time > maxSessionMinutes * (maxPossibleMinutes / maxSessionMinutes), cap it
                    val estimatedMaxSessions = (maxPossibleMinutes / maxSessionMinutes).coerceAtLeast(1)
                    val absoluteMaxMinutes = maxSessionMinutes * estimatedMaxSessions
                    
                    if (minutes > maxPossibleMinutes) {
                        android.util.Log.w("UsageStatsTracker", "  ⚠️ $appName shows $minutes min but only $maxPossibleMinutes min have passed today - capping to 0")
                        stats[appName] = 0L
                    } else if (minutes > absoluteMaxMinutes) {
                        android.util.Log.w("UsageStatsTracker", "  ⚠️ $appName shows $minutes min (likely includes background time) - capping to $absoluteMaxMinutes min")
                        stats[appName] = absoluteMaxMinutes
                    } else {
                        stats[appName] = minutes
                    }
                } else {
                    android.util.Log.d("UsageStatsTracker", "$appName ($packageName): No usage data found")
                    // Already initialized to 0L above
                }
            }
        }
        
        // Log final stats
        stats.forEach { (app, minutes) ->
            android.util.Log.d("UsageStatsTracker", "Final: $app = $minutes minutes")
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
     * Get start of day timestamp (midnight) in device's local timezone
     * This is a helper method, but we now calculate it inline in getTodayUsageStats for better timezone handling
     */
    private fun getStartOfDay(timestamp: Long): Long {
        val calendar = java.util.Calendar.getInstance() // Uses device's default timezone
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

