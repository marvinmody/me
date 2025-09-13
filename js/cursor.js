document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.cursor-dot');
    
    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // Handle cursor hover effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .project-card, input, textarea');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
});
