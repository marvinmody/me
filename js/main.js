// DOM Elements
const cursorOuter = document.querySelector('.cursor-outer');
const cursorInner = document.querySelector('.cursor-inner');
const progressBar = document.querySelector('.progress-bar');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-link');
const header = document.querySelector('.header');
const sections = document.querySelectorAll('.section');
const revealElements = document.querySelectorAll('.reveal-element');
const revealTexts = document.querySelectorAll('.reveal-text');
const body = document.querySelector('body');
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Custom Cursor
function updateCursor(e) {
    // Smooth follow for outer cursor
    cursorOuter.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    
    // Immediate follow for inner cursor
    cursorInner.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    
    // Update mouse position for particles
    mouseX = e.clientX;
    mouseY = e.clientY;
}

// Separate function for creating particles at cursor position
function createCursorParticles(e) {
    if (isReducedMotion) return; // Skip for reduced motion preference
    
    // Only create particles if cursor is over the hero section
    const heroRect = heroSection.getBoundingClientRect();
    if (
        mouseX >= heroRect.left &&
        mouseX <= heroRect.right &&
        mouseY >= heroRect.top &&
        mouseY <= heroRect.bottom
    ) {
        // Create particles at cursor position
        const particlesToCreate = isReducedMotion ? 1 : 2;
        for (let i = 0; i < particlesToCreate; i++) {
            particles.push(new Particle(
                mouseX - heroRect.left + (Math.random() * 20 - 10),
                mouseY - heroRect.top + (Math.random() * 20 - 10)
            ));
        }
    }
}

function enlargeCursor() {
    cursorOuter.classList.add('hover');
    cursorInner.classList.add('hover');
}

function resetCursor() {
    cursorOuter.classList.remove('hover');
    cursorInner.classList.remove('hover');
}

// Progress Bar
function updateProgressBar() {
    const scrollDistance = window.scrollY;
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const scrolled = (scrollDistance / totalHeight) * 100;
    progressBar.style.width = `${scrolled}%`;
}

// Mobile Menu Toggle
function toggleMenu() {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
}

// Debounce function to limit execution frequency
function debounce(callback, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => callback.apply(this, args), wait);
    };
}

// Throttle function to limit execution frequency
function throttle(callback, wait) {
    let timeoutId = null;
    let lastExecTime = 0;
    return (...args) => {
        const currentTime = new Date().getTime();
        
        if (currentTime - lastExecTime > wait) {
            callback.apply(null, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                callback.apply(null, args);
                lastExecTime = new Date().getTime();
            }, wait - (currentTime - lastExecTime));
        }
    };
}

// Use IntersectionObserver for more efficient scroll animations
function setupIntersectionObservers() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '-50px'
    };

    // Observer for all reveal elements (including section titles)
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.hasAttribute('data-delay') 
                    ? parseInt(element.getAttribute('data-delay')) 
                    : 0;

                setTimeout(() => {
                    element.classList.add('active');
                }, delay);
            }
        });
    }, observerOptions);

    // Observe section titles
    document.querySelectorAll('.section-title').forEach((title, index) => {
        title.setAttribute('data-delay', (index * 100).toString());
        revealObserver.observe(title);
    });

    // Observe reveal elements with staggered delays
    document.querySelectorAll('.reveal-element').forEach((element, index) => {
        element.setAttribute('data-delay', (index * 150).toString());
        revealObserver.observe(element);
    });

    // Observe reveal text elements
    document.querySelectorAll('.reveal-text').forEach((element, index) => {
        element.setAttribute('data-delay', (index * 100).toString());
        revealObserver.observe(element);
    });

    // Special handling for project cards with enhanced staggering
    document.querySelectorAll('.project-card').forEach((card, index) => {
        card.setAttribute('data-delay', (index * 200).toString());
        revealObserver.observe(card);
        
        // Add hover effect animations to project cards
        card.addEventListener('mouseenter', () => {
            if (isReducedMotion) return;
            const img = card.querySelector('img');
            if (img) {
                img.style.transform = 'scale(1.1) rotate(1deg)';
            }
            card.style.transform = 'translateY(-15px) scale(1.02)';
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
            card.style.borderColor = 'var(--primary-color)';
        });
        
        card.addEventListener('mouseleave', () => {
            if (isReducedMotion) return;
            const img = card.querySelector('img');
            if (img) {
                img.style.transform = 'scale(1) rotate(0deg)';
            }
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = 'none';
            card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });
    });

    // Enhanced about section animations
    document.querySelectorAll('.about-meta li').forEach((item, index) => {
        item.setAttribute('data-delay', (index * 100).toString());
        revealObserver.observe(item);
    });

    document.querySelectorAll('.skill-group').forEach((group, index) => {
        group.setAttribute('data-delay', (index * 150).toString());
        revealObserver.observe(group);
    });

    document.querySelectorAll('.badge').forEach((badge, index) => {
        badge.setAttribute('data-delay', (200 + index * 50).toString());
        revealObserver.observe(badge);
    });
}

// Scroll Animations - Fallback for browsers that don't support IntersectionObserver
function checkScroll() {
    // Header shadow on scroll
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Update active nav link based on scroll position
    updateActiveNavLink();
}

