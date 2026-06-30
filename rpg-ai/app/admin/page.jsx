"use client";
import { useState, useEffect, useRef } from "react";

export default function Admin() {
  const [tab, setTab] = useState("files");

  const tabs = [
    { id: "files", label: "📄 Arquivos & Contexto" },
    { id: "prompt", label: "🤖 Instruções do Agente" },
    { id: "bank", label: "🏦 Banco dos Jogadores" },
  ];

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontFamily:"Cinzel", fontSize:22, color:"var(--teal)", letterSpacing:1, marginBottom:24 }}>
        Painel do Mestre
      </h1>
      <div style={{ display:"flex", gap:4, marginBottom:24, borderBottom:"1px solid var(--border)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:"10px 18px", borderRadius:"8px 8px 0 0", fontSize:13, fontWeight:500,
            background: tab===t.id ? "var(--card)" : "transparent",
            color: tab===t.id ? "var(--teal)" : "var(--muted)",
            borderBottom: tab===t.id ? "2px solid var(--teal)" : "2px solid transparent",
            border: tab===t.id ? "1px solid var(--border)" : "none",
            borderBottomColor: tab===t.id ? "var(--teal)" : "transparent"
          }}>{t.label}</button>
        ))}
      </div>
      {tab === "files" && <FilesTab />}
      {tab === "prompt" && <PromptTab />}
      {tab === "bank" && <BankTab />}
    </div>
  );
}

