/**
 * Luméra Skin — Main JavaScript
 * Dark Mode, RTL/LTR, Navbar, Animations, Utilities
 */

'use strict';

// ---- Dark Mode ----
const THEME_KEY = 'lumera-theme';
const RTL_KEY   = 'lumera-dir';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const icons = document.querySelectorAll('.theme-toggle-icon');
  icons.forEach(icon => {
    icon.className = icon.className.replace(/bi-sun|bi-moon/, '');
    icon.classList.add(theme === 'dark' ? 'bi-sun' : 'bi-moon');
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved || preferred);
}

// ---- RTL / LTR ----
function applyDir(dir) {
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', dir === 'rtl' ? 'ar' : 'en');
  localStorage.setItem(RTL_KEY, dir);
  const btns = document.querySelectorAll('.rtl-toggle-btn');
  btns.forEach(btn => { btn.textContent = dir === 'rtl' ? 'LTR' : 'RTL'; });
}

function toggleDir() {
  const current = document.documentElement.getAttribute('dir') || 'ltr';
  applyDir(current === 'rtl' ? 'ltr' : 'rtl');
}

function initDir() {
  const saved = localStorage.getItem(RTL_KEY) || 'ltr';
  applyDir(saved);
}

// ---- Navbar Scroll Effect ----
function initNavbarScroll() {
  const navbar = document.querySelector('.lumera-navbar');
  if (!navbar) return;

  // On mobile, expanding browser controls can shift the visual viewport while
  // fixed elements remain anchored to the layout viewport. Keep a fixed
  // homepage navbar inside the actually visible area during that transition.
  const syncVisualViewport = () => {
    const isFixed = window.getComputedStyle(navbar).position === 'fixed';
    const offset = isFixed && window.visualViewport
      ? Math.max(0, Math.round(window.visualViewport.offsetTop))
      : 0;
    navbar.style.setProperty('--navbar-viewport-offset', `${offset}px`);
  };

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    syncVisualViewport();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.visualViewport?.addEventListener('resize', syncVisualViewport, { passive: true });
  window.visualViewport?.addEventListener('scroll', syncVisualViewport, { passive: true });
  onScroll();
}

// ---- Mobile Menu ----
function initMobileMenu() {
  const toggle = document.getElementById('navMobileToggle');
  const menu   = document.getElementById('navMobileMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    const icon = toggle.querySelector('i');
    if (icon) {
      icon.className = open ? 'bi bi-x-lg' : 'bi bi-list';
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      const icon = toggle.querySelector('i');
      if (icon) icon.className = 'bi bi-list';
    }
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      const icon = toggle.querySelector('i');
      if (icon) icon.className = 'bi bi-list';
    });
  });
}

// ---- Fade-up Intersection Observer ----
function initFadeUp() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = entry.target.parentElement?.querySelectorAll('.fade-up') || [];
        let delay = 0;
        siblings.forEach((sib, idx) => {
          if (sib === entry.target) delay = idx * 80;
        });
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, Math.min(delay, 400));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// ---- Active nav link ----
function initActiveNavLink() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[href]').forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ---- Toast Notification ----
function showToast(message, type = 'success') {
  let container = document.getElementById('lumera-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'lumera-toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    padding: 0.85rem 1.25rem;
    background: ${type === 'success' ? '#60796B' : '#b94a4a'};
    color: #fff;
    border-radius: 10px;
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 500;
    box-shadow: 0 4px 16px rgba(0,0,0,.15);
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 250ms ease, transform 250ms ease;
    max-width: 320px;
    display: flex; align-items: center; gap: 0.5rem;
  `;
  toast.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${message}`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ---- Add to Cart ----
function initAddToCart() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-cart]');
    if (!btn) return;
    const name = btn.closest('.product-card')?.querySelector('.product-name')?.textContent || 'Product';
    showToast(`${name} added to cart`);
    btn.innerHTML = '<i class="bi bi-check-lg"></i> Added';
    setTimeout(() => {
      btn.innerHTML = 'Shop Now';
    }, 2000);
  });
}

// ---- Form Validation ----
function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    const err = field.parentElement?.querySelector('.form-error');
    if (!field.value.trim()) {
      field.classList.add('error');
      if (err) err.textContent = 'This field is required.';
      valid = false;
    } else {
      field.classList.remove('error');
      if (err) err.textContent = '';
    }
    if (field.type === 'email' && field.value && !/\S+@\S+\.\S+/.test(field.value)) {
      field.classList.add('error');
      if (err) err.textContent = 'Please enter a valid email address.';
      valid = false;
    }
  });
  return valid;
}

function initForms() {
  document.querySelectorAll('form[data-lumera-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm(form)) {
        const successMsg = form.querySelector('.form-success-msg');
        if (successMsg) {
          form.querySelectorAll('.form-group-brand, .form-row-two').forEach(el => el.style.display = 'none');
          form.querySelector('.btn-form-submit').style.display = 'none';
          successMsg.style.display = 'block';
        } else {
          showToast('Your message has been sent. We\'ll be in touch shortly.');
          form.reset();
        }
      }
    });
  });
}

// ---- Password Toggle ----
function initPasswordToggle() {
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling || btn.parentElement?.querySelector('input');
      if (!input) return;
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      const icon = btn.querySelector('i');
      if (icon) icon.className = isPass ? 'bi bi-eye-slash' : 'bi bi-eye';
    });
  });
}

// ---- FAQ Accordion ----
function initFaq() {
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const answer = item?.querySelector('.faq-answer');
      const icon   = q.querySelector('.faq-icon');
      const isOpen = item?.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer').style.maxHeight = '0';
        const ic = openItem.querySelector('.faq-icon');
        if (ic) ic.style.transform = 'rotate(0deg)';
      });

      if (!isOpen && answer) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        if (icon) icon.style.transform = 'rotate(45deg)';
      }
    });
  });
}

// ---- Radio / Check Options (styled pill selectors) ----
function initPillSelectors() {
  document.querySelectorAll('.radio-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const name = opt.querySelector('input')?.name;
      document.querySelectorAll(`.radio-option input[name="${name}"]`).forEach(inp => {
        inp.closest('.radio-option').classList.remove('selected');
      });
      opt.classList.add('selected');
      const inp = opt.querySelector('input');
      if (inp) inp.checked = true;
    });
  });
  document.querySelectorAll('.check-option').forEach(opt => {
    opt.addEventListener('click', () => {
      opt.classList.toggle('selected');
      const inp = opt.querySelector('input');
      if (inp) inp.checked = !inp.checked;
    });
  });
}

// ---- Smooth scroll for anchor links ----
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ---- Scroll to Top Button ----
function initScrollTopBtn() {
  const btn = document.getElementById('scrollTopBtn') || document.querySelector('.scroll-top-btn');
  if (!btn) return;

  function toggleBtn() {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', toggleBtn, { passive: true });
  toggleBtn();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---- Init All ----
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDir();
  initNavbarScroll();
  initMobileMenu();
  initFadeUp();
  initActiveNavLink();
  initAddToCart();
  initForms();
  initPasswordToggle();
  initFaq();
  initPillSelectors();
  initSmoothScroll();
  initScrollTopBtn();

  // Theme toggle buttons
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  // RTL toggle buttons
  document.querySelectorAll('.rtl-toggle-btn').forEach(btn => {
    btn.addEventListener('click', toggleDir);
  });
});
