// Change 10: LP coins only background — no shapes, no canvas.
// Creates 30 floating LP coin <img> elements with CSS rotation + JS repulsion.

export function initFloatingCoins() {
  const count = window.innerWidth < 768 ? 12 : 30;
  let mouseX = -1000, mouseY = -1000;

  interface CoinEl {
    el: HTMLElement;
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    vx: number;
    vy: number;
    size: number;
  }

  const coins: CoinEl[] = [];
  const docHeight = Math.max(document.body.scrollHeight, 5000);

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const size = 28 + Math.random() * 42; // 28-70px
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * docHeight;
    const opacity = 0.15 + Math.random() * 0.3;
    const spinDuration = 5 + Math.random() * 5;
    const delay = Math.random() * -spinDuration;

    el.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      z-index: 0;
      pointer-events: none;
      opacity: ${opacity};
      animation: lpBgCoinSpin ${spinDuration}s linear infinite;
      animation-delay: ${delay}s;
    `;
    el.innerHTML = `<img src="/images/smallLucas_Project_Logo.png" alt="" style="width:100%;height:100%;border-radius:50%;display:block;" />`;

    document.getElementById('lp-coin-bg')?.appendChild(el);

    coins.push({
      el,
      x, y,
      baseX: x, baseY: y,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size,
    });
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY + window.scrollY;
  });

  function animate() {
    requestAnimationFrame(animate);
    const scrollY = window.scrollY;

    for (const c of coins) {
      // Mouse repulsion (in page coordinates)
      const dx = c.x - mouseX;
      const dy = c.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 160 && dist > 0) {
        const force = (160 - dist) / 160 * 0.5;
        c.vx += (dx / dist) * force;
        c.vy += (dy / dist) * force;
      }

      // Spring back
      c.vx += (c.baseX - c.x) * 0.001;
      c.vy += (c.baseY - c.y) * 0.001;
      c.vx *= 0.98;
      c.vy *= 0.98;

      c.x += c.vx;
      c.y += c.vy;

      c.el.style.left = c.x + 'px';
      c.el.style.top = c.y + 'px';
    }
  }

  animate();
}
