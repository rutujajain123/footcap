// Shopping Cart System
/**
 * cart.js - Shopping Cart Management System
 * Features: Add/Remove items, User-specific carts, Indian Rupee support
 * Requires user authentication for all cart operations
 */

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
            // Re-setup cart buttons after login
            setTimeout(() => this.setupCartButtons(), 100);
        });

        window.addEventListener('userLoggedOut', () => {
            this.clearCart();
        });

        // Setup cart buttons
        this.setupCartButtons();
    }

    setupCartButtons() {
        // Find all "Add to Cart" buttons (those with cart-outline icon)
        const cartButtons = document.querySelectorAll('button ion-icon[name="cart-outline"]');
        console.log(`Found ${cartButtons.length} cart buttons`);
        
        cartButtons.forEach((icon, index) => {
            const button = icon.closest('button');
            if (!button || button.dataset.cartListenerAdded) return;
            
            console.log(`Setting up cart button ${index + 1}`);
            
            // Mark as processed to avoid duplicate listeners
            button.dataset.cartListenerAdded = 'true';
            
            // Add click listener
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cart button clicked!');
                this.handleAddToCart(e);
            });
        });
    }

    handleAddToCart(e) {
        console.log('handleAddToCart called');
        
        // Check if user is logged in
        if (!window.authSystem || !window.authSystem.isLoggedIn()) {
            console.log('User not logged in, opening auth modal');
            if (window.authSystem) {
                window.authSystem.openAuthModal();
            } else {
                alert('Please log in to add items to cart');
            }
            return;
        }

        console.log('User is logged in, processing cart addition');

        // Get product details from the clicked button's parent card
        const productCard = e.target.closest('.product-card') || e.target.closest('.showcase-item') || e.target.closest('.card');
        console.log('Found product card:', productCard);
        
        if (!productCard) {
            console.warn('Could not find product card');
            return;
        }

        const product = this.extractProductInfo(productCard);
        if (product) {
            this.addToCart(product);
            this.showCartNotification(`${product.name} added to cart!`);
        } else {
            console.error('Could not extract product information');
        }
    }

    extractProductInfo(productCard) {
        try {
            // Extract product information from the card
            const imageEl = productCard.querySelector('img');
            const nameEl = productCard.querySelector('.card-title a, .product-title, .showcase-title');
            const priceEl = productCard.querySelector('.card-price, .price-wrapper .price, .price, .showcase-price');
            const badgeEl = productCard.querySelector('.card-badge, .showcase-badge');

            console.log('Extracting product info:', {
                imageEl: imageEl?.src,
                nameEl: nameEl?.textContent,
                priceEl: priceEl?.textContent,
                badgeEl: badgeEl?.textContent
            });

            if (!imageEl || !nameEl || !priceEl) {
                console.warn('Could not extract product info from card', {
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
                id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: nameEl.textContent.trim(),
                price: price,
                image: imageEl.src,
                badge: badgeEl ? badgeEl.textContent.trim() : null,
                quantity: 1
            };

            console.log('Extracted product:', product);
            return product;
        } catch (error) {
            console.error('Error extracting product info:', error);
            return null;
        }
    }

    addToCart(product) {
        console.log('Adding product to cart:', product); // Debug
        console.log('Current cart before adding:', this.cart); // Debug
        
        // Check if product already exists in cart
        const existingItem = this.cart.find(item => 
            item.name === product.name && item.price === product.price
        );

        if (existingItem) {
            console.log('Found existing item, incrementing quantity from', existingItem.quantity, 'to', existingItem.quantity + 1); // Debug
            existingItem.quantity += 1;
        } else {
            console.log('Adding new item to cart with quantity 1'); // Debug
            this.cart.push({ ...product });
        }

        console.log('Cart after adding:', this.cart); // Debug
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
        console.log('Clearing cart'); // Debug
        this.cart = [];
        this.saveCartToStorage();
        this.updateCartUI();
    }

    // Debug method to check cart state
    debugCartState() {
        console.log('=== CART DEBUG ===');
        console.log('Cart items:', this.cart);
        console.log('Total items:', this.cart.reduce((sum, item) => sum + item.quantity, 0));
        console.log('Individual items:');
        this.cart.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name} - Quantity: ${item.quantity} - Price: ₹${item.price}`);
        });
        console.log('=================');
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

    openCheckoutForm() {
        // Close cart modal first
        this.closeCart();
        
        // Open checkout modal after a short delay
        setTimeout(() => {
            this.showCheckoutForm();
        }, 350);
    }

    showCheckoutForm() {
        const modal = document.getElementById('checkoutModal');
        if (!modal) {
            console.error('Checkout modal not found');
            return;
        }

        // Populate checkout items
        this.populateCheckoutItems();
        
        // Show modal
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';

        // Setup event listeners
        this.setupCheckoutEventListeners();
    }

    populateCheckoutItems() {
        const checkoutItemsContainer = document.getElementById('checkoutItems');
        const checkoutTotalElement = document.getElementById('checkoutTotal');
        
        if (!checkoutItemsContainer || !checkoutTotalElement) return;

        if (this.cart.length === 0) {
            checkoutItemsContainer.innerHTML = '<p>No items in cart</p>';
            checkoutTotalElement.textContent = '0';
            return;
        }

        // Generate checkout items HTML
        checkoutItemsContainer.innerHTML = this.cart.map(item => `
            <div class="checkout-item">
                <div class="checkout-item-info">
                    <div class="checkout-item-name">${item.name}</div>
                    <div class="checkout-item-details">Quantity: ${item.quantity} × ₹${item.price}</div>
                </div>
                <div class="checkout-item-price">₹${(item.quantity * item.price).toLocaleString('en-IN')}</div>
            </div>
        `).join('');

        // Update total
        const total = this.cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        checkoutTotalElement.textContent = total.toLocaleString('en-IN');
    }

    setupCheckoutEventListeners() {
        // Close button
        const closeBtn = document.querySelector('.checkout-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.closeCheckoutForm();
        }

        // Click outside to close
        const modal = document.getElementById('checkoutModal');
        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) {
                    this.closeCheckoutForm();
                }
            };
        }

        // Form submission
        const form = document.getElementById('checkoutForm');
        if (form) {
            form.onsubmit = (e) => this.handleOrderSubmission(e);
        }
    }

    closeCheckoutForm() {
        const modal = document.getElementById('checkoutModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    handleOrderSubmission(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const orderData = {
            customer: {
                name: formData.get('customerName'),
                phone: formData.get('customerPhone'),
                address: formData.get('customerAddress')
            },
            paymentMethod: formData.get('paymentMethod'),
            items: this.cart,
            total: this.cart.reduce((sum, item) => sum + (item.quantity * item.price), 0),
            orderDate: new Date().toISOString(),
            orderId: `ORD${Date.now()}`
        };

        console.log('Order submitted:', orderData);
        
        // Show success message
        this.showOrderConfirmation(orderData);
        
        // Clear cart and close form
        this.clearCart();
        this.closeCheckoutForm();
    }

    showOrderConfirmation(orderData) {
        const paymentMethodNames = {
            'paytm': 'Paytm',
            'gpay': 'Google Pay',
            'phonepe': 'PhonePe',
            'cod': 'Cash on Delivery'
        };

        const message = `
            Order Confirmed! 🎉
            
            Order ID: ${orderData.orderId}
            Total: ₹${orderData.total.toLocaleString('en-IN')}
            Payment: ${paymentMethodNames[orderData.paymentMethod]}
            
            Your order will be delivered to:
            ${orderData.customer.address}
            
            Thank you for shopping with Footcap!
        `;

        alert(message);
    }

    updateCartUI() {
        this.updateCartCount();
        this.renderCartItems();
        this.updateCartTotal();
    }

    updateCartCount() {
        console.log('Current cart state:', this.cart); // Debug
        const totalItems = this.cart.reduce((sum, item) => {
            console.log(`Item: ${item.name}, Quantity: ${item.quantity}`); // Debug
            return sum + item.quantity;
        }, 0);
        console.log('Calculated total items:', totalItems); // Debug
        
        // Update cart count in header (if cart icon exists)
        const cartCountElements = document.querySelectorAll('.cart-count');
        console.log('Found cart count elements:', cartCountElements.length); // Debug
        
        cartCountElements.forEach(el => {
            el.textContent = totalItems;
            if (totalItems > 0) {
                el.classList.remove('hidden');
                console.log('Showing cart count:', totalItems); // Debug
            } else {
                el.classList.add('hidden');
                console.log('Hiding cart count'); // Debug
            }
        });

        // Add cart count badge to header if not exists
        this.addCartCountToHeader(totalItems);
    }

    addCartCountToHeader(count) {
        console.log('Adding cart count to header, count:', count); // Debug
        
        // Remove any existing cart icons first to prevent duplicates
        const existingCartIcons = document.querySelectorAll('.cart-icon');
        existingCartIcons.forEach(icon => icon.remove());
        
        // Only create cart icon if user is logged in
        if (!window.authSystem.isLoggedIn()) {
            console.log('User not logged in, skipping cart icon creation'); // Debug
            return;
        }
        
        console.log('User is logged in, creating cart icon'); // Debug
        
        // Find the logged-in user status element
        const userStatus = document.querySelector('.user-status.logged-in');
        const navActionList = document.querySelector('.nav-action-list');
        
        console.log('User status element:', userStatus); // Debug
        console.log('Nav action list:', navActionList); // Debug
        
        if (userStatus && navActionList) {
            const cartIcon = document.createElement('li');
            cartIcon.className = 'cart-icon';
            cartIcon.innerHTML = `
                <button class="nav-action-btn cart-nav-btn">
                    <ion-icon name="bag-outline" aria-hidden="true"></ion-icon>
                    <span class="nav-action-text">Cart</span>
                    <span class="cart-count ${count > 0 ? '' : 'hidden'}">${count}</span>
                </button>
            `;
            
            cartIcon.querySelector('.cart-nav-btn').addEventListener('click', () => this.openCart());
            
            // Insert cart icon before the user status
            const userStatusLi = userStatus.closest('li');
            if (userStatusLi) {
                navActionList.insertBefore(cartIcon, userStatusLi);
                console.log('Cart icon successfully added to navbar with count:', count); // Debug
            } else {
                console.log('Could not find user status li element'); // Debug
            }
        } else {
            console.log('Could not find user status or nav action list'); // Debug
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
                    <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
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
            totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
        }
    }

    saveCartToStorage() {
        if (window.authSystem.isLoggedIn()) {
            const userId = window.authSystem.getCurrentUser().id;
            localStorage.setItem(`footcap_cart_${userId}`, JSON.stringify(this.cart));
        }
    }

    loadCartFromStorage() {
        if (window.authSystem.isLoggedIn()) {
            const userId = window.authSystem.getCurrentUser().id;
            const cartData = localStorage.getItem(`footcap_cart_${userId}`);
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
            color: black;
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

// Add global debug functions
window.debugCart = () => window.cartSystem.debugCartState();
window.clearCart = () => window.cartSystem.clearCart();

console.log('Cart system initialized. Debug functions available: debugCart(), clearCart()');