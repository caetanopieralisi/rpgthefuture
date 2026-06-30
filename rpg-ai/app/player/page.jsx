"use client";
import { useState } from "react";

export default function Player() {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [txType, setTxType] = useState("credit");
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);

  async function login() {
    setLoading(true); setError("");
    const r = await fetch(`/api/ledger?player=${encodeURIComponent(name.trim())}&pin=${pin.trim()}`);
    const d = await r.json();
    if (d.error) {
      // Tenta criar
      const cr = await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), pin: pin.trim(), amount: 0, description: "Conta criada" })
      });
      const cd = await cr.json();
      if (cd.error) { setError(cd.error); setLoading(false); return; }
      const r2 = await fetch(`/api/ledger?player=${encodeURIComponent(name.trim())}&pin=${pin.trim()}`);
      setData(await r2.json());
    } else {
      setData(d);
    }
    setLoading(false);
  }

  async function refresh() {
    const r = await fetch(`/api/ledger?player=${encodeURIComponent(name.trim())}&pin=${pin.trim()}`);
    setData(await r.json());
  }

  async function addTx() {
    if (!amount) return;
    setTxLoading(true);
    const finalAmount = txType === "debit" ? -Math.abs(Number(amount)) : Math.abs(Number(amount));
    const r = await fetch("/api/ledger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), pin: pin.trim(), amount: finalAmount, description: desc || (txType === "debit" ? "Gasto" : "Recebimento") })
    });
    const d = await r.json();
    if (d.error) { alert(d.error); }
    setAmount(""); setDesc("");
    setTxLoading(false);
    refresh();
  }

  if (!data) {
    return (
      <div style={{ maxWidth: 420, margin: "80px auto", padding: "0 24px" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏦</div>
          <h1 style={{ fontFamily: "Cinzel", fontSize: 20, color: "var(--teal)", marginBottom: 4 }}>Banco do Aventureiro</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Entre com seu personagem ou crie sua conta</p>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do personagem"
            style={{ width: "100%", marginBottom: 10 }} />
          <input value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN (4+ dígitos)"
            type="password" style={{ width: "100%", marginBottom: 16 }}
            onKeyDown={e => e.key === "Enter" && login()} />
          {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 10 }}>{error}</p>}
          <button className="btn-primary" onClick={login} disabled={loading || !name || !pin}
            style={{ width: "100%", height: 44, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Acessando..." : "Entrar / Criar conta"}
          </button>
          <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 12 }}>Conta nova é criada automaticamente</p>
        </div>
      </div>
    );
  }

  const balance = data.player?.balance ?? 0;
  const txs = data.transactions || [];
  const totalIn = txs.filter(t => t.amount > 0).reduce((a, b) => a + Number(b.amount), 0);
  const totalOut = txs.filter(t => t.amount < 0).reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: 20, background: "linear-gradient(135deg, #0d1b2a 0%, #112233 100%)", border: "1px solid var(--teal-dim)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--teal-glow)", border: "2px solid var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
            🧙
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 1 }}>PERSONAGEM</p>
            <h2 style={{ fontFamily: "Cinzel", fontSize: 20, color: "var(--text)" }}>{data.player.name}</h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 1 }}>SALDO</p>
            <h2 style={{ fontFamily: "Cinzel", fontSize: 26, color: balance >= 0 ? "var(--gold)" : "var(--danger)" }}>
              {balance} <span style={{ fontSize: 14 }}>moedas</span>
            </h2>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "var(--muted)" }}>RECEBIDO</p>
            <p style={{ color: "var(--teal)", fontWeight: 600 }}>+{totalIn}</p>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "var(--muted)" }}>GASTO</p>
            <p style={{ color: "var(--danger)", fontWeight: 600 }}>{totalOut}</p>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "var(--muted)" }}>TRANSAÇÕES</p>
            <p style={{ fontWeight: 600 }}>{txs.length}</p>
          </div>
        </div>
      </div>

      {/* Nova transação */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Lançar transação</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button onClick={() => setTxType("credit")} style={{
            flex: 1, padding: "8px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: txType === "credit" ? "rgba(77,208,196,0.15)" : "var(--surface)",
            border: txType === "credit" ? "1px solid var(--teal)" : "1px solid var(--border)",
            color: txType === "credit" ? "var(--teal)" : "var(--muted)"
          }}>+ Receber moedas</button>
          <button onClick={() => setTxType("debit")} style={{
            flex: 1, padding: "8px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: txType === "debit" ? "rgba(255,107,107,0.1)" : "var(--surface)",
            border: txType === "debit" ? "1px solid var(--danger)" : "1px solid var(--border)",
            color: txType === "debit" ? "var(--danger)" : "var(--muted)"
          }}>- Gastar moedas</button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Qtd." type="number"
            style={{ width: 100 }} />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descrição (ex: comprou poção)"
            style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && addTx()} />
          <button className="btn-primary" onClick={addTx} disabled={txLoading || !amount}>
            {txLoading ? "..." : "OK"}
          </button>
        </div>
      </div>

      {/* Extrato */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Extrato ({txs.length})</h3>
        {txs.length === 0 && <p style={{ color: "var(--muted)", fontSize: 14 }}>Nenhuma transação ainda.</p>}
        {txs.map((t, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
            background: "var(--surface)", borderRadius: 8, marginBottom: 6,
            borderLeft: `3px solid ${Number(t.amount) >= 0 ? "var(--teal)" : "var(--danger)"}`
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14 }}>{t.description || "Transação"}</p>
              <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                {new Date(t.created_at).toLocaleString("pt-br")}
              </p>
            </div>
            <span style={{
              fontFamily: "Cinzel", fontSize: 16, fontWeight: 700,
              color: Number(t.amount) >= 0 ? "var(--teal)" : "var(--danger)"
            }}>
              {Number(t.amount) >= 0 ? "+" : ""}{t.amount}
            </span>
          </div>
        ))}
      </div>

      <button className="btn-secondary" onClick={() => { setData(null); setName(""); setPin(""); }}
        style={{ marginTop: 16, width: "100%", height: 40, fontSize: 13 }}>
        Sair da conta
      </button>
    </div>
  );
}