function FilesTab() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [context, setContext] = useState("");
  const [selected, setSelected] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  useEffect(() => { loadFiles(); }, []);

  async function loadFiles() {
    const r = await fetch("/api/files");
    const d = await r.json();
    setFiles(d.files || []);
  }

  async function upload() {
    if (!selected.length && !context.trim()) return;
    setUploading(true); setResults([]);
    const form = new FormData();
    selected.forEach(f => form.append("files", f));
    if (context.trim()) form.append("context", context);
    const r = await fetch("/api/upload", { method:"POST", body:form });
    const d = await r.json();
    setResults(d.results || []);
    setSelected([]); setContext("");
    setUploading(false); loadFiles();
  }

  async function del(source) {
    if (!confirm(`Remover "${source}"?`)) return;
    await fetch("/api/files", {
      method:"DELETE", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ source })
    });
    loadFiles();
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="card">
        <h3 style={{ marginBottom:14, fontSize:15, fontWeight:600 }}>Enviar PDFs</h3>
        <div onDragOver={e=>{e.preventDefault();setDragOver(true);}}
          onDragLeave={()=>setDragOver(false)}
          onDrop={e=>{e.preventDefault();setDragOver(false);
            setSelected(p=>[...p,...Array.from(e.dataTransfer.files).filter(f=>f.type==="application/pdf")]);}}
          onClick={()=>fileRef.current.click()}
          style={{
            border:`2px dashed ${dragOver?"var(--teal)":"var(--border)"}`,
            borderRadius:10, padding:28, textAlign:"center", cursor:"pointer",
            background: dragOver?"var(--teal-glow)":"var(--surface)", transition:"all 0.2s", marginBottom:12
          }}>
          <div style={{ fontSize:28, marginBottom:6 }}>📂</div>
          <p style={{ color:"var(--muted)", fontSize:14 }}>Arraste PDFs ou clique para selecionar (vários de uma vez)</p>
          <input ref={fileRef} type="file" accept="application/pdf" multiple style={{ display:"none" }}
            onChange={e=>setSelected(p=>[...p,...Array.from(e.target.files)])} />
        </div>
        {selected.length > 0 && selected.map((f,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px",
            background:"var(--surface)", borderRadius:6, marginBottom:4 }}>
            <span style={{ fontSize:13, flex:1, color:"var(--teal)" }}>📄 {f.name}</span>
            <span style={{ fontSize:12, color:"var(--muted)" }}>{(f.size/1024).toFixed(0)} KB</span>
            <button className="btn-danger" onClick={()=>setSelected(p=>p.filter((_,j)=>j!==i))}>✕</button>
          </div>
        ))}
        <h3 style={{ margin:"14px 0 8px", fontSize:14, fontWeight:600 }}>Contexto adicional</h3>
        <textarea value={context} onChange={e=>setContext(e.target.value)} rows={4}
          style={{ width:"100%", resize:"vertical", marginBottom:12 }}
          placeholder="Anotações, regras da casa, descrição de NPCs, eventos..." />
        <button className="btn-primary" onClick={upload} disabled={uploading}
          style={{ width:"100%", height:44, opacity:uploading?0.7:1 }}>
          {uploading ? "⏳ Indexando... (pode demorar)" : "Enviar e indexar"}
        </button>
        {results.map((r,i)=>(
          <div key={i} style={{ marginTop:8, padding:"8px 12px", borderRadius:6, fontSize:13,
            background:r.ok?"rgba(77,208,196,0.08)":"rgba(255,107,107,0.08)",
            border:`1px solid ${r.ok?"var(--teal-dim)":"var(--danger)"}`,
            color:r.ok?"var(--teal)":"var(--danger)" }}>
            {r.ok?"✅":"❌"} {r.source} — {r.ok?`${r.indexed}/${r.chunks} blocos indexados`:r.error}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom:14, fontSize:15, fontWeight:600 }}>Arquivos indexados ({files.length})</h3>
        {files.length===0 && <p style={{ color:"var(--muted)", fontSize:14 }}>Nenhum arquivo ainda.</p>}
        {files.map((f,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
            background:"var(--surface)", borderRadius:8, marginBottom:6 }}>
            <span style={{ fontSize:13, flex:1 }}>{f.source.startsWith("contexto")?"📝":"📄"} {f.source}</span>
            <span className="tag">{f.chunks} blocos</span>
            <span style={{ fontSize:11, color:"var(--muted)" }}>{new Date(f.created_at).toLocaleDateString("pt-br")}</span>
            <button className="btn-danger" onClick={()=>del(f.source)}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromptTab() {
  const [prompt, setPrompt] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/prompt").then(r=>r.json()).then(d=>setPrompt(d.prompt||""));
  }, []);

  async function save() {
    await fetch("/api/prompt", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ prompt })
    });
    setSaved(true); setTimeout(()=>setSaved(false), 2000);
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom:4, fontSize:15, fontWeight:600 }}>Instruções do Agente</h3>
      <p style={{ color:"var(--muted)", fontSize:13, marginBottom:16 }}>
        Personalidade, tom e comportamento do Mestre IA em toda conversa.
      </p>
      <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={16}
        style={{ width:"100%", resize:"vertical", fontSize:14, lineHeight:1.6, marginBottom:12 }} />
      <button className="btn-primary" onClick={save} style={{ height:44 }}>
        {saved ? "✅ Salvo!" : "Salvar instruções"}
      </button>
    </div>
  );
}

