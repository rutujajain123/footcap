/**
 * navigation.js - Smooth Scrolling Navigation System
 * Features: Smooth scroll to sections, Active link highlighting
 * Enhanced navigation experience for single-page application
 */

class NavigationSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
    }

    // Enhanced smooth scrolling with offset for fixed header
    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('.navbar-link[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active navigation
                    this.updateActiveNav(link);
                }
            });
        });
    }

    // Highlight active navigation based on scroll position
    setupActiveNavigation() {
        window.addEventListener('scroll', () => {
            this.highlightActiveSection();
        });
    }

    updateActiveNav(activeLink) {
        // Remove active class from all links
        document.querySelectorAll('.navbar-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to clicked link
        activeLink.classList.add('active');
    }

    highlightActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.navbar-link[href^="#"]');
        
        let current = '';
        const headerHeight = document.querySelector('.header').offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        // Update active navigation link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
}

// Initialize navigation system when page loads
document.addEventListener('DOMContentLoaded', function() {
    new NavigationSystem();
    console.log('Navigation system initialized with smooth scrolling');
});