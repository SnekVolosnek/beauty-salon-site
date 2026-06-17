/* ===============================================
   LUMIÈRE BEAUTY STUDIO — JavaScript
   =============================================== */

'use strict';

// ——— DOM READY ———
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  initParallax();
  initBurger();
  initBookingForm();
  initPhoneMask();
  initScrollTop();
  initGalleryHover();
});

/* ===============================================
   NAV — scroll shadow + active highlight
   =============================================== */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const handleScroll = () => {
    if (window.scrollY > 48) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Smooth scroll for all anchor links in nav
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = document.getElementById('nav')?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ===============================================
   BURGER MENU
   =============================================== */
function initBurger() {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  let isOpen = false;

  const toggle = () => {
    isOpen = !isOpen;
    menu.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);

    // Animate burger bars
    const spans = burger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  };

  burger.addEventListener('click', toggle);

  // Close on mobile link click
  document.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', () => {
      if (isOpen) toggle();
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (isOpen && !burger.contains(e.target) && !menu.contains(e.target)) {
      toggle();
    }
  });
}

/* ===============================================
   SCROLL REVEAL — intersection observer
   =============================================== */
function initScrollReveal() {
  // Skip if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const elements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || 0);

          setTimeout(() => {
            el.classList.add('visible');
          }, delay);

          observer.unobserve(el);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  elements.forEach(el => observer.observe(el));
}

/* ===============================================
   PARALLAX — hero background subtle shift
   =============================================== */
function initParallax() {
  const bg = document.getElementById('heroBg');
  if (!bg) return;

  // Skip on mobile for performance
  if (window.innerWidth < 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  const update = () => {
    const scrollY = window.scrollY;
    const maxScroll = window.innerHeight;
    if (scrollY < maxScroll) {
      bg.style.transform = `translateY(${scrollY * 0.22}px)`;
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}

/* ===============================================
   BOOKING FORM — validation & submission
   =============================================== */
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  const success = document.getElementById('bookingSuccess');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  const validators = {
    name: (val) => val.trim().length >= 2,
    phone: (val) => val.replace(/\D/g, '').length >= 10,
    service: (val) => val !== ''
  };

  const showError = (fieldId, show) => {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + 'Error');
    if (!field || !error) return;

    if (show) {
      field.classList.add('error');
      error.classList.add('show');
    } else {
      field.classList.remove('error');
      error.classList.remove('show');
    }
  };

  // Live validation on blur
  ['name', 'phone', 'service'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => {
      showError(id, !validators[id](el.value));
    });
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) {
        showError(id, !validators[id](el.value));
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    let valid = true;
    ['name', 'phone', 'service'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const ok = validators[id](el.value);
      showError(id, !ok);
      if (!ok) valid = false;
    });

    if (!valid) return;

    // Submit state
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    submitBtn.disabled = true;
    if (btnText) btnText.hidden = true;
    if (btnLoading) btnLoading.hidden = false;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1400));

    // Show success
    form.hidden = true;
    if (success) {
      success.hidden = false;
      success.style.display = 'block';
    }
  });
}

/* ===============================================
   PHONE MASK — Russian format +7 (___) ___-__-__
   =============================================== */
function initPhoneMask() {
  const phone = document.getElementById('phone');
  if (!phone) return;

  phone.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');

    // Remove leading 7 or 8
    if (val.startsWith('8') || val.startsWith('7')) {
      val = val.slice(1);
    }

    let formatted = '';
    if (val.length > 0) formatted += '+7 (';
    if (val.length >= 1) formatted += val.substring(0, 3);
    if (val.length >= 4) formatted += ') ' + val.substring(3, 6);
    if (val.length >= 7) formatted += '-' + val.substring(6, 8);
    if (val.length >= 9) formatted += '-' + val.substring(8, 10);

    e.target.value = formatted;
  });

  phone.addEventListener('keydown', (e) => {
    // Allow backspace to clear the whole field gracefully
    if (e.key === 'Backspace' && phone.value === '+7 (') {
      phone.value = '';
    }
  });

  phone.addEventListener('focus', () => {
    if (phone.value === '') {
      phone.value = '+7 (';
    }
  });

  phone.addEventListener('blur', () => {
    if (phone.value === '+7 (') {
      phone.value = '';
    }
  });
}

/* ===============================================
   SCROLL TO TOP BUTTON
   =============================================== */
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  const toggle = () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ===============================================
   GALLERY — subtle hover entrance
   =============================================== */
function initGalleryHover() {
  const items = document.querySelectorAll('.gallery__item');

  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      items.forEach(other => {
        if (other !== item) {
          other.style.opacity = '0.7';
        }
      });
    });

    item.addEventListener('mouseleave', () => {
      items.forEach(other => {
        other.style.opacity = '';
      });
    });
  });
}

/* ===============================================
   SERVICE CARDS — stagger on scroll into view
   =============================================== */
(function initServiceStagger() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll('.service-card');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Already handled by reveal class + data-delay
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  cards.forEach(card => observer.observe(card));
})();

/* ===============================================
   ACTIVE NAV HIGHLIGHT — highlight current section
   =============================================== */
(function initActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              navLinks.forEach(l => l.removeAttribute('aria-current'));
              link.setAttribute('aria-current', 'page');
            }
          });
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px' }
  );

  sections.forEach(s => observer.observe(s));
})();