function BankTab() {
  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [txType, setTxType] = useState("credit");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadPlayers(); }, []);

  async function loadPlayers() {
    const r = await fetch("/api/players");
    const d = await r.json();
    setPlayers(d.players || []);
  }

  async function selectPlayer(p) {
    setSelected(p);
    const r = await fetch(`/api/ledger?player=${encodeURIComponent(p.name)}&pin=${p.pin||"__admin__"}`);
    // admin acessa direto via players API - busca transações
    const { data: txs } = await fetch(`/api/players/${p.id}/transactions`).then(()=>({data:[]})).catch(()=>({data:[]}));
    // fallback: busca via supabase direto não é possível no client, vamos via nova rota
    loadPlayerTx(p.id);
  }

  async function loadPlayerTx(pid) {
    const r = await fetch(`/api/players?id=${pid}`);
    // precisamos de rota específica — por ora mostramos via ledger admin
    setTransactions([]);
  }

  async function adminTx() {
    if (!selected || !amount) return;
    setLoading(true);
    const finalAmount = txType==="debit" ? -Math.abs(Number(amount)) : Math.abs(Number(amount));
    await fetch("/api/players", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ player_id: selected.id, amount: finalAmount, description: desc || (txType==="debit"?"Gasto admin":"Crédito admin") })
    });
    setAmount(""); setDesc("");
    setLoading(false);
    const r = await fetch("/api/players");
    const d = await r.json();
    setPlayers(d.players||[]);
    const updated = (d.players||[]).find(p=>p.id===selected.id);
    if (updated) setSelected(updated);
  }

  return (
    <div style={{ display:"flex", gap:20 }}>
      {/* Lista de jogadores */}
      <div style={{ width:240, flexShrink:0 }}>
        <div className="card" style={{ padding:12 }}>
          <h3 style={{ fontSize:13, fontWeight:600, marginBottom:12, color:"var(--muted)", letterSpacing:1 }}>JOGADORES</h3>
          {players.length===0 && <p style={{ color:"var(--muted)", fontSize:13 }}>Nenhum jogador ainda.</p>}
          {players.map(p=>(
            <div key={p.id} onClick={()=>setSelected(p)}
              style={{ padding:"10px 12px", borderRadius:8, marginBottom:4, cursor:"pointer",
                background: selected?.id===p.id ? "var(--teal-glow)" : "var(--surface)",
                border: `1px solid ${selected?.id===p.id ? "var(--teal-dim)" : "transparent"}`,
                transition:"all 0.15s" }}>
              <p style={{ fontSize:13, fontWeight:500 }}>🧙 {p.name}</p>
              <p style={{ fontSize:12, color: Number(p.balance)>=0?"var(--gold)":"var(--danger)", marginTop:2 }}>
                {Number(p.balance)} moedas
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Detalhe do jogador */}
      <div style={{ flex:1 }}>
        {!selected ? (
          <div className="card" style={{ textAlign:"center", padding:40 }}>
            <p style={{ color:"var(--muted)", fontSize:14 }}>Selecione um jogador para ver detalhes</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Header do jogador */}
            <div className="card" style={{ background:"linear-gradient(135deg,#0d1b2a,#112233)", border:"1px solid var(--teal-dim)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <p style={{ fontSize:11, color:"var(--muted)", letterSpacing:1 }}>PERSONAGEM</p>
                  <h2 style={{ fontFamily:"Cinzel", fontSize:20 }}>{selected.name}</h2>
                  <p style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>
                    Desde {new Date(selected.created_at).toLocaleDateString("pt-br")}
                  </p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontSize:11, color:"var(--muted)", letterSpacing:1 }}>SALDO</p>
                  <h2 style={{ fontFamily:"Cinzel", fontSize:28, color:Number(selected.balance)>=0?"var(--gold)":"var(--danger)" }}>
                    {Number(selected.balance)} <span style={{ fontSize:14 }}>moedas</span>
                  </h2>
                </div>
              </div>
            </div>

            {/* Lançar admin */}
            <div className="card">
              <h3 style={{ fontSize:14, fontWeight:600, marginBottom:12 }}>Lançar transação (admin)</h3>
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                <button onClick={()=>setTxType("credit")} style={{
                  flex:1, padding:"8px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer",
                  background:txType==="credit"?"rgba(77,208,196,0.15)":"var(--surface)",
                  border:txType==="credit"?"1px solid var(--teal)":"1px solid var(--border)",
                  color:txType==="credit"?"var(--teal)":"var(--muted)"}}>+ Dar moedas</button>
                <button onClick={()=>setTxType("debit")} style={{
                  flex:1, padding:"8px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer",
                  background:txType==="debit"?"rgba(255,107,107,0.1)":"var(--surface)",
                  border:txType==="debit"?"1px solid var(--danger)":"1px solid var(--border)",
                  color:txType==="debit"?"var(--danger)":"var(--muted)"}}>- Cobrar moedas</button>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Qtd" type="number"
                  style={{ width:90 }} />
                <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Motivo"
                  style={{ flex:1 }} onKeyDown={e=>e.key==="Enter"&&adminTx()} />
                <button className="btn-primary" onClick={adminTx} disabled={loading||!amount}
                  style={{ padding:"0 20px" }}>OK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
