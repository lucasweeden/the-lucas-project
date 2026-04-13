// Change 4: 1000 floating LP logo coins across entire page
// Change 11: Cursor green spark flares

export function initFloatingCoins() {
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 80 : 1000;
  const docHeight = Math.max(document.body.scrollHeight, 6000);
  const container = document.getElementById('lp-coin-bg');
  if (!container) return;

  // Set container height to full page
  container.style.height = docHeight + 'px';

  let mouseX = -9999, mouseY = -9999;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY + window.scrollY;
  });

  const frag = document.createDocumentFragment();

  interface CoinRef { el: HTMLElement; x: number; y: number; baseX: number; baseY: number; }
  const coins: CoinRef[] = [];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const size = Math.floor(Math.random() * 51 + 14);
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * docHeight;
    const opacity = (0.18 + Math.random() * 0.37).toFixed(2);
    const spinDur = (3 + Math.random() * 8).toFixed(1);
    const floatDur = (4 + Math.random() * 6).toFixed(1);
    const delay = (Math.random() * -parseFloat(spinDur)).toFixed(1);

    el.className = 'lp-coin-particle';
    el.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;opacity:${opacity};will-change:transform;animation:lpCoinSpin ${spinDur}s linear infinite, lpCoinFloat ${floatDur}s ease-in-out infinite alternate;animation-delay:${delay}s,${(Math.random()*-parseFloat(floatDur)).toFixed(1)}s;`;
    el.innerHTML = `<img src="/images/smallLucas_Project_Logo.png" alt="" style="width:100%;height:100%;border-radius:50%;display:block;pointer-events:none;" />`;
    frag.appendChild(el);
    coins.push({ el, x, y, baseX: x, baseY: y });
  }
  container.appendChild(frag);

  // Mouse repulsion — check every 3rd frame
  let frame = 0;
  function repulse() {
    requestAnimationFrame(repulse);
    frame++;
    if (frame % 3 !== 0) return;
    for (const c of coins) {
      const dx = c.x - mouseX;
      const dy = c.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140 && dist > 0) {
        const push = (140 - dist) / 140 * 20;
        const px = (dx / dist) * push;
        const py = (dy / dist) * push;
        c.el.style.transform = `translateX(${px}px) translateY(${py}px)`;
      } else {
        c.el.style.transform = '';
      }
    }
  }
  repulse();
}

// Cursor green spark flares
export function initCursorSparks() {
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
