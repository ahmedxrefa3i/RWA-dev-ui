// Utility Functions for Rico World App

// ===== GENERAL UTILITIES =====

// Get user's IP address
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error getting IP:', error);
        return 'unknown';
    }
}

// Get user's location info
async function getUserLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            country: data.country_name || 'Unknown',
            city: data.city || 'Unknown',
            region: data.region || 'Unknown',
            timezone: data.timezone || 'Unknown'
        };
    } catch (error) {
        console.error('Error getting location:', error);
        return {
            country: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
            timezone: 'Unknown'
        };
    }
}

// Get device info
function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    let device = 'Unknown';
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect device type
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        device = 'Mobile';
    } else if (/Tablet|iPad/.test(userAgent)) {
        device = 'Tablet';
    } else {
        device = 'Desktop';
    }

    // Detect browser
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    // Detect OS
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return {
        device,
        browser,
        os,
        userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language || 'Unknown'
    };
}

// ===== ENCRYPTION/DECRYPTION =====

// Base64 decode function
function base64Decode(str) {
    try {
        return atob(str);
    } catch (error) {
        console.error('Base64 decode error:', error);
        return null;
    }
}

// Base64 encode function
function base64Encode(str) {
    try {
        return btoa(str);
    } catch (error) {
        console.error('Base64 encode error:', error);
        return null;
    }
}

// Simple encryption for additional security
function simpleEncrypt(text, key = 'ricoworld2024') {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
    }
    return base64Encode(result);
}

// Simple decryption
function simpleDecrypt(encryptedText, key = 'ricoworld2024') {
    const decoded = base64Decode(encryptedText);
    if (!decoded) return null;
    
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
    }
    return result;
}

// ===== LOCAL STORAGE UTILITIES =====

// Set item in localStorage with expiration
function setStorageItem(key, value, expirationHours = 24) {
    const item = {
        value: value,
        expiration: Date.now() + (expirationHours * 60 * 60 * 1000)
    };
    localStorage.setItem(key, JSON.stringify(item));
}

// Get item from localStorage with expiration check
function getStorageItem(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
        const item = JSON.parse(itemStr);
        if (Date.now() > item.expiration) {
            localStorage.removeItem(key);
            return null;
        }
        return item.value;
    } catch (error) {
        localStorage.removeItem(key);
        return null;
    }
}

// Clear expired items from localStorage
function clearExpiredStorage() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        getStorageItem(key); // This will remove expired items
    });
}

// ===== ANIMATION UTILITIES =====

// Add animation class to element
function addAnimation(element, animationClass, duration = 1000) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    
    if (!element) return;

    element.classList.add(animationClass);
    
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, duration);
}

// Animate element with custom properties
function animateElement(element, properties, duration = 300) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    
    if (!element) return Promise.resolve();

    return new Promise(resolve => {
        const originalStyles = {};
        
        // Store original styles
        Object.keys(properties).forEach(prop => {
            originalStyles[prop] = element.style[prop];
        });

        // Apply transition
        element.style.transition = `all ${duration}ms ease`;
        
        // Apply new styles
        Object.keys(properties).forEach(prop => {
            element.style[prop] = properties[prop];
        });

        setTimeout(() => {
            element.style.transition = '';
            resolve();
        }, duration);
    });
}

// ===== DOM UTILITIES =====

// Wait for DOM to be ready
function domReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

// Create element with attributes
function createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    
    Object.keys(attributes).forEach(attr => {
        if (attr === 'className') {
            element.className = attributes[attr];
        } else if (attr === 'innerHTML') {
            element.innerHTML = attributes[attr];
        } else {
            element.setAttribute(attr, attributes[attr]);
        }
    });
    
    if (textContent) {
        element.textContent = textContent;
    }
    
    return element;
}

// ===== NOTIFICATION SYSTEM =====

// Show notification
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = createElement('div', {
        className: `notification ${type} slide-in-right`
    });

    const icon = getNotificationIcon(type);
    
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-text">${message}</div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(notification);

    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, duration);
    }
}

// Get notification icon based on type
function getNotificationIcon(type) {
    const icons = {
        success: '<i class="fas fa-check-circle" style="color: var(--brand-success);"></i>',
        error: '<i class="fas fa-exclamation-triangle" style="color: var(--brand-error);"></i>',
        warning: '<i class="fas fa-exclamation-circle" style="color: var(--brand-warning);"></i>',
        info: '<i class="fas fa-info-circle" style="color: var(--brand-secondary);"></i>'
    };
    return icons[type] || icons.info;
}

// ===== LOADING UTILITIES =====

// Show loading screen
function showLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
    }
}

// Hide loading screen
function hideLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// ===== THEME UTILITIES =====

// Toggle theme
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        if (themeIcon) themeIcon.className = 'fas fa-moon';
        setStorageItem('theme', 'dark');
        showNotification('تم التبديل إلى الوضع الليلي', 'success');
    } else {
        body.classList.add('light-mode');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
        setStorageItem('theme', 'light');
        showNotification('تم التبديل إلى الوضع النهاري', 'success');
    }
}

// Load saved theme
function loadSavedTheme() {
    const savedTheme = getStorageItem('theme');
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    } else {
        body.classList.remove('light-mode');
        if (themeIcon) themeIcon.className = 'fas fa-moon';
    }
}

// ===== VALIDATION UTILITIES =====

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate IP address
function isValidIP(ip) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
}

// Validate password strength
function validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const score = [
        password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
    ].filter(Boolean).length;
    
    return {
        score,
        isStrong: score >= 4,
        feedback: getPasswordFeedback(score)
    };
}

function getPasswordFeedback(score) {
    const feedback = [
        'ضعيف جداً',
        'ضعيف',
        'متوسط',
        'جيد',
        'قوي جداً'
    ];
    return feedback[score] || 'ضعيف جداً';
}

// ===== TIME UTILITIES =====

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return 'غير محدد';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    
    return date.toLocaleDateString('ar-SA');
}

// Get time greeting
function getTimeGreeting() {
    const hour = new Date().getHours();
    
    if (hour < 6) return 'ليلة سعيدة';
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'ليلة سعيدة';
}

// ===== PERFORMANCE UTILITIES =====

// Debounce function
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== ERROR HANDLING =====

// Global error handler
function setupErrorHandling() {
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        showNotification('حدث خطأ غير متوقع', 'error');
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        showNotification('حدث خطأ في الاتصال', 'error');
    });
}

// ===== INITIALIZATION =====

// Initialize utilities when DOM is ready
domReady(() => {
    setupErrorHandling();
    clearExpiredStorage();
    loadSavedTheme();
});

// Export utilities to global scope
window.Utils = {
    getUserIP,
    getUserLocation,
    getDeviceInfo,
    base64Decode,
    base64Encode,
    simpleEncrypt,
    simpleDecrypt,
    setStorageItem,
    getStorageItem,
    clearExpiredStorage,
    addAnimation,
    animateElement,
    domReady,
    createElement,
    showNotification,
    showLoading,
    hideLoading,
    toggleTheme,
    loadSavedTheme,
    isValidEmail,
    isValidIP,
    validatePasswordStrength,
    formatTimestamp,
    getTimeGreeting,
    debounce,
    throttle
};

