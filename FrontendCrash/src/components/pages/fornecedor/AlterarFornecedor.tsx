import { useEffect, useState } from "react";
import type Fornecedor from "../../../models/Fornecedor";
import api from "../../../services/api";
import { useNavigate, useParams } from "react-router-dom";

// Componente para alterar um fornecedor existente
// Usa useParams para capturar o id da URL: /fornecedor/alterar/:id
function AlterarFornecedor() {

    const [nome, setNome] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [erro, setErro] = useState("");

    // useParams: lê parâmetros da URL — ex: /fornecedor/alterar/5 → id = "5"
    const { id } = useParams();

    // useNavigate: para redirecionar após salvar
    const navigate = useNavigate();

    // Carrega os dados do fornecedor ao montar o componente
    useEffect(() => {
        buscarFornecedorAPI();
    }, []);

    // Busca o fornecedor pelo id e pré-preenche os campos do formulário
    async function buscarFornecedorAPI() {
        try {
            // A API de fornecedores retorna {ativos, inativados} — não tem GET por id
            const resposta = await api.get("/api/fornecedores");
            const todos: Fornecedor[] = [
                ...resposta.data.ativos,
                ...resposta.data.inativados
            ];
            // Encontra o fornecedor com o id da URL
            const fornecedor = todos.find((f: Fornecedor) => f.id === Number(id));
            if (fornecedor) {
                setNome(fornecedor.nome);
                setCnpj(fornecedor.cnpj);
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Envia o PUT para atualizar o fornecedor na API
    async function enviarFornecedorAPI(e: any) {
        e.preventDefault();

        if (!nome.trim() || !cnpj.trim()) {
            setErro("Nome e CNPJ são obrigatórios.");
            return;
        }

        try {
            const fornecedor: Fornecedor = { id: Number(id), nome, cnpj, ativo: true };

            // PUT /api/fornecedores/{id} — atualiza o fornecedor
            await api.put(`/api/fornecedores/${id}`, fornecedor);

            navigate("/fornecedor");
        } catch (error: any) {
            console.log(error);
            setErro(error.response?.data ?? "Erro ao alterar fornecedor.");
        }
    }

    return (
        <div className="AlterarFornecedor">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Alterar <span className="accent">Fornecedor</span></h2>
                    <p className="page-subtitle">// editar registro #{id}</p>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={enviarFornecedorAPI} style={{ maxWidth: 480 }}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Nome *</label>
                        <input className="form-input" value={nome} required type="text"
                            onChange={(e: any) => setNome(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">CNPJ *</label>
                        <input className="form-input mono" value={cnpj} required type="text"
                            onChange={(e: any) => setCnpj(e.target.value)} />
                    </div>

                    {erro && <p className="error-text" style={{ marginBottom: 12 }}>⚠ {erro}</p>}

                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost"
                            onClick={() => navigate("/fornecedor")}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AlterarFornecedor;
