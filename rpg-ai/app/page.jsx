"use client";
import { useState } from "react";

export default function Chat() {
  const [q, setQ] = useState("");
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!q.trim()) return;
    setLog(l => [...l, { role: "user", text: q }]);
    setLoading(true);
    const question = q;
    setQ("");
    const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ question }) });
    const data = await res.json();
    setLog(l => [...l, { role: "ai", text: data.answer || data.error }]);
    setLoading(false);
  }

  return (
    <div>
      <h2 style={{ color: "#4dd0c4" }}>Pergunte ao Mestre IA</h2>
      <div style={{ background: "#13283d", borderRadius: 12, padding: 16, minHeight: 300 }}>
        {log.map((m, i) => (
          <p key={i} style={{ color: m.role === "user" ? "#fff" : "#4dd0c4" }}>
            <b>{m.role === "user" ? "Você" : "Mestre"}:</b> {m.text}
          </p>
        ))}
        {loading && <p style={{ color: "#4dd0c4" }}>Pensando...</p>}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()}
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "none" }} placeholder="Digite sua pergunta..." />
        <button onClick={ask} style={{ background: "#4dd0c4", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: "bold" }}>Enviar</button>
      </div>
    </div>
  );
}
