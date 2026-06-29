export const metadata = { title: "RPG AI" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body style={{
        margin: 0,
        background: "#0d1b2a",
        color: "#e6fffa",
        fontFamily: "system-ui, sans-serif",
        minHeight: "100vh"
      }}>
        <header style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 24px", background: "#13283d", borderBottom: "2px solid #4dd0c4"
        }}>
          <img src="/logo.png" alt="logo" style={{ height: 48 }} />
          <nav style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
            <a href="/" style={{ color: "#4dd0c4", textDecoration: "none" }}>Chat</a>
            <a href="/player" style={{ color: "#4dd0c4", textDecoration: "none" }}>Meu Banco</a>
            <a href="/admin" style={{ color: "#4dd0c4", textDecoration: "none" }}>Admin</a>
          </nav>
        </header>
        <main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>{children}</main>
      </body>
    </html>
  );
}
