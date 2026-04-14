// v6 Change 4: 1000 self-moving LP coins with physics-based cursor interaction

export function initFloatingCoins() {
  const device = document.documentElement.getAttribute('data-device') || 'desktop';
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';
  const count = isMobile ? 50 : (isTablet ? 150 : 1000);
  const container = document.getElementById('lp-coin-bg');
  if (!container) return;

  const pageW = window.innerWidth;
  const pageH = Math.max(document.body.scrollHeight, 6000);
  container.style.height = pageH + 'px';

  let mouseX = -9999, mouseY = -9999;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY + window.scrollY;
  });

  interface Coin {
    el: HTMLElement;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    rot: number;
    rotSpeed: number;
  }

  const coins: Coin[] = [];
  const frag = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const size = Math.floor(Math.random() * 51 + 14);
    const x = Math.random() * pageW;
    const y = Math.random() * pageH;
    const opacity = (0.18 + Math.random() * 0.37).toFixed(2);

    el.className = 'lp-coin-particle';
    el.style.cssText = `position:absolute;width:${size}px;height:${size}px;opacity:${opacity};will-change:transform;`;
    el.innerHTML = `<img src="/images/smallLucas_Project_Logo.png" alt="" style="width:100%;height:100%;border-radius:50%;display:block;pointer-events:none;" />`;
    frag.appendChild(el);

    coins.push({
      el, x, y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size,
      rot: Math.random() * 360,
      rotSpeed: 0.3 + Math.random() * 1.5,
    });
  }
  container.appendChild(frag);

  function animate() {
    requestAnimationFrame(animate);
    const scrollY = window.scrollY;
    const vpTop = scrollY - 200;
    const vpBottom = scrollY + window.innerHeight + 200;

    for (const c of coins) {
      // Cursor repulsion
      const dx = c.x - mouseX;
      const dy = c.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 160 && dist > 0) {
        const angle = Math.atan2(dy, dx);
        const force = (160 - dist) * 0.04;
        c.vx += Math.cos(angle) * force;
        c.vy += Math.sin(angle) * force;
      }

      // Velocity cap
      const speed = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
      if (speed > 3.0) {
        c.vx = (c.vx / speed) * 3.0;
        c.vy = (c.vy / speed) * 3.0;
      }

      // Damping
      c.vx *= 0.97;
      c.vy *= 0.97;

      // Move
      c.x += c.vx;
      c.y += c.vy;

      // Bounce off walls
      if (c.x < 0) { c.x = 0; c.vx = Math.abs(c.vx); }
      if (c.x > pageW - c.size) { c.x = pageW - c.size; c.vx = -Math.abs(c.vx); }
      if (c.y < 0) { c.y = 0; c.vy = Math.abs(c.vy); }
      if (c.y > pageH - c.size) { c.y = pageH - c.size; c.vy = -Math.abs(c.vy); }

      // Spin
      c.rot += c.rotSpeed;

      // Only update DOM for coins in/near viewport (performance)
      if (c.y > vpTop && c.y < vpBottom) {
        c.el.style.transform = `translate(${c.x}px, ${c.y}px) rotateY(${c.rot}deg)`;
      }
    }
  }
  animate();
}

// Green stardust particle system (Change 4)
export function initStardust() {
  const device = document.documentElement.getAttribute('data-device') || 'desktop';
  const isMobile = device === 'mobile';
  const particleCount = isMobile ? 300 : 2000;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2;pointer-events:none;will-change:transform;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

  const colors = ['#5aba32','#8cd867','#3dd8c5','#4a8c2a','#aee87a'];

  interface Dust {
    x: number; y: number; size: number; opacity: number;
    twinkleSpeed: number; twinkleOffset: number;
    driftX: number; driftY: number; color: string;
    isCursorSpark?: boolean; life?: number; maxLife?: number; vx?: number; vy?: number;
  }

  const particles: Dust[] = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.2 + 0.3,
      opacity: Math.random() * 0.7 + 0.1,
      twinkleSpeed: Math.random() * 0.03 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.15,
      driftY: (Math.random() - 0.5) * 0.08,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  // Cursor spark spawning (desktop only)
  if (!isMobile) {
    document.addEventListener('mousemove', (e) => {
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 1.5;
        particles.push({
          x: e.clientX, y: e.clientY,
          size: 2 + Math.random() * 2,
          opacity: 0.9,
          twinkleSpeed: 0, twinkleOffset: 0,
          driftX: 0, driftY: 0,
          color: colors[Math.floor(Math.random() * colors.length)],
          isCursorSpark: true,
          life: 0, maxLife: 800,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        });
      }
    });
  }

  function hexToRGBA(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      if (p.isCursorSpark) {
        p.life = (p.life || 0) + 16;
        if (p.life >= (p.maxLife || 800)) { particles.splice(i, 1); continue; }
        p.x += p.vx || 0;
        p.y += p.vy || 0;
        const fade = 1 - p.life / (p.maxLife || 800);
        ctx.globalAlpha = p.opacity * fade;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * fade, 0, Math.PI * 2); ctx.fill();
      } else {
        p.x += p.driftX;
        p.y += p.driftY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const twinkle = Math.sin(now * p.twinkleSpeed + p.twinkleOffset) * 0.5 + 0.5;
        const alpha = p.opacity * twinkle;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();

        // Star shape for larger particles
        if (p.size > 1.5) {
          ctx.globalAlpha = alpha * 0.4;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.5;
          const len = p.size * 3;
          for (let a = 0; a < 4; a++) {
            const angle = (Math.PI / 4) * a;
            ctx.beginPath();
            ctx.moveTo(p.x - Math.cos(angle) * len, p.y - Math.sin(angle) * len);
            ctx.lineTo(p.x + Math.cos(angle) * len, p.y + Math.sin(angle) * len);
            ctx.stroke();
          }
        }
      }
    }
    ctx.globalAlpha = 1;
  }
  animate();
}

// Cursor green spark flares (disabled on mobile)
export function initCursorSparks() {
  const device = document.documentElement.getAttribute('data-device') || 'desktop';
  if (device === 'mobile') return; // skip on mobile
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9998;pointer-events:none;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

  const colors = ['#5aba32', '#8cd867', '#3dd8c5', '#4a8c2a'];
  interface Spark { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string; }
  const sparks: Spark[] = [];

  document.addEventListener('mousemove', (e) => {
    for (let i = 0; i < 5; i++) {
      sparks.push({
        x: e.clientX, y: e.clientY,
        vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 1.5) * 5,
        life: 0, maxLife: 400 + Math.random() * 300,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life += 16;
      if (s.life >= s.maxLife) { sparks.splice(i, 1); continue; }
      s.vy += 0.15;
      s.x += s.vx;
      s.y += s.vy;
      const alpha = 1 - s.life / s.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * (1 - s.life / s.maxLife * 0.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 0.8;
      for (let j = 0; j < 4; j++) {
        const a = (Math.PI / 2) * j;
        const len = s.size * 1.5 * (1 - s.life / s.maxLife);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + Math.cos(a) * len, s.y + Math.sin(a) * len);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  animate();
}
