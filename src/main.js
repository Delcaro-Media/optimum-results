import './style.css';

// Hero stat counter animation
document.querySelectorAll('[data-count-to]').forEach(el => {
  const target = parseInt(el.dataset.countTo, 10);
  const suffix = el.dataset.countSuffix || '';
  const useComma = el.hasAttribute('data-count-comma');
  const duration = 1800;
  const start = performance.now();

  function format(n) {
    return useComma ? n.toLocaleString() : String(n);
  }

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    const current = Math.round(eased * target);
    el.textContent = format(current) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
});

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

// Page meta for SPA navigation
const PAGE_META = {
  'home': {
    title: 'Optimum Results Consulting Inc. | LDAR Field Execution & Program Oversight',
    description: 'Optimum Results Consulting Inc. — Led by Doug MacArthur with 46+ years in oil and gas. LDAR field surveys, multi-technology leak detection, and independent program oversight. North America\'s trusted partner, along with international consulting and services.',
    url: 'https://www.optimumresults.ca/'
  }
};

// Page navigation
function showPage(pageId, pushState = true) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(`page-${pageId}`);
  if (page) {
    page.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update browser URL
    const url = pageId === 'home' ? '/' : `/${pageId}`;
    if (pushState) {
      history.pushState({ page: pageId }, '', url);
    }
    // Update document title and meta tags
    const meta = PAGE_META[pageId] || PAGE_META['home'];
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', meta.description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', meta.url);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', meta.url);
    // Move focus to page heading for screen reader announcement
    const heading = page.querySelector('h1, h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    // Track virtual pageview for SPA navigation
    if (window.gtag) {
      window.gtag('event', 'page_view', { page_path: url });
    }
    // Re-trigger animations on new page
    setTimeout(observeAnimations, 100);
  }
}

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
  const pageId = e.state?.page || getPageFromPath();
  showPage(pageId, false);
});

// Determine page from URL path
function getPageFromPath() {
  return 'home';
}

// Handle data-nav links
document.addEventListener('click', (e) => {
  const navLink = e.target.closest('[data-nav]');
  if (navLink) {
    const target = navLink.dataset.nav;

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
const sections = ['home', 'field-surveys', 'leak-detection', 'program-design', 'program-review', 'contact'];
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
const GA_ID = 'G-VHLHLTMGG7';
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

  // Only stop GA if user explicitly declined
  if (consent === 'declined') return;

  // Load GA immediately unless declined
  loadGoogleAnalytics();

  // If no decision yet, show the banner
  if (!consent) {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    banner.removeAttribute('hidden');

    document.getElementById('cookie-accept').addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      banner.setAttribute('hidden', '');
    });

    document.getElementById('cookie-decline').addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'declined');
      banner.setAttribute('hidden', '');
      // Disable GA by removing the script and clearing dataLayer
      window.gtag = function() {};
      window.dataLayer = [];
    });
  }
}

initCookieConsent();

// Handle initial route from URL
const initialPage = getPageFromPath();
if (initialPage !== 'home') {
  showPage(initialPage, false);
} else {
  history.replaceState({ page: 'home' }, '', '/');
}

// Initialize
observeAnimations();
