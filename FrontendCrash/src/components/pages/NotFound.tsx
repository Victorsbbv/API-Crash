import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "4rem", color: "var(--accent-cyan)", lineHeight: 1 }}>404</div>
            <h2 className="page-title">Página <span className="accent">não encontrada</span></h2>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                // a rota acessada não existe
            </p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}>← Voltar ao Dashboard</Link>
        </div>
    );
}

export default NotFound;
