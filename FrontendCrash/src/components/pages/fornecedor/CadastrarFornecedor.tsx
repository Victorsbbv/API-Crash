import { useState } from "react";
import type Fornecedor from "../../../models/Fornecedor";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";

// Componente de formulário para cadastrar um novo fornecedor
function CadastrarFornecedor() {

    // Um estado por campo do formulário — padrão do professor
    const [nome, setNome] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [erro, setErro] = useState("");

    // useNavigate: permite redirecionar programaticamente para outra rota
    const navigate = useNavigate();

    // Chamado ao submeter o formulário (evento onSubmit do <form>)
    async function enviarFornecedorAPI(e: any) {
        e.preventDefault(); // Impede o comportamento padrão (reload da página)

        // Validação básica: campos obrigatórios
        if (!nome.trim() || !cnpj.trim()) {
            setErro("Nome e CNPJ são obrigatórios.");
            return;
        }

        try {
            // Cria o objeto do tipo Fornecedor com os valores dos estados
            const fornecedor: Fornecedor = { nome, cnpj };

            // POST /api/fornecedores — cria o fornecedor no banco de dados
            await api.post("/api/fornecedores", fornecedor);

            // Após cadastrar, redireciona para a listagem
            navigate("/fornecedor");
        } catch (error: any) {
            console.log(error);
            // Exibe a mensagem de erro retornada pelo backend
            setErro(error.response?.data ?? "Erro ao cadastrar fornecedor.");
        }
    }

    return (
        <div className="CadastrarFornecedor">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Cadastrar <span className="accent">Fornecedor</span></h2>
                    <p className="page-subtitle">// novo registro de fornecedor</p>
                </div>
            </div>

            <div className="page-body">
                {/* onSubmit chama a função de envio; required impede envio com campo vazio */}
                <form onSubmit={enviarFornecedorAPI} style={{ maxWidth: 480 }}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Nome *</label>
                        {/* onChange atualiza o estado a cada digitação */}
                        <input className="form-input" value={nome} required type="text"
                            placeholder="Nome do fornecedor"
                            onChange={(e: any) => setNome(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">CNPJ *</label>
                        <input className="form-input mono" value={cnpj} required type="text"
                            placeholder="00.000.000/0000-00"
                            onChange={(e: any) => setCnpj(e.target.value)} />
                    </div>

                    {/* Renderização condicional: exibe o erro somente se a string não estiver vazia */}
                    {erro && <p className="error-text" style={{ marginBottom: 12 }}>⚠ {erro}</p>}

                    <div className="form-actions">
                        {/* type="button" impede que o clique submeta o formulário */}
                        <button type="button" className="btn btn-ghost"
                            onClick={() => navigate("/fornecedor")}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Cadastrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CadastrarFornecedor;
