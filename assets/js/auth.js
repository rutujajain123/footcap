// Authentication System
/**
 * auth.js - User Authentication System
 * Features: Signup, Login, Session Management, localStorage Integration
 * Secure user data handling for eCommerce functionality
 */

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.eventListenersSetup = false;
        this.init();
    }

    init() {
        // Check if user is already logged in
        this.loadUserFromStorage();
        this.setupEventListeners();
        this.updateUserStatus();
    }

    setupEventListeners() {
        // Modal controls
        const authModal = document.getElementById('authModal');
        const authClose = document.querySelector('.auth-close');
        
        // Tab switching
        const tabBtns = document.querySelectorAll('.auth-tab-btn');
        
        // Form submissions
        const signupForm = document.getElementById('signupForm');
        const loginForm = document.getElementById('loginForm');

        console.log('Setting up auth event listeners...'); // Debug
        console.log('Signup form found:', signupForm); // Debug
        console.log('Login form found:', loginForm); // Debug

        // Close modal when clicking X
        authClose?.addEventListener('click', () => this.closeAuthModal());
        
        // Close modal when clicking outside
        authModal?.addEventListener('click', (e) => {
            if (e.target === authModal) {
                this.closeAuthModal();
            }
        });

        // Tab switching
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Form submissions
        signupForm?.addEventListener('submit', (e) => {
            console.log('Signup form submitted!'); // Debug
            this.handleSignup(e);
        });
        loginForm?.addEventListener('submit', (e) => {
            console.log('Login form submitted!'); // Debug
            this.handleLogin(e);
        });

        // Mark event listeners as set up
        this.eventListenersSetup = true;
    }

    openAuthModal() {
        const authModal = document.getElementById('authModal');
        authModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeAuthModal() {
        const authModal = document.getElementById('authModal');
        authModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resetForms();
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tab}-form`).classList.add('active');
    }

    async handleSignup(e) {
        e.preventDefault();
        
        // Extract and validate user input data
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;

        // Basic validation
        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long', 'error');
            return;
        }

        // Check if user already exists
        const users = this.getUsers();
        if (users.some(user => user.email === email)) {
            this.showMessage('User with this email already exists', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: this.hashPassword(password), // In real app, use proper hashing
            createdAt: new Date().toISOString()
        };

        // Save user
        users.push(newUser);
        localStorage.setItem('footcap_users', JSON.stringify(users));

        // Login the user
        this.loginUser(newUser);
        this.closeAuthModal();
        this.showMessage('Account created successfully!', 'success');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === this.hashPassword(password));

        if (user) {
            this.loginUser(user);
            this.closeAuthModal();
            this.showMessage('Login successful!', 'success');
        } else {
            this.showMessage('Invalid email or password', 'error');
        }
    }

    loginUser(user) {
        this.currentUser = user;
        localStorage.setItem('footcap_current_user', JSON.stringify(user));
        this.updateUserStatus();
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('footcap_current_user');
        
        // Show default cart button again
        const defaultCartBtn = document.getElementById('defaultCartBtn');
        if (defaultCartBtn) {
            defaultCartBtn.style.display = 'block';
        }
        
        // Show default wishlist button again
        const defaultWishlistBtn = document.getElementById('defaultWishlistBtn');
        if (defaultWishlistBtn) {
            defaultWishlistBtn.style.display = 'block';
        }
        
        this.updateUserStatus();
        
        // Clear cart
        if (window.cartSystem) {
            window.cartSystem.clearCart();
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
        this.showMessage('Logged out successfully', 'success');
    }

    loadUserFromStorage() {
        const userData = localStorage.getItem('footcap_current_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    updateUserStatus() {
        // Remove existing user status items
        const existingStatus = document.querySelector('.user-status-item');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        // Remove any cart icons to prevent duplicates
        const existingCartIcons = document.querySelectorAll('.cart-icon');
        existingCartIcons.forEach(icon => icon.remove());

        // Hide/show default cart button based on login status
        const defaultCartBtn = document.getElementById('defaultCartBtn');
        if (defaultCartBtn) {
            if (this.currentUser) {
                defaultCartBtn.style.display = 'none';
            } else {
                defaultCartBtn.style.display = 'block';
            }
        }

        // Hide/show default wishlist button based on login status
        const defaultWishlistBtn = document.getElementById('defaultWishlistBtn');
        if (defaultWishlistBtn) {
            if (this.currentUser) {
                defaultWishlistBtn.style.display = 'none';
            } else {
                defaultWishlistBtn.style.display = 'block';
            }
        }

        // Add new user status to navigation
        const navActionList = document.querySelector('.nav-action-list');
        if (!navActionList) return;

        if (this.currentUser) {
            // Create a list item for logged-in state
            const userStatusLi = document.createElement('li');
            userStatusLi.className = 'user-status-item';
            userStatusLi.innerHTML = `
                <div class="user-status logged-in">
                    <span>Welcome, ${this.currentUser.name}</span>
                    <button class="logout-btn" onclick="authSystem.logout()">Logout</button>
                </div>
            `;
            navActionList.appendChild(userStatusLi);
            console.log('Created logout button for user:', this.currentUser.name); // Debug
        } else {
            // Create a list item for signup button
            const userStatusLi = document.createElement('li');
            userStatusLi.className = 'user-status-item';
            userStatusLi.innerHTML = `
                <button class="nav-action-btn auth-signup-btn" onclick="authSystem.openAuthModal()">
                    <span class="nav-action-text">Sign Up</span>
                </button>
            `;
            navActionList.appendChild(userStatusLi);
            console.log('Created signup button'); // Debug
        }
        
        // Trigger cart UI update to recreate cart icon if needed
        if (window.cartSystem && this.currentUser) {
            setTimeout(() => {
                window.cartSystem.updateCartUI();
                console.log('Cart UI updated after login'); // Debug
            }, 100);
        }
        
        // Trigger wishlist UI update to recreate wishlist icon if needed
        if (window.wishlistSystem && this.currentUser) {
            setTimeout(() => {
                window.wishlistSystem.updateWishlistUI();
                console.log('Wishlist UI updated after login'); // Debug
            }, 100);
        }
    }

    getUsers() {
        const usersData = localStorage.getItem('footcap_users');
        return usersData ? JSON.parse(usersData) : [];
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    hashPassword(password) {
        // Simple hash for demo - use proper hashing in production
        return btoa(password);
    }

    resetForms() {
        document.getElementById('signupForm')?.reset();
        document.getElementById('loginForm')?.reset();
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message ${type}`;
        messageDiv.textContent = message;
        
        // Style the message
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 2px solid transparent;
            ${type === 'success' ? 'background-color: #22c55e; border-color: #16a34a;' : 
              type === 'error' ? 'background-color: #ef4444; border-color: #dc2626;' : 
              'background-color: #3b82f6; border-color: #2563eb;'}
        `;

        document.body.appendChild(messageDiv);

        // Auto remove after 4 seconds (longer for success messages)
        const duration = type === 'success' ? 4000 : 3000;
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.opacity = '0';
                messageDiv.style.transform = 'translateX(100%)';
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, duration);
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize authentication system
console.log('Loading auth system...'); // Debug log
const authSystem = new AuthSystem();
console.log('Auth system loaded:', authSystem); // Debug log

// Make it globally available
window.authSystem = authSystem;

// Add additional event delegation for form submissions (fallback)
document.addEventListener('DOMContentLoaded', function() {
    // Ensure forms are connected even if not caught by main setup
    document.addEventListener('submit', function(e) {
        // Only handle if the main event listeners haven't been set up
        if (e.target.id === 'signupForm' && !window.authSystem.eventListenersSetup) {
            console.log('Signup form submitted via delegation!'); // Debug
            e.preventDefault();
            if (window.authSystem) {
                window.authSystem.handleSignup(e);
            }
        } else if (e.target.id === 'loginForm' && !window.authSystem.eventListenersSetup) {
            console.log('Login form submitted via delegation!'); // Debug
            e.preventDefault();
            if (window.authSystem) {
                window.authSystem.handleLogin(e);
            }
        }
    });
});