/**
 * script.js - Core Footcap Website Functionality
 * Enhanced with authentication integration and modern features
 */

'use strict';



/**
 * navbar toggle
 */

const overlay = document.querySelector("[data-overlay]");
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbar = document.querySelector("[data-navbar]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");

const navElems = [overlay, navOpenBtn, navCloseBtn];

for (let i = 0; i < navElems.length; i++) {
  navElems[i].addEventListener("click", function () {
    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
  });
}



/**
 * header & go top btn active on page scroll
 */

const header = document.querySelector("[data-header]");
const goTopBtn = document.querySelector("[data-go-top]");

window.addEventListener("scroll", function () {
  if (window.scrollY >= 80) {
    header.classList.add("active");
    goTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    goTopBtn.classList.remove("active");
  }
});

/**
 * Initialize cart and auth systems when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  // Ensure auth and cart systems are initialized
  if (typeof authSystem !== 'undefined') {
    console.log('Auth system initialized');
  }
  
  if (typeof cartSystem !== 'undefined') {
    console.log('Cart system initialized');
    
    // Setup cart buttons after a short delay to ensure DOM is ready
    setTimeout(() => {
      cartSystem.setupCartButtons();
    }, 100);
  }
  
  if (typeof wishlistSystem !== 'undefined') {
    console.log('Wishlist system initialized');
    
    // Setup wishlist buttons after a short delay to ensure DOM is ready
    setTimeout(() => {
      wishlistSystem.setupHeartButtons();
    }, 100);
    
    // Make wishlist button in header clickable
    const wishlistBtn = document.querySelector('button[aria-labelledby="nav-label-2"]');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', () => {
        if (window.authSystem.isLoggedIn()) {
          wishlistSystem.showWishlist();
        } else {
          window.authSystem.openAuthModal();
        }
      });
    }
  }
  
  // Add signup requirement to Shop Now buttons
  const shopNowButtons = document.querySelectorAll('.btn.btn-primary');
  shopNowButtons.forEach(button => {
    // Only add listener if button contains "Shop Now" text
    const buttonText = button.textContent.trim();
    if (buttonText.includes('Shop Now')) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        if (!window.authSystem.isLoggedIn()) {
          window.authSystem.openAuthModal();
        } else {
          // User is logged in, allow normal shopping behavior
          // You can add shopping page navigation here
          alert('Welcome to shopping! Cart functionality is available.');
        }
      });
    }
  });
  
  // Add signup requirement to default cart/bag button
  const defaultCartBtn = document.getElementById('defaultCartBtn');
  if (defaultCartBtn) {
    console.log('Default cart button found, adding auth requirement'); // Debug
    defaultCartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Default cart button clicked'); // Debug
      console.log('User logged in?', window.authSystem?.isLoggedIn()); // Debug
      
      if (!window.authSystem || !window.authSystem.isLoggedIn()) {
        console.log('User not logged in, opening auth modal'); // Debug
        if (window.authSystem) {
          window.authSystem.openAuthModal();
        } else {
          alert('Please refresh the page and try again.');
        }
      } else {
        console.log('User logged in, showing cart'); // Debug
        // User is logged in, show their cart
        if (window.cartSystem) {
          window.cartSystem.openCart();
        } else {
          alert('Cart system not available.');
        }
      }
    });
  } else {
    console.log('Default cart button not found!'); // Debug
  }
  
  // Add global event delegation for any bag icon clicks (backup method)
  document.addEventListener('click', (e) => {
    // Check if clicked element is a bag icon or cart button
    const bagIcon = e.target.closest('ion-icon[name="bag-outline"]');
    const cartButton = e.target.closest('button[id="defaultCartBtn"]');
    
    if ((bagIcon && bagIcon.closest('#defaultCartBtn')) || cartButton) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Bag icon clicked via event delegation!'); // Debug
      
      if (!window.authSystem || !window.authSystem.isLoggedIn()) {
        console.log('Opening auth modal via delegation'); // Debug
        if (window.authSystem) {
          window.authSystem.openAuthModal();
        } else {
          alert('Please refresh the page and try again.');
        }
      } else {
        console.log('User logged in, opening cart via delegation'); // Debug
        if (window.cartSystem) {
          window.cartSystem.openCart();
        }
      }
    }
  });
  
  // Add signup requirement to default wishlist button
  const defaultWishlistBtn = document.getElementById('defaultWishlistBtn');
  if (defaultWishlistBtn) {
    defaultWishlistBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Default wishlist button clicked'); // Debug
      if (!window.authSystem.isLoggedIn()) {
        console.log('User not logged in, opening auth modal'); // Debug
        window.authSystem.openAuthModal();
      } else {
        console.log('User logged in, showing wishlist'); // Debug
        // User is logged in, show their wishlist
        if (window.wishlistSystem) {
          window.wishlistSystem.showWishlist();
        }
      }
    });
  }
  
  // Re-setup cart and wishlist buttons whenever new content is loaded
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any new cart or heart buttons were added
        const hasCartButtons = Array.from(mutation.addedNodes).some(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            return node.querySelector && node.querySelector('button[aria-labelledby*="card-label-1"]');
          }
          return false;
        });
        
        const hasHeartButtons = Array.from(mutation.addedNodes).some(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            return node.querySelector && node.querySelector('button[aria-labelledby="card-label-2"]');
          }
          return false;
        });
        
        if (hasCartButtons && typeof cartSystem !== 'undefined') {
          cartSystem.setupCartButtons();
        }
        
        if (hasHeartButtons && typeof wishlistSystem !== 'undefined') {
          wishlistSystem.setupHeartButtons();
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});