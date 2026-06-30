"use client";
import { useState, useEffect, useRef } from "react";

export default function Admin() {
  const [tab, setTab] = useState("files");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [context, setContext] = useState("");
  const [prompt, setPrompt] = useState("");
  const [promptSaved, setPromptSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileRef = useRef();

  useEffect(() => { loadFiles(); loadPrompt(); }, []);

  async function loadFiles() {
    const r = await fetch("/api/files");
    const d = await r.json();
    setFiles(d.files || []);
  }

  async function loadPrompt() {
    const r = await fetch("/api/prompt");
    const d = await r.json();
    setPrompt(d.prompt || "");
  }

  async function upload() {
    if (!selectedFiles.length && !context.trim()) return;
    setUploading(true);
    setUploadResults([]);
    const form = new FormData();
    for (const f of selectedFiles) form.append("files", f);
    if (context.trim()) form.append("context", context);
    const r = await fetch("/api/upload", { method: "POST", body: form });
    const d = await r.json();
    setUploadResults(d.results || []);
    setSelectedFiles([]);
    setContext("");
    setUploading(false);
    loadFiles();
  }

  async function deleteFile(source) {
    if (!confirm(`Remover "${source}" do índice?`)) return;
    await fetch("/api/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source })
    });
    loadFiles();
  }

  async function savePrompt() {
    await fetch("/api/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    setPromptSaved(true);
    setTimeout(() => setPromptSaved(false), 2000);
  }

  function onDrop(e) {
    e.preventDefault(); setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
    setSelectedFiles(prev => [...prev, ...dropped]);
  }

  const tabs = [
    { id: "files", label: "📄 Arquivos & Contexto" },
    { id: "prompt", label: "🤖 Instruções do Agente" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontFamily: "Cinzel", fontSize: 22, color: "var(--teal)", letterSpacing: 1, marginBottom: 24 }}>Painel do Mestre</h1>

      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 20px", borderRadius: "8px 8px 0 0",
            background: tab === t.id ? "var(--card)" : "transparent",
            color: tab === t.id ? "var(--teal)" : "var(--muted)",
            borderBottom: tab === t.id ? "2px solid var(--teal)" : "2px solid transparent",
            fontSize: 14, fontWeight: 500
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "files" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Upload area */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>Enviar PDFs</h3>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${dragOver ? "var(--teal)" : "var(--border)"}`,
                borderRadius: 10, padding: 32, textAlign: "center", cursor: "pointer",
                background: dragOver ? "var(--teal-glow)" : "var(--surface)",
                transition: "all 0.2s", marginBottom: 12
              }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>Arraste PDFs aqui ou clique para selecionar</p>
              <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>Vários arquivos de uma vez</p>
              <input ref={fileRef} type="file" accept="application/pdf" multiple style={{ display: "none" }}
                onChange={e => setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)])} />
            </div>

            {selectedFiles.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {selectedFiles.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--surface)", borderRadius: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, flex: 1, color: "var(--teal)" }}>📄 {f.name}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{(f.size/1024).toFixed(0)} KB</span>
                    <button className="btn-danger" onClick={() => setSelectedFiles(prev => prev.filter((_, j) => j !== i))}>✕</button>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ marginBottom: 8, fontSize: 15, fontWeight: 600 }}>Contexto adicional</h3>
            <textarea value={context} onChange={e => setContext(e.target.value)} rows={4}
              style={{ width: "100%", resize: "vertical", marginBottom: 12 }}
              placeholder="Cole aqui anotações, descrições de NPCs, regras da casa, eventos da campanha..." />

            <button className="btn-primary" onClick={upload} disabled={uploading}
              style={{ width: "100%", height: 44, opacity: uploading ? 0.7 : 1 }}>
              {uploading ? "⏳ Indexando..." : "Enviar e indexar"}
            </button>

            {uploadResults.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {uploadResults.map((r, i) => (
                  <div key={i} style={{ padding: "8px 12px", borderRadius: 6, marginBottom: 4, fontSize: 13,
                    background: r.ok ? "rgba(77,208,196,0.08)" : "rgba(255,107,107,0.08)",
                    border: `1px solid ${r.ok ? "var(--teal-dim)" : "var(--danger)"}`,
                    color: r.ok ? "var(--teal)" : "var(--danger)"
                  }}>
                    {r.ok ? "✅" : "❌"} {r.source} {r.chunks ? `(${r.chunks} blocos)` : ""} {r.error || ""}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Arquivos indexados */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>Arquivos indexados ({files.length})</h3>
            {files.length === 0 && <p style={{ color: "var(--muted)", fontSize: 14 }}>Nenhum arquivo ainda.</p>}
            {files.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                background: "var(--surface)", borderRadius: 8, marginBottom: 6
              }}>
                <span style={{ fontSize: 13, flex: 1 }}>{f.source.startsWith("contexto-manual") ? "📝" : "📄"} {f.source}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{f.chunks} blocos</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(f.created_at).toLocaleDateString("pt-br")}</span>
                <button className="btn-danger" onClick={() => deleteFile(f.source)}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "prompt" && (
        <div className="card">
          <h3 style={{ marginBottom: 4, fontSize: 15, fontWeight: 600 }}>Instruções do Agente (System Prompt)</h3>
          <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>
            Defina a personalidade, tom e comportamento do Mestre IA. Estas instruções são enviadas em toda conversa.
          </p>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={14}
            style={{ width: "100%", resize: "vertical", fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}
            placeholder="Ex: Você é o Mestre do RPG The Future 4.0. Responda com tom épico e imersivo..." />
          <button className="btn-primary" onClick={savePrompt} style={{ height: 44 }}>
            {promptSaved ? "✅ Salvo!" : "Salvar instruções"}
          </button>
        </div>
      )}
    </div>
  );
}
