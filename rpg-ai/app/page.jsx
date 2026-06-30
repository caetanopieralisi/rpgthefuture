"use client";
import { useState, useRef, useEffect } from "react";

export default function Chat() {
  const [q, setQ] = useState("");
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [log]);

  async function ask() {
    if (!q.trim() || loading) return;
    const question = q.trim();
    setQ("");
    const history = log.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
    setLog(l => [...l, { role: "user", text: question }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history })
      });
      const data = await res.json();
      setLog(l => [...l, { role: "ai", text: data.answer || data.error }]);
    } catch {
      setLog(l => [...l, { role: "ai", text: "Erro ao conectar com o servidor." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px", height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "Cinzel", fontSize: 22, color: "var(--teal)", letterSpacing: 1 }}>Oráculo da Campanha</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>Faça perguntas sobre o universo, regras e lore do jogo</p>
      </div>

      <div style={{
        flex: 1, overflowY: "auto", padding: "16px 0", display: "flex", flexDirection: "column", gap: 16
      }}>
        {log.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--muted)", marginTop: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔮</div>
            <p style={{ fontFamily: "Cinzel", fontSize: 15 }}>O oráculo aguarda sua pergunta...</p>
          </div>
        )}
        {log.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "75%",
              padding: "12px 16px",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? "var(--teal)" : "var(--card)",
              border: m.role === "user" ? "none" : "1px solid var(--border)",
              color: m.role === "user" ? "#080f18" : "var(--text)",
              fontSize: 14, lineHeight: 1.6,
              boxShadow: m.role === "ai" ? "0 0 20px rgba(77,208,196,0.05)" : "none"
            }}>
              {m.role === "ai" && <div style={{ fontSize: 11, color: "var(--teal)", fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>MESTRE IA</div>}
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "12px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px 16px 16px 4px" }}>
              <div style={{ fontSize: 11, color: "var(--teal)", fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>MESTRE IA</div>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {[0,1,2].map(i => (
                  <div key={i} className="loading-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--teal)", animationDelay: `${i*0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && ask()}
          style={{ flex: 1, height: 48, fontSize: 14 }}
          placeholder="Pergunte sobre o jogo, regras, lore..."
        />
        <button className="btn-primary" onClick={ask} disabled={loading} style={{ height: 48, padding: "0 24px", opacity: loading ? 0.6 : 1 }}>
          Enviar
        </button>
      </div>
    </div>
  );
}