// Update active navigation link based on scroll position
function updateActiveNavLink() {
    const scrollPosition = window.scrollY;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinksItems.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Smooth scroll to section when clicking nav links with enhanced easing
function smoothScroll(e) {
    if (e.target.classList.contains('nav-link')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        // Custom smooth scroll with easing
        const startPosition = window.pageYOffset;
        const targetPosition = targetSection.offsetTop - 80;
        const distance = targetPosition - startPosition;
        const duration = 1000; // Longer duration for more dramatic effect
        let start = null;
        
        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            
            // Cubic bezier easing function for smoother motion
            const easing = cubicBezier(0.16, 1, 0.3, 1, percentage);
            
            window.scrollTo(0, startPosition + distance * easing);
            
            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        }
        
        // Cubic bezier function for smooth easing
        function cubicBezier(p0, p1, p2, p3, t) {
            const term1 = Math.pow(1 - t, 3) * p0;
            const term2 = 3 * Math.pow(1 - t, 2) * t * p1;
            const term3 = 3 * (1 - t) * Math.pow(t, 2) * p2;
            const term4 = Math.pow(t, 3) * p3;
            
            return term1 + term2 + term3 + term4;
        }
        
        window.requestAnimationFrame(step);

        // Close mobile menu if open
        if (menuToggle.classList.contains('active')) {
            toggleMenu();
        }
    }
}

// Form submission
function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());
    
    // In a real application, you would send this data to a server
    console.log('Form submitted with values:', formValues);
    
    // Show success message (in a real app)
    alert('Message sent successfully! This is a demo, so no actual message was sent.');
    form.reset();
}

// Event Listeners with performance optimizations
// These will be set up after DOM is loaded to ensure all functions are defined

// Add hover effect to all interactive elements
const interactiveElements = document.querySelectorAll('a, button, .menu-toggle, input, textarea');
interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', enlargeCursor);
    element.addEventListener('mouseleave', resetCursor);
});

// Form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
}

// Initialize animations on page load
window.addEventListener('load', () => {
    // Initial check for elements in viewport
    checkScroll();
    
    // Setup intersection observers if supported
    if ('IntersectionObserver' in window) {
        setupIntersectionObservers();
    }
    
    // Particle animation function
    function animateParticles() {
        // Simple particle animation loop
        requestAnimationFrame(animateParticles);
    }
    
    // Start particle animation with requestAnimationFrame
    requestAnimationFrame(animateParticles);
    
    // Add staggered animation to hero elements
    const heroTitle = document.querySelector('.hero h1');
    const heroSubtitle = document.querySelector('.subtitle');
    const heroCta = document.querySelector('.cta-container');
    
    if (heroTitle) {
        // Check for reduced motion preference
        if (!isReducedMotion) {
            // Split text into characters for animation
            const text = heroTitle.textContent;
            heroTitle.innerHTML = '';
            
            for (let i = 0; i < text.length; i++) {
                const span = document.createElement('span');
                span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
                span.style.animationDelay = `${i * 0.05}s`;
                span.classList.add('char-animation');
                heroTitle.appendChild(span);
            }
            
            // Add the active class to trigger the highlight animation
            setTimeout(() => {
                heroTitle.classList.add('active');
            }, 1000);
        } else {
            // Simplified animation for reduced motion preference
            heroTitle.classList.add('active');
        }
    }
    
    setTimeout(() => {
        if (heroSubtitle) heroSubtitle.classList.add('active');
    }, isReducedMotion ? 100 : 500);
    
    setTimeout(() => {
        if (heroCta) heroCta.classList.add('active');
    }, isReducedMotion ? 200 : 800);
    
    // Initialize project cards with staggered appearance
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        // Add a data attribute for staggered animations
        card.setAttribute('data-index', index);
    });
});

// Add CSS class for mobile navigation and animations
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners with performance optimizations
    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mousemove', throttle(createCursorParticles, 50));
    document.addEventListener('scroll', throttle(updateProgressBar, 10));
    document.addEventListener('scroll', throttle(checkScroll, 100));
    menuToggle.addEventListener('click', toggleMenu);
    navLinks.addEventListener('click', smoothScroll);
    
    // Custom cursor visibility
    document.addEventListener('mouseenter', () => {
        cursorOuter.classList.add('visible');
        cursorInner.classList.add('visible');
    });
    
    document.addEventListener('mouseleave', () => {
        cursorOuter.classList.remove('visible');
        cursorInner.classList.remove('visible');
    });
    
    // Initialize intersection observers
    setupIntersectionObservers();
    
    // Initialize scroll-based animations
    checkScroll();
    updateActiveNavLink();
    
    // Initialize progress bar
    updateProgressBar();
    
    const style = document.createElement('style');
    style.textContent = `
        .background-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        }
        
        .char-animation {
            display: inline-block;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInChar 0.5s forwards ease-out;
        }
        
        @keyframes fadeInChar {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .project-card {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s cubic-bezier(0.215, 0.61, 0.355, 1), 
                        transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1),
                        box-shadow 0.3s ease,
                        border-color 0.3s ease;
        }
        
        .project-card.active {
            opacity: 1;
            transform: translateY(0);
        }
        
        .project-card:hover {
            transform: translateY(-10px) scale(1.02);
        }
        
        .project-image::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(0, 229, 255, 0.2) 0%, transparent 100%);
            opacity: 0;
            transition: opacity 0.5s ease;
            z-index: 1;
        }
        
        .project-card:hover .project-image::before {
            opacity: 1;
        }
        
        @media (max-width: 767px) {
            .nav-links {
                position: fixed;
                top: 70px;
                left: 0;
                width: 100%;
                background-color: rgba(10, 15, 20, 0.95);
                padding: 2rem;
                flex-direction: column;
                align-items: center;
                transform: translateY(-100%);
                opacity: 0;
                transition: all 0.3s ease;
                pointer-events: none;
                border-bottom: 1px solid rgba(0, 229, 255, 0.1);
            }
            
            .nav-links.active {
                transform: translateY(0);
                opacity: 1;
                pointer-events: all;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
            }
        }
    `;
    document.head.appendChild(style);
});