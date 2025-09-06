class HackFocusPopup {
    constructor() {
        this.timer = null;
        this.isRunning = false;
        this.currentSession = 'focus';
        this.sessionCount = 1;
        this.totalSessions = 0;
        this.settings = {
            focusDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            autoBreaks: true
        };
        
        this.missionMessages = {
            focus: [
                "Establishing backdoor...",
                "Bypassing firewall...",
                "Decrypting payload...",
                "Injecting exploit...",
                "Escalating privileges...",
                "Accessing mainframe...",
                "Cracking encryption...",
                "Hacking the matrix..."
            ],
            shortBreak: [
                "Firewall cooling down...",
                "System rebooting...",
                "Clearing cache...",
                "Recharging batteries..."
            ],
            longBreak: [
                "System maintenance mode...",
                "Full system reboot...",
                "Security protocols reset...",
                "Mission briefing complete..."
            ]
        };
        
        this.init();
    }
    
    async init() {
        console.log('Popup: init() called');
        await this.loadSettings();
        console.log('Popup: loadSettings() completed');
        this.loadState();
        console.log('Popup: loadState() called');
        this.setupEventListeners();
        this.updateUI();
        this.updateMissionLog("System initialized. Ready for mission.");
        console.log('Popup: init() completed');
    }
    
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['hackFocusSettings']);
            if (result.hackFocusSettings) {
                this.settings = { ...this.settings, ...result.hackFocusSettings };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    async saveSettings() {
        try {
            await chrome.storage.sync.set({ hackFocusSettings: this.settings });
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
    
    loadState() {
        console.log('Popup: loadState() called');
        
        // Check if there's an active timer using callback instead of async/await
        chrome.storage.local.get(['hackFocusTimer'], (timerResult) => {
            console.log('Popup: loadState() - timerResult:', timerResult);
            
            if (timerResult && timerResult.hackFocusTimer && timerResult.hackFocusTimer.isRunning) {
                console.log('Found active timer, restoring state:', timerResult.hackFocusTimer);
                this.isRunning = true;
                this.currentSession = timerResult.hackFocusTimer.currentSession;
                this.sessionCount = timerResult.hackFocusTimer.sessionCount;
                
                // Update UI to show timer is running
                this.updateUI();
                
                // Start the timer display
                this.startTimerDisplay();
            } else {
                console.log('No active timer found or timer not running');
                console.log('Timer exists?', !!(timerResult && timerResult.hackFocusTimer));
                console.log('Is running?', timerResult?.hackFocusTimer?.isRunning);
            }
        });
        
        // Debug: Let's see what keys are actually in storage
        chrome.storage.local.get(null, (allStorage) => {
            console.log('Popup: All storage keys:', Object.keys(allStorage || {}));
            console.log('Popup: All storage data:', allStorage);
        });
    }
    
    async getMessageFromBackground(action, data = null) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ action, ...data }, (response) => {
                resolve(response);
            });
        });
    }
    
    async saveState() {
        try {
            const state = {
                currentSession: this.currentSession,
                sessionCount: this.sessionCount,
                totalSessions: this.totalSessions
            };
            await chrome.storage.local.set({ hackFocusState: state });
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }
    
    setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.startTimer());
        document.getElementById('stop-btn').addEventListener('click', () => this.stopTimer());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetTimer());
        document.getElementById('options-btn').addEventListener('click', () => this.openOptions());
        
        // Settings change listeners
        document.getElementById('focus-duration').addEventListener('change', (e) => {
            this.settings.focusDuration = parseInt(e.target.value);
            this.saveSettings();
            this.updateUI();
        });
        
        document.getElementById('short-break').addEventListener('change', (e) => {
            this.settings.shortBreak = parseInt(e.target.value);
            this.saveSettings();
        });
        
        document.getElementById('long-break').addEventListener('change', (e) => {
            this.settings.longBreak = parseInt(e.target.value);
            this.saveSettings();
        });
        
        document.getElementById('auto-breaks').addEventListener('change', (e) => {
            this.settings.autoBreaks = e.target.checked;
            this.saveSettings();
        });
    }
    
    startTimer() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateUI();
        
        const duration = this.getCurrentDuration();
        const endTime = Date.now() + (duration * 60 * 1000);
        
        const timerState = {
            isRunning: true,
            endTime: endTime,
            currentSession: this.currentSession,
            sessionCount: this.sessionCount
        };
        
        console.log('Popup: Storing timer state:', timerState);
        
        // Store timer state - this will trigger the background script to start
        chrome.storage.local.set({
            hackFocusTimer: timerState
        }, () => {
            console.log('Popup: Timer state saved to storage');
        });
        
        // Set alarm for notification
        chrome.alarms.create('hackFocusTimer', {
            when: endTime
        });
        
        this.updateMissionLog(`Mission ${this.sessionCount} initiated: ${this.getCurrentMissionMessage()}`);
        this.startTimerDisplay();
        
        // Enable blocking when timer starts
        chrome.runtime.sendMessage({ action: 'enableBlocking' });
    }
    
    stopTimer(userInitiated = true) {
        this.isRunning = false;
        this.updateUI();
        
        // Clear timer state - this will trigger the background script to stop
        chrome.storage.local.remove(['hackFocusTimer']);
        chrome.alarms.clear('hackFocusTimer');
        
        // Disable blocking when timer is stopped
        chrome.runtime.sendMessage({ action: 'disableBlocking' });
        
        if (userInitiated) {
            this.updateMissionLog("Mission aborted by user.");
        }
    }
    
    resetTimer() {
        this.stopTimer(true); // User initiated reset
        this.currentSession = 'focus';
        this.sessionCount = 1;
        this.saveState();
        this.updateUI();
        this.updateMissionLog("System reset. Ready for new mission.");
    }
    
    getCurrentDuration() {
        switch (this.currentSession) {
            case 'focus': return this.settings.focusDuration;
            case 'shortBreak': return this.settings.shortBreak;
            case 'longBreak': return this.settings.longBreak;
            default: return this.settings.focusDuration;
        }
    }
    
    getCurrentMissionMessage() {
        const messages = this.missionMessages[this.currentSession] || this.missionMessages.focus;
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    startTimerDisplay() {
        // Don't start our own timer, let the background script handle it
        // Just start updating the display
        this.updateTimerDisplay();
    }
    
    updateTimerDisplay() {
        // Get timer state from local storage (updated by background script)
        chrome.storage.local.get(['hackFocusTimer'], (result) => {
            const timerState = result.hackFocusTimer;
            
            if (!timerState || !timerState.isRunning) {
                // Timer not running, stop the display but don't log as "aborted by user"
                this.isRunning = false;
                this.updateUI();
                return;
            }
            
            // Use the remaining time calculated by background script, or calculate it ourselves
            let remaining = timerState.remaining;
            if (!remaining && timerState.endTime) {
                remaining = Math.max(0, timerState.endTime - Date.now());
            }
            
            if (remaining === 0) {
                this.completeSession();
                return;
            }
            
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            this.updateProgress(remaining);
            
            // Schedule next update
            setTimeout(() => {
                this.updateTimerDisplay();
            }, 1000);
        });
    }
    
    updateProgress(remaining) {
        const total = this.getCurrentDuration() * 60 * 1000;
        const elapsed = total - remaining;
        const percentage = Math.min(100, (elapsed / total) * 100);
        
        document.getElementById('progress-fill').style.width = `${percentage}%`;
        document.getElementById('progress-text').textContent = `${Math.round(percentage)}% Complete`;
    }
    
    completeSession() {
        this.isRunning = false;
        
        // The background script will handle the session completion
        // We just need to update the UI
        this.updateUI();
        this.updateMissionLog("Session completed! Check background script for updates.");
        
        // Reload state from background script
        this.loadState().then(() => {
            this.updateUI();
        });
    }
    
    showNotification() {
        const messages = {
            focus: {
                title: "Break Time!",
                message: "Firewall cooling down... System rebooted. Back to the hack!"
            },
            shortBreak: {
                title: "Break Complete!",
                message: "System rebooted. Ready for next hack attempt."
            },
            longBreak: {
                title: "Long Break Complete!",
                message: "System maintenance complete. Mission briefing updated."
            }
        };
        
        const message = messages[this.currentSession] || messages.focus;
        
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon-48.png',
            title: message.title,
            message: message.message
        });
    }
    
    updateUI() {
        // Update settings in UI
        document.getElementById('focus-duration').value = this.settings.focusDuration;
        document.getElementById('short-break').value = this.settings.shortBreak;
        document.getElementById('long-break').value = this.settings.longBreak;
        document.getElementById('auto-breaks').checked = this.settings.autoBreaks;
        
        // Update timer display
        const duration = this.getCurrentDuration();
        document.getElementById('timer').textContent = `${duration.toString().padStart(2, '0')}:00`;
        
        // Update session info
        const sessionTypes = {
            focus: 'FOCUS SESSION',
            shortBreak: 'SHORT BREAK',
            longBreak: 'LONG BREAK'
        };
        
        document.getElementById('session-type').textContent = sessionTypes[this.currentSession];
        document.getElementById('session-number').textContent = `Session ${this.sessionCount}`;
        
        // Update buttons
        document.getElementById('start-btn').disabled = this.isRunning;
        document.getElementById('stop-btn').disabled = !this.isRunning;
        
        // Update mission status
        document.getElementById('mission-status').textContent = this.getCurrentMissionMessage();
        
        // Update progress
        document.getElementById('progress-fill').style.width = '0%';
        document.getElementById('progress-text').textContent = '0% Complete';
        
        // Add glitch effect for active sessions
        const timerElement = document.getElementById('timer');
        if (this.isRunning) {
            timerElement.classList.add('pulse');
        } else {
            timerElement.classList.remove('pulse');
        }
    }
    
    updateMissionLog(message) {
        const logContent = document.getElementById('mission-log');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
        
        // Keep only last 10 entries
        while (logContent.children.length > 10) {
            logContent.removeChild(logContent.firstChild);
        }
    }
    
    openOptions() {
        chrome.runtime.openOptionsPage();
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HackFocusPopup();
});
