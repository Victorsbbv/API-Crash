import { useState } from "react";
import type ContaContabil from "../../../models/ContaContabil";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";

// Formulário para cadastrar uma nova conta contábil
function CadastrarContaContabil() {

    const [nome, setNome] = useState("");
    const [codigo, setCodigo] = useState("");
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    async function enviarAPI(e: any) {
        e.preventDefault();

        if (!nome.trim() || !codigo.trim()) {
            setErro("Nome e Código são obrigatórios.");
            return;
        }

        try {
            const conta: ContaContabil = { nome, codigo };
            // POST /api/contacontabil — cria no banco
            await api.post("/api/contacontabil", conta);
            navigate("/contacontabil");
        } catch (error: any) {
            console.log(error);
            setErro(error.response?.data ?? "Erro ao cadastrar conta contábil.");
        }
    }

    return (
        <div className="CadastrarContaContabil">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Cadastrar <span className="accent">Conta Contábil</span></h2>
                    <p className="page-subtitle">// novo registro no plano de contas</p>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={enviarAPI} style={{ maxWidth: 480 }}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Código *</label>
                        <input className="form-input mono" value={codigo} required type="text"
                            placeholder="Ex: 1.1.1.001"
                            onChange={(e: any) => setCodigo(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Nome *</label>
                        <input className="form-input" value={nome} required type="text"
                            placeholder="Nome da conta contábil"
                            onChange={(e: any) => setNome(e.target.value)} />
                    </div>

                    {erro && <p className="error-text" style={{ marginBottom: 12 }}>⚠ {erro}</p>}

                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost"
                            onClick={() => navigate("/contacontabil")}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">Cadastrar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CadastrarContaContabil;