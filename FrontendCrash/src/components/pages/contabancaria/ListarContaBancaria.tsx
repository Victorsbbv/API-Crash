import { useEffect, useState } from "react";
import api from "../../../services/api";
import type ContaBancaria from "../../../models/ContaBancaria";
import { Link } from "react-router-dom";

// Lista as contas bancárias cadastradas
function ListarContaBancaria() {

    const [ativos, setAtivos] = useState<ContaBancaria[]>([]);
    const [inativos, setInativos] = useState<ContaBancaria[]>([]);
    const [erro, setErro] = useState("");

    useEffect(() => {
        carregarAPI();
    }, []);

    async function carregarAPI() {
        try {
            // GET /api/contabancaria retorna { ativos, inativos }
            const resposta = await api.get("/api/contabancaria");
            setAtivos(resposta.data.ativos ?? []);
            setInativos(resposta.data.inativos ?? []);
        } catch (error) {
            console.log(error);
            setErro("Erro ao carregar contas bancárias.");
        }
    }

    async function inativar(id: number) {
        try {
            await api.delete(`/api/contabancaria/${id}`);
            carregarAPI();
        } catch (error) {
            console.log(error);
        }
    }

    async function reativar(c: ContaBancaria) {
        try {
            await api.put(`/api/contabancaria/${c.id}`, { ...c, ativo: true });
            carregarAPI();
        } catch (error) {
            console.log(error);
        }
    }

    // Formata o saldo em reais — ex: 1500.5 → "R$ 1.500,50"
    const formatarSaldo = (v: number) =>
        v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    return (
        <div className="ListarContaBancaria">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Conta <span className="accent">Bancária</span></h2>
                    <p className="page-subtitle">// contas e saldos bancários</p>
                </div>
                <Link to="/contabancaria/cadastrar" className="btn btn-primary">+ Nova Conta Bancária</Link>
            </div>

            <div className="page-body">
                {erro && <p className="error-text">⚠ {erro}</p>}

                <div className="section-header">
                    <span className="section-title"><span className="dot" />Ativas ({ativos.length})</span>
                </div>
                <div className="table-container" style={{ marginBottom: 24 }}>
                    <table>
                        <thead>
                            <tr><th>#</th><th>Banco</th><th>Saldo</th><th>Inativar</th><th>Alterar</th></tr>
                        </thead>
                        <tbody>
                            {ativos.map((c: ContaBancaria) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.nomeBanco}</td>
                                    <td className="mono">{formatarSaldo(c.saldo ?? 0)}</td>
                                    <td>
                                        <button className="btn btn-danger btn-sm"
                                            onClick={() => inativar(c.id!)}>
                                            Inativar
                                        </button>
                                    </td>
                                    <td>
                                        <Link to={`/contabancaria/alterar/${c.id}`} className="btn btn-ghost btn-sm">
                                            Alterar
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {inativos.length > 0 && (
                    <>
                        <div className="section-header">
                            <span className="section-title"><span className="dot" />Inativas ({inativos.length})</span>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr><th>#</th><th>Banco</th><th>Saldo</th><th>Reativar</th></tr>
                                </thead>
                                <tbody>
                                    {inativos.map((c: ContaBancaria) => (
                                        <tr key={c.id}>
                                            <td>{c.id}</td>
                                            <td>{c.nomeBanco}</td>
                                            <td className="mono">{formatarSaldo(c.saldo ?? 0)}</td>
                                            <td>
                                                <button className="btn btn-success btn-sm"
                                                    onClick={() => reativar(c)}>
                                                    Reativar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ListarContaBancaria;
