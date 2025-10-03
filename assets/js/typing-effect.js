/**
 * typing-effect.js - Dynamic Text Animation System
 * Features: Sequential typing animation for hero text
 * Clean typing effect without cursor for smooth user experience
 */

// Typing Effect for Hero Title
class TypingEffect {
    // Initialize typing effect with customizable speed
    constructor(element, text, speed = 100) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.index = 0;
        this.currentText = '';
    }

    type() {
        if (this.index < this.text.length) {
            this.currentText += this.text[this.index];
            this.index++;
            
            this.element.innerHTML = this.currentText;
            setTimeout(() => this.type(), this.speed);
        }
    }

    start() {
        this.type();
    }

    reset() {
        this.index = 0;
        this.currentText = '';
        this.element.innerHTML = '';
    }
}

// Sequential typing effect manager
class SequentialTyping {
    constructor(typingEffects, delay = 500) {
        this.effects = typingEffects;
        this.delay = delay;
        this.currentIndex = 0;
    }

    startNext() {
        if (this.currentIndex < this.effects.length) {
            const currentEffect = this.effects[this.currentIndex];
            currentEffect.start();
            
            // Wait for current effect to finish, then start next
            const textLength = currentEffect.text.length;
            const totalTime = textLength * currentEffect.speed;
            
            setTimeout(() => {
                this.currentIndex++;
                if (this.currentIndex < this.effects.length) {
                    setTimeout(() => this.startNext(), this.delay);
                }
            }, totalTime);
        }
    }

    start() {
        this.startNext();
    }
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', function() {
    const typingElement1 = document.getElementById('typing-text-1');
    const typingElement2 = document.getElementById('typing-text-2');
    
    if (typingElement1 && typingElement2) {
        const effect1 = new TypingEffect(typingElement1, 'New Summer', 100);
        const effect2 = new TypingEffect(typingElement2, 'Shoes Collection', 100);
        
        const sequentialTyping = new SequentialTyping([effect1, effect2], 300);
        
        // Start typing effect after a short delay
        setTimeout(() => {
            sequentialTyping.start();
        }, 500);
    }
});