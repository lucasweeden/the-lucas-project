// Change 10: 120 floating LP logo coins spread across full page height
// Change 11: Green cursor spark flares

export function initFloatingCoins() {
  const count = window.innerWidth < 768 ? 30 : 120;
  let mouseX = -9999, mouseY = -9999;

  interface CoinEl {
    el: HTMLElement;
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    vx: number;
    vy: number;
  }

  const coins: CoinEl[] = [];
  const docHeight = Math.max(document.body.scrollHeight, 6000);
  const container = document.getElementById('lp-coin-bg');
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const size = 20 + Math.random() * 60;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * docHeight;
    const opacity = 0.12 + Math.random() * 0.38;
    const dur = 3 + Math.random() * 7;

    el.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;z-index:0;pointer-events:none;opacity:${opacity};animation:lpBgCoinSpin ${dur}s linear infinite;animation-delay:${Math.random()*-dur}s;`;
    el.innerHTML = `<img src="/images/smallLucas_Project_Logo.png" alt="" style="width:100%;height:100%;border-radius:50%;display:block;" />`;
    container.appendChild(el);

    coins.push({ el, x, y, baseX: x, baseY: y, vx: (Math.random()-0.5)*0.2, vy: (Math.random()-0.5)*0.2 });
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY + window.scrollY;
  });

  function animate() {
    requestAnimationFrame(animate);
    for (const c of coins) {
      const dx = c.x - mouseX;
      const dy = c.y - mouseY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 180 && dist > 0) {
        const f = (180-dist)/180*0.4;
        c.vx += (dx/dist)*f;
        c.vy += (dy/dist)*f;
      }
      c.vx += (c.baseX-c.x)*0.001;
      c.vy += (c.baseY-c.y)*0.001;
      c.vx *= 0.98; c.vy *= 0.98;
      c.x += c.vx; c.y += c.vy;
      c.el.style.left = c.x + 'px';
      c.el.style.top = c.y + 'px';
    }
  }
  animate();
}

// Change 11: Cursor green spark flares
export function initCursorSparks() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9998;pointer-events:none;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

  const sparkColors = ['#5aba32', '#8cd867', '#3dd8c5', '#4a8c2a'];

  interface Spark {
    x: number; y: number;
    vx: number; vy: number;
    life: number; maxLife: number;
    size: number; color: string;
  }

  const sparks: Spark[] = [];

  document.addEventListener('mousemove', (e) => {
    for (let i = 0; i < 5; i++) {
      sparks.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random()-0.5)*6,
        vy: (Math.random()-1.5)*5,
        life: 0,
        maxLife: 400 + Math.random()*300,
        size: 2 + Math.random()*3,
        color: sparkColors[Math.floor(Math.random()*sparkColors.length)],
      });
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = sparks.length-1; i >= 0; i--) {
      const s = sparks[i];
      s.life += 16;
      if (s.life >= s.maxLife) { sparks.splice(i, 1); continue; }

      s.vy += 0.15; // gravity
      s.x += s.vx;
      s.y += s.vy;

      const alpha = 1 - s.life / s.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * (1 - s.life/s.maxLife * 0.5), 0, Math.PI*2);
      ctx.fill();

      // Starburst lines
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 0.8;
      for (let j = 0; j < 4; j++) {
        const angle = (Math.PI/2)*j;
        const len = s.size * 1.5 * (1 - s.life/s.maxLife);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + Math.cos(angle)*len, s.y + Math.sin(angle)*len);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  animate();
}
