// Wishlist System
class WishlistSystem {
    constructor() {
        this.wishlist = [];
        this.init();
    }

    init() {
        this.loadWishlistFromStorage();
        this.setupEventListeners();
        this.updateWishlistUI();
    }

    setupEventListeners() {
        // Listen for user login/logout events
        window.addEventListener('userLoggedIn', (e) => {
            this.loadWishlistFromStorage();
            this.updateWishlistUI();
        });

        window.addEventListener('userLoggedOut', () => {
            this.clearWishlist();
        });

        // Setup heart buttons
        this.setupHeartButtons();
        
        // Add global event delegation for heart buttons (backup method)
        document.addEventListener('click', (e) => {
            // Check if clicked element is a heart button or heart icon
            const heartButton = e.target.closest('button[aria-labelledby="card-label-2"]');
            const heartIcon = e.target.closest('ion-icon[name="heart-outline"], ion-icon[name="heart"]');
            
            if (heartButton || (heartIcon && heartIcon.closest('button'))) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Heart clicked via event delegation!'); // Debug log
                this.handleAddToWishlist(e);
            }
        });
    }

    setupHeartButtons() {
        // Find all "Add to Wishlist" buttons (heart buttons) using multiple selectors
        let heartButtons = document.querySelectorAll('button[aria-labelledby="card-label-2"]');
        
        // Fallback: find by heart icon
        if (heartButtons.length === 0) {
            heartButtons = document.querySelectorAll('button ion-icon[name="heart-outline"], button ion-icon[name="heart"]');
            heartButtons = Array.from(heartButtons).map(icon => icon.closest('button')).filter(btn => btn);
        }
        
        console.log(`Found ${heartButtons.length} heart buttons`); // Debug log
        
        heartButtons.forEach((button, index) => {
            // Remove existing listeners by cloning
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add click listener
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Heart button ${index + 1} clicked!`); // Debug log
                this.handleAddToWishlist(e);
            });
            
            // Also add listener to the icon itself
            const icon = newButton.querySelector('ion-icon');
            if (icon) {
                icon.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`Heart icon ${index + 1} clicked!`); // Debug log
                    this.handleAddToWishlist(e);
                });
            }
        });
    }

    handleAddToWishlist(e) {
        console.log('handleAddToWishlist called'); // Debug log
        
        // Check if user is logged in
        if (!window.authSystem || !window.authSystem.isLoggedIn()) {
            console.log('User not logged in, opening auth modal'); // Debug log
            if (window.authSystem) {
                window.authSystem.openAuthModal();
            } else {
                alert('Please refresh the page and try again.');
            }
            return;
        }

        console.log('User is logged in, processing wishlist action'); // Debug log

        // Get product details from the clicked button's parent card
        const productCard = e.target.closest('.product-card') || e.target.closest('.showcase-item');
        if (!productCard) {
            console.log('Product card not found'); // Debug log
            return;
        }

        const product = this.extractProductInfo(productCard);
        if (product) {
            console.log('Product extracted:', product); // Debug log
            
            // Check if already in wishlist
            const isInWishlist = this.isInWishlist(product);
            
            if (isInWishlist) {
                this.removeFromWishlist(product);
                this.showWishlistNotification(`${product.name} removed from wishlist!`, 'remove');
                this.updateHeartButton(e.target, false);
            } else {
                this.addToWishlist(product);
                this.showWishlistNotification(`${product.name} added to wishlist!`, 'add');
                this.updateHeartButton(e.target, true);
            }
        } else {
            console.log('Could not extract product info'); // Debug log
        }
    }

    extractProductInfo(productCard) {
        try {
            // Extract product information from the card
            const imageEl = productCard.querySelector('.product-banner img, .showcase-banner img');
            const nameEl = productCard.querySelector('.product-title, .showcase-title');
            const priceEl = productCard.querySelector('.price, .showcase-price');
            const badgeEl = productCard.querySelector('.card-badge, .showcase-badge');

            if (!imageEl || !nameEl || !priceEl) {
                console.warn('Could not extract product info from card');
                return null;
            }

            // Extract price (remove currency symbols and get first price if multiple)
            const priceText = priceEl.textContent.trim();
            const priceMatch = priceText.match(/\$?(\d+\.?\d*)/);
            const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

            return {
                id: `wishlist_${nameEl.textContent.trim().replace(/\s+/g, '_').toLowerCase()}`,
                name: nameEl.textContent.trim(),
                price: price,
                image: imageEl.src,
                badge: badgeEl ? badgeEl.textContent.trim() : null,
                addedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error extracting product info for wishlist:', error);
            return null;
        }
    }

    addToWishlist(product) {
        // Check if product already exists in wishlist
        const existingItem = this.wishlist.find(item => item.id === product.id);

        if (!existingItem) {
            this.wishlist.push({ ...product });
            this.saveWishlistToStorage();
            this.updateWishlistUI();
        }
    }

    removeFromWishlist(product) {
        this.wishlist = this.wishlist.filter(item => item.id !== product.id);
        this.saveWishlistToStorage();
        this.updateWishlistUI();
    }

    isInWishlist(product) {
        return this.wishlist.some(item => item.id === product.id);
    }

    clearWishlist() {
        this.wishlist = [];
        this.saveWishlistToStorage();
        this.updateWishlistUI();
        this.resetAllHeartButtons();
    }

    updateWishlistUI() {
        this.updateWishlistCount();
        this.updateHeartButtonStates();
    }

    updateWishlistCount() {
        const count = this.wishlist.length;
        
        // Update the heart badge in navigation
        const wishlistBadge = document.querySelector('.nav-action-badge[value]');
        if (wishlistBadge) {
            wishlistBadge.textContent = count;
            wishlistBadge.setAttribute('value', count);
            
            // Hide badge if count is 0
            wishlistBadge.style.display = count > 0 ? 'block' : 'none';
        }
    }

    updateHeartButton(buttonElement, isLiked) {
        const heartIcon = buttonElement.querySelector('ion-icon') || buttonElement;
        const button = heartIcon.closest('button');
        
        if (isLiked) {
            // Change to filled heart
            heartIcon.setAttribute('name', 'heart');
            button.classList.add('wishlist-active');
            button.style.color = 'var(--red-salsa)';
        } else {
            // Change to outline heart
            heartIcon.setAttribute('name', 'heart-outline');
            button.classList.remove('wishlist-active');
            button.style.color = '';
        }
    }

    updateHeartButtonStates() {
        // Update all heart buttons based on current wishlist
        const heartButtons = document.querySelectorAll('button[aria-labelledby="card-label-2"]');
        
        heartButtons.forEach(button => {
            const productCard = button.closest('.product-card') || button.closest('.showcase-item');
            if (productCard) {
                const product = this.extractProductInfo(productCard);
                if (product) {
                    const isLiked = this.isInWishlist(product);
                    this.updateHeartButton(button, isLiked);
                }
            }
        });
    }

    resetAllHeartButtons() {
        const heartButtons = document.querySelectorAll('button[aria-labelledby="card-label-2"]');
        
        heartButtons.forEach(button => {
            this.updateHeartButton(button, false);
        });
    }

    saveWishlistToStorage() {
        if (window.authSystem.isLoggedIn()) {
            const userId = window.authSystem.getCurrentUser().id;
            localStorage.setItem(`footcap_wishlist_${userId}`, JSON.stringify(this.wishlist));
        }
    }

    loadWishlistFromStorage() {
        if (window.authSystem.isLoggedIn()) {
            const userId = window.authSystem.getCurrentUser().id;
            const wishlistData = localStorage.getItem(`footcap_wishlist_${userId}`);
            this.wishlist = wishlistData ? JSON.parse(wishlistData) : [];
        } else {
            this.wishlist = [];
        }
    }

    showWishlistNotification(message, type = 'add') {
        // Remove existing notification
        const existingNotification = document.querySelector('.wishlist-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = 'wishlist-notification';
        notification.textContent = message;
        
        const bgColor = type === 'add' ? 'var(--red-salsa)' : 'var(--davys-gray)';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Auto remove after 2 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 2000);
    }

    getWishlistSummary() {
        return {
            items: this.wishlist,
            totalItems: this.wishlist.length
        };
    }

    // Method to display wishlist (can be called to show wishlist modal/page)
    showWishlist() {
        if (!window.authSystem.isLoggedIn()) {
            window.authSystem.openAuthModal();
            return;
        }

        if (this.wishlist.length === 0) {
            this.showWishlistNotification('Your wishlist is empty!', 'info');
            return;
        }

        // For now, just show a simple alert with wishlist items
        // In a real application, you'd want to create a proper wishlist modal/page
        const wishlistNames = this.wishlist.map(item => item.name).join('\\n');
        alert(`Your Wishlist (${this.wishlist.length} items):\\n\\n${wishlistNames}`);
    }
}

// Initialize wishlist system
console.log('Loading wishlist system...'); // Debug log
const wishlistSystem = new WishlistSystem();
console.log('Wishlist system loaded:', wishlistSystem); // Debug log

// Make it globally available
window.wishlistSystem = wishlistSystem;