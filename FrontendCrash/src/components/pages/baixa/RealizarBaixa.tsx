import { useEffect, useState } from "react";
import type ContaPagar from "../../../models/ContaPagar";
import type ContaBancaria from "../../../models/ContaBancaria";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";

// Página para realizar baixa de títulos:
// - Individual: seleciona 1 título + 1 banco
// - Lote: seleciona vários títulos + 1 banco
function RealizarBaixa() {

    // Controle qual aba está ativa: individual ou lote
    const [aba, setAba] = useState<"individual" | "lote">("individual");

    // Estados da baixa INDIVIDUAL
    const [contaPagarId, setContaPagarId] = useState("");
    const [contaBancariaId, setContaBancariaId] = useState("");
    const [erroInd, setErroInd] = useState("");
    const [sucessoInd, setSucessoInd] = useState("");

    // Estados da baixa em LOTE
    // selectedIds: array de ids dos títulos selecionados pelos checkboxes
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [contaBancariaLoteId, setContaBancariaLoteId] = useState("");
    const [erroLote, setErroLote] = useState("");
    const [sucessoLote, setSucessoLote] = useState("");

    // Listas para popular os selects
    const [contasPendentes, setContasPendentes] = useState<ContaPagar[]>([]);
    const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        carregarDependenciasAPI();
    }, []);

    async function carregarDependenciasAPI() {
        try {
            const [respCP, respCB] = await Promise.all([
                api.get<ContaPagar[]>("/api/contapagar"),
                api.get("/api/contabancaria")
            ]);
            // Filtra só os títulos ainda não pagos
            setContasPendentes(respCP.data.filter((c: ContaPagar) => !c.pago));
            setContasBancarias(respCB.data.ativos ?? []);
        } catch (error) {
            console.log(error);
        }
    }

    // --- BAIXA INDIVIDUAL ---
    async function realizarBaixaIndividual(e: any) {
        e.preventDefault();

        if (!contaPagarId || !contaBancariaId) {
            setErroInd("Selecione o título e a conta bancária.");
            return;
        }

        try {
            // POST /api/baixa/{contaPagarId} com body { contaBancariaId }
            const resposta = await api.post(`/api/baixa/${contaPagarId}`, {
                contaBancariaId: Number(contaBancariaId)
            });

            setSucessoInd(resposta.data.mensagem ?? "Título baixado com sucesso!");
            setErroInd("");
            setContaPagarId("");
            setContaBancariaId("");
            carregarDependenciasAPI(); // Recarrega para remover o título da lista
        } catch (error: any) {
            console.log(error);
            setErroInd(error.response?.data ?? "Erro ao realizar baixa.");
            setSucessoInd("");
        }
    }

    // --- BAIXA EM LOTE ---
    async function realizarBaixaLote(e: any) {
        e.preventDefault();

        if (selectedIds.length === 0 || !contaBancariaLoteId) {
            setErroLote("Selecione ao menos um título e a conta bancária.");
            return;
        }

        try {
            // POST /api/baixa/lote com body { contaPagarIds: [...], contaBancariaId }
            const resposta = await api.post("/api/baixa/lote", {
                contaPagarIds: selectedIds,
                contaBancariaId: Number(contaBancariaLoteId)
            });

            setSucessoLote(resposta.data.mensagem ?? "Títulos baixados!");
            setErroLote("");
            setSelectedIds([]);
            setContaBancariaLoteId("");
            carregarDependenciasAPI();
        } catch (error: any) {
            console.log(error);
            setErroLote(error.response?.data ?? "Erro ao realizar baixa em lote.");
            setSucessoLote("");
        }
    }

    // Alterna um id no array de selecionados (checkbox)
    function toggleId(id: number) {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    }

    const fmt = (v: number) =>
        v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    // Total dos títulos selecionados para baixa em lote
    const totalSelecionado = contasPendentes
        .filter(c => selectedIds.includes(c.id!))
        .reduce((soma, c) => soma + c.valor, 0);

    return (
        <div className="RealizarBaixa">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Realizar <span className="accent">Baixa</span></h2>
                    <p className="page-subtitle">// pagamento de títulos a pagar</p>
                </div>
            </div>

            <div className="page-body">
                {/* Tabs para alternar entre individual e lote */}
                <div className="section-header" style={{ marginBottom: 24 }}>
                    <div className="tabs">
                        <button
                            className={`tab ${aba === "individual" ? "active" : ""}`}
                            onClick={() => setAba("individual")}>
                            Baixa Individual
                        </button>
                        <button
                            className={`tab ${aba === "lote" ? "active" : ""}`}
                            onClick={() => setAba("lote")}>
                            Baixa em Lote
                        </button>
                    </div>
                </div>

                {/* ===== ABA INDIVIDUAL ===== */}
                {aba === "individual" && (
                    <form onSubmit={realizarBaixaIndividual} style={{ maxWidth: 520 }}>

                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Título a Pagar *</label>
                            <select className="form-select" value={contaPagarId} required
                                onChange={(e: any) => setContaPagarId(e.target.value)}>
                                <option value="">Selecione o título...</option>
                                {contasPendentes.map((c: ContaPagar) => (
                                    <option key={c.id} value={c.id}>
                                        #{c.id} — {c.descricao} ({fmt(c.valor)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Conta Bancária *</label>
                            <select className="form-select" value={contaBancariaId} required
                                onChange={(e: any) => setContaBancariaId(e.target.value)}>
                                <option value="">Selecione o banco...</option>
                                {contasBancarias.map((b: ContaBancaria) => (
                                    <option key={b.id} value={b.id}>
                                        {b.nomeBanco} — Saldo: {fmt(b.saldo ?? 0)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {erroInd && <p className="error-text" style={{ marginBottom: 12 }}>⚠ {erroInd}</p>}
                        {sucessoInd && (
                            <p style={{ color: "var(--success)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: 12 }}>
                                ✓ {sucessoInd}
                            </p>
                        )}

                        <div className="form-actions">
                            <button type="button" className="btn btn-ghost"
                                onClick={() => navigate("/baixa")}>
                                Voltar
                            </button>
                            <button type="submit" className="btn btn-success">
                                ✓ Realizar Baixa
                            </button>
                        </div>
                    </form>
                )}

                {/* ===== ABA LOTE ===== */}
                {aba === "lote" && (
                    <form onSubmit={realizarBaixaLote} style={{ maxWidth: 600 }}>

                        {/* Lista de títulos pendentes com checkbox */}
                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">
                                Títulos Pendentes ({selectedIds.length} selecionado(s))
                            </label>

                            {contasPendentes.length === 0 ? (
                                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: 8 }}>
                                    Nenhum título pendente.
                                </p>
                            ) : (
                                /* Lista clicável de títulos — padrão simples sem modal */
                                <div className="titulo-list" style={{ marginTop: 8 }}>
                                    {contasPendentes.map((c: ContaPagar) => (
                                        <div
                                            key={c.id}
                                            className={`titulo-select-row ${selectedIds.includes(c.id!) ? "selected" : ""}`}
                                            onClick={() => toggleId(c.id!)}
                                        >
                                            {/* Checkbox: marca/desmarca o título */}
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(c.id!)}
                                                onChange={() => toggleId(c.id!)}
                                                onClick={e => e.stopPropagation()}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                                    {c.descricao}
                                                </div>
                                                <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>
                                                    Vcto: {new Date(c.dataVencimento).toLocaleDateString("pt-BR")}
                                                    {c.fornecedor && ` · ${c.fornecedor.nome}`}
                                                </div>
                                            </div>
                                            <span className="mono" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                                {fmt(c.valor)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Exibe o total selecionado quando há algum */}
                        {selectedIds.length > 0 && (
                            <div className="stat-card" style={{ padding: "12px 16px", marginBottom: 16 }}>
                                <div className="stat-label">Total Selecionado</div>
                                <div className="stat-value">{fmt(totalSelecionado)}</div>
                            </div>
                        )}

                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Conta Bancária *</label>
                            <select className="form-select" value={contaBancariaLoteId} required
                                onChange={(e: any) => setContaBancariaLoteId(e.target.value)}>
                                <option value="">Selecione o banco...</option>
                                {contasBancarias.map((b: ContaBancaria) => (
                                    <option key={b.id} value={b.id}>
                                        {b.nomeBanco} — Saldo: {fmt(b.saldo ?? 0)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {erroLote && <p className="error-text" style={{ marginBottom: 12 }}>⚠ {erroLote}</p>}
                        {sucessoLote && (
                            <p style={{ color: "var(--success)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: 12 }}>
                                ✓ {sucessoLote}
                            </p>
                        )}

                        <div className="form-actions">
                            <button type="button" className="btn btn-ghost"
                                onClick={() => navigate("/baixa")}>
                                Voltar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-success"
                                disabled={selectedIds.length === 0}>
                                ✓ Baixar {selectedIds.length > 0 ? `${selectedIds.length} Título(s)` : "em Lote"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default RealizarBaixa;
