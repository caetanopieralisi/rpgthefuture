"use client";
export default function NavBar() {
  const links = [
    { href: "/", label: "⚔️ Chat" },
    { href: "/player", label: "🪙 Banco" },
    { href: "/admin", label: "🛡️ Admin" },
  ];
  return (
    <nav style={{
      display:"flex", alignItems:"center", gap:12,
      padding:"0 24px", height:64,
      background:"var(--card)",
      borderBottom:"1px solid var(--border)",
      position:"sticky", top:0, zIndex:100
    }}>
      <img src="/logo.png" alt="logo" style={{ height:40 }} />
      <div style={{ flex:1 }} />
      <div style={{ display:"flex", gap:4 }}>
        {links.map(l => (
          <a key={l.href} href={l.href} style={{
            padding:"8px 16px", borderRadius:8, fontSize:14, fontWeight:500, color:"var(--text)"
          }}
            onMouseEnter={e=>{e.target.style.background="var(--teal-glow)";e.target.style.color="var(--teal)";}}
            onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="var(--text)";}}
          >{l.label}</a>
        ))}
      </div>
    </nav>
  );
}
