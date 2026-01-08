// ============================================================
// Hex Robotics - Main JavaScript
// - Smooth scrolling navigation
// - Scroll reveal animations
// - Scrolling video behavior
// - Simple contact form handler
// - Hooks for future cursor animations
// All written in plain, beginner-friendly JavaScript.
// ============================================================

// Helper: select a single element
function $(selector, scope) {
  return (scope || document).querySelector(selector);
}

// Helper: select multiple elements
function $all(selector, scope) {
  return Array.from((scope || document).querySelectorAll(selector));
}

// ------------------------------------------------------------//
// Smooth scroll for nav links
// ------------------------------------------------------------//
function initSmoothScrollNav() {
  const navLinks = $all('a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// ------------------------------------------------------------//
// Scroll reveal using IntersectionObserver
// ------------------------------------------------------------//
function initScrollReveal() {
  const revealEls = $all(".reveal");
  if (!("IntersectionObserver" in window) || revealEls.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          // Once visible, we don't need to watch it again
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealEls.forEach((el, index) => {
    // Optional: Add staggered delay if grid card
    if (el.closest('.robot-card') || el.closest('.about-card')) {
      //Simple logic: delay based on index modulo row size, or just random
      // Check if it has siblings to determine index relative to container might be too complex for simple use
      // simpler: just add a tiny delay based on pure order
      // but we don't want to delay *first* items too much if they are scattered.
      // Best approach for "stagger": CSS nth-child delay is cleaner, but let's do a simple data-delay check
    }
    observer.observe(el)
  });
}

// ------------------------------------------------------------//
// ROI Calculator Logic (Real-time + Currency)
// ------------------------------------------------------------//
function initROICalculator() {
  const sliders = {
    laborers: document.getElementById('input-laborers'),
    wage: document.getElementById('input-wage'),
    hours: document.getElementById('input-hours')
  };

  const labels = {
    laborers: document.getElementById('label-laborers'),
    wage: document.getElementById('label-wage'),
    hours: document.getElementById('label-hours')
  };

  const results = {
    savings: document.getElementById('res-savings'),
    efficiency: document.getElementById('res-efficiency'),
    breakeven: document.getElementById('res-breakeven')
  };

  const currencySwitch = document.getElementById('currency-switch');
  const currencyLabels = document.querySelectorAll('.currency-label');

  // State
  let state = {
    currency: 'USD', // or 'INR'
    conversionRate: 84 // 1 USD = ~84 INR (approx for wages)
  };

  // Range Configs
  const ranges = {
    USD: { min: 15, max: 150, default: 30 },
    INR: { min: 500, max: 5000, default: 1200 } // Adjusted for daily/hourly context
  };

  if (!sliders.laborers) return;

  function updateCurrencyState() {
    const isINR = state.currency === 'INR';

    // UI Toggle
    if (isINR) {
      currencySwitch.classList.add('active');
      currencyLabels[0].classList.remove('active');
      currencyLabels[1].classList.add('active');

      // Update Wage Slider for INR
      sliders.wage.min = ranges.INR.min;
      sliders.wage.max = ranges.INR.max;
      // Heuristic: If value is small (USD-like), convert it. Else clamp.
      if (sliders.wage.value < 200) {
        sliders.wage.value = Math.floor(sliders.wage.value * state.conversionRate);
      }
    } else {
      currencySwitch.classList.remove('active');
      currencyLabels[0].classList.add('active');
      currencyLabels[1].classList.remove('active');

      // Update Wage Slider for USD
      sliders.wage.min = ranges.USD.min;
      sliders.wage.max = ranges.USD.max;
      // Convert back if huge
      if (sliders.wage.value > 200) {
        sliders.wage.value = Math.floor(sliders.wage.value / state.conversionRate);
      }
    }
    calculate();
  }

  function toggleCurrency() {
    state.currency = state.currency === 'USD' ? 'INR' : 'USD';
    updateCurrencyState();
  }

  function calculate() {
    const laborers = parseInt(sliders.laborers.value);
    const wage = parseInt(sliders.wage.value);
    const hours = parseInt(sliders.hours.value);
    const currencySym = state.currency === 'USD' ? '$' : '₹';

    // Update Labels
    labels.laborers.textContent = laborers;
    labels.wage.textContent = `${currencySym}${wage}`;
    labels.hours.textContent = hours;

    // Maths:
    // Annual Cost = laborers * wage * hours * 52
    // Efficiency Gain = 40%
    const annualLaborCost = laborers * wage * hours * 52;
    const targetSavings = annualLaborCost * 0.40;

    // Break Even Logic:
    // Simple Model: ROI Speed improves with scale.
    // Base 14 months, minus 0.1 month per laborer. Min 4 months.
    let breakEvenMonths = 14 - (laborers * 0.1);
    if (breakEvenMonths < 4) breakEvenMonths = 4;

    // Update Text
    if (results.breakeven) results.breakeven.textContent = `${breakEvenMonths.toFixed(1)} Months`;
    if (results.efficiency) results.efficiency.textContent = `${30 + Math.min(laborers, 30)}%`;

    // Smoothly animate
    animateValue(results.savings, currentSavings, targetSavings, 400, state.currency);
    currentSavings = targetSavings;
  }

  // Animation Helper
  let currentSavings = 0;
  let animationFrame;

  function animateValue(obj, start, end, duration, currency) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Lerp
      const value = Math.floor(start + (end - start) * progress);

      // Smart formatting (en-US vs en-IN)
      const locale = currency === 'INR' ? 'en-IN' : 'en-US';
      const curCode = currency;

      obj.textContent = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: curCode,
        maximumFractionDigits: 0
      }).format(value);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = window.requestAnimationFrame(step);
  }

  // Bind Events
  Object.values(sliders).forEach(slider => {
    slider.addEventListener('input', calculate);
  });

  if (currencySwitch) {
    currencySwitch.addEventListener('click', toggleCurrency);
  }

  // Init
  calculate();
}
// ------------------------------------------------------------//
// Number Counter Animation
// ------------------------------------------------------------//
function initNumberCounters() {
  const stats = $all('.stat-number');
  if (!stats.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateValue(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
  } else {
    // Fallback
    stats.forEach(stat => {
      stat.textContent = stat.getAttribute('data-target');
    });
  }

  function animateValue(obj) {
    const target = parseInt(obj.getAttribute('data-target'), 10);
    const duration = 2000; // ms
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Ease out quart
      const easeProgress = 1 - Math.pow(1 - progress, 4);

      obj.innerHTML = Math.floor(easeProgress * target);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.innerHTML = target; // Ensure exact final value
      }
    };

    window.requestAnimationFrame(step);
  }
}





