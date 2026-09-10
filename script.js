// ===== Theme toggle =====
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
root.setAttribute('data-theme', 'dark');

function paintIcon(theme){
  themeIcon.innerHTML = theme === 'light'
    ? '<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M4.9 4.9 3.5 3.5M20.5 20.5l-1.4-1.4M4.9 19.1l-1.4 1.4M20.5 3.5l-1.4 1.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
    : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
}
paintIcon('dark');
themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  paintIcon(next);
});

// ===== Mobile menu =====
const hamburger = document.getElementById('hamburger');
const mobilePanel = document.getElementById('mobilePanel');
hamburger.addEventListener('click', () => {
  const isOpen = mobilePanel.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(isOpen));
});
mobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobilePanel.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}));

// ===== Scrollspy (highlight active nav link) =====
const navLinks = document.querySelectorAll('#navLinks a');
const sections = [...document.querySelectorAll('section[id]')];
const spy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`#navLinks a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
sections.forEach(s => spy.observe(s));

// ===== MASTERPIECE TRANSITIONS =====
// 1) Split headings into words for the staggered curtain-rise reveal
document.querySelectorAll('.split-text').forEach(el => {
  const text = el.textContent;
  el.textContent = '';
  text.trim().split(/\s+/).forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.style.setProperty('--i', i);
    span.textContent = word + '\u00A0';
    el.appendChild(span);
  });
});

// 2) One observer drives every reveal type: plain fade/rise, word-stagger,
//    image curtain-unveil, and card grids. Each element animates once,
//    the moment it enters the viewport, then stops being watched.
const revealSelectors = '.reveal, .split-text, .img-reveal, .skill-card, .project-card, .award-card, .credential-card';
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll(revealSelectors).forEach(el => revealObserver.observe(el));

// 3) Skill bars fill to their target width as their card reveals
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const span = entry.target.querySelector('.bar > span');
      if (span) {
        const target = span.getAttribute('style').match(/--w:\s*([\d.]+)%/);
        span.style.width = target ? target[1] + '%' : '80%';
      }
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.skill-card').forEach(card => barObserver.observe(card));

// ===== Explosion box toggle (hero) =====
const expStage = document.getElementById('expStage');
const expToggle = document.getElementById('expToggle');
if (expStage && expToggle) {
  const expLabel = expToggle.querySelector('.exp-toggle-label');
  expToggle.addEventListener('click', () => {
    const isOpen = expStage.classList.toggle('is-open');
    expToggle.setAttribute('aria-expanded', String(isOpen));
    expLabel.textContent = isOpen ? 'Close the story' : 'Explore my story';
  });
}

// ===== Contact form (front-end only demo) =====
const form = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    formMsg.style.color = '#e5383b';
    formMsg.textContent = 'Please fill in all fields correctly.';
    return;
  }
  const name = document.getElementById('name').value;
  formMsg.style.color = '#3ecf6e';
  formMsg.textContent = `Thanks ${name}, your message is ready to send — connect this form to an email service or backend to deliver it.`;
  form.reset();
});

document.getElementById('year').textContent = new Date().getFullYear();

// ===== About slideshow (auto-scans assets/about/ via list.php; falls back to slides-manifest.js) =====
(function initAboutSlider(){
  const track = document.getElementById('sliderTrack');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const dotsWrap = document.getElementById('sliderDots');
  if (!track) return;

  const videoExt = /\.(mp4|webm|mov)$/i;

  function buildSlide(filename, alt){
    const slide = document.createElement('div');
    slide.className = 'slide';
    const src = 'assets/about/' + encodeURIComponent(filename);
    if (videoExt.test(filename)) {
      const video = document.createElement('video');
      video.src = src;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.controls = true;
      slide.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt || '';
      img.loading = 'lazy';
      slide.appendChild(img);
    }
    return slide;
  }

  function setup(items){
    items.forEach(item => track.appendChild(buildSlide(item.file, item.alt)));
    const slides = [...track.children];
    if (!slides.length) return;
    let index = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = [...dotsWrap.children];

    function pauseVideos(){
      slides.forEach(s => { const v = s.querySelector('video'); if (v) v.pause(); });
    }
    function goTo(i){
      pauseVideos();
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('is-active', di === index));
    }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));

    let startX = null;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(dx > 0 ? index - 1 : index + 1);
      startX = null;
    });
  }

  // Preferred path: assets/about/list.php scans the folder server-side (works on
  // XAMPP/Apache) so any file dropped in that folder shows up on refresh — nothing to edit.
  // Fallback: if PHP isn't available (e.g. static hosting, or opening the file directly),
  // use the hand-written list in assets/about/slides-manifest.js instead.
  fetch('assets/about/list.php', { cache: 'no-store' })
    .then(res => { if (!res.ok) throw new Error('list.php not available'); return res.json(); })
    .then(files => {
      if (!Array.isArray(files) || !files.length) throw new Error('folder scan came back empty');
      setup(files.map(f => ({ file: f, alt: 'Shan Hanzon A. Aldama' })));
    })
    .catch(() => {
      const manifest = Array.isArray(window.ABOUT_SLIDES) ? window.ABOUT_SLIDES : [];
      setup(manifest);
    });
})();

// ===== Credentials lightbox (Certificates & Diploma viewer) =====
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  function openCredential(card){
    const full = card.getAttribute('data-full');
    if (!full) return;
    if (/\.pdf($|\?)/i.test(full)) {
      window.open(full, '_blank', 'noopener');
      return;
    }
    lightboxImg.src = full;
    lightboxImg.alt = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Credential';
    lightbox.classList.add('is-open');
  }

  document.querySelectorAll('.credential-card[data-full]').forEach(card => {
    card.addEventListener('click', () => openCredential(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCredential(card);
      }
    });
  });

  function closeLightbox(){
    lightbox.classList.remove('is-open');
    lightboxImg.src = '';
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

// ===== Bottom nav (mobile app-style shortcut bar) =====
const bottomNav = document.getElementById('bottomNav');
if (bottomNav) {
  const bottomLinks = [...bottomNav.querySelectorAll('.bottom-nav-link')];

  // Reuses the same `sections` list gathered above for the top scrollspy
  const bottomSpy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const match = bottomNav.querySelector(`.bottom-nav-link[href="#${entry.target.id}"]`);
        if (match) {
          bottomLinks.forEach(l => l.classList.remove('active'));
          match.classList.add('active');
        }
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => bottomSpy.observe(s));

  // Hide the bar while scrolling down, bring it back on scroll up
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (Math.abs(y - lastY) > 6) {
      bottomNav.classList.toggle('is-hidden', y > lastY && y > 120);
      lastY = y;
    }
  }, { passive: true });

  // Keep it out of the way while the full mobile menu is open
  hamburger.addEventListener('click', () => {
    bottomNav.classList.toggle('is-hidden', mobilePanel.classList.contains('open'));
  });
  mobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    bottomNav.classList.remove('is-hidden');
  }));
}

// ===== Hero network canvas background =====
const canvas = document.getElementById('net');
const ctx = canvas.getContext('2d');
let w, h, points;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize(){
  const hero = document.querySelector('.hero');
  w = canvas.width = hero.offsetWidth;
  h = canvas.height = hero.offsetHeight;
}
function initPoints(){
  const count = Math.min(70, Math.floor((w * h) / 18000));
  points = Array.from({ length: count }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25
  }));
}
function draw(){
  ctx.clearRect(0, 0, w, h);
  const isLight = root.getAttribute('data-theme') === 'light';
  ctx.fillStyle = isLight ? 'rgba(20,20,20,0.35)' : 'rgba(255,255,255,0.35)';
  ctx.strokeStyle = isLight ? 'rgba(20,20,20,0.08)' : 'rgba(255,255,255,0.08)';
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (!reduceMotion) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
    ctx.fill();
    for (let j = i + 1; j < points.length; j++) {
      const q = points[j];
      const dx = p.x - q.x, dy = p.y - q.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }
  }
  if (!reduceMotion) requestAnimationFrame(draw);
}
function start(){
  resize();
  initPoints();
  draw();
}
window.addEventListener('resize', () => {
  resize();
  initPoints();
  if (reduceMotion) draw();
});
start();
