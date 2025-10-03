// Wishlist System
/**
 * wishlist.js - Product Wishlist/Favorites System
 * Features: Heart icon toggles, User-specific wishlists, Authentication required
 * Persistent storage using localStorage with user-specific data
 */

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
            const imageEl = productCard.querySelector('.card-banner img, .showcase-banner img');
            const nameEl = productCard.querySelector('.card-title a, .showcase-title');
            const priceEl = productCard.querySelector('.card-price, .showcase-price');
            const badgeEl = productCard.querySelector('.card-badge, .showcase-badge');

            console.log('Extracting wishlist product info:', {
                imageEl: imageEl?.src,
                nameEl: nameEl?.textContent,
                priceEl: priceEl?.textContent,
                badgeEl: badgeEl?.textContent
            });

            if (!imageEl || !nameEl || !priceEl) {
                console.warn('Could not extract product info from card for wishlist', {
                    hasImage: !!imageEl,
                    hasName: !!nameEl,
                    hasPrice: !!priceEl,
                    cardHTML: productCard.outerHTML.substring(0, 500)
                });
                return null;
            }

            // Extract price (remove currency symbols and get first price if multiple)
            const priceText = priceEl.textContent.trim();
            const priceMatch = priceText.match(/[\$₹]?(\d+[,\.]?\d*)/);
            const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;

            const product = {
                id: `wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: nameEl.textContent.trim(),
                price: price,
                image: imageEl.src,
                badge: badgeEl ? badgeEl.textContent.trim() : null,
                addedAt: new Date().toISOString()
            };

            console.log('Extracted wishlist product:', product);
            return product;
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
        // Handle both product object and product ID
        const productId = typeof product === 'string' ? product : product.id;
        
        this.wishlist = this.wishlist.filter(item => item.id !== productId);
        this.saveWishlistToStorage();
        this.updateWishlistUI();
        
        // Update wishlist modal if it's open
        const wishlistModal = document.getElementById('wishlistModal');
        if (wishlistModal) {
            const wishlistItems = wishlistModal.querySelector('#wishlistItems');
            if (wishlistItems) {
                wishlistItems.innerHTML = this.renderWishlistItems();
            }
        }
        
        console.log('Removed from wishlist:', productId);
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
        this.addWishlistIconToNavbar();
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
        
        // Update wishlist count in navbar icon if it exists
        const wishlistCountElements = document.querySelectorAll('.wishlist-count');
        wishlistCountElements.forEach(el => {
            el.textContent = count;
            if (count > 0) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });
    }

    addWishlistIconToNavbar() {
        // Remove existing wishlist icons to prevent duplicates
        const existingWishlistIcons = document.querySelectorAll('.wishlist-icon');
        existingWishlistIcons.forEach(icon => icon.remove());
        
        // Only create wishlist icon if user is logged in
        if (!window.authSystem.isLoggedIn()) {
            return;
        }
        
        const userStatus = document.querySelector('.user-status.logged-in');
        const navActionList = document.querySelector('.nav-action-list');
        const cartIcon = document.querySelector('.cart-icon');
        
        if (userStatus && navActionList) {
            const wishlistIcon = document.createElement('li');
            wishlistIcon.className = 'wishlist-icon';
            
            const wishlistCount = this.wishlist.length;
            wishlistIcon.innerHTML = `
                <button class="nav-action-btn wishlist-nav-btn">
                    <ion-icon name="heart-outline" aria-hidden="true"></ion-icon>
                    <span class="nav-action-text">Wishlist</span>
                    <span class="wishlist-count ${wishlistCount > 0 ? '' : 'hidden'}">${wishlistCount}</span>
                </button>
            `;
            
            wishlistIcon.querySelector('.wishlist-nav-btn').addEventListener('click', () => this.openWishlistModal());
            
            // Insert wishlist icon before cart icon (if cart exists) or before user status
            if (cartIcon) {
                navActionList.insertBefore(wishlistIcon, cartIcon);
            } else {
                const userStatusLi = userStatus.closest('li');
                if (userStatusLi) {
                    navActionList.insertBefore(wishlistIcon, userStatusLi);
                }
            }
            
            console.log('Wishlist icon added to navbar with count:', wishlistCount);
        }
    }

    openWishlistModal() {
        console.log('Opening wishlist modal, current wishlist:', this.wishlist); // Debug
        // Create and show wishlist modal
        this.createWishlistModal();
    }

    createWishlistModal() {
        console.log('Creating wishlist modal with items:', this.wishlist); // Debug
        
        // Remove existing modal if any
        const existingModal = document.getElementById('wishlistModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'wishlistModal';
        modal.className = 'cart-modal'; // Reuse cart modal styling
        modal.innerHTML = `
            <div class="cart-modal-content">
                <div class="cart-header">
                    <h3>My Wishlist (${this.wishlist.length} items)</h3>
                    <span class="cart-close wishlist-close">&times;</span>
                </div>
                <div id="wishlistItems" class="cart-items">
                    ${this.renderWishlistItems()}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('.wishlist-close').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });

        // Show modal with proper animation
        setTimeout(() => {
            modal.style.display = 'block';
            modal.classList.add('show');
        }, 10);
        
        console.log('Wishlist modal created and displayed'); // Debug
    }

    renderWishlistItems() {
        if (this.wishlist.length === 0) {
            return `
                <div class="empty-cart">
                    <ion-icon name="heart-outline" style="font-size: 48px; color: var(--davys-gray);"></ion-icon>
                    <p>Your wishlist is empty</p>
                    <button onclick="document.getElementById('wishlistModal').remove()" class="auth-btn">Continue Shopping</button>
                </div>
            `;
        }

        return this.wishlist.map(item => `
            <div class="cart-item wishlist-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">₹${item.price}</p>
                </div>
                <button class="remove-from-wishlist" onclick="wishlistSystem.removeFromWishlist('${item.id}')">
                    <ion-icon name="trash-outline"></ion-icon>
                </button>
            </div>
        `).join('');
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

// Add global debug functions
window.debugWishlist = () => {
    console.log('=== WISHLIST DEBUG ===');
    console.log('Wishlist items:', window.wishlistSystem.wishlist);
    console.log('Total items:', window.wishlistSystem.wishlist.length);
    console.log('User logged in:', window.authSystem?.isLoggedIn());
    console.log('Individual items:');
    window.wishlistSystem.wishlist.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.name} - ₹${item.price}`);
    });
    console.log('=====================');
};

window.openWishlist = () => window.wishlistSystem.openWishlistModal();
window.clearWishlist = () => {
    window.wishlistSystem.wishlist = [];
    window.wishlistSystem.saveWishlistToStorage();
    window.wishlistSystem.updateWishlistUI();
    console.log('Wishlist cleared');
};

console.log('Wishlist debug functions available: debugWishlist(), openWishlist(), clearWishlist()');
window.wishlistSystem = wishlistSystem;