import { useEffect, useState } from "react";
import api from "../../../services/api";
import type ContaPagar from "../../../models/ContaPagar";
import { Link } from "react-router-dom";

// Cores da data de vencimento: vermelho=vencido, amarelo=hoje, verde=futuro
function corVencimento(dataISO: string, pago: boolean): string {
    if (pago) return "var(--text-secondary)";
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const vcto = new Date(dataISO); vcto.setHours(0, 0, 0, 0);
    const diff = vcto.getTime() - hoje.getTime();
    if (diff < 0)   return "var(--danger)";
    if (diff === 0) return "var(--accent-gold)";
    return "var(--success)";
}

// Lista todas as contas a pagar com status e ações
function ListarContaPagar() {

    // Estado que armazena o array de contas a pagar
    const [contas, setContas] = useState<ContaPagar[]>([]);
    const [erro, setErro] = useState("");

    useEffect(() => {
        carregarAPI();
    }, []);

    async function carregarAPI() {
        try {
            // GET /api/contapagar retorna um array simples (não tem ativos/inativos)
            const resposta = await api.get<ContaPagar[]>("/api/contapagar");
            setContas(resposta.data);
        } catch (error) {
            console.log(error);
            setErro("Erro ao carregar contas a pagar.");
        }
    }

    // Deleta fisicamente a conta (só funciona se não estiver paga)
    async function deletarConta(id: number) {
        try {
            await api.delete(`/api/contapagar/${id}`);
            carregarAPI();
        } catch (error: any) {
            console.log(error);
            alert(error.response?.data ?? "Erro ao deletar conta.");
        }
    }

    // Formata o valor como moeda brasileira
    const fmt = (v: number) =>
        v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    // Formata a data de ISO para dd/mm/yyyy
    const fmtData = (d: string) =>
        new Date(d).toLocaleDateString("pt-BR");

    return (
        <div className="ListarContaPagar">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Contas a <span className="accent">Pagar</span></h2>
                    <p className="page-subtitle">// títulos e obrigações financeiras</p>
                </div>
                <Link to="/contapagar/cadastrar" className="btn btn-primary">+ Nova Conta</Link>
            </div>

            <div className="page-body">
                {erro && <p className="error-text">⚠ {erro}</p>}

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Descrição</th>
                                <th>Fornecedor</th>
                                <th>Valor</th>
                                <th>Vencimento</th>
                                <th>Status</th>
                                <th>Deletar</th>
                                <th>Alterar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contas.map((c: ContaPagar) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.descricao}</td>
                                    {/* Exibe o nome do fornecedor vindo do Include (objeto de navegação) */}
                                    <td>{c.fornecedor?.nome ?? `#${c.fornecedorId}`}</td>
                                    <td className="mono">{fmt(c.valor)}</td>
                                    <td className="mono" style={{ color: corVencimento(c.dataVencimento, c.pago ?? false), fontWeight: 600 }}>
                                        {fmtData(c.dataVencimento)}
                                    </td>
                                    <td>
                                        <span className={`badge ${c.pago ? "badge-paid" : "badge-pending"}`}>
                                            {(() => {
                                                if (c.pago) return "● Pago";
                                                const hoje = new Date(); hoje.setHours(0,0,0,0);
                                                const v = new Date(c.dataVencimento); v.setHours(0,0,0,0);
                                                const d = v.getTime() - hoje.getTime();
                                                if (d < 0)   return "⚠ Vencido";
                                                if (d === 0) return "⚡ Vence Hoje";
                                                return "○ Pendente";
                                            })()}
                                        </span>
                                    </td>
                                    <td>
                                        {/* Só permite deletar se ainda não foi pago */}
                                        {!c.pago && (
                                            <button className="btn btn-danger btn-sm"
                                                onClick={() => deletarConta(c.id!)}>
                                                Deletar
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        {!c.pago && (
                                            <Link to={`/contapagar/alterar/${c.id}`} className="btn btn-ghost btn-sm">
                                                Alterar
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ListarContaPagar;
