'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import DiscordIcon from '@/components/DiscordIcon';

// Floating particle
function Particle({ x, y, size, duration, delay, opacity }: {
  x: number; y: number; size: number; duration: number; delay: number; opacity: number;
}) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        opacity,
        background: `radial-gradient(circle, #facc15, transparent)`,
        animation: `float ${duration}s ease-in-out ${delay}s infinite alternate`,
      }}
    />
  );
}

const PARTICLES = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 6 + 3,
  duration: Math.random() * 6 + 5,
  delay: Math.random() * 4,
  opacity: Math.random() * 0.5 + 0.2,
}));

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant AI Feedback',
    desc: 'Groq-powered evaluation returns results in under 3 seconds. No waiting, no humans, no delays.',
  },
  {
    icon: '🧠',
    title: 'Smart Code Review',
    desc: 'Llama 3.1 scores your code on elegance, readability, and correctness with actionable 2-sentence feedback.',
  },
  {
    icon: '🏆',
    title: 'Live Leaderboard',
    desc: 'Compete globally across daily, weekly, monthly, and all-time rankings. Every point counts.',
  },
  {
    icon: '🔥',
    title: 'Streak System',
    desc: 'Build unstoppable momentum. Solve challenges daily and unlock exclusive streak badges.',
  },
  {
    icon: '🎯',
    title: 'Curated Challenges',
    desc: 'Hand-crafted vanilla JS problems from easy to hard. No frameworks, no libraries — just raw skill.',
  },
  {
    icon: '📈',
    title: 'Level Up',
    desc: 'Every submission earns XP. Watch your level climb as your JavaScript mastery grows.',
  },
];

