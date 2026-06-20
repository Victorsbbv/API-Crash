import { useEffect, useState } from "react";
import api from "../../../services/api";
import type Fornecedor from "../../../models/Fornecedor";
import { Link } from "react-router-dom";

// REGRAS PARA A CRIAÇÃO DE NOVOS COMPONENTES (professor):
// 1 - O componente deve começar com uma letra maiúscula
// 2 - O componente DEVE ser uma função
// 3 - O componente deve ser exportado
// 4 - O componente DEVE retornar apenas um elemento pai HTML

function ListarFornecedor() {

    // Estados: variáveis reativas do React
    // Quando o estado muda, o componente re-renderiza automaticamente
    const [ativos, setAtivos] = useState<Fornecedor[]>([]);
    const [inativos, setInativos] = useState<Fornecedor[]>([]);
    const [erro, setErro] = useState("");

    // useEffect: executado no carregamento do componente (array vazio = só uma vez)
    useEffect(() => {
        carregarFornecedoresAPI();
    }, []);

    // Função assíncrona que busca os fornecedores na API via GET
    // O axios retorna os dados em resposta.data
    async function carregarFornecedoresAPI() {
        try {
            const resposta = await api.get("/api/fornecedores");
            setAtivos(resposta.data.ativos ?? []);
            setInativos(resposta.data.inativados ?? []);
        } catch (error) {
            console.log(error);
            setErro("Erro ao carregar fornecedores.");
        }
    }

    // Chama DELETE na API — no backend, isso inativa o fornecedor (exclusão lógica)
    async function inativarFornecedor(id: number) {
        try {
            await api.delete(`/api/fornecedores/${id}`);
            carregarFornecedoresAPI(); // Recarrega a lista após a ação
        } catch (error) {
            console.log(error);
        }
    }

    // Chama PUT com ativo: true para reativar o fornecedor
    async function reativarFornecedor(f: Fornecedor) {
        try {
            await api.put(`/api/fornecedores/${f.id}`, { ...f, ativo: true });
            carregarFornecedoresAPI();
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="ListarFornecedor">
            {/* Cabeçalho da página com botão de cadastro */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Fornece<span className="accent">dores</span></h2>
                    <p className="page-subtitle">// cadastro e gestão de fornecedores</p>
                </div>
                {/* Link navega para a rota de cadastro sem recarregar a página */}
                <Link to="/fornecedor/cadastrar" className="btn btn-primary">+ Novo Fornecedor</Link>
            </div>

            <div className="page-body">
                {/* Mensagem de erro — só aparece se erro !== "" */}
                {erro && <p className="error-text">⚠ {erro}</p>}

                {/* Tabela de fornecedores ativos */}
                <div className="section-header">
                    <span className="section-title">
                        <span className="dot" />
                        Ativos ({ativos.length})
                    </span>
                </div>
                <div className="table-container" style={{ marginBottom: 24 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nome</th>
                                <th>CNPJ</th>
                                <th>Inativar</th>
                                <th>Alterar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* map(): percorre o array e renderiza uma linha por fornecedor */}
                            {ativos.map((f: Fornecedor) => (
                                <tr key={f.id}>
                                    <td>{f.id}</td>
                                    <td>{f.nome}</td>
                                    <td className="mono">{f.cnpj}</td>
                                    <td>
                                        <button className="btn btn-danger btn-sm"
                                            onClick={() => inativarFornecedor(f.id!)}>
                                            Inativar
                                        </button>
                                    </td>
                                    <td>
                                        {/* Link com id na URL — lido pelo AlterarFornecedor via useParams */}
                                        <Link to={`/fornecedor/alterar/${f.id}`} className="btn btn-ghost btn-sm">
                                            Alterar
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Tabela de inativos — só renderiza se houver algum */}
                {inativos.length > 0 && (
                    <>
                        <div className="section-header">
                            <span className="section-title">
                                <span className="dot" />
                                Inativos ({inativos.length})
                            </span>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Nome</th>
                                        <th>CNPJ</th>
                                        <th>Reativar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inativos.map((f: Fornecedor) => (
                                        <tr key={f.id}>
                                            <td>{f.id}</td>
                                            <td>{f.nome}</td>
                                            <td className="mono">{f.cnpj}</td>
                                            <td>
                                                <button className="btn btn-success btn-sm"
                                                    onClick={() => reativarFornecedor(f)}>
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

export default ListarFornecedor;
