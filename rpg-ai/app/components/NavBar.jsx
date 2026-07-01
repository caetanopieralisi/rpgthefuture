"use client";
import { useState } from "react";

export default function NavBar() {
  const links = [
    { href: "/", label: "⚔️ Chat" },
    { href: "/player", label: "🪙 Banco" },
    { href: "/admin", label: "🛡️ Admin" },
  ];
  return (
    <nav style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "0 24px", height: 64,
      background: "var(--card)",
      borderBottom: "1px solid var(--border)",
      position: "sticky", top: 0, zIndex: 100
    }}>
      <img src="/logo.png" alt="logo" style={{ height: 40 }} />
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", gap: 4 }}>
        {links.map(l => <NavLink key={l.href} href={l.href} label={l.label} />)}
      </div>
    </nav>
  );
}

function NavLink({ href, label }) {
  const [hover, setHover] = useState(false);
  return (
    <a href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
        color: hover ? "var(--teal)" : "var(--text)",
        background: hover ? "var(--teal-glow)" : "transparent",
        transition: "all 0.15s"
      }}>
      {label}
    </a>
  );
}