const STATS = [
  { value: '< 3s', label: 'AI Review Time' },
  { value: '100%', label: 'Vanilla JS' },
  { value: '∞', label: 'Challenges Ahead' },
];

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Grid distortion canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cols = 24;
      const rows = 16;
      const cw = canvas.width / cols;
      const rh = canvas.height / rows;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const t = Date.now() / 1000;

      ctx.strokeStyle = 'rgba(250, 204, 21, 0.06)';
      ctx.lineWidth = 0.8;

      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        for (let c = 0; c <= cols; c++) {
          const bx = c * cw;
          const by = r * rh;
          const dx = bx - mx;
          const dy = by - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const strength = Math.max(0, 1 - dist / 320);
          const wave = Math.sin(t * 1.2 + c * 0.3 + r * 0.2) * 3;
          const px = bx + dx * strength * -0.12 + wave;
          const py = by + dy * strength * -0.12 + wave;
          if (c === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        for (let r = 0; r <= rows; r++) {
          const bx = c * cw;
          const by = r * rh;
          const dx = bx - mx;
          const dy = by - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const strength = Math.max(0, 1 - dist / 320);
          const wave = Math.sin(t * 1.2 + c * 0.3 + r * 0.2) * 3;
          const px = bx + dx * strength * -0.12 + wave;
          const py = by + dy * strength * -0.12 + wave;
          if (r === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-[#050505] text-white overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes float {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-22px) scale(1.15); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 0.9; transform: scale(1.04); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .font-syne  { font-family: 'Syne', sans-serif; }
        .font-dm    { font-family: 'DM Sans', sans-serif; }
        .fade-up-1  { animation: fadeUp 0.8s ease both 0.1s; }
        .fade-up-2  { animation: fadeUp 0.8s ease both 0.3s; }
        .fade-up-3  { animation: fadeUp 0.8s ease both 0.5s; }
        .fade-up-4  { animation: fadeUp 0.8s ease both 0.7s; }
        .glow-ring  { animation: glow-pulse 3s ease-in-out infinite; }
        .spin-slow  { animation: spin-slow 18s linear infinite; }

        .btn-shimmer {
          background: linear-gradient(90deg, #facc15 0%, #fde68a 40%, #facc15 60%, #ca8a04 100%);
          background-size: 400px 100%;
          animation: shimmer 2.5s linear infinite;
        }
        .card-hover {
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-6px);
          border-color: rgba(250, 204, 21, 0.3);
          box-shadow: 0 20px 60px rgba(250, 204, 21, 0.08);
        }
        .noise::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.4;
        }
      `}</style>

      {/* Canvas grid */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Ambient glows */}
      <div className="fixed top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.07) 0%, transparent 70%)' }} />
      <div className="fixed bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.05) 0%, transparent 70%)' }} />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {mounted && PARTICLES.map(p => <Particle key={p.id} {...p} />)}
      </div>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-15 text-center noise">

        {/* Spinning ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none glow-ring"
          style={{ border: '1px solid rgba(250,204,21,0.06)', borderRadius: '50%' }}>
          <div className="absolute inset-[-1px] rounded-full spin-slow"
            style={{ border: '1px dashed rgba(250,204,21,0.1)' }} />
        </div>

        {/* Badge */}
        <div className="fade-up-1 mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-400/20 bg-yellow-400/5 text-yellow-400 text-xs font-medium font-dm tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          AI-Powered Code Reviews · V1 Live
        </div>

        {/* Headline */}
        <h1 className="fade-up-2 font-syne font-800 text-[clamp(3rem,9vw,7.5rem)] leading-[0.92] tracking-tight mb-6 max-w-5xl">
          <span className="block text-white">Master</span>
          <span className="block relative">
            <span className="relative z-10"
              style={{ WebkitTextStroke: '1px rgba(250,204,21,0.6)', color: 'transparent' }}>
              Vanilla
            </span>
            <span className="text-yellow-400"> JS</span>
          </span>
          <span className="block text-white/30 text-[0.6em] font-dm font-light tracking-normal mt-2">
            Get scored by AI. Rise the ranks.
          </span>
        </h1>

        {/* Sub */}
        <p className="fade-up-3 font-dm text-gray-400 text-lg max-w-xl leading-relaxed mb-10">
          Submit pure JavaScript. Receive instant AI feedback with a score, level up,
          maintain streaks, and compete on a global leaderboard.
        </p>

        {/* CTAs */}
        <div className="fade-up-4 flex flex-col sm:flex-row gap-4 items-center">
          <Link href="/login"
            className="btn-shimmer text-black font-syne font-bold px-8 py-4 rounded-xl text-base tracking-wide shadow-lg shadow-yellow-400/20 hover:scale-105 transition-transform">
            Start Coding Free →
          </Link>
          <Link href="/challenges"
            className="font-dm text-gray-300 border border-white/10 px-8 py-4 rounded-xl text-base hover:bg-white/5 hover:border-white/20 transition">
            Browse Challenges
          </Link>
        </div>

        {/* Stats row */}
        <div className="fade-up-4 mt-16 flex gap-12 items-center">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-syne text-3xl font-bold text-yellow-400">{s.value}</p>
              <p className="font-dm text-gray-500 text-xs mt-1 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="font-dm text-xs tracking-widest uppercase text-gray-400">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-yellow-400 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 px-6 py-32 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-dm text-yellow-400 text-xs tracking-[0.3em] uppercase mb-3">The Flow</p>
          <h2 className="font-syne text-5xl font-bold">How it works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
          {[
            { step: '01', title: 'Pick a Challenge', desc: 'Browse curated vanilla JS problems sorted by difficulty. Each one tests a real-world skill.' },
            { step: '02', title: 'Write Your Solution', desc: 'Use the embedded Monaco editor. No setup, no installs. Just write pure JavaScript.' },
            { step: '03', title: 'Get AI Scored', desc: 'Groq evaluates your code in under 3 seconds. Points awarded, streak updated, badges unlocked.' },
          ].map((item) => (
            <div key={item.step} className="bg-[#0a0a0a] p-8 group hover:bg-[#0f0f0f] transition">
              <p className="font-syne text-6xl font-bold text-white/5 group-hover:text-yellow-400/10 transition mb-4">{item.step}</p>
              <h3 className="font-syne text-xl font-bold mb-3">{item.title}</h3>
              <p className="font-dm text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-dm text-yellow-400 text-xs tracking-[0.3em] uppercase mb-3">Everything you need</p>
          <h2 className="font-syne text-5xl font-bold">Built to make you better</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title}
              className="card-hover bg-[#0a0a0a] border border-white/8 rounded-2xl p-6">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-syne text-lg font-bold mb-2">{f.title}</h3>
              <p className="font-dm text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(250,204,21,0.07) 0%, transparent 70%)' }} />
          <p className="font-dm text-yellow-400 text-xs tracking-[0.3em] uppercase mb-4">Ready?</p>
          <h2 className="font-syne text-[clamp(2.5rem,6vw,5rem)] font-bold leading-tight mb-6">
            Your first challenge<br />
            <span className="text-yellow-400">awaits.</span>
          </h2>
          <p className="font-dm text-gray-400 mb-10 text-lg">
            Join VanillaArena. Write clean JS. Get better every day.
          </p>
          <Link href="/login"
            className="btn-shimmer inline-block text-black font-syne font-bold px-10 py-4 rounded-xl text-lg tracking-wide shadow-xl shadow-yellow-400/20 hover:scale-105 transition-transform">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-syne font-bold text-lg">
            Vanilla<span className="text-yellow-400">Arena</span>
          </span>
          <p className="font-dm text-gray-600 text-sm">
            Built with Next.js · Supabase · Groq
          </p>

          <a
          href="https://discord.gg/gcbPNN4uw"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition text-sm font-dm"
    >
          <span className="text-[#7289da]">
            <DiscordIcon size={16} />
          </span>
          Join Discord
        </a>
      </div>
    </footer>
    </main >
  );
}