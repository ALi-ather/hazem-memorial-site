// Tasbih Counter Application
class TasbihCounter {
    constructor() {
        this.counters = {
            'سبحان الله وبحمده': 0,
            'الحمد لله': 0,
            'الله أكبر': 0,
            'اللهم ارفع درجته': 0
        };
        this.totalCount = 0;
        this.storageKey = 'hazem-memorial-tasbih';
        
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.updateDisplay();
        this.setupEventListeners();
        this.checkAudioFile();
    }
    
    // Load counters from localStorage
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.counters = { ...this.counters, ...data.counters };
                this.totalCount = data.totalCount || 0;
            }
        } catch (error) {
            console.log('Error loading from storage:', error);
        }
    }
    
    // Save counters to localStorage
    saveToStorage() {
        try {
            const data = {
                counters: this.counters,
                totalCount: this.totalCount,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.log('Error saving to storage:', error);
        }
    }
    
    // Increment specific tasbih counter
    incrementCounter(tasbihText) {
        if (this.counters.hasOwnProperty(tasbihText)) {
            this.counters[tasbihText]++;
            this.totalCount++;
            this.updateDisplay();
            this.saveToStorage();
            this.animateButton(tasbihText);
            this.playClickSound();
        }
    }
    
    // Update display of all counters
    updateDisplay() {
        // Update individual counters
        const buttons = document.querySelectorAll('.tasbih-btn');
        buttons.forEach((button, index) => {
            const tasbihText = button.getAttribute('data-tasbih');
            const countElement = button.querySelector('.tasbih-count');
            if (countElement && this.counters[tasbihText] !== undefined) {
                countElement.textContent = this.counters[tasbihText];
            }
        });
        
        // Update total counter
        const totalElement = document.getElementById('total-count');
        if (totalElement) {
            totalElement.textContent = this.totalCount;
        }
    }
    
    // Reset all counters
    resetCounters() {
        if (confirm('هل أنت متأكد من إعادة تعيين جميع العدادات؟')) {
            Object.keys(this.counters).forEach(key => {
                this.counters[key] = 0;
            });
            this.totalCount = 0;
            this.updateDisplay();
            this.saveToStorage();
            this.showResetMessage();
        }
    }
    
    // Animate button on click
    animateButton(tasbihText) {
        const button = document.querySelector(`[data-tasbih="${tasbihText}"]`);
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        }
    }
    
    // Play click sound (if available)
    playClickSound() {
        try {
            // Create a simple click sound using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Silently fail if audio context is not available
        }
    }
    
    // Show reset confirmation message
    showResetMessage() {
        const message = document.createElement('div');
        message.className = 'reset-message';
        message.textContent = 'تم إعادة تعيين العدادات بنجاح';
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #28a745;
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 1.2rem;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 2000);
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            const buttons = document.querySelectorAll('.tasbih-btn');
            
            if (key >= '1' && key <= '4') {
                const index = parseInt(key) - 1;
                if (buttons[index]) {
                    buttons[index].click();
                }
            }
            
            if (e.ctrlKey && key === 'r') {
                e.preventDefault();
                this.resetCounters();
            }
        });
        
        // Touch events for mobile
        document.querySelectorAll('.tasbih-btn').forEach(button => {
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                button.click();
            });
        });
    }
    
    // Check if audio file exists and show/hide Quran section
    checkAudioFile() {
        const audio = document.getElementById('quran-audio');
        const section = document.getElementById('quran-section');
        
        if (audio && section) {
            audio.addEventListener('error', () => {
                section.style.display = 'none';
            });
            
            audio.addEventListener('loadeddata', () => {
                section.style.display = 'block';
            });
        }
    }
}

// Social sharing functions
function shareOnWhatsApp() {
    const text = encodeURIComponent('صدقة جارية على روح المرحوم حازم محمد عقل - اللهم اجعلها نورًا ورحمةً ورفعةً لدرجته');
    const url = encodeURIComponent(window.location.href);
    const whatsappUrl = `https://wa.me/?text=${text}%20${url}`;
    window.open(whatsappUrl, '_blank');
}

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showCopyMessage();
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopyMessage();
    });
}

function showCopyMessage() {
    const message = document.createElement('div');
    message.textContent = 'تم نسخ الرابط بنجاح';
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #007bff;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 1.1rem;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 2000);
}

// Global functions for HTML onclick events
let tasbihApp;

function incrementTasbih(button) {
    const tasbihText = button.getAttribute('data-tasbih');
    tasbihApp.incrementCounter(tasbihText);
}

function resetCounters() {
    tasbihApp.resetCounters();
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    tasbihApp = new TasbihCounter();
    
    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

