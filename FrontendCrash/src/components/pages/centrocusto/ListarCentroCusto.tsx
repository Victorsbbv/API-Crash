import { useEffect, useState } from "react";
import api from "../../../services/api";
import type CentroCusto from "../../../models/CentroCusto";
import { Link } from "react-router-dom";

// Lista os centros de custo cadastrados
function ListarCentroCusto() {

    const [ativos, setAtivos] = useState<CentroCusto[]>([]);
    const [inativos, setInativos] = useState<CentroCusto[]>([]);
    const [erro, setErro] = useState("");

    useEffect(() => {
        carregarAPI();
    }, []);

    async function carregarAPI() {
        try {
            // GET /api/centrocusto retorna { ativos, inativos }
            const resposta = await api.get("/api/centrocusto");
            setAtivos(resposta.data.ativos ?? []);
            setInativos(resposta.data.inativos ?? []);
        } catch (error) {
            console.log(error);
            setErro("Erro ao carregar centros de custo.");
        }
    }

    async function inativar(id: number) {
        try {
            await api.delete(`/api/centrocusto/${id}`);
            carregarAPI();
        } catch (error) {
            console.log(error);
        }
    }

    async function reativar(c: CentroCusto) {
        try {
            await api.put(`/api/centrocusto/${c.id}`, { ...c, ativo: true });
            carregarAPI();
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="ListarCentroCusto">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Centro de <span className="accent">Custo</span></h2>
                    <p className="page-subtitle">// classificação e controle de gastos</p>
                </div>
                <Link to="/centrocusto/cadastrar" className="btn btn-primary">+ Novo Centro de Custo</Link>
            </div>

            <div className="page-body">
                {erro && <p className="error-text">⚠ {erro}</p>}

                <div className="section-header">
                    <span className="section-title"><span className="dot" />Ativos ({ativos.length})</span>
                </div>
                <div className="table-container" style={{ marginBottom: 24 }}>
                    <table>
                        <thead>
                            <tr><th>#</th><th>Nome</th><th>Inativar</th><th>Alterar</th></tr>
                        </thead>
                        <tbody>
                            {ativos.map((c: CentroCusto) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.nome}</td>
                                    <td>
                                        <button className="btn btn-danger btn-sm"
                                            onClick={() => inativar(c.id!)}>
                                            Inativar
                                        </button>
                                    </td>
                                    <td>
                                        <Link to={`/centrocusto/alterar/${c.id}`} className="btn btn-ghost btn-sm">
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
                            <span className="section-title"><span className="dot" />Inativos ({inativos.length})</span>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr><th>#</th><th>Nome</th><th>Reativar</th></tr>
                                </thead>
                                <tbody>
                                    {inativos.map((c: CentroCusto) => (
                                        <tr key={c.id}>
                                            <td>{c.id}</td>
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

export default ListarCentroCusto;