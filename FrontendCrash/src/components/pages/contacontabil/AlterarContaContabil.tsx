import { useEffect, useState } from "react";
import type ContaContabil from "../../../models/ContaContabil";
import api from "../../../services/api";
import { useNavigate, useParams } from "react-router-dom";

// Formulário para alterar uma conta contábil existente
function AlterarContaContabil() {

    const [nome, setNome] = useState("");
    const [codigo, setCodigo] = useState("");
    const [erro, setErro] = useState("");
    const { id } = useParams(); // Captura o :id da URL
    const navigate = useNavigate();

    useEffect(() => {
        buscarAPI();
    }, []);

    // Carrega os dados da conta pelo id para preencher o formulário
    async function buscarAPI() {
        try {
            const resposta = await api.get("/api/contacontabil/");
            const todos: ContaContabil[] = [
                ...resposta.data.ativos,
                ...resposta.data.inativados
            ];
            const conta = todos.find((c: ContaContabil) => c.id === Number(id));
            if (conta) {
                setNome(conta.nome);
                setCodigo(conta.codigo);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function enviarAPI(e: any) {
        e.preventDefault();

        if (!nome.trim() || !codigo.trim()) {
            setErro("Nome e Código são obrigatórios.");
            return;
        }

        try {
            const conta: ContaContabil = { id: Number(id), nome, codigo, ativo: true };
            // PUT /api/contacontabil/{id} — atualiza no banco
            await api.put(`/api/contacontabil/${id}`, conta);
            navigate("/contacontabil");
        } catch (error: any) {
            console.log(error);
            setErro(error.response?.data ?? "Erro ao alterar conta contábil.");
        }
    }

    return (
        <div className="AlterarContaContabil">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Alterar <span className="accent">Conta Contábil</span></h2>
                    <p className="page-subtitle">// editar registro #{id}</p>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={enviarAPI} style={{ maxWidth: 480 }}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Código *</label>
                        <input className="form-input mono" value={codigo} required type="text"
                            onChange={(e: any) => setCodigo(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Nome *</label>
                        <input className="form-input" value={nome} required type="text"
                            onChange={(e: any) => setNome(e.target.value)} />
                    </div>

                    {erro && <p className="error-text" style={{ marginBottom: 12 }}>⚠ {erro}</p>}

                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost"
                            onClick={() => navigate("/contacontabil")}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AlterarContaContabil;