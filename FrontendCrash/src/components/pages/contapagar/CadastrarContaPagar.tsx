import { useEffect, useState } from "react";
import DateInput from "../../DateInput";
import type ContaPagar from "../../../models/ContaPagar";
import type Fornecedor from "../../../models/Fornecedor";
import type ContaContabil from "../../../models/ContaContabil";
import type CentroCusto from "../../../models/CentroCusto";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";

// Formulário de cadastro de conta a pagar
// Precisa carregar as listas de FK (fornecedor, conta contábil, centro de custo)
// para popular os selects — mesmo padrão do professor com useEffect + api.get
function CadastrarContaPagar() {

    // Campos do formulário
    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [dataVencimento, setDataVencimento] = useState("");
    const [fornecedorId, setFornecedorId] = useState("");
    const [contaContabilId, setContaContabilId] = useState("");
    const [centroCustoId, setCentroCustoId] = useState("");
    const [erro, setErro] = useState("");

    // Listas para popular os selects (dependências)
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [contasContabeis, setContasContabeis] = useState<ContaContabil[]>([]);
    const [centros, setCentros] = useState<CentroCusto[]>([]);

    const navigate = useNavigate();

    // Carrega as listas de dependências ao montar o componente
    useEffect(() => {
        carregarDependenciasAPI();
    }, []);

    // Função que carrega fornecedores, contas contábeis e centros de custo
    // Todas são chamadas separadas à API, seguindo o padrão do professor
    async function carregarDependenciasAPI() {
        try {
            const [respF, respCC, respCE] = await Promise.all([
                api.get("/api/fornecedores"),
                api.get("/api/contacontabil/"),
                api.get("/api/centrocusto")
            ]);
            // Só mostra os registros ativos nos selects
            setFornecedores(respF.data.ativos ?? []);
            setContasContabeis(respCC.data.ativos ?? []);
            setCentros(respCE.data.ativos ?? []);
        } catch (error) {
            console.log(error);
        }
    }

    async function enviarAPI(e: any) {
        e.preventDefault();

        // Valida se todos os campos obrigatórios estão preenchidos
        if (!descricao.trim() || !valor || !dataVencimento || !fornecedorId || !contaContabilId || !centroCustoId) {
            setErro("Preencha todos os campos obrigatórios.");
            return;
        }

        try {
            // Monta o objeto ContaPagar com os ids das FKs
            const conta: ContaPagar = {
                descricao,
                valor: Number(valor),
                // T12:00:00 evita bug de fuso: new Date("2026-06-18") vira 17T21:00:00Z no BRT
                dataVencimento: `${dataVencimento}T12:00:00`,
                fornecedorId: Number(fornecedorId),
                contaContabilId: Number(contaContabilId),
                centroCustoId: Number(centroCustoId)
            };

            // POST /api/contapagar
            await api.post("/api/contapagar", conta);
            navigate("/contapagar");
        } catch (error: any) {
            console.log(error);
            setErro(error.response?.data ?? "Erro ao cadastrar conta a pagar.");
        }
    }

    return (
        <div className="CadastrarContaPagar">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Cadastrar <span className="accent">Conta a Pagar</span></h2>
                    <p className="page-subtitle">// novo título a pagar</p>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={enviarAPI} style={{ maxWidth: 560 }}>
                    {/* Descrição */}
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Descrição *</label>
                        <input className="form-input" value={descricao} required type="text"
                            placeholder="Descrição da conta a pagar"
                            onChange={(e: any) => setDescricao(e.target.value)} />
                    </div>

                    {/* Valor e Vencimento na mesma linha */}
                    <div className="form-grid" style={{ marginBottom: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Valor (R$) *</label>
                            <input className="form-input mono" value={valor} required
                                type="number" min="0.01" step="0.01" placeholder="0.00"
                                onChange={(e: any) => setValor(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Vencimento *</label>
                            <DateInput value={dataVencimento} required
                                onChange={setDataVencimento} />
                        </div>
                    </div>

                    {/* Select de Fornecedor — populado pela API */}
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Fornecedor *</label>
                        <select className="form-select" value={fornecedorId} required
                            onChange={(e: any) => setFornecedorId(e.target.value)}>
                            <option value="">Selecione o fornecedor...</option>
                            {fornecedores.map((f: Fornecedor) => (
                                <option key={f.id} value={f.id}>{f.nome}</option>
                            ))}
                        </select>
                    </div>

                    {/* Select de Conta Contábil */}
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Conta Contábil *</label>
                        <select className="form-select" value={contaContabilId} required
                            onChange={(e: any) => setContaContabilId(e.target.value)}>
                            <option value="">Selecione a conta contábil...</option>
                            {contasContabeis.map((c: ContaContabil) => (
                                <option key={c.id} value={c.id}>{c.codigo} – {c.nome}</option>
                            ))}
                        </select>
                    </div>

                    {/* Select de Centro de Custo */}
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Centro de Custo *</label>
                        <select className="form-select" value={centroCustoId} required
                            onChange={(e: any) => setCentroCustoId(e.target.value)}>
                            <option value="">Selecione o centro de custo...</option>
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
                        <button type="submit" className="btn btn-primary">Cadastrar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CadastrarContaPagar;
