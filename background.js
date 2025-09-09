class HackFocusBackground {
    constructor() {
        this.blockingEnabled = false;
        this.blockMode = 'blocklist'; // 'blocklist' or 'allowlist'
        this.blockedSites = [];
        this.allowedSites = [];
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.setupWebRequestBlocking();
    }
    
    loadSettings() {
        chrome.storage.local.get(['hackFocusBlockSettings'], (result) => {
            if (result && result.hackFocusBlockSettings) {
                const settings = result.hackFocusBlockSettings;
                this.blockingEnabled = settings.blockingEnabled || false;
                this.blockMode = settings.blockMode || 'blocklist';
                this.blockedSites = settings.blockedSites || [];
                this.allowedSites = settings.allowedSites || [];
                console.log('Background: Loaded block settings:', settings);
            } else {
                console.log('Background: No block settings found');
            }
        });
    }
    
    async saveSettings() {
        try {
            const settings = {
                blockingEnabled: this.blockingEnabled,
                blockMode: this.blockMode,
                blockedSites: this.blockedSites,
                allowedSites: this.allowedSites
            };
            await chrome.storage.sync.set({ hackFocusBlockSettings: settings });
        } catch (error) {
            console.error('Error saving block settings:', error);
        }
    }
    
    setupEventListeners() {
        // Handle alarm events for timer
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'hackFocusTimer') {
                this.handleTimerComplete();
            }
        });
        
        // Handle storage changes
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local' && changes.hackFocusBlockSettings) {
                console.log('Background: Block settings changed, reloading...');
                console.log('Background: Changes object:', changes);
                console.log('Background: New value:', changes.hackFocusBlockSettings.newValue);
                console.log('Background: Old value:', changes.hackFocusBlockSettings.oldValue);
                this.loadSettings();
            }
            if (namespace === 'local' && changes.hackFocusTimer) {
                this.handleTimerStateChange(changes.hackFocusTimer);
            }
        });
        
        // Handle messages from popup/options
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });
        
        // Handle installation
        chrome.runtime.onInstalled.addListener(() => {
            this.handleInstallation();
        });
        
        // Start background timer display
        this.startBackgroundTimerDisplay();
    }
    
    setupWebRequestBlocking() {
        if (chrome.webRequest && chrome.webRequest.onBeforeRequest) {
            chrome.webRequest.onBeforeRequest.addListener(
                (details) => {
                    return this.shouldBlockRequest(details);
                },
                { urls: ["<all_urls>"] },
                ["blocking"]
            );
        }
    }
    
    shouldBlockRequest(details) {
        console.log('Background: shouldBlockRequest called for:', details.url);
        console.log('Background: blockingEnabled:', this.blockingEnabled);
        console.log('Background: blockMode:', this.blockMode);
        console.log('Background: blockedSites:', this.blockedSites);
        
        if (!this.blockingEnabled) {
            console.log('Background: Blocking disabled, allowing request');
            return { cancel: false };
        }
        
        const url = new URL(details.url);
        const hostname = url.hostname;
        console.log('Background: Checking hostname:', hostname);
        
        if (this.blockMode === 'blocklist') {
            // Block if site is in blocklist
            const shouldBlock = this.blockedSites.some(site => 
                this.matchesSite(hostname, site)
            );
            
            console.log('Background: Should block (blocklist):', shouldBlock);
            console.log('Background: Blocked sites array:', this.blockedSites);
            console.log('Background: Hostname being checked:', hostname);
            
            if (shouldBlock) {
                console.log('Background: Blocking request and redirecting to block page');
                this.redirectToBlockPage(details.tabId);
                return { cancel: true };
            }
        } else if (this.blockMode === 'allowlist') {
            // Block if site is NOT in allowlist
            const isAllowed = this.allowedSites.some(site => 
                this.matchesSite(hostname, site)
            );
            
            console.log('Background: Is allowed (allowlist):', isAllowed);
            console.log('Background: Allowed sites array:', this.allowedSites);
            console.log('Background: Hostname being checked:', hostname);
            
            if (!isAllowed) {
                console.log('Background: Blocking request (not in allowlist) and redirecting to block page');
                this.redirectToBlockPage(details.tabId);
                return { cancel: true };
            }
        } else {
            console.error('Background: Unknown block mode:', this.blockMode);
        }
        
        console.log('Background: Allowing request');
        return { cancel: false };
    }
    
    matchesSite(hostname, sitePattern) {
        console.log('Background: matchesSite - hostname:', hostname, 'sitePattern:', sitePattern);
        
        // Simple pattern matching for domains
        if (sitePattern.startsWith('*.')) {
            const domain = sitePattern.substring(2);
            const matches = hostname.endsWith(domain) || hostname === domain;
            console.log('Background: Wildcard match result:', matches);
            return matches;
        }
        
        const matches = hostname === sitePattern || hostname.endsWith('.' + sitePattern);
        console.log('Background: Exact match result:', matches);
        return matches;
    }
    
    redirectToBlockPage(tabId) {
        if (tabId) {
            chrome.tabs.update(tabId, {
                url: chrome.runtime.getURL('blocked.html')
            });
        }
    }
    
    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'getBlockSettings':
                    sendResponse({
                        blockingEnabled: this.blockingEnabled,
                        blockMode: this.blockMode,
                        blockedSites: this.blockedSites,
                        allowedSites: this.allowedSites
                    });
                    break;
                    
                case 'updateBlockSettings':
                    this.blockingEnabled = request.settings.blockingEnabled;
                    this.blockMode = request.settings.blockMode;
                    this.blockedSites = request.settings.blockedSites;
                    this.allowedSites = request.settings.allowedSites;
                    await this.saveSettings();
                    sendResponse({ success: true });
                    break;
                    
                case 'toggleBlocking':
                    this.blockingEnabled = request.enabled;
                    await this.saveSettings();
                    sendResponse({ success: true });
                    break;
                    
                case 'disableBlocking':
                    console.log('Background: Disabling blocking due to timer stop');
                    this.blockingEnabled = false;
                    // Also update storage to persist the blocking state
                    chrome.storage.local.get(['hackFocusBlockSettings'], (result) => {
                        if (result && result.hackFocusBlockSettings) {
                            result.hackFocusBlockSettings.blockingEnabled = false;
                            chrome.storage.local.set({ hackFocusBlockSettings: result.hackFocusBlockSettings });
                        }
                    });
                    sendResponse({ success: true });
                    break;
                    
                case 'enableBlocking':
                    console.log('Background: Enabling blocking due to timer start');
                    this.blockingEnabled = true;
                    // Also update storage to persist the blocking state
                    chrome.storage.local.get(['hackFocusBlockSettings'], (result) => {
                        if (result && result.hackFocusBlockSettings) {
                            result.hackFocusBlockSettings.blockingEnabled = true;
                            chrome.storage.local.set({ hackFocusBlockSettings: result.hackFocusBlockSettings });
                        }
                    });
                    sendResponse({ success: true });
                    break;
                    
                case 'getTimerState':
                    const timerState = await this.getTimerState();
                    sendResponse(timerState);
                    break;
                    
                case 'updateStats':
                    this.updateStats(request.sessionDuration);
                    sendResponse({ success: true });
                    break;
                    
                case 'reloadSettings':
                    console.log('Background: Manually reloading settings...');
                    this.loadSettings();
                    sendResponse({ success: true });
                    break;
                    
                case 'getSessionState':
                    const sessionState = await this.getSessionState();
                    sendResponse(sessionState);
                    break;
                    
                default:
                    sendResponse({ error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        }
    }
    
    async getTimerState() {
        try {
            const result = await chrome.storage.local.get(['hackFocusTimer']);
            return result.hackFocusTimer || null;
        } catch (error) {
            console.error('Error getting timer state:', error);
            return null;
        }
    }
    
    async getSessionState() {
        try {
            const result = await chrome.storage.local.get(['hackFocusState']);
            return result.hackFocusState || {
                currentSession: 'focus',
                sessionCount: 1,
                totalSessions: 0
            };
        } catch (error) {
            console.error('Error getting session state:', error);
            return {
                currentSession: 'focus',
                sessionCount: 1,
                totalSessions: 0
            };
        }
    }
    
    handleTimerComplete() {
        console.log('Timer completed in background script');
        
        // Get current timer state
        chrome.storage.local.get(['hackFocusTimer'], (result) => {
            if (result.hackFocusTimer) {
                const timerState = result.hackFocusTimer;
                console.log('Timer state:', timerState);
                
                // Show notification
                this.showTimerNotification(timerState);
                
                // Update session count and state
                this.updateSessionState(timerState);
                
                // Update stats with session duration
                if (timerState.currentSession === 'focus') {
                    this.updateStats(timerState.focusDuration || 25);
                }
                
                // Clear the timer
                chrome.storage.local.remove(['hackFocusTimer']);
            }
        });
        
        // Clear the alarm
        chrome.alarms.clear('hackFocusTimer');
    }
    
    updateStats(sessionDuration) {
        chrome.storage.local.get(['hackFocusStats'], (result) => {
            const stats = result?.hackFocusStats || {
                totalSessions: 0,
                totalTime: 0,
                sitesBlocked: 0,
                currentStreak: 0,
                hackedComputers: {
                    small: 0,
                    medium: 0,
                    large: 0,
                    server: 0
                },
                dailyStats: {}   // Daily focus tracking
            };
            
            // Update basic stats
            stats.totalSessions++;
            stats.totalTime += sessionDuration;
            
            // Determine computer type based on duration
            if (sessionDuration >= 25 && sessionDuration < 30) {
                stats.hackedComputers.small++;
                console.log('Background: Small computer hacked! (25min session)');
            } else if (sessionDuration >= 30 && sessionDuration < 40) {
                stats.hackedComputers.medium++;
                console.log('Background: Medium computer hacked! (30min session)');
            } else if (sessionDuration >= 40 && sessionDuration < 60) {
                stats.hackedComputers.large++;
                console.log('Background: Large computer hacked! (40min+ session)');
            } else if (sessionDuration >= 60) {
                stats.hackedComputers.server++;
                console.log('Background: Server hacked! (Forest mission - 60min+ session)');
            }
            
            // Update daily stats
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            if (!stats.dailyStats[today]) {
                stats.dailyStats[today] = {
                    totalTime: 0,
                    sessions: 0,
                    date: today,
                    tasksCompleted: 0
                };
            }
            stats.dailyStats[today].totalTime += sessionDuration;
            stats.dailyStats[today].sessions++;
            
            // Update task completion stats
            this.updateTaskStats();
            
            // Calculate current streak
            stats.currentStreak = this.calculateStreak(stats.dailyStats);
            
            // Save updated stats
            chrome.storage.local.set({ hackFocusStats: stats }, () => {
                console.log('Background: Stats updated:', stats);
            });
        });
    }
    
    calculateStreak(dailyStats) {
        const dates = Object.keys(dailyStats).sort((a, b) => new Date(b) - new Date(a));
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Check if today or yesterday has focus time
        if (dailyStats[today] && dailyStats[today].totalTime > 0) {
            streak = 1;
            // Count consecutive days backwards
            for (let i = 1; i < dates.length; i++) {
                const checkDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                if (dailyStats[checkDate] && dailyStats[checkDate].totalTime > 0) {
                    streak++;
                } else {
                    break;
                }
            }
        } else if (dailyStats[yesterday] && dailyStats[yesterday].totalTime > 0) {
            // If no focus today but had focus yesterday, start counting from yesterday
            streak = 1;
            for (let i = 2; i < dates.length; i++) {
                const checkDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                if (dailyStats[checkDate] && dailyStats[checkDate].totalTime > 0) {
                    streak++;
                } else {
                    break;
                }
            }
        }
        
        return streak;
    }
    
    updateTaskStats() {
        chrome.storage.local.get(['hackFocusTasks'], (result) => {
            const tasks = result.hackFocusTasks || [];
            const completedTasks = tasks.filter(task => task.completed).length;
            
            // Update today's task completion count
            const today = new Date().toISOString().split('T')[0];
            chrome.storage.local.get(['hackFocusStats'], (statsResult) => {
                const stats = statsResult?.hackFocusStats || {};
                if (stats.dailyStats && stats.dailyStats[today]) {
                    stats.dailyStats[today].tasksCompleted = completedTasks;
                    chrome.storage.local.set({ hackFocusStats: stats });
                }
            });
        });
    }
    
    showTimerNotification(timerState) {
        const messages = {
            focus: {
                title: "Focus Session Complete!",
                message: "Break time! Firewall cooling down... System rebooted. Back to the hack!"
            },
            shortBreak: {
                title: "Short Break Complete!",
                message: "System rebooted. Ready for next hack attempt."
            },
            longBreak: {
                title: "Long Break Complete!",
                message: "System maintenance complete. Mission briefing updated."
            }
        };
        
        const message = messages[timerState.currentSession] || messages.focus;
        
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon-48.png',
            title: message.title,
            message: message.message
        });
    }
    
    async updateSessionState(timerState) {
        try {
            // Get current state
            const result = await chrome.storage.local.get(['hackFocusState']);
            let state = result.hackFocusState || {
                currentSession: 'focus',
                sessionCount: 1,
                totalSessions: 0
            };
            
            // Update state based on completed session
            if (timerState.currentSession === 'focus') {
                state.sessionCount++;
                state.totalSessions++;
                
                // Determine next session type
                if (state.sessionCount % 4 === 1) {
                    state.currentSession = 'longBreak';
                } else {
                    state.currentSession = 'shortBreak';
                }
            } else {
                state.currentSession = 'focus';
            }
            
            // Save updated state
            await chrome.storage.local.set({ hackFocusState: state });
            console.log('Updated session state:', state);
            
        } catch (error) {
            console.error('Error updating session state:', error);
        }
    }
    
    startBackgroundTimerDisplay() {
        // Check for existing timer and start display if needed
        chrome.storage.local.get(['hackFocusTimer'], (result) => {
            if (result.hackFocusTimer && result.hackFocusTimer.isRunning) {
                this.startTimerDisplay();
            }
        });
    }
    
    startTimerDisplay() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.updateBackgroundTimer();
        }, 1000);
    }
    
    stopTimerDisplay() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateBackgroundTimer() {
        chrome.storage.local.get(['hackFocusTimer'], (result) => {
            const timerState = result.hackFocusTimer;
            
            if (!timerState || !timerState.isRunning) {
                this.stopTimerDisplay();
                return;
            }
            
            const endTime = timerState.endTime;
            const now = Date.now();
            const remaining = Math.max(0, endTime - now);
            
            if (remaining === 0) {
                this.handleTimerComplete();
                return;
            }
            
            // Update the timer state with current time for popup to read
            chrome.storage.local.set({
                hackFocusTimer: {
                    ...timerState,
                    currentTime: now,
                    remaining: remaining
                }
            });
        });
    }
    
    handleTimerStateChange(change) {
        console.log('Background: Timer state changed:', change);
        if (change.newValue && change.newValue.isRunning) {
            console.log('Background: Starting timer display for:', change.newValue);
            this.startTimerDisplay();
        } else if (!change.newValue || !change.newValue.isRunning) {
            console.log('Background: Stopping timer display');
            this.stopTimerDisplay();
        }
    }
    
    handleInstallation() {
        // Set default settings on installation
        const defaultSettings = {
            blockingEnabled: true,
            blockMode: 'blocklist',
            blockedSites: [
                'facebook.com',
                'twitter.com',
                'instagram.com',
                'youtube.com',
                'reddit.com',
                'tiktok.com'
            ],
            allowedSites: []
        };
        
        chrome.storage.local.set({ hackFocusBlockSettings: defaultSettings });
        
        // Set default Pomodoro settings
        const defaultPomodoroSettings = {
            focusDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            autoBreaks: true
        };
        
        chrome.storage.sync.set({ hackFocusSettings: defaultPomodoroSettings });
    }
}

// Initialize background script
new HackFocusBackground();
