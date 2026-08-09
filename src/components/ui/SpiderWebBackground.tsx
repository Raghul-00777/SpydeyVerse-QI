import { useEffect, useRef } from 'react';

// ── Spider-Man web background ─────────────────────────
// Primary:  #e01515 (suit red)
// Bright:   #ff3b3b (glow / mouse highlight)
// Particle count scales with screen size, higher density, glow effects

export default function SpiderWebBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      opacity: number;
      pulse: number;
      pulseSpeed: number;
    }

    // Higher particle density for a robust web background effect
    const count = Math.min(140, Math.max(92, Math.floor((canvas.width * canvas.height) / 8200)));
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      size: Math.random() * 1.8 + 0.9,
      opacity: Math.random() * 0.5 + 0.28,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.005 + 0.0022,
    }));

    const mouse = { x: -2000, y: -2000 };
    const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMouseMove);

    let rafId: number;
    let frame = 0;

    function drawGlowLine(
      x1: number, y1: number, x2: number, y2: number,
      alpha: number, bright: boolean
    ) {
      if (!ctx) return;

      ctx.beginPath();
      ctx.strokeStyle = bright
        ? `rgba(255,59,59,${alpha})`
        : `rgba(224,21,21,${alpha})`;
      ctx.lineWidth = bright ? 1.4 : (0.6 + alpha * 1.1);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    function draw() {
      if (!ctx || !canvas) return;
      frame++;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Update particle positions ───────────────────
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Mouse repulsion — push particles away from cursor
        const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
        const md  = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 150 && md > 0) {
          p.vx += (mdx / md) * 0.055;
          p.vy += (mdy / md) * 0.055;
        }

        // Speed cap
        const sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (sp > 0.9) { p.vx = (p.vx / sp) * 0.9; p.vy = (p.vy / sp) * 0.9; }
      }

      // ── Web strands between particles ───────────────
      const CONNECT_DIST = 180;

      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECT_DIST) {
            const ratio = 1 - dist / CONNECT_DIST;
            const alpha = ratio * 0.55;
            drawGlowLine(pi.x, pi.y, pj.x, pj.y, alpha, false);
          }
        }

        // ── Mouse web strands ─────────────────────────
        const mdx = pi.x - mouse.x, mdy = pi.y - mouse.y;
        const md  = Math.sqrt(mdx * mdx + mdy * mdy);
        const MOUSE_DIST = 230;

        if (md < MOUSE_DIST) {
          const ratio = 1 - md / MOUSE_DIST;
          const alpha = ratio * 0.85;
          drawGlowLine(pi.x, pi.y, mouse.x, mouse.y, alpha, true);
        }
      }

      // ── Particle nodes ──────────────────────────────
      for (const p of particles) {
        const pulse = 0.85 + Math.sin(p.pulse) * 0.15;
        const finalOpacity = p.opacity * pulse;
        const finalSize    = p.size * pulse;

        // Outer glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, finalSize + 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224,21,21,${finalOpacity * 0.2})`;
        ctx.fill();

        // Inner dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, finalSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,72,72,${finalOpacity})`;
        ctx.fill();
      }

      // ── Mouse cursor web hub ────────────────────────
      if (mouse.x > -1000) {
        // Stronger cursor hub pulsing for a higher visual impact
        const hubPulse = 0.6 + Math.sin(frame * 0.038) * 0.42;

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 18, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(224,21,21,${hubPulse * 0.3})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,59,59,${hubPulse * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,72,72,${hubPulse * 0.9})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ff3b3b';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
}
