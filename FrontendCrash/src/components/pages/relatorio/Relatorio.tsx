import { useEffect, useState } from "react";
import DateInput from "../../DateInput";
import type ContaPagar from "../../../models/ContaPagar";
import type CentroCusto from "../../../models/CentroCusto";
import type ContaContabil from "../../../models/ContaContabil";
import type Fornecedor from "../../../models/Fornecedor";
import type BaixaTitulo from "../../../models/BaixaTitulo";
import api from "../../../services/api";

function Relatorio() {

    // Filtros
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [pago, setPago] = useState(""); // "" | "true" | "false"
    const [centroCustoId, setCentroCustoId] = useState("");
    const [contaContabilId, setContaContabilId] = useState("");
    const [fornecedorId, setFornecedorId] = useState("");
    const [valorMin, setValorMin] = useState("");
    const [valorMax, setValorMax] = useState("");

    // Listas para os selects
    const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
    const [contasContabeis, setContasContabeis] = useState<ContaContabil[]>([]);
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

    // Resultados
    const [titulos, setTitulos] = useState<ContaPagar[]>([]);
    const [resumo, setResumo] = useState<any>(null);
    const [erro, setErro] = useState("");
    const [baixas, setBaixas] = useState<BaixaTitulo[]>([]);

    useEffect(() => {
        async function carregarFiltros() {
            try {
                const [resCc, resCont, resForn, resBaixas] = await Promise.all([
                    api.get("/api/centrocusto"),
                    api.get("/api/contacontabil/"),
                    api.get("/api/fornecedores"),
                    api.get("/api/baixa").catch(() => ({ data: [] }))
                ]);
                setCentrosCusto(resCc.data.ativos ?? []);
                setContasContabeis(resCont.data.ativos ?? []);
                setFornecedores(resForn.data.ativos ?? []);
                setBaixas(Array.isArray(resBaixas.data) ? resBaixas.data : []);
            } catch {
                // selects ficam vazios se a API falhar — não bloqueia o relatório
            }
        }
        carregarFiltros();
    }, []);

    async function buscarRelatorioAPI(e: any) {
        e.preventDefault();
        setErro("");
        setTitulos([]);
        setResumo(null);

        try {
            // 1º filtro (backend): apenas datas — traz tudo dentro do intervalo
            const params: Record<string, string> = {};
            if (dataInicio) params.dataInicio = `${dataInicio}T00:00:00`;
            if (dataFim)    params.dataFim    = `${dataFim}T23:59:59`;

            const resposta = await api.get("/api/relatorio", { params });

            // 2º filtro (frontend): todos os critérios aplicados sobre o resultado bruto da API
            let lista: ContaPagar[] = resposta.data.titulos ?? [];

            // Datas — reaplica no frontend pelo dataVencimento para garantir a hierarquia
            if (dataInicio) {
                const inicio = new Date(`${dataInicio}T00:00:00`);
                lista = lista.filter((c) => new Date(c.dataVencimento) >= inicio);
            }
            if (dataFim) {
                const fim = new Date(`${dataFim}T23:59:59`);
                lista = lista.filter((c) => new Date(c.dataVencimento) <= fim);
            }

            if (pago !== "")
                lista = lista.filter((c) => String(c.pago) === pago);

            if (centroCustoId)
                lista = lista.filter((c) => String(c.centroCustoId) === centroCustoId);

            if (contaContabilId)
                lista = lista.filter((c) => String(c.contaContabilId) === contaContabilId);

            if (fornecedorId)
                lista = lista.filter((c) => String(c.fornecedorId) === fornecedorId);

            const min = valorMin !== "" ? parseFloat(valorMin) : null;
            const max = valorMax !== "" ? parseFloat(valorMax) : null;
            if (min !== null) lista = lista.filter((c) => c.valor >= min);
            if (max !== null) lista = lista.filter((c) => c.valor <= max);

            // Recalcula o resumo com base na lista já filtrada
            const resumoFiltrado = lista.length > 0 ? {
                totalTitulos: lista.length,
                totalPago: lista.filter(c => c.pago).reduce((acc, c) => acc + c.valor, 0),
                totalPendente: lista.filter(c => !c.pago).reduce((acc, c) => acc + c.valor, 0),
                totalGeral: lista.reduce((acc, c) => acc + c.valor, 0),
            } : null;

            setTitulos(lista);
            setResumo(resumoFiltrado);
            if (lista.length === 0) setErro("Nenhuma conta encontrada com os filtros aplicados.");
        } catch (error: any) {
            console.log(error);
            setErro(error.response?.data ?? "Nenhum resultado encontrado.");
        }
    }

    const fmt = (v: number) =>
        v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const fmtData = (d: string) =>
        new Date(d).toLocaleDateString("pt-BR");

    return (
        <div className="Relatorio">
            <div className="page-header">
                <div>
                    <h2 className="page-title"><span className="accent">Relatório</span></h2>
                    <p className="page-subtitle">// consulta parametrizada de contas a pagar<br/><br/>// Filtra por data de pagamento</p>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={buscarRelatorioAPI} style={{ maxWidth: 680, marginBottom: 28 }}>

                    {/* Datas */}
                    <div className="form-grid" style={{ marginBottom: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Data Início</label>
                            <DateInput value={dataInicio} onChange={setDataInicio} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Data Fim</label>
                            <DateInput value={dataFim} onChange={setDataFim} />
                        </div>
                    </div>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 16 }}>
                        // Filtra por data de vencimento: altere o <u>filtro</u> status para contas pendentes
                    </p>

                    {/* Status + Fornecedor */}
                    <div className="form-grid" style={{ marginBottom: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-select" value={pago}
                                onChange={(e: any) => setPago(e.target.value)}>
                                <option value="">Todos</option>
                                <option value="false">Pendentes</option>
                                <option value="true">Pagos</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fornecedor</label>
                            <select className="form-select" value={fornecedorId}
                                onChange={(e: any) => setFornecedorId(e.target.value)}>
                                <option value="">Todos</option>
                                {fornecedores.map((f) => (
                                    <option key={f.id} value={f.id}>{f.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Centro de Custo + Conta Contábil */}
                    <div className="form-grid" style={{ marginBottom: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Centro de Custo</label>
                            <select className="form-select" value={centroCustoId}
                                onChange={(e: any) => setCentroCustoId(e.target.value)}>
                                <option value="">Todos</option>
                                {centrosCusto.map((c) => (
                                    <option key={c.id} value={c.id}>{c.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Conta Contábil</label>
                            <select className="form-select" value={contaContabilId}
                                onChange={(e: any) => setContaContabilId(e.target.value)}>
                                <option value="">Todas</option>
                                {contasContabeis.map((c) => (
                                    <option key={c.id} value={c.id}>{c.codigo} — {c.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Faixa de valor */}
                    <div className="form-grid" style={{ marginBottom: 20 }}>
                        <div className="form-group">
                            <label className="form-label">Valor Mínimo (R$)</label>
                            <input className="form-input" type="number" min="0" step="0.01"
                                placeholder="0,00"
                                value={valorMin}
                                onChange={(e: any) => setValorMin(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Valor Máximo (R$)</label>
                            <input className="form-input" type="number" min="0" step="0.01"
                                placeholder="sem limite"
                                value={valorMax}
                                onChange={(e: any) => setValorMax(e.target.value)} />
                        </div>
                    </div>

                    {erro && <p className="error-text" style={{ marginBottom: 12 }}>⚠ {erro}</p>}

                    <button type="submit" className="btn btn-primary">Buscar</button>
                </form>

                {/* Resumo */}
                {resumo && (
                    <div className="stats-grid" style={{ marginBottom: 24 }}>
                        <div className="stat-card">
                            <div className="stat-label">Total de Títulos</div>
                            <div className="stat-value cyan">{resumo.totalTitulos}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Total Pago</div>
                            <div className="stat-value success">{fmt(resumo.totalPago)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Total Pendente</div>
                            <div className="stat-value danger">{fmt(resumo.totalPendente)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Total Geral</div>
                            <div className="stat-value">{fmt(resumo.totalGeral)}</div>
                        </div>
                    </div>
                )}

                {/* Tabela de resultados */}
                {titulos.length > 0 && (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Descrição</th>
                                    <th>Fornecedor</th>
                                    <th>Conta Contábil</th>
                                    <th>Centro de Custo</th>
                                    <th>Valor</th>
                                    <th>Vencimento</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {titulos.map((c: ContaPagar) => (
                                    <tr key={c.id}>
                                        <td>{c.id}</td>
                                        <td>{c.descricao}</td>
                                        <td>{c.fornecedor?.nome ?? `#${c.fornecedorId}`}</td>
                                        <td className="mono">
                                            {c.contaContabil
                                                ? `${c.contaContabil.codigo} — ${c.contaContabil.nome}`
                                                : `#${c.contaContabilId}`}
                                        </td>
                                        <td>{c.centroCusto?.nome ?? `#${c.centroCustoId}`}</td>
                                        <td className="mono">{fmt(c.valor)}</td>
                                        <td className="mono">{fmtData(c.dataVencimento)}</td>
                                        <td>
                                            {c.pago ? (() => {
                                                const baixa = baixas.find((b) => b.contaPagarId === c.id);
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
                                            })() : (
                                                <span className="badge badge-pending">○ Pendente</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Relatorio;