import { useEffect, useState } from "react";
import type ContaPagar from "../../../models/ContaPagar";
import type Fornecedor from "../../../models/Fornecedor";
import type ContaContabil from "../../../models/ContaContabil";
import type CentroCusto from "../../../models/CentroCusto";
import api from "../../../services/api";
import { useNavigate, useParams } from "react-router-dom";
import DateInput from "../../DateInput";

// Formulário para alterar uma conta a pagar existente
// Combina useParams (id da URL) + useEffect (carrega dados) — padrão do professor
function AlterarContaPagar() {

    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [dataVencimento, setDataVencimento] = useState("");
    const [fornecedorId, setFornecedorId] = useState("");
    const [contaContabilId, setContaContabilId] = useState("");
    const [centroCustoId, setCentroCustoId] = useState("");
    const [erro, setErro] = useState("");

    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [contasContabeis, setContasContabeis] = useState<ContaContabil[]>([]);
    const [centros, setCentros] = useState<CentroCusto[]>([]);

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Carrega tanto a conta a ser editada quanto as listas de dependências
        buscarContaAPI();
        carregarDependenciasAPI();
    }, []);

    // Busca a conta a pagar pelo id e preenche os campos
    async function buscarContaAPI() {
        try {
            // A API tem GET por id: GET /api/contapagar/{id}
            const resposta = await api.get<ContaPagar>(`/api/contapagar/${id}`);
            const c = resposta.data;
            setDescricao(c.descricao);
            setValor(String(c.valor));
            // Extrai só a parte da data (YYYY-MM-DD) do ISO string
            setDataVencimento(c.dataVencimento.split("T")[0]);
            setFornecedorId(String(c.fornecedorId));
            setContaContabilId(String(c.contaContabilId));
            setCentroCustoId(String(c.centroCustoId));
        } catch (error) {
            console.log(error);
        }
    }

    async function carregarDependenciasAPI() {
        try {
            const [respF, respCC, respCE] = await Promise.all([
                api.get("/api/fornecedores"),
                api.get("/api/contacontabil/"),
                api.get("/api/centrocusto")
            ]);
            setFornecedores(respF.data.ativos ?? []);
            setContasContabeis(respCC.data.ativos ?? []);
            setCentros(respCE.data.ativos ?? []);
        } catch (error) {
            console.log(error);
        }
    }

    async function enviarAPI(e: any) {
        e.preventDefault();

        if (!descricao.trim() || !valor || !dataVencimento || !fornecedorId || !contaContabilId || !centroCustoId) {
            setErro("Preencha todos os campos obrigatórios.");
            return;
        }

        try {
            const conta: ContaPagar = {
                id: Number(id),
                descricao,
                valor: Number(valor),
                dataVencimento: `${dataVencimento}T12:00:00`,
                fornecedorId: Number(fornecedorId),
                contaContabilId: Number(contaContabilId),
                centroCustoId: Number(centroCustoId)
            };

            // PUT /api/contapagar/{id} — atualiza no banco
            await api.put(`/api/contapagar/${id}`, conta);
            navigate("/contapagar");
        } catch (error: any) {
            console.log(error);
            setErro(error.response?.data ?? "Erro ao alterar conta a pagar.");
        }
    }

    return (
        <div className="AlterarContaPagar">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Alterar <span className="accent">Conta a Pagar</span></h2>
                    <p className="page-subtitle">// editar título #{id}</p>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={enviarAPI} style={{ maxWidth: 560 }}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Descrição *</label>
                        <input className="form-input" value={descricao} required type="text"
                            onChange={(e: any) => setDescricao(e.target.value)} />
                    </div>

                    <div className="form-grid" style={{ marginBottom: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Valor (R$) *</label>
                            <input className="form-input mono" value={valor} required
                                type="number" min="0.01" step="0.01"
                                onChange={(e: any) => setValor(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Vencimento *</label>
                            <DateInput value={dataVencimento} required
                                onChange={setDataVencimento} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Fornecedor *</label>
                        <select className="form-select" value={fornecedorId} required
                            onChange={(e: any) => setFornecedorId(e.target.value)}>
                            <option value="">Selecione...</option>
                            {fornecedores.map((f: Fornecedor) => (
                                <option key={f.id} value={f.id}>{f.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Conta Contábil *</label>
                        <select className="form-select" value={contaContabilId} required
                            onChange={(e: any) => setContaContabilId(e.target.value)}>
                            <option value="">Selecione...</option>
                            {contasContabeis.map((c: ContaContabil) => (
                                <option key={c.id} value={c.id}>{c.codigo} – {c.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Centro de Custo *</label>
                        <select className="form-select" value={centroCustoId} required
                            onChange={(e: any) => setCentroCustoId(e.target.value)}>
                            <option value="">Selecione...</option>
                            {centros.map((c: CentroCusto) => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                    </div>

                    {erro && <p className="error-text" style={{ marginBottom: 12 }}>⚠ {erro}</p>}

                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost"
                            onClick={() => navigate("/contapagar")}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AlterarContaPagar;
