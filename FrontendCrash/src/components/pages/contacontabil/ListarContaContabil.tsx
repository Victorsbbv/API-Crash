import { useEffect, useState } from "react";
import api from "../../../services/api";
import type ContaContabil from "../../../models/ContaContabil";
import { Link } from "react-router-dom";

// Lista as contas contábeis cadastradas (ativas e inativas)
function ListarContaContabil() {

    const [ativos, setAtivos] = useState<ContaContabil[]>([]);
    const [inativos, setInativos] = useState<ContaContabil[]>([]);
    const [erro, setErro] = useState("");

    useEffect(() => {
        carregarAPI();
    }, []);

    async function carregarAPI() {
        try {
            // GET /api/contacontabil/ retorna { ativos, inativados }
            const resposta = await api.get("/api/contacontabil/");
            setAtivos(resposta.data.ativos ?? []);
            setInativos(resposta.data.inativados ?? []);
        } catch (error) {
            console.log(error);
            setErro("Erro ao carregar contas contábeis.");
        }
    }

    async function inativar(id: number) {
        try {
            await api.delete(`/api/contacontabil/${id}`);
            carregarAPI();
        } catch (error) {
            console.log(error);
        }
    }

    async function reativar(c: ContaContabil) {
        try {
            await api.put(`/api/contacontabil/${c.id}`, { ...c, ativo: true });
            carregarAPI();
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="ListarContaContabil">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Conta <span className="accent">Contábil</span></h2>
                    <p className="page-subtitle">// plano de contas contábeis</p>
                </div>
                <Link to="/contacontabil/cadastrar" className="btn btn-primary">+ Nova Conta Contábil</Link>
            </div>

            <div className="page-body">
                {erro && <p className="error-text">⚠ {erro}</p>}

                <div className="section-header">
                    <span className="section-title"><span className="dot" />Ativas ({ativos.length})</span>
                </div>
                <div className="table-container" style={{ marginBottom: 24 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Código</th>
                                <th>Nome</th>
                                <th>Inativar</th>
                                <th>Alterar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ativos.map((c: ContaContabil) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td className="mono">{c.codigo}</td>
                                    <td>{c.nome}</td>
                                    <td>
                                        <button className="btn btn-danger btn-sm"
                                            onClick={() => inativar(c.id!)}>
                                            Inativar
                                        </button>
                                    </td>
                                    <td>
                                        <Link to={`/contacontabil/alterar/${c.id}`} className="btn btn-ghost btn-sm">
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
                                    <tr><th>#</th><th>Código</th><th>Nome</th><th>Reativar</th></tr>
                                </thead>
                                <tbody>
                                    {inativos.map((c: ContaContabil) => (
                                        <tr key={c.id}>
                                            <td>{c.id}</td>
                                            <td className="mono">{c.codigo}</td>
                                            <td>{c.nome}</td>
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

export default ListarContaContabil;