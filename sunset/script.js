function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const burger = document.querySelector('.hamburger-menu');

    // Toggle the 'open' class on the menu
    menu.classList.toggle('open');

    // Optional: Toggle an 'active' class on the burger to animate it to an X
    burger.classList.toggle('active');
}

function updateScrollSpy() {
    const navLinks = document.querySelectorAll('.bottom-nav a');
    const sections = Array.from(navLinks)
        .map(link => link.getAttribute('href'))
        .filter(href => href && href.startsWith('#') && href.length > 1)
        .map(href => document.getElementById(href.slice(1)))
        .filter(Boolean);

    const threshold = window.innerHeight * 0.18;
    let currentSection = sections[0] || null;

    for (const section of sections) {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= threshold) {
            currentSection = section;
        }
    }

    navLinks.forEach(link => {
        const targetId = link.getAttribute('href').slice(1);
        link.classList.toggle('active', currentSection && currentSection.id === targetId);
    });
}

window.addEventListener('scroll', updateScrollSpy, { passive: true });
window.addEventListener('resize', updateScrollSpy);
window.addEventListener('load', updateScrollSpy);

const bottomNav = document.querySelector('.bottom-nav');
if (bottomNav) {
    bottomNav.addEventListener('wheel', (event) => {
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.preventDefault();
            bottomNav.scrollLeft += event.deltaY;
        }
    }, { passive: false });

    bottomNav.addEventListener('click', (event) => {
        if (event.target.tagName.toLowerCase() === 'a') {
            window.setTimeout(updateScrollSpy, 100);
        }
    });
}

const backToTop = document.getElementById('backToTop');
const updateBackToTop = () => {
    if (!backToTop) return;
    backToTop.classList.toggle('show', window.scrollY > 360);
};

window.addEventListener('scroll', updateBackToTop, { passive: true });
window.addEventListener('load', updateBackToTop);

if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}