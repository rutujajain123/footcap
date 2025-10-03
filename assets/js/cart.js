// Shopping Cart System
class CartSystem {
    constructor() {
        this.cart = [];
        this.isOpen = false;
        this.init();
    }

    init() {
        this.loadCartFromStorage();
        this.setupEventListeners();
        this.updateCartUI();
    }

    setupEventListeners() {
        // Cart modal controls
        const cartModal = document.getElementById('cartModal');
        const cartClose = document.querySelector('.cart-close');

        // Close cart modal
        cartClose?.addEventListener('click', () => this.closeCart());
        
        // Close modal when clicking outside
        cartModal?.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                this.closeCart();
            }
        });

        // Listen for user login/logout events
        window.addEventListener('userLoggedIn', (e) => {
            this.loadCartFromStorage();
            this.updateCartUI();
        });

        window.addEventListener('userLoggedOut', () => {
            this.clearCart();
        });

        // Setup cart buttons
        this.setupCartButtons();
    }

    setupCartButtons() {
        // Find all "Add to Cart" buttons
        const cartButtons = document.querySelectorAll('button[aria-labelledby*="card-label-1"]');
        
        cartButtons.forEach(button => {
            // Remove existing listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new listener
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleAddToCart(e);
            });
        });
    }

    handleAddToCart(e) {
        // Check if user is logged in
        if (!window.authSystem.isLoggedIn()) {
            window.authSystem.openAuthModal();
            return;
        }

        // Get product details from the clicked button's parent card
        const productCard = e.target.closest('.product-card') || e.target.closest('.showcase-item');
        if (!productCard) return;

        const product = this.extractProductInfo(productCard);
        if (product) {
            this.addToCart(product);
            this.showCartNotification(`${product.name} added to cart!`);
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
                id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: nameEl.textContent.trim(),
                price: price,
                image: imageEl.src,
                badge: badgeEl ? badgeEl.textContent.trim() : null,
                quantity: 1
            };
        } catch (error) {
            console.error('Error extracting product info:', error);
            return null;
        }
    }

    addToCart(product) {
        // Check if product already exists in cart
        const existingItem = this.cart.find(item => 
            item.name === product.name && item.price === product.price
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product });
        }

        this.saveCartToStorage();
        this.updateCartUI();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCartToStorage();
        this.updateCartUI();
    }

    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                this.saveCartToStorage();
                this.updateCartUI();
            }
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCartToStorage();
        this.updateCartUI();
    }

    openCart() {
        const cartModal = document.getElementById('cartModal');
        cartModal.style.display = 'block';
        setTimeout(() => cartModal.classList.add('show'), 10);
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        const cartModal = document.getElementById('cartModal');
        cartModal.classList.remove('show');
        setTimeout(() => {
            cartModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
        this.isOpen = false;
    }

    updateCartUI() {
        this.updateCartCount();
        this.renderCartItems();
        this.updateCartTotal();
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update cart count in header (if cart icon exists)
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(el => {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'block' : 'none';
        });

        // Add cart count badge to header if not exists
        this.addCartCountToHeader(totalItems);
    }

    addCartCountToHeader(count) {
        // Remove any existing cart icons first to prevent duplicates
        const existingCartIcons = document.querySelectorAll('.cart-icon');
        existingCartIcons.forEach(icon => icon.remove());
        
        // Only create cart icon if user is logged in
        if (!window.authSystem.isLoggedIn()) {
            return;
        }
        
        const userStatus = document.querySelector('.user-status');
        if (userStatus) {
            const cartIcon = document.createElement('div');
            cartIcon.className = 'cart-icon';
            cartIcon.style.cssText = `
                position: relative;
                cursor: pointer;
                margin-right: 15px;
                padding: 8px;
                border-radius: 50%;
                background: var(--cultured);
                transition: all 0.3s ease;
            `;
            cartIcon.innerHTML = `
                <ion-icon name="bag-outline" style="font-size: 20px;"></ion-icon>
                <span class="cart-count" style="
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: var(--red-salsa);
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    ${count > 0 ? '' : 'display: none;'}
                ">${count}</span>
            `;
            cartIcon.addEventListener('click', () => this.openCart());
            userStatus.parentNode.insertBefore(cartIcon, userStatus);
        }
    }

    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <ion-icon name="bag-outline" style="font-size: 48px; color: var(--davys-gray);"></ion-icon>
                    <p>Your cart is empty</p>
                    <button onclick="cartSystem.closeCart()" class="auth-btn">Continue Shopping</button>
                </div>
            `;
            return;
        }

        cartItemsContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="cartSystem.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="cartSystem.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <ion-icon name="trash-outline" class="cart-remove" onclick="cartSystem.removeFromCart('${item.id}')"></ion-icon>
            </div>
        `).join('');
    }

    updateCartTotal() {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalEl = document.getElementById('cartTotal');
        if (totalEl) {
            totalEl.textContent = total.toFixed(2);
        }
    }

    saveCartToStorage() {
        if (window.authSystem.isLoggedIn()) {
            const userId = window.authSystem.getCurrentUser().id;
            localStorage.setItem(`walkwave_cart_${userId}`, JSON.stringify(this.cart));
        }
    }

    loadCartFromStorage() {
        if (window.authSystem.isLoggedIn()) {
            const userId = window.authSystem.getCurrentUser().id;
            const cartData = localStorage.getItem(`walkwave_cart_${userId}`);
            this.cart = cartData ? JSON.parse(cartData) : [];
        } else {
            this.cart = [];
        }
    }

    showCartNotification(message) {
        // Remove existing notification
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--red-salsa);
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto remove after 2 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 2000);
    }

    getCartSummary() {
        return {
            items: this.cart,
            totalItems: this.cart.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
    }
}

// Initialize cart system
const cartSystem = new CartSystem();

// Make it globally available
window.cartSystem = cartSystem;