import React, { useEffect, useMemo, useRef, useState } from 'react';

const CRIMSON = '#A51C30';
const INK = '#17140F';
const PAPER = '#FAFAF8';
const SERIF = "'Instrument Serif', Georgia, serif";
const SANS = "'IBM Plex Sans', system-ui, -apple-system, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";
const EMAIL = 'mailto:harvardblockchainclub@gmail.com';

const CELL = 15;
const GAP = 2;
const COLS = 93;

const rgba = (hex, a) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/* Harvard Yard rooflines drawn on a coarse block grid */
function buildCells() {
  const seen = new Set();
  const cells = [];
  const add = (c, r) => {
    if (c < 0 || r < 0) return;
    const k = `${c}:${r}`;
    if (seen.has(k)) return;
    seen.add(k);
    cells.push({ c, r });
  };
  const box = (x, w, h, base = 0) => {
    for (let c = x; c < x + w; c++) for (let r = base; r < base + h; r++) add(c, r);
  };
  const pediment = (x, w, baseR, rows) => {
    let l = x, rgt = x + w - 1, r = baseR;
    for (let i = 0; i < rows && l <= rgt; i++) {
      for (let c = l; c <= rgt; c++) add(c, r);
      l++; rgt--; r++;
    }
  };
  const spire = (x, w, baseR) => {
    let l = x, rgt = x + w - 1, r = baseR;
    while (l <= rgt) {
      for (let c = l; c <= rgt; c++) { add(c, r); add(c, r + 1); }
      l++; rgt--; r += 2;
    }
    add(x + Math.floor(w / 2), r);
    add(x + Math.floor(w / 2), r + 1);
  };
  const dome = (x, w, baseR) => {
    let l = x, rgt = x + w - 1, r = baseR;
    while (rgt - l >= 1) { for (let c = l; c <= rgt; c++) add(c, r); l++; rgt--; r++; }
    for (let c = l; c <= rgt; c++) { add(c, r); add(c, r + 1); }
  };

  // 1 — Sever-style hall
  box(1, 14, 11); pediment(1, 14, 11, 4);
  box(3, 1, 4, 14); box(11, 1, 4, 14);
  // 2 — Memorial Church with steeple
  box(19, 13, 10); pediment(19, 13, 10, 3);
  box(23, 5, 6, 13); box(24, 3, 4, 19); spire(24, 3, 23);
  // 3 — Widener
  box(36, 21, 14); pediment(41, 11, 14, 3);
  // 4 — Lowell House with domed tower
  box(60, 15, 10); pediment(60, 15, 10, 4);
  box(65, 5, 8, 12); box(66, 3, 2, 20); dome(65, 5, 22);
  // 5 — right-hand house
  box(79, 13, 9); pediment(79, 13, 9, 4);
  box(81, 1, 4, 12); box(89, 1, 4, 12);

  return cells;
}

function BlockSkyline({ scrollY, vw, vh }) {
  const cells = useMemo(buildCells, []);
  const rows = useMemo(() => cells.reduce((m, c) => Math.max(m, c.r), 0) + 1, [cells]);
  const scale = Math.max(0.4, Math.min(1, (vw - 40) / (COLS * CELL), (vh * 0.46) / (rows * CELL)));
  const parallax = Math.min(scrollY * 0.18, 120);
  const bandHeight = Math.round(rows * CELL * scale + 90);
  const showTicker = vh > 620;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: bandHeight,
        pointerEvents: 'none', zIndex: 1, overflow: 'hidden',
        transform: `translateY(${-parallax * 0.35}px)`,
        transition: 'transform 0.15s linear',
      }}
    >
      <div
        style={{
          position: 'absolute', left: '50%', bottom: 74,
          width: COLS * CELL, height: rows * CELL,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: 'center bottom',
        }}
      >
        {cells.map((cell, i) => {
          const hot = (i * 7 + cell.c * 3) % 23 === 0;
          const delay = cell.c * 0.022 + cell.r * 0.05;
          const alpha = Math.max(0.07, 0.26 - cell.r * 0.011);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: cell.c * CELL,
                bottom: cell.r * CELL,
                width: CELL - GAP,
                height: CELL - GAP,
                background: hot ? rgba(CRIMSON, 0.45) : rgba(CRIMSON, alpha),
                outline: `1px solid ${rgba(CRIMSON, hot ? 0.4 : 0.12)}`,
                outlineOffset: '-1px',
                animation: hot
                  ? 'hubcBlockIn 0.7s cubic-bezier(.2,.8,.25,1) both, hubcPulse 3.6s ease-in-out infinite'
                  : 'hubcBlockIn 0.7s cubic-bezier(.2,.8,.25,1) both',
                animationDelay: hot ? `${delay}s, ${delay + 0.9}s` : `${delay}s`,
              }}
            />
          );
        })}
      </div>

      {showTicker && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 34, height: 11, overflow: 'hidden',
            maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
          }}
        >
          <div style={{ display: 'flex', gap: 8, width: 'max-content', animation: 'hubcChain 6s linear infinite' }}>
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 9, height: 9, flex: '0 0 auto',
                  border: `1px solid ${rgba(CRIMSON, 0.22)}`,
                  background: i % 5 === 0 ? rgba(CRIMSON, 0.16) : 'transparent',
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 73, height: 1,
          background: `linear-gradient(90deg, transparent, ${rgba(CRIMSON, 0.28)}, transparent)`,
        }}
      />
    </div>
  );
}

