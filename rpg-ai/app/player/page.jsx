"use client";
import { useState } from "react";

export default function Player() {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [data, setData] = useState(null);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  async function login() {
    const res = await fetch(`/api/ledger?player=${encodeURIComponent(name)}&pin=${pin}`);
    const d = await res.json();
    if (d.error) {
      // tenta criar jogador novo
      await fetch("/api/ledger", { method: "POST", body: JSON.stringify({ name, pin, amount: 0, description: "Conta criada" }) });
      const res2 = await fetch(`/api/ledger?player=${encodeURIComponent(name)}&pin=${pin}`);
      setData(await res2.json());
    } else {
      setData(d);
    }
  }

  async function addTx() {
    await fetch("/api/ledger", { method: "POST", body: JSON.stringify({ name, pin, amount: Number(amount), description: desc }) });
    setAmount(""); setDesc("");
    login();
  }

  if (!data) {
    return (
      <div>
        <h2 style={{ color: "#4dd0c4" }}>Meu Banco</h2>
        <input placeholder="Nome do personagem" value={name} onChange={e => setName(e.target.value)}
          style={{ display: "block", marginBottom: 8, padding: 10, width: "100%", borderRadius: 8, border: "none" }} />
        <input placeholder="PIN" type="password" value={pin} onChange={e => setPin(e.target.value)}
          style={{ display: "block", marginBottom: 8, padding: 10, width: "100%", borderRadius: 8, border: "none" }} />
        <button onClick={login} style={{ background: "#4dd0c4", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: "bold" }}>Entrar / Criar conta</button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ color: "#4dd0c4" }}>Olá, {data.player.name}</h2>
      <h3>Saldo: {data.player.balance} moedas</h3>
      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input placeholder="valor (+/-)" value={amount} onChange={e => setAmount(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "none", width: 100 }} />
        <input placeholder="descrição" value={desc} onChange={e => setDesc(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "none", flex: 1 }} />
        <button onClick={addTx} style={{ background: "#4dd0c4", border: "none", borderRadius: 8, padding: "8px 12px" }}>Lançar</button>
      </div>
      <h4>Extrato</h4>
      {data.transactions.map(t => (
        <div key={t.id} style={{ background: "#13283d", borderRadius: 8, padding: 10, marginBottom: 6 }}>
          <b style={{ color: t.amount >= 0 ? "#4dd0c4" : "#ff8a80" }}>{t.amount >= 0 ? "+" : ""}{t.amount}</b> — {t.description}
          <div style={{ fontSize: 12, opacity: 0.6 }}>{new Date(t.created_at).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
