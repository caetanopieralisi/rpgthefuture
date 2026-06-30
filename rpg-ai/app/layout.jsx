export const metadata = { title: "RPG The Future" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          :root {
            --bg: #080f18;
            --surface: #0d1b2a;
            --card: #111e2e;
            --border: #1e3448;
            --teal: #4dd0c4;
            --teal-dim: #2a8a82;
            --teal-glow: rgba(77,208,196,0.15);
            --text: #c8e6e4;
            --muted: #6b8fa8;
            --danger: #ff6b6b;
            --gold: #f0c060;
          }
          body {
            background: var(--bg);
            color: var(--text);
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          a { color: var(--teal); text-decoration: none; }
          input, textarea, select {
            background: var(--surface);
            border: 1px solid var(--border);
            color: var(--text);
            border-radius: 8px;
            padding: 10px 14px;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }
          input:focus, textarea:focus { border-color: var(--teal); }
          button {
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            border: none;
            border-radius: 8px;
            transition: all 0.2s;
          }
          .btn-primary {
            background: var(--teal);
            color: #080f18;
            padding: 10px 20px;
            font-weight: 600;
          }
          .btn-primary:hover { background: #6ee0d6; box-shadow: 0 0 16px var(--teal-glow); }
          .btn-secondary {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text);
            padding: 8px 16px;
          }
          .btn-secondary:hover { border-color: var(--teal); color: var(--teal); }
          .btn-danger {
            background: transparent;
            border: 1px solid transparent;
            color: var(--muted);
            padding: 4px 10px;
            font-size: 13px;
          }
          .btn-danger:hover { color: var(--danger); }
          .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
          }
          .tag {
            display: inline-block;
            background: var(--teal-glow);
            border: 1px solid var(--teal-dim);
            color: var(--teal);
            border-radius: 6px;
            padding: 2px 10px;
            font-size: 12px;
          }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: var(--surface); }
          ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: var(--teal-dim); }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
          .loading-dot { animation: pulse 1.2s infinite; }
        `}</style>
      </head>
      <body>
        <NavBar />
        <div style={{ flex: 1 }}>{children}</div>
      </body>
    </html>
  );
}

function NavBar() {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '0 24px', height: 64,
      background: 'var(--card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <img src="/logo.png" alt="logo" style={{ height: 40 }} />
      <div style={{ flex: 1 }} />
      <NavLinks />
    </nav>
  );
}

function NavLinks() {
  const links = [
    { href: '/', label: '⚔️ Chat' },
    { href: '/player', label: '🪙 Banco' },
    { href: '/admin', label: '🛡️ Admin' },
  ];
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {links.map(l => (
        <a key={l.href} href={l.href} style={{
          padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
          color: 'var(--text)', transition: 'all 0.2s'
        }}
          onMouseEnter={e => { e.target.style.background = 'var(--teal-glow)'; e.target.style.color = 'var(--teal)'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text)'; }}
        >{l.label}</a>
      ))}
    </div>
  );
}
