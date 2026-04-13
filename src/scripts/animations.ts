// GSAP ScrollTrigger animations v4
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  // Section titles: clip-path reveal
  document.querySelectorAll('.section-title').forEach((title) => {
    gsap.fromTo(title,
      { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
      { clipPath: 'inset(0% 0 0 0)', opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none none' }
      }
    );
  });

  // Images: scale + fade in
  document.querySelectorAll('.section-portrait, .spiral-photo').forEach((img) => {
    gsap.fromTo(img,
      { scale: 0.92, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: img, start: 'top 85%', toggleActions: 'play none none none' }
      }
    );
  });

  // Text slide from left
  document.querySelectorAll('.anim-left').forEach((el) => {
    gsap.fromTo(el, { x: -60, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' }
      }
    );
  });

  // Image slide from right
  document.querySelectorAll('.anim-right').forEach((el) => {
    gsap.fromTo(el, { x: 60, opacity: 0, rotateY: 8 },
      { x: 0, opacity: 1, rotateY: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' }
      }
    );
  });

  // Section 1 cinematic scroll
  const lpContent = document.getElementById('lp-section-content');
  const lpSection = document.getElementById('lucas-project');
  if (lpContent && lpSection) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: lpSection, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
    tl.fromTo(lpContent, { x: '60vw', opacity: 0, scale: 0.94 }, { x: '0vw', opacity: 1, scale: 1, ease: 'power3.inOut', duration: 1 });
    tl.to(lpContent, { x: '-60vw', opacity: 0, ease: 'power3.inOut', duration: 1 }, '+=0.3');
  }

  // Cards stagger in
  document.querySelectorAll('.stair-cards, .four-col, .two-col-cards, .social-grid').forEach((grid) => {
    const cards = grid.querySelectorAll('.card, .social-card');
    gsap.fromTo(cards, { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: grid, start: 'top 80%', toggleActions: 'play none none none' }
      }
    );
  });

  // Mobile timeline steps
  document.querySelectorAll('.spiral-step').forEach((step) => {
    ScrollTrigger.create({ trigger: step, start: 'top 80%', onEnter: () => step.classList.add('visible') });
  });

  // Stat count-up
  document.querySelectorAll('.stat-number[data-count]').forEach((el) => {
    const target = parseFloat(el.getAttribute('data-count') || '0');
    const prefix = el.textContent?.startsWith('$') ? '$' : '';
    const isDecimal = target % 1 !== 0;
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, { val: target, duration: 2, ease: 'power2.out',
          onUpdate: () => {
            const d = isDecimal ? obj.val.toFixed(1) : Math.floor(obj.val).toString();
            el.textContent = prefix + d + (target >= 10 ? 'M+' : (isDecimal ? 'M' : '+'));
          },
        });
      },
    });
  });

  // Hero parallax
  const heroContent = document.querySelector('.hero-content');
  const heroCanvas = document.querySelector('.hero-canvas');
  if (heroContent) {
    gsap.to(heroContent, { y: -120, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }
  if (heroCanvas) {
    gsap.to(heroCanvas, { y: -60, scale: 0.9, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  // Card 3D tilt
  if (window.matchMedia('(pointer: fine)').matches && window.innerWidth > 768) {
    document.querySelectorAll('.tilt-card').forEach((card) => {
      const el = card as HTMLElement;
      el.style.transformStyle = 'preserve-3d';
      el.addEventListener('mousemove', (e: Event) => {
        const me = e as MouseEvent;
        const rect = el.getBoundingClientRect();
        const rx = ((me.clientY - rect.top - rect.height/2) / (rect.height/2)) * -8;
        const ry = ((me.clientX - rect.left - rect.width/2) / (rect.width/2)) * 8;
        el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.4s ease';
        el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        setTimeout(() => { el.style.transition = ''; }, 400);
      });
    });

    // Photo 3D hover + glare
    document.querySelectorAll('.photo-3d').forEach((wrap) => {
      const el = wrap as HTMLElement;
      const glare = el.querySelector('.glare') as HTMLElement;
      el.addEventListener('mousemove', (e: Event) => {
        const me = e as MouseEvent;
        const rect = el.getBoundingClientRect();
        const rx = ((me.clientY - rect.top - rect.height/2) / (rect.height/2)) * -12;
        const ry = ((me.clientX - rect.left - rect.width/2) / (rect.width/2)) * 12;
        el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        if (glare) {
          glare.style.background = `radial-gradient(circle at ${(me.clientX-rect.left)/rect.width*100}% ${(me.clientY-rect.top)/rect.height*100}%, rgba(255,255,255,0.15), transparent 60%)`;
        }
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.3s ease';
        el.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
        setTimeout(() => { el.style.transition = ''; }, 300);
      });
    });

    // Heading 3D tilt
    document.querySelectorAll('h1, h2, h3').forEach((heading) => {
      const el = heading as HTMLElement;
      el.addEventListener('mousemove', (e: Event) => {
        const me = e as MouseEvent;
        const rect = el.getBoundingClientRect();
        const rx = ((me.clientY - rect.top - rect.height/2) / (rect.height/2)) * -4;
        const ry = ((me.clientX - rect.left - rect.width/2) / (rect.width/2)) * 4;
        el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.3s ease';
        el.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
        setTimeout(() => { el.style.transition = ''; }, 300);
      });
    });
  }

  // Change 8: Text hover — green color change only (no inversion)
  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
  document.querySelectorAll('h1, h2, h3, p, span, .section-label, .card-body, .spiral-text, .closing-line, .hero-tagline').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      (el as HTMLElement).style.color = isDark() ? '#8cd867' : '#1a4d0a';
      (el as HTMLElement).style.transition = 'color 200ms ease';
    });
    el.addEventListener('mouseleave', () => {
      (el as HTMLElement).style.color = '';
    });
  });
}
