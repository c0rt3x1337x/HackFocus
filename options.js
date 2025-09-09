class HackFocusOptions {
    constructor() {
        this.settings = {
            blockingEnabled: false,
            blockMode: 'blocklist',
            blockedSites: [],
            allowedSites: [],
            focusDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            autoBreaks: true,
            selectedMission: 'mainframe'
        };
        
        this.init();
    }
    
    init() {
        console.log('Options: init() called');
        
        // Test if storage is working at all
        chrome.storage.local.set({testKey: 'testValue'}, () => {
            console.log('Options: Storage test - set testKey to local storage');
            chrome.storage.local.get(['testKey'], (result) => {
                console.log('Options: Storage test - retrieved testKey:', result);
                if (result && result.testKey === 'testValue') {
                    console.log('Options: Local storage is working correctly');
                } else {
                    console.log('Options: Local storage test failed');
                }
            });
        });
        
        this.loadSettings();
        this.setupEventListeners();
        this.loadStats();
    }
    
    loadSettings() {
        console.log('Options: loadSettings() called');
        console.log('Options: Current settings before load:', this.settings);
        
        // Debug: Let's see what's actually in storage
        chrome.storage.local.get(null, (allStorage) => {
            console.log('Options: All local storage keys:', Object.keys(allStorage || {}));
            console.log('Options: All local storage data:', allStorage);
        });
        
        // Load block settings
        chrome.storage.local.get(['hackFocusBlockSettings'], (blockResult) => {
            console.log('Options: blockResult:', blockResult);
            console.log('Options: blockResult type:', typeof blockResult);
            console.log('Options: blockResult.hackFocusBlockSettings:', blockResult?.hackFocusBlockSettings);
            
            if (blockResult && blockResult.hackFocusBlockSettings) {
                const blockSettings = blockResult.hackFocusBlockSettings;
                this.settings.blockingEnabled = blockSettings.blockingEnabled || false;
                this.settings.blockMode = blockSettings.blockMode || 'blocklist';
                this.settings.blockedSites = blockSettings.blockedSites || [];
                this.settings.allowedSites = blockSettings.allowedSites || [];
                console.log('Options: Loaded block settings successfully');
                console.log('Options: Blocked sites loaded from storage:', this.settings.blockedSites);
                console.log('Options: Blocked sites length:', this.settings.blockedSites.length);
            } else {
                console.log('Options: No block settings found in storage, using defaults');
                console.log('Options: Default blocked sites:', this.settings.blockedSites);
            }
            this.updateUI();
        });
        
        // Load Pomodoro settings
        chrome.storage.sync.get(['hackFocusSettings'], (pomodoroResult) => {
            console.log('Options: pomodoroResult:', pomodoroResult);
            if (pomodoroResult && pomodoroResult.hackFocusSettings) {
                const pomodoroSettings = pomodoroResult.hackFocusSettings;
                this.settings.focusDuration = pomodoroSettings.focusDuration || 25;
                this.settings.shortBreak = pomodoroSettings.shortBreak || 5;
                this.settings.longBreak = pomodoroSettings.longBreak || 15;
                this.settings.autoBreaks = pomodoroSettings.autoBreaks !== false;
                console.log('Options: Loaded pomodoro settings:', this.settings);
            } else {
                console.log('Options: No pomodoro settings found, using defaults');
            }
            this.updateUI();
        });
        
        // Load mission theme
        chrome.storage.sync.get(['hackFocusMission'], (missionResult) => {
            console.log('Options: missionResult:', missionResult);
            if (missionResult && missionResult.hackFocusMission) {
                this.settings.selectedMission = missionResult.hackFocusMission;
                console.log('Options: Loaded mission:', this.settings.selectedMission);
            } else {
                console.log('Options: No mission found, using default');
            }
            this.updateUI();
        });
    }
    
    saveSettings() {
        console.log('Options: saveSettings() called');
        console.log('Options: this.settings object:', this.settings);
        console.log('Options: this.settings.blockedSites:', this.settings.blockedSites);
        console.log('Options: this.settings.blockedSites length:', this.settings.blockedSites.length);
        console.log('Options: this.settings.blockedSites type:', typeof this.settings.blockedSites);
        console.log('Options: this.settings.blockedSites isArray:', Array.isArray(this.settings.blockedSites));
        
        // Save block settings
        const blockSettingsToSave = {
            blockingEnabled: this.settings.blockingEnabled,
            blockMode: this.settings.blockMode,
            blockedSites: this.settings.blockedSites,
            allowedSites: this.settings.allowedSites
        };
        
        console.log('Options: Block settings to save:', blockSettingsToSave);
        
        // Try using chrome.storage.local instead of sync
        chrome.storage.local.set({
            hackFocusBlockSettings: blockSettingsToSave
        }, () => {
            console.log('Options: Block settings saved to local storage');
            // Verify it was saved
            chrome.storage.local.get(['hackFocusBlockSettings'], (result) => {
                console.log('Options: Verification - saved block settings:', result);
                if (result && result.hackFocusBlockSettings) {
                    console.log('Options: Save verification successful - blocked sites:', result.hackFocusBlockSettings.blockedSites);
                } else {
                    console.log('Options: Save verification failed - no data found');
                }
            });
        });
        
        // Save Pomodoro settings
        chrome.storage.sync.set({
            hackFocusSettings: {
                focusDuration: this.settings.focusDuration,
                shortBreak: this.settings.shortBreak,
                longBreak: this.settings.longBreak,
                autoBreaks: this.settings.autoBreaks
            }
        }, () => {
            console.log('Options: Pomodoro settings saved');
        });
        
        // Save mission theme
        chrome.storage.sync.set({
            hackFocusMission: this.settings.selectedMission
        }, () => {
            console.log('Options: Mission settings saved');
            this.showStatus('Settings saved successfully!', 'success');
        });
    }
    
    setupEventListeners() {
        // Blocking settings
        document.getElementById('blocking-enabled').addEventListener('change', (e) => {
            this.settings.blockingEnabled = e.target.checked;
        });
        
        document.getElementById('block-mode').addEventListener('change', (e) => {
            this.settings.blockMode = e.target.value;
        });
        
        // Pomodoro settings
        document.getElementById('focus-duration').addEventListener('change', (e) => {
            this.settings.focusDuration = parseInt(e.target.value);
        });
        
        document.getElementById('short-break').addEventListener('change', (e) => {
            this.settings.shortBreak = parseInt(e.target.value);
        });
        
        document.getElementById('long-break').addEventListener('change', (e) => {
            this.settings.longBreak = parseInt(e.target.value);
        });
        
        document.getElementById('auto-breaks').addEventListener('change', (e) => {
            this.settings.autoBreaks = e.target.checked;
        });
        
        // Add site buttons
        document.getElementById('new-site').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addSite();
            }
        });
        
        document.getElementById('new-allowed-site').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addAllowedSite();
            }
        });
    }
    
    updateUI() {
        // Update blocking settings
        document.getElementById('blocking-enabled').checked = this.settings.blockingEnabled;
        document.getElementById('block-mode').value = this.settings.blockMode;
        
        // Update Pomodoro settings
        document.getElementById('focus-duration').value = this.settings.focusDuration;
        document.getElementById('short-break').value = this.settings.shortBreak;
        document.getElementById('long-break').value = this.settings.longBreak;
        document.getElementById('auto-breaks').checked = this.settings.autoBreaks;
        
        // Update site lists
        this.updateSiteList('blocked-sites-list', this.settings.blockedSites, 'blocked');
        this.updateSiteList('allowed-sites-list', this.settings.allowedSites, 'allowed');
        
        // Update mission selection
        this.updateMissionSelection();
    }
    
    updateSiteList(listId, sites, type) {
        const listElement = document.getElementById(listId);
        listElement.innerHTML = '';
        
        if (sites.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'site-item';
            emptyMessage.innerHTML = `<div class="site-url">No sites in ${type} list</div>`;
            listElement.appendChild(emptyMessage);
            return;
        }
        
        sites.forEach((site, index) => {
            const siteItem = document.createElement('div');
            siteItem.className = 'site-item';
            siteItem.innerHTML = `
                <div class="site-url">${site}</div>
                <button class="btn btn-danger remove-site-btn" data-index="${index}" data-type="${type}">Remove</button>
            `;
            listElement.appendChild(siteItem);
        });
        
        // Add event listeners to remove buttons
        listElement.querySelectorAll('.remove-site-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                const type = e.target.getAttribute('data-type');
                this.removeSite(index, type);
            });
        });
    }
    
    updateMissionSelection() {
        // Remove selected class from all mission cards
        document.querySelectorAll('.mission-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selected class to current mission
        const selectedCard = document.querySelector(`[data-mission="${this.settings.selectedMission}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
    }
    
    addSite() {
        console.log('Options: addSite() called');
        const input = document.getElementById('new-site');
        const site = input.value.trim().toLowerCase();
        
        console.log('Options: Input value:', input.value);
        console.log('Options: Site after trim/lowercase:', site);
        console.log('Options: Current blocked sites:', this.settings.blockedSites);
        
        if (site && !this.settings.blockedSites.includes(site)) {
            this.settings.blockedSites.push(site);
            console.log('Options: Added site, new blocked sites:', this.settings.blockedSites);
            console.log('Options: Blocked sites array length:', this.settings.blockedSites.length);
            console.log('Options: Blocked sites array type:', typeof this.settings.blockedSites);
            console.log('Options: Blocked sites isArray:', Array.isArray(this.settings.blockedSites));
            this.updateSiteList('blocked-sites-list', this.settings.blockedSites, 'blocked');
            input.value = '';
            this.saveSettings(); // Save settings immediately after adding site
            this.showStatus(`Added ${site} to block list`, 'success');
        } else if (this.settings.blockedSites.includes(site)) {
            console.log('Options: Site already in block list');
            this.showStatus('Site already in block list', 'error');
        } else if (!site) {
            console.log('Options: No site entered');
            this.showStatus('Please enter a domain name', 'error');
        }
    }
    
    addAllowedSite() {
        const input = document.getElementById('new-allowed-site');
        const site = input.value.trim().toLowerCase();
        
        if (site && !this.settings.allowedSites.includes(site)) {
            this.settings.allowedSites.push(site);
            this.updateSiteList('allowed-sites-list', this.settings.allowedSites, 'allowed');
            input.value = '';
            this.saveSettings(); // Save settings immediately after adding site
            this.showStatus(`Added ${site} to allow list`, 'success');
        } else if (this.settings.allowedSites.includes(site)) {
            this.showStatus('Site already in allow list', 'error');
        }
    }
    
    removeSite(index, type) {
        if (type === 'blocked') {
            this.settings.blockedSites.splice(index, 1);
            this.updateSiteList('blocked-sites-list', this.settings.blockedSites, 'blocked');
        } else if (type === 'allowed') {
            this.settings.allowedSites.splice(index, 1);
            this.updateSiteList('allowed-sites-list', this.settings.allowedSites, 'allowed');
        }
        
        // Save settings immediately after removing a site
        this.saveSettings();
        this.showStatus('Site removed', 'success');
    }
    
    selectMission(mission) {
        this.settings.selectedMission = mission;
        this.updateMissionSelection();
        this.showStatus(`Mission theme changed to ${mission}`, 'success');
    }
    
    loadStats() {
        console.log('Options: loadStats() called');
        
        chrome.storage.local.get(['hackFocusStats'], (result) => {
            console.log('Options: Storage result:', result);
            
            const stats = result?.hackFocusStats || {
                totalSessions: 0,
                totalTime: 0,
                sitesBlocked: 0,
                currentStreak: 0,
                hackedComputers: {
                    small: 0,    // 25min sessions
                    medium: 0,   // 30min sessions  
                    large: 0,    // 40min+ sessions
                    server: 0    // Special long sessions
                },
                dailyStats: {}   // Daily focus tracking
            };
            
            console.log('Options: Final stats object:', stats);
            console.log('Options: Daily stats:', stats.dailyStats);
            
            document.getElementById('total-sessions').textContent = stats.totalSessions;
            document.getElementById('total-time').textContent = this.formatTime(stats.totalTime);
            document.getElementById('sites-blocked').textContent = stats.sitesBlocked;
            document.getElementById('current-streak').textContent = stats.currentStreak;
            
            // Update hacked computers display
            this.updateHackedComputersDisplay(stats.hackedComputers);
            
            // Update daily dashboard
            this.updateDailyDashboard(stats.dailyStats);
            
            // Update contribution grid
            this.updateContributionGrid(stats.dailyStats);
        });
    }
    
    updateHackedComputersDisplay(hackedComputers) {
        // Create or update the hacked computers section
        let computersSection = document.getElementById('hacked-computers-section');
        if (!computersSection) {
            computersSection = document.createElement('div');
            computersSection.id = 'hacked-computers-section';
            computersSection.className = 'section';
            computersSection.innerHTML = `
                <div class="section-title">Hacked Computers</div>
                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-value" id="small-computers">0</div>
                        <div class="stat-label">Small Computers (25min)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="medium-computers">0</div>
                        <div class="stat-label">Medium Computers (30min)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="large-computers">0</div>
                        <div class="stat-label">Large Computers (40min+)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="servers">0</div>
                        <div class="stat-label">Servers (Forest)</div>
                    </div>
                </div>
                <div class="computer-grid" id="computer-grid">
                    <!-- Computer icons will be generated here -->
                </div>
            `;
            
            // Insert after the main stats section
            const mainStats = document.querySelector('#stats .section');
            mainStats.parentNode.insertBefore(computersSection, mainStats.nextSibling);
        }
        
        // Update the stat values
        document.getElementById('small-computers').textContent = hackedComputers.small;
        document.getElementById('medium-computers').textContent = hackedComputers.medium;
        document.getElementById('large-computers').textContent = hackedComputers.large;
        document.getElementById('servers').textContent = hackedComputers.server;
        
        // Generate computer grid
        this.generateComputerGrid(hackedComputers);
    }
    
    generateComputerGrid(hackedComputers) {
        const grid = document.getElementById('computer-grid');
        grid.innerHTML = '';
        
        const totalComputers = hackedComputers.small + hackedComputers.medium + hackedComputers.large + hackedComputers.server;
        
        if (totalComputers === 0) {
            grid.innerHTML = '<div class="empty-grid">No computers hacked yet. Start your first focus session!</div>';
            return;
        }
        
        // Computer icons mapping
        const computerIcons = {
            small: '💻',    // Laptop
            medium: '🖥️',   // Desktop
            large: '🖨️',    // Printer/Workstation
            server: '🖲️'    // Server
        };
        
        const computerNames = {
            small: 'Small Computer (25min)',
            medium: 'Medium Computer (30min)',
            large: 'Large Computer (40min+)',
            server: 'Server (60min+)'
        };
        
        // Generate computer icons
        for (let i = 0; i < hackedComputers.small; i++) {
            this.createComputerIcon(grid, 'small', computerIcons.small, computerNames.small);
        }
        
        for (let i = 0; i < hackedComputers.medium; i++) {
            this.createComputerIcon(grid, 'medium', computerIcons.medium, computerNames.medium);
        }
        
        for (let i = 0; i < hackedComputers.large; i++) {
            this.createComputerIcon(grid, 'large', computerIcons.large, computerNames.large);
        }
        
        for (let i = 0; i < hackedComputers.server; i++) {
            this.createComputerIcon(grid, 'server', computerIcons.server, computerNames.server);
        }
    }
    
    createComputerIcon(grid, type, icon, tooltip) {
        const computerDiv = document.createElement('div');
        computerDiv.className = `computer-icon ${type}`;
        computerDiv.textContent = icon;
        
        const tooltipDiv = document.createElement('div');
        tooltipDiv.className = 'computer-tooltip';
        tooltipDiv.textContent = tooltip;
        
        computerDiv.appendChild(tooltipDiv);
        grid.appendChild(computerDiv);
    }
    
    // Function to update stats when a session completes
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
                }
            };
            
            // Update basic stats
            stats.totalSessions++;
            stats.totalTime += sessionDuration;
            
            // Determine computer type based on duration
            if (sessionDuration >= 25 && sessionDuration < 30) {
                stats.hackedComputers.small++;
            } else if (sessionDuration >= 30 && sessionDuration < 40) {
                stats.hackedComputers.medium++;
            } else if (sessionDuration >= 40 && sessionDuration < 60) {
                stats.hackedComputers.large++;
            } else if (sessionDuration >= 60) {
                stats.hackedComputers.server++;
            }
            
            // Save updated stats
            chrome.storage.local.set({ hackFocusStats: stats }, () => {
                console.log('Stats updated:', stats);
            });
        });
    }
    
    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    }
    
    updateDailyDashboard(dailyStats) {
        console.log('Options: updateDailyDashboard called with:', dailyStats);
        
        // Check if dashboard elements exist
        const timeRangeElement = document.getElementById('timeRange');
        const chartElement = document.getElementById('daily-chart');
        const tableBody = document.getElementById('daily-details-body');
        
        console.log('Options: Dashboard elements found:', {
            timeRange: !!timeRangeElement,
            chart: !!chartElement,
            tableBody: !!tableBody
        });
        
        if (!timeRangeElement || !chartElement || !tableBody) {
            console.error('Options: Dashboard elements not found!');
            return;
        }
        
        const timeRange = parseInt(timeRangeElement.value) || 7;
        const chartData = this.getDailyChartData(dailyStats || {}, timeRange);
        
        console.log('Options: Chart data generated:', chartData);
        
        // Update dashboard stats
        this.updateDashboardStats(chartData);
        
        // Update chart
        this.updateDailyChart(chartData);
        
        // Update details table
        this.updateDailyDetailsTable(chartData);
    }
    
    getDailyChartData(dailyStats, days) {
        const data = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayData = dailyStats[dateStr] || {
                totalTime: 0,
                sessions: 0,
                date: dateStr,
                tasksCompleted: 0
            };
            
            data.push({
                date: dateStr,
                displayDate: this.formatDisplayDate(date),
                totalTime: dayData.totalTime,
                sessions: dayData.sessions,
                tasksCompleted: dayData.tasksCompleted || 0,
                avgSession: dayData.sessions > 0 ? Math.round(dayData.totalTime / dayData.sessions) : 0
            });
        }
        
        return data;
    }
    
    formatDisplayDate(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }
    
    updateDashboardStats(chartData) {
        const totalTime = chartData.reduce((sum, day) => sum + day.totalTime, 0);
        const activeDays = chartData.filter(day => day.totalTime > 0).length;
        const avgDaily = activeDays > 0 ? Math.round(totalTime / activeDays) : 0;
        const bestDay = Math.max(...chartData.map(day => day.totalTime));
        
        document.getElementById('avg-daily-time').textContent = this.formatTime(avgDaily);
        document.getElementById('best-day-time').textContent = this.formatTime(bestDay);
        document.getElementById('active-days').textContent = activeDays;
    }
    
    updateDailyChart(chartData) {
        console.log('Options: updateDailyChart called with:', chartData);
        
        const chartContainer = document.getElementById('daily-chart');
        if (!chartContainer) {
            console.error('Options: Chart container not found!');
            return;
        }
        
        chartContainer.innerHTML = '';
        
        if (chartData.length === 0) {
            console.log('Options: No chart data to display');
            chartContainer.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No focus data available</div>';
            return;
        }
        
        const maxTime = Math.max(...chartData.map(day => day.totalTime), 1);
        console.log('Options: Max time for chart:', maxTime);
        
        chartData.forEach((day, index) => {
            const barHeight = (day.totalTime / maxTime) * 100;
            console.log(`Options: Day ${index}: ${day.displayDate}, time: ${day.totalTime}m, height: ${barHeight}%`);
            
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${Math.max(barHeight, 2)}%`;
            
            const label = document.createElement('div');
            label.className = 'chart-bar-label';
            label.textContent = day.displayDate;
            
            const value = document.createElement('div');
            value.className = 'chart-bar-value';
            value.textContent = `${day.totalTime}m`;
            
            bar.appendChild(label);
            bar.appendChild(value);
            chartContainer.appendChild(bar);
        });
        
        console.log('Options: Chart updated with', chartContainer.children.length, 'bars');
    }
    
    updateDailyDetailsTable(chartData) {
        console.log('Options: updateDailyDetailsTable called with:', chartData);
        
        const tbody = document.getElementById('daily-details-body');
        if (!tbody) {
            console.error('Options: Table body not found!');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (chartData.length === 0) {
            console.log('Options: No table data to display');
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666; padding: 20px;">No focus data available</td></tr>';
            return;
        }
        
        chartData.forEach((day, index) => {
            console.log(`Options: Adding table row ${index}:`, day);
            
            const row = document.createElement('tr');
            
            const status = this.getDayStatus(day.totalTime);
            const statusClass = `status-${status.class}`;
            const statusText = status.text;
            
            row.innerHTML = `
                <td>${day.displayDate}</td>
                <td>${this.formatTime(day.totalTime)}</td>
                <td>${day.sessions}</td>
                <td>${day.tasksCompleted}</td>
                <td>${day.avgSession > 0 ? this.formatTime(day.avgSession) : '-'}</td>
                <td><span class="status-indicator ${statusClass}"></span>${statusText}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        console.log('Options: Table updated with', tbody.children.length, 'rows');
    }
    
    getDayStatus(totalTime) {
        if (totalTime >= 120) {
            return { class: 'excellent', text: 'Excellent' };
        } else if (totalTime >= 60) {
            return { class: 'good', text: 'Good' };
        } else if (totalTime >= 25) {
            return { class: 'fair', text: 'Fair' };
        } else if (totalTime > 0) {
            return { class: 'poor', text: 'Poor' };
        } else {
            return { class: 'none', text: 'No Focus' };
        }
    }
    
    updateContributionGrid(dailyStats) {
        console.log('Options: updateContributionGrid called with:', dailyStats);
        
        const gridContainer = document.getElementById('contribution-grid');
        if (!gridContainer) {
            console.error('Options: Contribution grid container not found!');
            return;
        }
        
        const selectedYear = parseInt(document.getElementById('contributionYear').value) || new Date().getFullYear();
        console.log('Options: Selected year:', selectedYear);
        
        // Generate contribution data for the selected year
        const contributionData = this.generateContributionData(dailyStats || {}, selectedYear);
        console.log('Options: Generated contribution data:', contributionData);
        
        // Clear existing grid
        gridContainer.innerHTML = '';
        
        // Generate grid squares
        contributionData.forEach((day, index) => {
            const square = document.createElement('div');
            square.className = `contribution-square level-${day.level}`;
            square.setAttribute('data-date', day.date);
            square.setAttribute('data-time', day.totalTime);
            square.setAttribute('data-sessions', day.sessions);
            
            // Add tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'contribution-tooltip';
            tooltip.innerHTML = `
                <div><strong>${day.displayDate}</strong></div>
                <div>Focus: ${day.totalTime}m</div>
                <div>Sessions: ${day.sessions}</div>
            `;
            square.appendChild(tooltip);
            
            gridContainer.appendChild(square);
        });
        
        console.log('Options: Contribution grid updated with', gridContainer.children.length, 'squares');
    }
    
    generateContributionData(dailyStats, year) {
        const data = [];
        const startDate = new Date(year, 0, 1); // January 1st
        const endDate = new Date(year, 11, 31); // December 31st
        
        // Calculate the start of the contribution grid (Sunday of the first week)
        const firstSunday = new Date(startDate);
        firstSunday.setDate(startDate.getDate() - startDate.getDay());
        
        // Generate 53 weeks of data (53 * 7 = 371 days)
        for (let week = 0; week < 53; week++) {
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(firstSunday);
                currentDate.setDate(firstSunday.getDate() + (week * 7) + day);
                
                const dateStr = currentDate.toISOString().split('T')[0];
                const dayData = dailyStats[dateStr] || {
                    totalTime: 0,
                    sessions: 0,
                    date: dateStr
                };
                
                data.push({
                    date: dateStr,
                    displayDate: this.formatContributionDate(currentDate),
                    totalTime: dayData.totalTime,
                    sessions: dayData.sessions,
                    level: this.getContributionLevel(dayData.totalTime),
                    isCurrentYear: currentDate.getFullYear() === year
                });
            }
        }
        
        return data;
    }
    
    getContributionLevel(totalTime) {
        if (totalTime === 0) return 0;
        if (totalTime < 15) return 1;
        if (totalTime < 30) return 2;
        if (totalTime < 60) return 3;
        return 4;
    }
    
    formatContributionDate(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    }
    
    showStatus(message, type) {
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = message;
        statusElement.className = `status-message status-${type}`;
        statusElement.style.display = 'block';
        
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);
    }
    
    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            try {
                // Reset to default settings
                this.settings = {
                    blockingEnabled: false,
                    blockMode: 'blocklist',
                    blockedSites: [
                        'facebook.com',
                        'twitter.com',
                        'instagram.com',
                        'youtube.com',
                        'reddit.com',
                        'tiktok.com'
                    ],
                    allowedSites: [],
                    focusDuration: 25,
                    shortBreak: 5,
                    longBreak: 15,
                    autoBreaks: true,
                    selectedMission: 'mainframe'
                };
                
                await this.saveSettings();
                this.updateUI();
                this.showStatus('Settings reset to defaults', 'success');
            } catch (error) {
                console.error('Error resetting settings:', error);
                this.showStatus('Error resetting settings', 'error');
            }
        }
    }
}

// Global functions for HTML onclick handlers
let options;

function showTab(tabName, clickedElement) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    const targetContent = document.getElementById(tabName);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Add active class to clicked tab
    if (clickedElement) {
        clickedElement.classList.add('active');
    }
}

// Global functions removed - now using event listeners

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    options = new HackFocusOptions();
    
    // Add event listeners to tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showTab(tabName, this);
        });
    });
    
    // Add event listeners to buttons
    document.getElementById('addBlockedSite').addEventListener('click', () => {
        options.addSite();
    });
    
    document.getElementById('addAllowedSite').addEventListener('click', () => {
        options.addAllowedSite();
    });
    
    document.getElementById('saveSettings').addEventListener('click', () => {
        options.saveSettings();
    });
    
    document.getElementById('resetSettings').addEventListener('click', () => {
        options.resetSettings();
    });
    
    document.getElementById('reloadBlockSettings').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'reloadSettings' }, (response) => {
            if (response && response.success) {
                options.showStatus('Block settings reloaded in background script', 'success');
            } else {
                options.showStatus('Failed to reload block settings', 'error');
            }
        });
    });
    
    // Add event listeners to mission cards
    document.getElementById('mission-mainframe').addEventListener('click', () => {
        options.selectMission('mainframe');
    });
    
    document.getElementById('mission-vault').addEventListener('click', () => {
        options.selectMission('vault');
    });
    
    document.getElementById('mission-satellite').addEventListener('click', () => {
        options.selectMission('satellite');
    });
    
    document.getElementById('mission-matrix').addEventListener('click', () => {
        options.selectMission('matrix');
    });
    
    // Add event listener for time range selector
    document.getElementById('timeRange').addEventListener('change', () => {
        // Reload stats to update dashboard with new time range
        options.loadStats();
    });
    
    // Add event listener for contribution year selector
    document.getElementById('contributionYear').addEventListener('change', () => {
        // Reload stats to update contribution grid with new year
        options.loadStats();
    });
});
