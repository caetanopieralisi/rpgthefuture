"use client";
import { useState } from "react";

export default function Admin() {
  const [context, setContext] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  async function send() {
    setStatus("Enviando...");
    const form = new FormData();
    if (context) form.append("context", context);
    if (file) form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setStatus(data.ok ? "Enviado e indexado com sucesso!" : "Erro: " + data.error);
    setContext(""); setFile(null);
  }

  return (
    <div>
      <h2 style={{ color: "#4dd0c4" }}>Admin — Contexto e Arquivos</h2>
      <textarea value={context} onChange={e => setContext(e.target.value)} rows={6}
        placeholder="Cole aqui contexto adicional da campanha..."
        style={{ width: "100%", borderRadius: 8, padding: 10, border: "none" }} />
      <div style={{ margin: "12px 0" }}>
        <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} />
      </div>
      <button onClick={send} style={{ background: "#4dd0c4", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: "bold" }}>
        Enviar e indexar
      </button>
      {status && <p style={{ color: "#4dd0c4" }}>{status}</p>}
    </div>
  );
}
