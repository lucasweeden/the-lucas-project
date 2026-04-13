// GSAP ScrollTrigger animations, card tilt, and stat counters
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  // --- Section titles: clip-path reveal ---
  document.querySelectorAll('.section-title').forEach((title) => {
    gsap.fromTo(
      title,
      { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
      {
        clipPath: 'inset(0% 0 0 0)',
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: title,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // --- Images: scale + fade in ---
  document.querySelectorAll('.section-portrait, .timeline-photo').forEach((img) => {
    gsap.fromTo(
      img,
      { scale: 0.92, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: img,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // --- Text slide from left ---
  document.querySelectorAll('.anim-left').forEach((el) => {
    gsap.fromTo(
      el,
      { x: -60, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // --- Image slide from right ---
  document.querySelectorAll('.anim-right').forEach((el) => {
    gsap.fromTo(
      el,
      { x: 60, opacity: 0, rotateY: 8 },
      {
        x: 0,
        opacity: 1,
        rotateY: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // --- Cards: stagger in ---
  document.querySelectorAll('.three-col, .two-col-cards, .social-grid').forEach((grid) => {
    const cards = grid.querySelectorAll('.card, .social-card');
    gsap.fromTo(
      cards,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // --- Timeline dots ---
  const dots = document.querySelectorAll('.timeline-dot');
  dots.forEach((dot) => {
    ScrollTrigger.create({
      trigger: dot,
      start: 'top 80%',
      onEnter: () => dot.classList.add('visible'),
    });
  });

  // --- Stat count-up ---
  document.querySelectorAll('.stat-number[data-count]').forEach((el) => {
    const target = parseFloat(el.getAttribute('data-count') || '0');
    const prefix = el.textContent?.startsWith('$') ? '$' : '';
    const isDecimal = target % 1 !== 0;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            const display = isDecimal ? obj.val.toFixed(1) : Math.floor(obj.val).toString();
            el.textContent = prefix + display + (target >= 10 ? 'M+' : (isDecimal ? 'M' : '+'));
          },
        });
      },
    });
  });

  // --- Hero parallax on scroll ---
  const heroContent = document.querySelector('.hero-content');
  const heroCanvas = document.querySelector('.hero-canvas');
  if (heroContent) {
    gsap.to(heroContent, {
      y: -120,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }
  if (heroCanvas) {
    gsap.to(heroCanvas, {
      y: -60,
      scale: 0.9,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  // --- Card 3D tilt ---
  if (window.matchMedia('(pointer: fine)').matches && window.innerWidth > 768) {
    document.querySelectorAll('.tilt-card').forEach((card) => {
      const el = card as HTMLElement;
      el.style.transformStyle = 'preserve-3d';

      el.addEventListener('mousemove', (e: Event) => {
        const me = e as MouseEvent;
        const rect = el.getBoundingClientRect();
        const x = me.clientX - rect.left;
        const y = me.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.4s ease';
        el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
        setTimeout(() => { el.style.transition = ''; }, 400);
      });
    });
  }
}
