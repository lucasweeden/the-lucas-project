// Change 14: Global particle system — all shapes mixed, 5x density, brand green palette

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  layer: number;
  shape: string;
  colorIdx: number;
}

const shapes = ['circle', 'triangle', 'diamond', 'square', 'hexagon', 'star', 'line'];
const colors = ['90,186,50', '74,140,42', '140,216,103'];
const layerConfig = [
  { sizeMin: 1.5, sizeMax: 3, speedMul: 0.12, opacityMul: 0.3 },
  { sizeMin: 3, sizeMax: 5, speedMul: 0.25, opacityMul: 0.55 },
  { sizeMin: 5, sizeMax: 8, speedMul: 0.4, opacityMul: 0.8 },
];

function drawShape(ctx: CanvasRenderingContext2D, shape: string, x: number, y: number, size: number) {
  ctx.beginPath();
  switch (shape) {
    case 'circle': ctx.arc(x, y, size, 0, Math.PI * 2); break;
    case 'triangle':
      ctx.moveTo(x, y - size);
      ctx.lineTo(x - size * 0.866, y + size * 0.5);
      ctx.lineTo(x + size * 0.866, y + size * 0.5);
      ctx.closePath(); break;
    case 'diamond':
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.7, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.7, y);
      ctx.closePath(); break;
    case 'square': ctx.rect(x - size * 0.7, y - size * 0.7, size * 1.4, size * 1.4); break;
    case 'hexagon':
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        i === 0 ? ctx.moveTo(x + size * Math.cos(angle), y + size * Math.sin(angle))
                 : ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
      }
      ctx.closePath(); break;
    case 'star':
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? size : size * 0.4;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        i === 0 ? ctx.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle))
                 : ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
      }
      ctx.closePath(); break;
    case 'line':
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y); break;
    default: ctx.arc(x, y, size, 0, Math.PI * 2);
  }
}

export function initGlobalParticles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isMobile = window.innerWidth < 768;
  const totalCount = isMobile ? 300 : 900;

  let w = window.innerWidth;
  let h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;

  let mouseX = -1000, mouseY = -1000;
  let particles: Particle[] = [];

  function createParticles() {
    particles = [];
    for (let i = 0; i < totalCount; i++) {
      const layer = i % 3;
      const cfg = layerConfig[layer];
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * cfg.speedMul,
        vy: (Math.random() - 0.5) * cfg.speedMul,
        size: cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin),
        opacity: cfg.opacityMul * (0.3 + Math.random() * 0.5),
        layer,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        colorIdx: Math.floor(Math.random() * colors.length),
      });
    }
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const color = colors[p.colorIdx];

      // Mouse repulsion
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 && dist > 0) {
        const force = (150 - dist) / 150 * 0.6;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
      if (p.shape === 'line') {
        ctx.strokeStyle = `rgba(${color}, ${p.opacity})`;
        ctx.lineWidth = 1.5;
        drawShape(ctx, p.shape, p.x, p.y, p.size);
        ctx.stroke();
      } else {
        drawShape(ctx, p.shape, p.x, p.y, p.size);
        ctx.fill();
      }

      // Connection lines (check nearby, limited for perf)
      if (i % 3 === 0) {
        for (let j = i + 1; j < Math.min(i + 20, particles.length); j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cdist < 90) {
            ctx.strokeStyle = `rgba(${color}, ${0.12 * (1 - cdist / 90)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    }
  }

  createParticles();
  animate();

  window.addEventListener('resize', () => {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    createParticles();
  });
}