// ------------------------------------------------------------//
// Contact form: simple front-end handler (no backend)
// ------------------------------------------------------------//
function initContactForm() {
  const form = $("#contact-form");
  const statusEl = $("#contact-status");
  if (!form || !statusEl) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();

    if (!name || !email || !message) {
      statusEl.textContent = "Please fill out all fields before sending.";
      statusEl.classList.remove("contact-status--success");
      statusEl.classList.add("contact-status--error");
      return;
    }

    statusEl.textContent = "Sending...";
    statusEl.classList.remove("contact-status--success", "contact-status--error");

    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          statusEl.textContent = "Thanks, " + name + "! We’ve received your message.";
          statusEl.classList.add("contact-status--success");
          form.reset();
        } else {
          statusEl.textContent = "Oops! There was a problem submitting your form.";
          statusEl.classList.add("contact-status--error");
        }
      })
      .catch(error => {
        statusEl.textContent = "Oops! There was a network error.";
        statusEl.classList.add("contact-status--error");
      });
  });
}

// ------------------------------------------------------------//
// Simple header nav toggle on mobile
// ------------------------------------------------------------//
function initNavToggle() {
  const toggle = $(".nav-toggle");
  const navLinks = $(".nav-links");
  if (!toggle || !navLinks) return;

  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("is-open");
  });

  // Close menu when clicking a link (nice on mobile)
  $all(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
    });
  });
}

