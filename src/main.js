import './style.css';

// Navigation scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu toggle
const mobileToggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');

mobileToggle.addEventListener('click', () => {
  mobileToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close mobile menu when a link is clicked
navLinks.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    mobileToggle.classList.remove('active');
    navLinks.classList.remove('open');
  }
});

// Page navigation
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(`page-${pageId}`);
  if (page) {
    page.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Track virtual pageview for SPA navigation
    if (window.gtag) {
      window.gtag('event', 'page_view', { page_path: `/${pageId}` });
    }
    // Re-trigger animations on new page
    setTimeout(observeAnimations, 100);
  }
}

// Handle data-page links (service detail pages)
document.addEventListener('click', (e) => {
  const pageLink = e.target.closest('[data-page]');
  if (pageLink) {
    e.preventDefault();
    const pageId = pageLink.dataset.page;
    showPage(pageId);
    // Update active nav state
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    return;
  }

  const navLink = e.target.closest('[data-nav]');
  if (navLink) {
    const target = navLink.dataset.nav;

    // If we're on a service detail page, go back to home first
    const activePage = document.querySelector('.page.active');
    if (activePage && activePage.id !== 'page-home') {
      showPage('home');
      // Wait for page to render, then scroll to section
      setTimeout(() => {
        const section = document.getElementById(target);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }

    // Update active nav state
    document.querySelectorAll('.nav-links > li > a').forEach(a => a.classList.remove('active'));
    const parentNavLink = document.querySelector(`.nav-links > li > a[data-nav="${target}"]`);
    if (parentNavLink) {
      parentNavLink.classList.add('active');
    }
  }
});

// Intersection Observer for scroll animations
function observeAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger the animations
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('[data-animate]:not(.visible)').forEach(el => {
    observer.observe(el);
  });
}

// Active nav tracking on scroll
const sections = ['home', 'services', 'case-studies', 'contact'];
window.addEventListener('scroll', () => {
  const activePage = document.querySelector('.page.active');
  if (!activePage || activePage.id !== 'page-home') return;

  let current = 'home';
  for (const id of sections) {
    const section = document.getElementById(id);
    if (section && section.getBoundingClientRect().top <= 200) {
      current = id;
    }
  }
  document.querySelectorAll('.nav-links > li > a').forEach(a => {
    a.classList.toggle('active', a.dataset.nav === current);
  });
});

// Dynamic copyright year
const copyrightYearEl = document.getElementById('copyright-year');
if (copyrightYearEl) {
  copyrightYearEl.textContent = new Date().getFullYear();
}

// Cookie consent & Google Analytics
const GA_ID = 'G-XXXXXXXXXX';
const CONSENT_KEY = 'optimum-cookie-consent';

function loadGoogleAnalytics() {
  if (document.querySelector(`script[src*="googletagmanager"]`)) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, { send_page_view: true });
}

function initCookieConsent() {
  const consent = localStorage.getItem(CONSENT_KEY);
  if (consent === 'accepted') {
    loadGoogleAnalytics();
    return;
  }
  if (consent === 'declined') return;

  // No decision yet — show banner
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  banner.removeAttribute('hidden');

  document.getElementById('cookie-accept').addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    banner.setAttribute('hidden', '');
    loadGoogleAnalytics();
  });

  document.getElementById('cookie-decline').addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    banner.setAttribute('hidden', '');
  });
}

initCookieConsent();

// Initialize
observeAnimations();
