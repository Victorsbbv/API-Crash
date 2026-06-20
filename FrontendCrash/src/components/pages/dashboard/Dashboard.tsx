import { useEffect, useState } from "react";
import api from "../../../services/api";

// Retorna a cor da data de vencimento:
// vermelho = vencido, amarelo = hoje, verde = amanhã ou depois
function corVencimento(dataISO: string): string {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const vcto = new Date(dataISO); vcto.setHours(0, 0, 0, 0);
    const diff = vcto.getTime() - hoje.getTime(); // ms
    if (diff < 0)  return "var(--danger)";          // vencido
    if (diff === 0) return "var(--accent-gold)";     // hoje
    return "var(--success)";                         // amanhã ou depois
}

function Dashboard() {
    const [contasPagar, setContasPagar]       = useState<any[]>([]);
    const [baixas, setBaixas]                 = useState<any[]>([]);
    const [fornecedoresAtivos, setFornecedoresAtivos] = useState(0);
    const [saldoTotal, setSaldoTotal]         = useState(0);
    const [loading, setLoading]               = useState(true);

    useEffect(() => { carregarAPI(); }, []);

    async function carregarAPI() {
        try {
            // Carrega em paralelo; allSettled nunca rejeita, cada item tem .status
            const [rCP, rBX, rF, rCB] = await Promise.allSettled([
                api.get("/api/contapagar"),
                api.get("/api/baixa"),
                api.get("/api/fornecedores"),
                api.get("/api/contabancaria"),
            ]);

            setContasPagar(rCP.status === "fulfilled" && Array.isArray(rCP.value.data) ? rCP.value.data : []);
            setBaixas(rBX.status === "fulfilled" && Array.isArray(rBX.value.data) ? rBX.value.data : []);
            setFornecedoresAtivos(rF.status === "fulfilled" ? (rF.value.data.ativos ?? []).length : 0);
            if (rCB.status === "fulfilled") {
                const ativos: any[] = rCB.value.data.ativos ?? [];
                setSaldoTotal(ativos.reduce((s, b) => s + (b.saldo ?? 0), 0));
            }
        } catch (error) {
            console.log("Dashboard erro:", error);
        } finally {
            setLoading(false);
        }
    }

    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const fmtCompact = (v: number) => {
        const a = Math.abs(v);
        if (a >= 1e9) return `R$ ${(v / 1e9).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} Bi`;
        if (a >= 1e6) return `R$ ${(v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} Mi`;
        return fmt(v);
    };

    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const pagas     = contasPagar.filter(c => c.pago);
    const pendentes = contasPagar.filter(c => !c.pago);
    const totalPago     = pagas.reduce((s, c) => s + c.valor, 0);
    const totalPendente = pendentes.reduce((s, c) => s + c.valor, 0);
    const vencidas  = pendentes.filter(c => {
        const v = new Date(c.dataVencimento); v.setHours(0, 0, 0, 0);
        return v.getTime() < hoje.getTime();
    }).length;

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 40, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            <div className="spinner" style={{ width: 18, height: 18 }} />
            Carregando dashboard...
        </div>
    );

    return (
        <div className="Dashboard">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Visão <span className="accent">Geral</span></h2>
                    <p className="page-subtitle">// resumo financeiro em tempo real</p>
                </div>
            </div>

            <div className="page-body">
                <div className="stats-grid" style={{ marginBottom: 32 }}>
                    <div className="stat-card">
                        <div className="stat-label">Saldo Total</div>
                        <div className="stat-value cyan">{fmtCompact(saldoTotal)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">A Pagar</div>
                        <div className="stat-value danger">{fmtCompact(totalPendente)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Pago (total)</div>
                        <div className="stat-value success">{fmtCompact(totalPago)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Títulos Vencidos</div>
                        <div className="stat-value gold">{vencidas}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Fornecedores Ativos</div>
                        <div className="stat-value">{fornecedoresAtivos}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Baixas Realizadas</div>
                        <div className="stat-value">{baixas.length}</div>
                    </div>
                </div>

                <div className="section-header" style={{ marginBottom: 12 }}>
                    <span className="section-title"><span className="dot" />Contas Recentes a Pagar</span>
                </div>

                <div className="table-container">
                    {contasPagar.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📋</div>
                            <div className="empty-title">Nenhuma conta registrada</div>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Fornecedor</th>
                                    <th>Valor</th>
                                    <th>Vencimento</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contasPagar.slice(0, 8).map((c: any) => {
                                    const cor = !c.pago ? corVencimento(c.dataVencimento) : "var(--text-secondary)";
                                    const vcto = new Date(c.dataVencimento); vcto.setHours(0,0,0,0);
                                    const diff = vcto.getTime() - hoje.getTime();
                                    const vencido = !c.pago && diff < 0;
                                    const venceHoje = !c.pago && diff === 0;
                                    return (
                                        <tr key={c.id}>
                                            <td>{c.descricao}</td>
                                            <td style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                                                {c.fornecedor?.nome ?? `#${c.fornecedorId}`}
                                            </td>
                                            <td className="mono" style={{ color: "var(--accent-gold)", fontWeight: 600 }}>
                                                {fmt(c.valor)}
                                            </td>
                                            <td className="mono" style={{ color: cor, fontWeight: 600 }}>
                                                {new Date(c.dataVencimento).toLocaleDateString("pt-BR")}
                                            </td>
                                            <td>
                                                {(() => {
                                                    if (c.pago) {
                                                        // Busca a baixa correspondente para mostrar a data de pagamento
                                                        const baixa = baixas.find((b: any) => b.contaPagarId === c.id);
                                                        const dataPgto = baixa?.dataPagamento
                                                            ? new Date(baixa.dataPagamento).toLocaleDateString("pt-BR")
                                                            : null;
                                                        return (
                                                            <span className="badge badge-paid" style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                                                <span>● Pago</span>
                                                                {dataPgto && (
                                                                    <span style={{ fontSize: "0.65rem", opacity: 0.8, fontFamily: "var(--font-mono)" }}>
                                                                        {dataPgto}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        );
                                                    }
                                                    return (
                                                        <span className="badge badge-pending">
                                                            {vencido ? "⚠ Vencido" : venceHoje ? "⚡ Vence Hoje" : "○ Pendente"}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