const NavLink = ({ label, active, onClick }) => (
  <a
    className="hubc-navlink"
    onClick={onClick}
    style={{
      fontSize: 14, fontWeight: 500, cursor: 'pointer', textDecoration: 'none',
      color: active ? CRIMSON : 'rgba(23,20,15,0.75)',
    }}
  >
    {label}
  </a>
);

const InitiativeCard = ({ n, status, title, href, children }) => {
  const Tag = href ? 'a' : 'div';
  const linkProps = href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
  <Tag className="hubc-card hubc-reveal" {...linkProps} style={{ display: 'block', background: '#fff', padding: 40, color: 'inherit', textDecoration: 'none' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
      <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(23,20,15,0.35)' }}>{n}</span>
      <span
        style={{
          fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: status === 'Active' ? CRIMSON : 'rgba(23,20,15,0.45)',
        }}
      >
        {status}
      </span>
    </div>
    <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 27, lineHeight: 1.2, margin: '0 0 12px' }}>{title}</h3>
    <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(23,20,15,0.6)', margin: href ? '0 0 20px' : 0 }}>{children}</p>
    {href && (
      <span
        className="hubc-cardlink"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 11,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: CRIMSON,
          borderBottom: '1px solid rgba(165,28,48,0.35)', paddingBottom: 3,
        }}
      >
        {href.replace(/^https?:\/\//, '')} →
      </span>
    )}
  </Tag>
  );
};

const SOCIALS = [
  {
    label: 'X',
    href: 'https://x.com/hublockchain',
    svg: <path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-7-6.2 7H1.4l8.1-9.3L1 2h7.1l4.9 6.4L18.9 2Zm-1.2 18h1.9L7.4 3.9H5.4L17.7 20Z" />,
    filled: true,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/harvardblockchainclub/',
    svg: <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.76-1.95C21.4 8.75 22 11 22 14v7h-4v-6.2c0-1.5-.03-3.4-2.1-3.4-2.1 0-2.4 1.6-2.4 3.3V21h-4V9Z" />,
    filled: true,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/hu.blockchain/',
    svg: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: 'Email',
    href: EMAIL,
    svg: (
      <>
        <rect x="2.8" y="5" width="18.4" height="14" rx="2" />
        <path d="M3.4 6.5 12 13l8.6-6.5" />
      </>
    ),
  },
];

const SocialIcon = ({ label, href, svg, filled }) => (
  <a
    className="hubc-social"
    href={href}
    aria-label={`HUBC on ${label}`}
    title={label}
    {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 38, height: 38, border: '1px solid rgba(23,20,15,0.14)', borderRadius: 2,
      color: 'rgba(23,20,15,0.55)',
    }}
  >
    <svg
      width={filled ? 15 : 16}
      height={filled ? 15 : 16}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={filled ? 0 : 1.8}
      aria-hidden="true"
    >
      {svg}
    </svg>
  </a>
);

const Person = ({ photo, name, role, note, position = 'center 20%' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
    <img
      className="hubc-portrait hubc-reveal"
      src={photo}
      alt={name}
      loading="lazy"
      style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', objectPosition: position }}
    />
    <div>
      <div style={{ fontFamily: SERIF, fontSize: 24, lineHeight: 1.15 }}>{name}</div>
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: CRIMSON, marginTop: 8 }}>
        {role}
      </div>
      {note && <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(23,20,15,0.5)', marginTop: 6 }}>{note}</div>}
    </div>
  </div>
);