// ------------------------------------------------------------//
// Footer year helper
// ------------------------------------------------------------//
function initFooterYear() {
  const yearEl = $("#footer-year");
  if (!yearEl) return;
  yearEl.textContent = new Date().getFullYear().toString();
}

// ------------------------------------------------------------//
// Cursor hooks (for you to customize later)
// ------------------------------------------------------------//
// ------------------------------------------------------------//
// Horizontal Scroll Section logic
// ------------------------------------------------------------//
function initHorizontalScroll() {
  const section = document.querySelector(".robots-horizontal-section");
  const track = document.querySelector(".horizontal-track");

  if (!section || !track) return;

  window.addEventListener("scroll", () => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    // Check if we are within the scrollable area
    // Start slightly before to catch the entry? No, strict entry.
    const startObj = sectionTop;
    const endObj = sectionTop + sectionHeight - windowHeight;

    if (scrollY >= startObj && scrollY <= endObj) {
      // Calculate percentage scrolled within the section
      // Adjusted distance = (scrollY - startObj)
      // Total scrollable distance = (sectionHeight - windowHeight)
      const distance = scrollY - startObj;
      const totalDistance = sectionHeight - windowHeight;
      let percentage = distance / totalDistance;

      // Clamp 0-1
      if (percentage < 0) percentage = 0;
      if (percentage > 1) percentage = 1;

      // How far to move the track?
      // Move track left by (trackWidth - windowWidth) * percentage
      const trackWidth = track.scrollWidth;
      const moveDistance = trackWidth - window.innerWidth;

      track.style.transform = `translateX(-${percentage * moveDistance}px)`;
    }
    // optimization: sticky position handles the vertical freeze
  });
}

// ------------------------------------------------------------//
// Hero Video Scroll Animation
// ------------------------------------------------------------//
function initHeroVideoAnimation() {
  const heroSection = document.querySelector('.hero');
  const videoWrapper = document.querySelector('.hero-video-wrapper');

  if (!heroSection || !videoWrapper) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = heroSection.offsetHeight;

    // optimization: stop animating if passed hero
    if (scrollY > heroHeight) return;

    const progress = scrollY / heroHeight;

    // Parallax & Fade
    // Move video down slower than scroll (parallax)
    // Fade out as we scroll down
    videoWrapper.style.transform = `translateY(${scrollY * 0.4}px)`;
    videoWrapper.style.opacity = 1 - (progress * 1.5); // Fade out faster
  });
}

// ------------------------------------------------------------//
// Cursor hooks (for you to customize later)
// ------------------------------------------------------------//
function initCursorHooks() {
  const cursorLayer = $("#cursor-layer");
  if (!cursorLayer) return;

  // Example: soft orange glow that follows the cursor.
  // You can replace this later with particles, trails, etc.
  const glow = document.createElement("div");
  glow.style.position = "absolute";
  glow.style.width = "140px";
  glow.style.height = "140px";
  glow.style.borderRadius = "999px";
  glow.style.background =
    "radial-gradient(circle at center, rgba(255,122,26,0.35), transparent 65%)";
  glow.style.pointerEvents = "none";
  glow.style.transform = "translate(-50%, -50%)";
  glow.style.transition = "opacity 0.2s ease-out";
  glow.style.opacity = "0";

  cursorLayer.appendChild(glow);

  document.addEventListener("mousemove", (event) => {
    const { clientX, clientY } = event;
    glow.style.left = clientX + "px";
    glow.style.top = clientY + "px";
    glow.style.opacity = "1";
  });

  document.addEventListener("mouseleave", () => {
    glow.style.opacity = "0";
  });
}



// ------------------------------------------------------------//
// Initialize everything once the DOM is ready
// ------------------------------------------------------------//
document.addEventListener("DOMContentLoaded", () => {
  initSmoothScrollNav();
  initScrollReveal();
  initContactForm();
  initNavToggle();
  initFooterYear();
  initCursorHooks();
  initNumberCounters();
  initHeroVideoAnimation();
  initHorizontalScroll();
  initROICalculator();
});
