// Reusable particle system for section backgrounds
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  layer: number; // 0=far, 1=mid, 2=near
}

const layerConfig = [
  { sizeMin: 1.5, sizeMax: 3, speedMul: 0.15, opacityMul: 0.3 },
  { sizeMin: 3, sizeMax: 5, speedMul: 0.3, opacityMul: 0.6 },
  { sizeMin: 5, sizeMax: 8, speedMul: 0.5, opacityMul: 1.0 },
];

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: string,
  x: number,
  y: number,
  size: number
) {
  ctx.beginPath();
  switch (shape) {
    case 'circle':
      ctx.arc(x, y, size, 0, Math.PI * 2);
      break;
    case 'triangle':
      ctx.moveTo(x, y - size);
      ctx.lineTo(x - size * 0.866, y + size * 0.5);
      ctx.lineTo(x + size * 0.866, y + size * 0.5);
      ctx.closePath();
      break;
    case 'diamond':
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.7, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.7, y);
      ctx.closePath();
      break;
    case 'square':
      ctx.rect(x - size * 0.7, y - size * 0.7, size * 1.4, size * 1.4);
      break;
    case 'hexagon':
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    case 'star':
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? size : size * 0.4;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    case 'line':
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      break;
    default:
      ctx.arc(x, y, size, 0, Math.PI * 2);
  }
}

export function initParticleCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const count = parseInt(canvas.dataset.particles || '100');
  const shape = canvas.dataset.shape || 'circle';
  const colorStr = canvas.dataset.color || '90,186,50';

  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? Math.floor(count * 0.4) : count;

  let w = 0, h = 0;
  let mouseX = -1000, mouseY = -1000;
  let particles: Particle[] = [];

  function resize() {
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;
    w = rect.width;
    h = rect.height;
    canvas.width = w;
    canvas.height = h;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      const layer = i % 3;
      const cfg = layerConfig[layer];
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * cfg.speedMul,
        vy: (Math.random() - 0.5) * cfg.speedMul,
        size: cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin),
        opacity: cfg.opacityMul * (0.5 + Math.random() * 0.5),
        layer,
      });
    }
  }

  // Track mouse within the section
  const section = canvas.parentElement;
  section?.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  section?.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
  });

  // Visibility check
  let isVisible = false;
  const observer = new IntersectionObserver(
    ([entry]) => { isVisible = entry.isIntersecting; },
    { threshold: 0.05 }
  );
  if (section) observer.observe(section);

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible || !ctx) return;

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Mouse repulsion
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120 && dist > 0) {
        const force = (120 - dist) / 120 * 0.8;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Damping
      p.vx *= 0.985;
      p.vy *= 0.985;

      // Drift
      p.x += p.vx;
      p.y += p.vy;

      // Wrap
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      // Draw particle
      ctx.fillStyle = `rgba(${colorStr}, ${p.opacity})`;
      if (shape === 'line') {
        ctx.strokeStyle = `rgba(${colorStr}, ${p.opacity})`;
        ctx.lineWidth = 1.5;
        drawShape(ctx, shape, p.x, p.y, p.size);
        ctx.stroke();
      } else {
        drawShape(ctx, shape, p.x, p.y, p.size);
        ctx.fill();
      }

      // Connection lines
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const cdx = p.x - p2.x;
        const cdy = p.y - p2.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist < 80) {
          ctx.strokeStyle = `rgba(${colorStr}, ${0.15 * (1 - cdist / 80)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }

  resize();
  createParticles();
  animate();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
}
