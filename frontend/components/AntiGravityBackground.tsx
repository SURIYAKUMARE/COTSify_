"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  type: number;
  color: string;
  wobble: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  pulse: number;
  pulseSpeed: number;
}

const COLORS = [
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#10b981", // green
  "#f59e0b", // amber
  "#ec4899", // pink
];

// Draw different electronic component shapes
function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.opacity * (0.85 + 0.15 * Math.sin(p.pulse));
  ctx.strokeStyle = p.color;
  ctx.fillStyle = p.color + "22";
  ctx.lineWidth = 1.2;

  const s = p.size;

  switch (p.type % 10) {
    // Microchip / IC
    case 0:
      ctx.strokeRect(-s, -s * 0.6, s * 2, s * 1.2);
      ctx.fillRect(-s, -s * 0.6, s * 2, s * 1.2);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-s, -s * 0.3 + i * s * 0.3);
        ctx.lineTo(-s - s * 0.4, -s * 0.3 + i * s * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s, -s * 0.3 + i * s * 0.3);
        ctx.lineTo(s + s * 0.4, -s * 0.3 + i * s * 0.3);
        ctx.stroke();
      }
      break;

    // Capacitor
    case 1:
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, -s);
      ctx.lineTo(-s * 0.5, s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.5, -s);
      ctx.lineTo(s * 0.5, s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 1.2, 0);
      ctx.lineTo(-s * 0.5, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.5, 0);
      ctx.lineTo(s * 1.2, 0);
      ctx.stroke();
      break;

    // Resistor
    case 2:
      ctx.beginPath();
      ctx.moveTo(-s * 1.5, 0);
      ctx.lineTo(-s, 0);
      ctx.stroke();
      ctx.strokeRect(-s, -s * 0.4, s * 2, s * 0.8);
      ctx.fillRect(-s, -s * 0.4, s * 2, s * 0.8);
      ctx.beginPath();
      ctx.moveTo(s, 0);
      ctx.lineTo(s * 1.5, 0);
      ctx.stroke();
      break;

    // LED
    case 3:
      ctx.beginPath();
      ctx.moveTo(-s * 0.8, -s * 0.8);
      ctx.lineTo(-s * 0.8, s * 0.8);
      ctx.lineTo(s * 0.8, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.8, -s * 0.8);
      ctx.lineTo(s * 0.8, s * 0.8);
      ctx.stroke();
      // Light rays
      ctx.globalAlpha *= 0.5;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(s * 1.0, i * s * 0.4);
        ctx.lineTo(s * 1.8, i * s * 0.7);
        ctx.stroke();
      }
      break;

    // Circuit node / dot
    case 4:
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
      // Cross lines
      ctx.beginPath();
      ctx.moveTo(-s * 1.2, 0);
      ctx.lineTo(s * 1.2, 0);
      ctx.moveTo(0, -s * 1.2);
      ctx.lineTo(0, s * 1.2);
      ctx.stroke();
      break;

    // Transistor
    case 5:
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.8);
      ctx.lineTo(-s * 0.3, s * 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.4);
      ctx.lineTo(s * 0.7, -s * 0.9);
      ctx.moveTo(-s * 0.3, s * 0.4);
      ctx.lineTo(s * 0.7, s * 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 1.2, 0);
      ctx.lineTo(-s * 0.3, 0);
      ctx.stroke();
      break;

    // Inductor / coil
    case 6:
      ctx.beginPath();
      ctx.moveTo(-s * 1.5, 0);
      ctx.lineTo(-s * 1.0, 0);
      for (let i = 0; i < 4; i++) {
        ctx.arc(-s * 0.7 + i * s * 0.5, 0, s * 0.3, Math.PI, 0, false);
      }
      ctx.lineTo(s * 1.5, 0);
      ctx.stroke();
      break;

    // Wifi / signal waves
    case 7:
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(0, s * 0.3, s * i * 0.4, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, s * 0.3, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;

    // Battery
    case 8:
      ctx.strokeRect(-s * 0.8, -s * 0.5, s * 1.6, s);
      ctx.fillRect(-s * 0.8, -s * 0.5, s * 1.6, s);
      ctx.fillStyle = p.color;
      ctx.fillRect(s * 0.8, -s * 0.25, s * 0.3, s * 0.5);
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.3);
      ctx.lineTo(-s * 0.3, s * 0.3);
      ctx.moveTo(-s * 0.6, 0);
      ctx.lineTo(0, 0);
      ctx.stroke();
      break;

    // Hexagon (processor)
    default:
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 6;
        const px = Math.cos(angle) * s;
        const py = Math.sin(angle) * s;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }

  ctx.restore();
}

export default function AntiGravityBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Mouse repulsion
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouseMove);

    // Create particles
    const count = Math.min(55, Math.floor((window.innerWidth * window.innerHeight) / 18000));
    particlesRef.current = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.5 + 0.2), // upward drift
      size: Math.random() * 10 + 6,
      opacity: Math.random() * 0.35 + 0.1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.008,
      type: i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
      wobbleAmp: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.03 + 0.01,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connection lines between nearby particles
      const ps = particlesRef.current;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            ctx.save();
            ctx.globalAlpha = (1 - dist / 160) * 0.08;
            ctx.strokeStyle = ps[i].color;
            ctx.lineWidth = 0.5;
            ctx.setLineDash([3, 6]);
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
          }
        }
      }

      // Update and draw each particle
      for (const p of ps) {
        // Anti-gravity: float upward with wobble
        p.wobble += p.wobbleSpeed;
        p.vx = Math.sin(p.wobble) * p.wobbleAmp * 0.3;
        p.vy += -0.003; // gentle upward acceleration
        p.vy = Math.max(p.vy, -0.9); // terminal velocity upward

        // Mouse repulsion
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const mdx = p.x - mx;
        const mdy = p.y - my;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 120) {
          const force = (120 - mdist) / 120;
          p.vx += (mdx / mdist) * force * 1.5;
          p.vy += (mdy / mdist) * force * 1.5;
        }

        // Apply velocity with damping
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.99;

        // Rotation
        p.rotation += p.rotationSpeed;

        // Pulse
        p.pulse += p.pulseSpeed;

        // Wrap: when particle floats off top, respawn at bottom
        if (p.y < -p.size * 3) {
          p.y = canvas.height + p.size * 3;
          p.x = Math.random() * canvas.width;
          p.vy = -(Math.random() * 0.5 + 0.2);
        }
        if (p.x < -p.size * 3) p.x = canvas.width + p.size * 3;
        if (p.x > canvas.width + p.size * 3) p.x = -p.size * 3;

        drawParticle(ctx, p);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.9 }}
    />
  );
}
