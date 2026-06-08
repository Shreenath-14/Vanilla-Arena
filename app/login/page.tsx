'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const CODE_FRAGMENTS = [
  { text: 'array.map(x => x * 2)',        x: 8,  y: 12, size: 13, duration: 9,  delay: 0   },
  { text: '.filter(n => n % 2 === 0)',     x: 62, y: 8,  size: 12, duration: 11, delay: 1.5 },
  { text: 'reduce((acc, val) => acc+val)', x: 5,  y: 45, size: 11, duration: 8,  delay: 0.8 },
  { text: 'function fizzBuzz(n) {',        x: 55, y: 55, size: 12, duration: 13, delay: 2   },
  { text: 'const result = [];',            x: 15, y: 72, size: 11, duration: 10, delay: 3   },
  { text: 'arr.flat().sort((a,b)=>a-b)',   x: 58, y: 78, size: 11, duration: 9,  delay: 1   },
  { text: 'Object.keys(obj).forEach(',     x: 3,  y: 88, size: 10, duration: 12, delay: 2.5 },
  { text: 'Promise.all([...tasks])',        x: 60, y: 32, size: 11, duration: 10, delay: 0.5 },
  { text: '=> n % 3 === 0',               x: 20, y: 30, size: 10, duration: 14, delay: 4   },
  { text: 'console.log(result)',           x: 40, y: 88, size: 10, duration: 8,  delay: 1.8 },
];

export default function LoginPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cols = 16;
      const rows = 20;
      const cw = canvas.width / cols;
      const rh = canvas.height / rows;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const t = Date.now() / 1000;

      ctx.strokeStyle = 'rgba(250, 204, 21, 0.1)';
      ctx.lineWidth = 0.8;

      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        for (let c = 0; c <= cols; c++) {
          const bx = c * cw;
          const by = r * rh;
          const dx = bx - mx;
          const dy = by - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const strength = Math.max(0, 1 - dist / 280);
          const wave = Math.sin(t + c * 0.4 + r * 0.3) * 2.5;
          const px = bx + dx * strength * -0.1 + wave;
          const py = by + dy * strength * -0.1 + wave;
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
          const strength = Math.max(0, 1 - dist / 280);
          const wave = Math.sin(t + c * 0.4 + r * 0.3) * 2.5;
          const px = bx + dx * strength * -0.1 + wave;
          const py = by + dy * strength * -0.1 + wave;
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

  const handleGitHubLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex bg-[#050505]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes drift {
          0%   { transform: translateY(0px)   opacity(1); }
          50%  { transform: translateY(-18px); opacity: 0.7; }
          100% { transform: translateY(0px);  opacity: 1; }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }
        .font-mono { font-family: 'DM Mono', monospace; }

        .fade-left  { animation: fadeInLeft  0.7s ease both; }
        .fade-right { animation: fadeInRight 0.7s ease both 0.2s; }

        .code-float {
          animation: drift var(--dur) ease-in-out var(--delay) infinite;
        }
        .github-btn {
          background: linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .github-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(250, 204, 21, 0.25);
        }
        .github-btn:active {
          transform: translateY(0px);
        }
        .glass-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
        }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div className="relative hidden lg:flex flex-col w-[55%] overflow-hidden">
        {/* Canvas grid */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 40% 50%, rgba(250,204,21,0.1) 0%, transparent 65%)' }} />

        {/* Spinning ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ border: '1px solid rgba(250,204,21,0.08)' }}>
          <div className="absolute inset-[-1px] rounded-full spin-slow"
            style={{ border: '1px dashed rgba(250,204,21,0.12)', animation: 'spin-slow 20s linear infinite' }} />
        </div>

        {/* Floating code fragments */}
        {mounted && CODE_FRAGMENTS.map((f, i) => (
          <div
            key={i}
            className="code-float absolute font-mono text-yellow-400/25 pointer-events-none select-none whitespace-nowrap"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              fontSize: f.size,
              '--dur': `${f.duration}s`,
              '--delay': `${f.delay}s`,
            } as React.CSSProperties}
          >
            {f.text}
          </div>
        ))}

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-start justify-center h-full px-16 fade-left">
          {/* Logo */}
          <div className="mb-12">
            <span className="font-syne font-bold text-3xl text-white">
              Vanilla<span className="text-yellow-400">Arena</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-syne font-bold text-[clamp(2.8rem,4.5vw,4.2rem)] leading-[1.0] text-white mb-6 max-w-lg">
            Write JS.<br />
            Get Scored.<br />
            <span className="text-yellow-400">Dominate.</span>
          </h1>

          <p className="font-dm text-gray-400 text-lg leading-relaxed max-w-md mb-12">
            AI-powered code review in under 3 seconds. Level up, build streaks,
            and climb the global leaderboard.
          </p>

          {/* Mini stats */}
          <div className="flex gap-8">
            {[
              { val: '< 3s',  label: 'AI Review' },
              { val: '5',     label: 'Challenges' },
              { val: '100%',  label: 'Vanilla JS' },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-syne text-2xl font-bold text-yellow-400">{s.val}</p>
                <p className="font-dm text-gray-500 text-xs uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom divider line */}
        <div className="absolute top-0 right-0 w-px h-full"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(250,204,21,0.15) 30%, rgba(250,204,21,0.15) 70%, transparent)' }} />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative fade-right">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <span className="font-syne font-bold text-2xl text-white">
            Vanilla<span className="text-yellow-400">Arena</span>
          </span>
        </div>

        {/* Glass card */}
        <div className="glass-card rounded-2xl p-8 w-full max-w-sm">

          {/* Card header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20 mb-4">
              <span className="text-xl">⚡</span>
            </div>
            <h2 className="font-syne font-bold text-2xl text-white mb-2">Welcome back</h2>
            <p className="font-dm text-gray-400 text-sm">Sign in to start solving challenges</p>
          </div>

          {/* GitHub button */}
          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="github-btn w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl font-dm font-semibold text-[#0a0a0a] text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            )}
            {loading ? 'Redirecting...' : 'Continue with GitHub'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="font-dm text-gray-600 text-xs">secure OAuth</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Trust signals */}
          <div className="flex flex-col gap-2">
            {[
              { icon: '🔒', text: 'No password required' },
              { icon: '✨', text: 'Free forever — no credit card' },
              { icon: '⚡', text: 'Start solving in 30 seconds' },
            ].map((t) => (
              <div key={t.text} className="flex items-center gap-2.5">
                <span className="text-sm">{t.icon}</span>
                <span className="font-dm text-gray-500 text-xs">{t.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <a href="/" className="font-dm text-gray-600 text-xs mt-6 hover:text-gray-400 transition">
          ← Back to home
        </a>
      </div>
    </div>
  );
}