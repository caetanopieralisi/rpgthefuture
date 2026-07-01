"use client";
import { useState } from "react";

export default function Player() {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [txType, setTxType] = useState("credit");
  const [txLoading, setTxLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  async function login() {
    setLoading(true); setError("");
    try {
      const r = await fetch(`/api/ledger?player=${encodeURIComponent(name.trim())}&pin=${pin.trim()}`);
      const d = await r.json();
      if (d.error && d.error.includes("não encontrado")) {
        setCreating(true); setLoading(false); return;
      }
      if (d.error) { setError(d.error); setLoading(false); return; }
      setData(d);
    } catch (e) {
      setError("Falha ao conectar com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/ledger", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name:name.trim(), pin:pin.trim(), amount:0, description:"Conta criada" })
      });
      const d = await r.json();
      if (d.error) { setError(d.error); setLoading(false); return; }
      const r2 = await fetch(`/api/ledger?player=${encodeURIComponent(name.trim())}&pin=${pin.trim()}`);
      setData(await r2.json()); setCreating(false);
    } catch (e) {
      setError("Falha ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    const r = await fetch(`/api/ledger?player=${encodeURIComponent(name.trim())}&pin=${pin.trim()}`);
    setData(await r.json());
  }

  async function addTx() {
    if (!amount) return;
    setTxLoading(true);
    const finalAmount = txType==="debit" ? -Math.abs(Number(amount)) : Math.abs(Number(amount));
    const r = await fetch("/api/ledger", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ name:name.trim(), pin:pin.trim(), amount:finalAmount, description:desc||"Transação" })
    });
    const d = await r.json();
    if (d.error) alert(d.error);
    setAmount(""); setDesc(""); setTxLoading(false); refresh();
  }

  if (creating) return (
    <div style={{ maxWidth:420, margin:"80px auto", padding:"0 24px" }}>
      <div className="card" style={{ textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>⚔️</div>
        <h2 style={{ fontFamily:"Cinzel", fontSize:18, color:"var(--teal)", marginBottom:8 }}>Personagem não encontrado</h2>
        <p style={{ color:"var(--muted)", fontSize:13, marginBottom:20 }}>
          Deseja criar a conta de <b style={{ color:"var(--text)" }}>{name}</b> com este PIN?
        </p>
        {error && <p style={{ color:"var(--danger)", fontSize:13, marginBottom:10 }}>{error}</p>}
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn-secondary" onClick={()=>setCreating(false)} style={{ flex:1, height:42 }}>Voltar</button>
          <button className="btn-primary" onClick={create} disabled={loading} style={{ flex:1, height:42 }}>
            {loading?"Criando...":"Criar conta"}
          </button>
        </div>
      </div>
    </div>
  );

  if (!data) return (
    <div style={{ maxWidth:420, margin:"80px auto", padding:"0 24px" }}>
      <div className="card" style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🏦</div>
        <h1 style={{ fontFamily:"Cinzel", fontSize:20, color:"var(--teal)", marginBottom:4 }}>Banco do Aventureiro</h1>
        <p style={{ color:"var(--muted)", fontSize:13, marginBottom:24 }}>Acesse sua conta com nome e PIN</p>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do personagem"
          style={{ width:"100%", marginBottom:10, textAlign:"center" }} />
        <input value={pin} onChange={e=>setPin(e.target.value)} placeholder="PIN"
          type="password" style={{ width:"100%", marginBottom:16, textAlign:"center" }}
          onKeyDown={e=>e.key==="Enter"&&login()} />
        {error && <p style={{ color:"var(--danger)", fontSize:13, marginBottom:10 }}>{error}</p>}
        <button className="btn-primary" onClick={login} disabled={loading||!name||!pin}
          style={{ width:"100%", height:44, opacity:loading?0.7:1 }}>
          {loading?"Verificando...":"Acessar"}
        </button>
      </div>
    </div>
  );

  const balance = Number(data.player?.balance ?? 0);
  const txs = data.transactions || [];
  const totalIn = txs.filter(t=>Number(t.amount)>0).reduce((a,b)=>a+Number(b.amount),0);
  const totalOut = Math.abs(txs.filter(t=>Number(t.amount)<0).reduce((a,b)=>a+Number(b.amount),0));

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"32px 24px" }}>
      {/* Cartão de conta */}
      <div className="card" style={{ marginBottom:20, background:"linear-gradient(135deg,#0d1b2a 0%,#0a2030 100%)", border:"1px solid var(--teal-dim)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-20, top:-20, width:120, height:120, borderRadius:"50%", background:"var(--teal-glow)", filter:"blur(40px)" }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <p style={{ fontSize:11, color:"var(--muted)", letterSpacing:2, marginBottom:4 }}>BANCO DO AVENTUREIRO</p>
            <h2 style={{ fontFamily:"Cinzel", fontSize:22 }}>{data.player.name}</h2>
          </div>
          <div style={{ fontSize:28 }}>🧙</div>
        </div>
        <div style={{ margin:"20px 0 0" }}>
          <p style={{ fontSize:11, color:"var(--muted)", letterSpacing:2 }}>SALDO ATUAL</p>
          <h1 style={{ fontFamily:"Cinzel", fontSize:36, color:balance>=0?"var(--gold)":"var(--danger)", margin:"4px 0" }}>
            {balance.toLocaleString("pt-br")} <span style={{ fontSize:16, color:"var(--muted)" }}>moedas de ouro</span>
          </h1>
        </div>
        <div style={{ display:"flex", gap:24, marginTop:16, paddingTop:16, borderTop:"1px solid var(--border)" }}>
          <div>
            <p style={{ fontSize:11, color:"var(--muted)" }}>RECEBIDO</p>
            <p style={{ color:"var(--teal)", fontWeight:600, fontSize:15 }}>+{totalIn.toLocaleString("pt-br")}</p>
          </div>
          <div>
            <p style={{ fontSize:11, color:"var(--muted)" }}>GASTO</p>
            <p style={{ color:"var(--danger)", fontWeight:600, fontSize:15 }}>-{totalOut.toLocaleString("pt-br")}</p>
          </div>
          <div>
            <p style={{ fontSize:11, color:"var(--muted)" }}>TRANSAÇÕES</p>
            <p style={{ fontWeight:600, fontSize:15 }}>{txs.length}</p>
          </div>
        </div>
      </div>

      {/* Nova transação — só jogador lançando seus próprios gastos/receitas */}
      <div className="card" style={{ marginBottom:20 }}>
        <h3 style={{ fontSize:14, fontWeight:600, marginBottom:12 }}>Registrar movimentação</h3>
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          <button onClick={()=>setTxType("credit")} style={{
            flex:1, padding:"8px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer",
            background:txType==="credit"?"rgba(77,208,196,0.15)":"var(--surface)",
            border:txType==="credit"?"1px solid var(--teal)":"1px solid var(--border)",
            color:txType==="credit"?"var(--teal)":"var(--muted)"}}>+ Recebi moedas</button>
          <button onClick={()=>setTxType("debit")} style={{
            flex:1, padding:"8px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer",
            background:txType==="debit"?"rgba(255,107,107,0.1)":"var(--surface)",
            border:txType==="debit"?"1px solid var(--danger)":"1px solid var(--border)",
            color:txType==="debit"?"var(--danger)":"var(--muted)"}}>- Gastei moedas</button>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Qtd." type="number"
            style={{ width:100 }} />
          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="O que foi? (ex: comprou poção)"
            style={{ flex:1 }} onKeyDown={e=>e.key==="Enter"&&addTx()} />
          <button className="btn-primary" onClick={addTx} disabled={txLoading||!amount}>
            {txLoading?"...":"Registrar"}
          </button>
        </div>
      </div>

      {/* Extrato */}
      <div className="card">
        <h3 style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>Extrato completo</h3>
        {txs.length===0 && <p style={{ color:"var(--muted)", fontSize:14, textAlign:"center", padding:20 }}>Nenhuma movimentação ainda.</p>}
        {txs.map((t,i)=>(
          <div key={i} style={{
            display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
            background:"var(--surface)", borderRadius:8, marginBottom:6,
            borderLeft:`3px solid ${Number(t.amount)>=0?"var(--teal)":"var(--danger)"}`
          }}>
            <div style={{ fontSize:18 }}>{Number(t.amount)>=0?"💰":"🛒"}</div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14 }}>{t.description}</p>
              <p style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>
                {new Date(t.created_at).toLocaleString("pt-br")}
              </p>
            </div>
            <span style={{ fontFamily:"Cinzel", fontSize:16, fontWeight:700,
              color:Number(t.amount)>=0?"var(--teal)":"var(--danger)" }}>
              {Number(t.amount)>=0?"+":""}{Number(t.amount).toLocaleString("pt-br")}
            </span>
          </div>
        ))}
      </div>

      <button className="btn-secondary" onClick={()=>{ setData(null); setName(""); setPin(""); }}
        style={{ marginTop:16, width:"100%", height:40, fontSize:13 }}>
        Sair da conta
      </button>
    </div>
  );
}
