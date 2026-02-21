'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomePage() {
  const { theme: t, mode, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const features = [
    { icon: 'dashboard', title: 'Real-Time Dashboard', desc: 'Monitor orders, KPIs, risk scores & AI analysis from a single command center.' },
    { icon: 'auto_awesome', title: 'AI Predictions', desc: 'Built-in prediction engine with delay forecasts, route optimization & proactive suggestions.' },
    { icon: 'map', title: 'Supply Chain Map', desc: 'Interactive SVG map of India supply network — nodes, routes & risk visualization.' },
    { icon: 'notifications', title: 'Smart Alerts', desc: 'Automated disruption alerts for monsoons, port congestion, strikes & more.' },
    { icon: 'task_alt', title: 'Accept & Resolve', desc: 'Accept AI suggestions, resolve issues, and auto-generate PDF reports.' },
    { icon: 'cloud_sync', title: 'Firebase Sync', desc: 'All data persisted in real-time — accepted actions survive refresh and sync across devices.' },
  ];

  const team = [
    { name: 'Code Crunch Squad', role: 'Team', icon: 'groups' },
  ];

  const gradientBg = mode === 'dark'
    ? 'linear-gradient(160deg, #0a0c14 0%, #111827 50%, #0a0c14 100%)'
    : 'linear-gradient(160deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)';

  const heroGradient = 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)';

  return (
    <div style={{ minHeight: '100vh', background: gradientBg, color: t.text, fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      {/* Floating dots decoration */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${60 + i * 40}px`, height: `${60 + i * 40}px`,
            borderRadius: '50%', background: `${t.primary}08`,
            top: `${10 + i * 15}%`, left: `${5 + (i % 3) * 35}%`,
            animation: mounted ? `float${i % 3} ${6 + i * 2}s ease-in-out infinite` : 'none',
          }} />
        ))}
      </div>

      <style>{`
                @keyframes float0 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
                @keyframes float1 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(15px) rotate(-3deg); } }
                @keyframes float2 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 50% { box-shadow: 0 0 0 12px rgba(99,102,241,0); } }
            `}</style>

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="material-icons-outlined" style={{ fontSize: '28px', color: t.primary }}>security</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: t.heading }}>SupplyChain AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: t.bgCard, border: `1px solid ${t.border}`, color: t.textSecondary, cursor: 'pointer' }}>
            <span className="material-icons-outlined" style={{ fontSize: '18px' }}>{mode === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <Link href="/login" style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, background: t.primary, color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Launch App <span className="material-icons-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '60px 48px 40px', maxWidth: '900px', margin: '0 auto', animation: mounted ? 'fadeUp 0.8s ease-out' : 'none' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '20px', background: t.warningBg, border: `1px solid ${t.warningBorder}`, marginBottom: '24px' }}>
          <span style={{ fontSize: '14px' }}>🏆</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: t.warning }}>HackWhak 3.0</span>
          <span style={{ fontSize: '12px', color: t.textMuted }}>•</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: t.textSecondary }}>Team Code Crunch Squad</span>
        </div>

        <h1 style={{ fontSize: '52px', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px', background: heroGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AI-Powered Supply Chain Intelligence
        </h1>
        <p style={{ fontSize: '18px', color: t.textSecondary, lineHeight: 1.6, maxWidth: '650px', margin: '0 auto 36px' }}>
          Predict disruptions before they happen. Optimize routes in real-time. Resolve issues with one click. Built for India's B2B supply chain.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '20px' }}>
          <Link href="/login" style={{ padding: '14px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, background: heroGradient, color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', animation: 'pulse 2s infinite' }}>
            <span className="material-icons-outlined" style={{ fontSize: '20px' }}>rocket_launch</span>
            Get Started
          </Link>
          <Link href="/dashboard" style={{ padding: '14px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, background: t.bgCard, color: t.heading, textDecoration: 'none', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons-outlined" style={{ fontSize: '20px' }}>dashboard</span>
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Tech badges */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', gap: '10px', padding: '0 48px 50px', animation: mounted ? 'fadeUp 1s ease-out 0.2s both' : 'none' }}>
        {['Next.js', 'React', 'Firebase', 'Gemini AI'].map(tech => (
          <span key={tech} style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '20px', background: `${t.primary}12`, color: t.primary, border: `1px solid ${t.primary}25` }}>{tech}</span>
        ))}
      </div>

      {/* Features */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 48px 60px', maxWidth: '1100px', margin: '0 auto', animation: mounted ? 'fadeUp 1s ease-out 0.4s both' : 'none' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 800, color: t.heading, marginBottom: '12px' }}>Platform Features</h2>
        <p style={{ textAlign: 'center', fontSize: '15px', color: t.textMuted, marginBottom: '36px' }}>Everything you need to manage your supply chain intelligently</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '28px', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${t.primary}15`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${t.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <span className="material-icons-outlined" style={{ fontSize: '22px', color: t.primary }}>{f.icon}</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: t.heading, margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: t.textSecondary, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team & Hackathon */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 48px 60px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '20px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: heroGradient }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ fontSize: '36px' }}>🏆</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: t.heading, margin: '0 0 8px' }}>HackWhak 3.0</h2>
          <p style={{ fontSize: '15px', color: t.textSecondary, margin: '0 0 24px' }}>Built with passion in record time</p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '16px 28px', borderRadius: '14px', background: t.primaryBg, border: `1px solid ${t.primaryBorder}` }}>
            <span className="material-icons-outlined" style={{ fontSize: '28px', color: t.primary }}>groups</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: t.heading }}>Team Code Crunch Squad</div>
              <div style={{ fontSize: '13px', color: t.textMuted }}>Building the future of supply chain management</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '28px' }}>
            {[
              { icon: 'code', label: '5 Pages', desc: 'Full App' },
              { icon: 'psychology', label: 'AI Engine', desc: 'Built-in' },
              { icon: 'description', label: 'PDF Reports', desc: 'Auto-gen' },
              { icon: 'dark_mode', label: 'Themes', desc: 'Dark/Light' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <span className="material-icons-outlined" style={{ fontSize: '24px', color: t.primary, display: 'block', marginBottom: '4px' }}>{s.icon}</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: t.heading }}>{s.label}</div>
                <div style={{ fontSize: '11px', color: t.textMuted }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '24px 48px 40px', borderTop: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="material-icons-outlined" style={{ fontSize: '18px', color: t.primary }}>security</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: t.heading }}>SupplyChain AI</span>
        </div>
        <p style={{ fontSize: '12px', color: t.textMuted }}>
          Built with ❤️ by <b style={{ color: t.heading }}>Team Code Crunch Squad</b> for <b style={{ color: t.warning }}>HackWhak 3.0</b>
        </p>
        <p style={{ fontSize: '11px', color: t.textMuted, marginTop: '4px' }}>
          © 2024 SupplyChain AI • Next.js • Firebase • Gemini AI
        </p>
      </footer>
    </div>
  );
}