export default function App() {
  const [page, setPage] = useState('home');
  const [scrollY, setScrollY] = useState(0);
  const [size, setSize] = useState({ vw: 1440, vh: 900 });
  const raf = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        setScrollY(window.scrollY);
      });
    };
    const onResize = () => setSize({ vw: window.innerWidth, vh: window.innerHeight });
    onResize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const go = (p) => () => { setPage(p); window.scrollTo(0, 0); };

  const cells = useMemo(buildCells, []);
  const rows = useMemo(() => cells.reduce((m, c) => Math.max(m, c.r), 0) + 1, [cells]);
  const scale = Math.max(0.4, Math.min(1, (size.vw - 40) / (COLS * CELL), (size.vh * 0.46) / (rows * CELL)));
  const heroPadBottom = Math.round(rows * CELL * scale + 90);

  return (
    <div style={{ fontFamily: SANS, color: INK, background: PAPER, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: ${PAPER}; }
        a { color: ${CRIMSON}; text-decoration: none; }
        ::selection { background: rgba(165,28,48,0.16); }
        @keyframes hubcBlockIn { from { opacity: 0; transform: translateY(14px) scale(0.82); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes hubcPulse { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
        @keyframes hubcChain { from { transform: translateX(0); } to { transform: translateX(-160px); } }
        @keyframes hubcFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hubcRise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hubcCaret { 0%,45% { opacity: 1; } 55%,100% { opacity: 0.15; } }
        .hubc-reveal { animation: hubcRise linear both; animation-timeline: view(); animation-range: entry 0% cover 28%; }
        .hubc-btn-dark, .hubc-btn-ghost, .hubc-btn-outline, .hubc-btn-solid { transition: background 0.3s ease, color 0.25s ease, border-color 0.3s ease, transform 0.3s cubic-bezier(.2,.8,.25,1), box-shadow 0.3s ease; }
        .hubc-btn-dark:hover { background: ${CRIMSON} !important; transform: translateY(-2px); box-shadow: 0 12px 24px rgba(165,28,48,0.22); }
        .hubc-btn-ghost:hover { border-color: ${INK} !important; transform: translateY(-2px); }
        .hubc-btn-outline:hover { background: ${INK} !important; color: ${PAPER} !important; }
        .hubc-btn-solid:hover { background: ${INK} !important; transform: translateY(-2px); box-shadow: 0 14px 28px rgba(23,20,15,0.18); }
        .hubc-navlink { transition: color 0.25s ease, letter-spacing 0.25s ease; }
        .hubc-navlink:hover { color: ${CRIMSON} !important; letter-spacing: 0.04em; }
        .hubc-card { transition: background 0.3s ease, transform 0.35s cubic-bezier(.2,.8,.25,1), box-shadow 0.35s ease; }
        .hubc-card:hover { background: #FFFCFC; transform: translateY(-3px); box-shadow: 0 18px 40px rgba(23,20,15,0.09); }
        .hubc-card .hubc-cardlink { transition: gap 0.25s ease, border-color 0.25s ease; }
        .hubc-card:hover .hubc-cardlink { gap: 14px; border-color: ${CRIMSON}; }
        .hubc-chip { transition: border-color 0.25s ease, color 0.25s ease, transform 0.25s ease; }
        .hubc-chip:hover { border-color: ${CRIMSON}; color: ${CRIMSON}; transform: translateY(-2px); }
        .hubc-portrait { filter: grayscale(1); transition: filter 0.5s ease, transform 0.6s cubic-bezier(.2,.8,.25,1); }
        .hubc-portrait:hover { filter: grayscale(0); transform: scale(1.02); }
        .hubc-social { transition: color 0.25s ease, border-color 0.25s ease, transform 0.25s cubic-bezier(.2,.8,.25,1); }
        .hubc-social:hover { color: ${CRIMSON} !important; border-color: ${CRIMSON}; transform: translateY(-2px); }
        .hubc-logo { transition: height 0.35s cubic-bezier(.2,.8,.25,1), opacity 0.25s ease; }
        .hubc-logo:hover { opacity: 0.7; }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.001s !important; animation-iteration-count: 1 !important; transition-duration: 0.001s !important; }
        }
        @media (max-width: 720px) {
          .hubc-nav { padding: 14px 20px !important; gap: 16px; }
          .hubc-nav-links { gap: 20px !important; }
          .hubc-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .hubc-two-col { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>

      <nav
        className="hubc-nav"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${scrollY > 40 ? 12 : 18}px 56px`, background: 'rgba(250,250,248,0.82)',
          backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(23,20,15,0.07)',
          boxShadow: scrollY > 40 ? '0 10px 30px rgba(23,20,15,0.05)' : '0 0 0 rgba(0,0,0,0)',
          transition: 'padding 0.35s cubic-bezier(.2,.8,.25,1), box-shadow 0.35s ease',
        }}
      >
        <img
          className="hubc-logo"
          src="/hubc-logo.png"
          alt="Harvard Undergraduate Blockchain Club"
          onClick={go('home')}
          style={{ height: scrollY > 40 ? 28 : 34, width: 'auto', cursor: 'pointer' }}
        />
        <div className="hubc-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <NavLink label="About" active={page === 'home'} onClick={go('home')} />
          <NavLink label="Initiatives" active={page === 'initiatives'} onClick={go('initiatives')} />
          <NavLink label="Team" active={page === 'team'} onClick={go('team')} />
          <a
            className="hubc-btn-outline"
            href={EMAIL}
            style={{
              fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '11px 20px', border: `1px solid ${INK}`, color: INK, borderRadius: 2,
              transition: 'background 0.25s ease, color 0.25s ease',
            }}
          >
            Contact
          </a>
        </div>
      </nav>

      {page === 'home' && (
        <section>
          <div
            className="hubc-pad"
            style={{
              position: 'relative', minHeight: '100vh', overflow: 'hidden',
              display: 'flex', alignItems: 'center',
              padding: `132px 56px ${heroPadBottom}px`,
            }}
          >
            <BlockSkyline scrollY={scrollY} vw={size.vw} vh={size.vh} />
            <div style={{ position: 'relative', zIndex: 2, maxWidth: 1240, margin: '0 auto', width: '100%' }}>
              <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: CRIMSON, marginBottom: 28, animation: 'hubcFadeUp 0.8s ease both', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                Harvard Undergraduate Blockchain Club
                <span style={{ width: 8, height: 8, background: CRIMSON, animation: 'hubcCaret 1.6s steps(1, end) infinite' }} />
              </div>
              <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(46px, 8.5vw, 118px)', lineHeight: 0.94, letterSpacing: '-0.02em', margin: '0 0 28px', maxWidth: '14ch', animation: 'hubcFadeUp 0.9s ease 0.08s both' }}>
                Building the future, <em style={{ fontStyle: 'italic', color: CRIMSON }}>block by block.</em>
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.65, color: 'rgba(23,20,15,0.62)', maxWidth: '46ch', margin: '0 0 40px', animation: 'hubcFadeUp 0.9s ease 0.16s both' }}>
                A student community in Cambridge researching, building, and shipping on decentralized infrastructure — from protocol design to real deployments.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', animation: 'hubcFadeUp 0.9s ease 0.24s both' }}>
                <a className="hubc-btn-dark" onClick={go('initiatives')} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '15px 26px', background: INK, color: PAPER, borderRadius: 2, cursor: 'pointer', transition: 'background 0.25s ease' }}>
                  Our work
                </a>
                <a className="hubc-btn-ghost" onClick={go('team')} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '15px 26px', border: '1px solid rgba(23,20,15,0.22)', color: INK, borderRadius: 2, cursor: 'pointer', transition: 'border-color 0.25s ease' }}>
                  Meet the team
                </a>
              </div>
            </div>
          </div>

          <div className="hubc-pad" style={{ padding: '120px 56px', background: '#fff', borderTop: '1px solid rgba(23,20,15,0.08)' }}>
            <div className="hubc-two-col" style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 80, alignItems: 'start' }}>
              <h2 className="hubc-reveal" style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(34px, 4vw, 56px)', lineHeight: 1.06, letterSpacing: '-0.015em', margin: 0 }}>
                Serious about the technology, not the noise.
              </h2>
              <div className="hubc-reveal" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <p style={{ fontSize: 17, lineHeight: 1.75, color: 'rgba(23,20,15,0.68)', margin: 0 }}>
                  We are undergraduates studying cryptography, distributed systems, mechanism design, and the institutions being rebuilt around them. Weekly sessions run from first principles to production code.
                </p>
                <p style={{ fontSize: 17, lineHeight: 1.75, color: 'rgba(23,20,15,0.68)', margin: 0 }}>
                  Members ship research, audit contracts, and work alongside founders, protocol teams, and faculty across the university. No prior experience required — only the willingness to build.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                  {['Research', 'Engineering', 'Policy', 'Industry'].map((t) => (
                    <span key={t} className="hubc-chip" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 14px', border: '1px solid rgba(23,20,15,0.16)', borderRadius: 2, color: 'rgba(23,20,15,0.6)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {page === 'initiatives' && (
        <section className="hubc-pad" style={{ padding: '160px 56px 120px' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: CRIMSON, marginBottom: 22 }}>Initiatives</div>
            <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(40px, 6vw, 84px)', lineHeight: 1, letterSpacing: '-0.02em', margin: '0 0 24px' }}>Our initiatives</h1>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(23,20,15,0.6)', maxWidth: '52ch', margin: '0 0 72px' }}>
              Research groups, teaching programs, and the events that bring the ecosystem to campus.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 1, background: 'rgba(23,20,15,0.1)', border: '1px solid rgba(23,20,15,0.1)' }}>
              <InitiativeCard n="01" status="Active" title="Blockchain & AI Summit 2026" href="https://blockchainaisummit.org">
                Our flagship conference bringing researchers, founders, and policymakers to Harvard. Programming announced this fall.
              </InitiativeCard>
              <InitiativeCard n="02" status="Active" title="DeFi Research">
                A reading and writing group on market structure, protocol design, and the economics of decentralized finance.
              </InitiativeCard>
              <InitiativeCard n="03" status="Active" title="Security Lab">
                Smart contract security training, with members auditing student and early-stage protocol codebases.
              </InitiativeCard>
              <InitiativeCard n="04" status="Ongoing" title="Blockchain 101">
                A weekly workshop series introducing the fundamentals to anyone at Harvard, no background assumed.
              </InitiativeCard>
              <InitiativeCard n="05" status="Ongoing" title="Industry Connect">
                Speaker sessions, treks, and recruiting pipelines with protocol teams, funds, and research labs.
              </InitiativeCard>
              <InitiativeCard n="06" status="Past" title="HBC25">
                Our 2025 campus summit — a day of talks and workshops with builders from across the industry.
              </InitiativeCard>
            </div>
          </div>
        </section>
      )}

      {page === 'team' && (
        <section className="hubc-pad" style={{ padding: '160px 56px 120px' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: CRIMSON, marginBottom: 22 }}>Team</div>
            <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(40px, 6vw, 84px)', lineHeight: 1, letterSpacing: '-0.02em', margin: '0 0 24px' }}>Executive leadership</h1>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(23,20,15,0.6)', maxWidth: '52ch', margin: '0 0 72px' }}>
              Builders, researchers, and organizers from across the College — with faculty support from SEAS.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px 32px' }}>
              <Person photo="/antonia.jpg" name="Antonia Kolb" role="President · '28" position="center 22%" />
              <Person photo="/hudson.jpg" name="Hudson Brown" role="Treasurer · '28" />
              <Person photo="/sasha.jpg" name="Sasha Minsky" role="Head of Growth · '28" />
              <Person photo="/tyler.jpeg" name="Tyler Dang" role="Operations Director · '28" position="center 25%" />
              <Person photo="/will.jpeg" name="Will Brunner" role="Marketing & Communications · '28" />
              <Person photo="/david.jpeg" name="David Parkes" role="Faculty Advisor" note="John A. Paulson Dean, Harvard SEAS" position="center 25%" />
            </div>

            <div style={{ marginTop: 110, borderTop: '1px solid rgba(23,20,15,0.12)', paddingTop: 56, display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', alignItems: 'end' }}>
              <div>
                <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(28px, 3.4vw, 46px)', lineHeight: 1.1, margin: '0 0 12px', maxWidth: '20ch' }}>
                  Interested in partnering with us?
                </h3>
                <p style={{ fontSize: 16, color: 'rgba(23,20,15,0.6)', margin: 0, maxWidth: '46ch' }}>
                  We work with protocols, funds, and research groups on sponsorship, speakers, and student projects.
                </p>
              </div>
              <a className="hubc-btn-solid" href={EMAIL} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '16px 30px', background: CRIMSON, color: '#fff', borderRadius: 2, whiteSpace: 'nowrap', transition: 'background 0.25s ease' }}>
                Get in touch
              </a>
            </div>
          </div>
        </section>
      )}

      <footer className="hubc-foot hubc-pad" style={{ borderTop: '1px solid rgba(23,20,15,0.08)', padding: '32px 56px', background: '#fff' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', color: 'rgba(23,20,15,0.42)' }}>
            © {new Date().getFullYear()} Harvard Undergraduate Blockchain Club · Cambridge, MA
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {SOCIALS.map((s) => <SocialIcon key={s.label} {...s} />)}
          </div>
        </div>
      </footer>
    </div>
  );
}
