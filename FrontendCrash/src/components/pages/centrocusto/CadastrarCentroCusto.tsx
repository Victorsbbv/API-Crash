import { useState } from "react";
import type CentroCusto from "../../../models/CentroCusto";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";

function CadastrarCentroCusto() {

    const [nome, setNome] = useState("");
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    async function enviarAPI(e: any) {
        e.preventDefault();

        if (!nome.trim()) {
            setErro("Nome é obrigatório.");
            return;
        }

        try {
            const centro: CentroCusto = { nome };
            await api.post("/api/centrocusto", centro);
            navigate("/centrocusto");
        } catch (error: any) {
            console.log(error);
            setErro(error.response?.data ?? "Erro ao cadastrar centro de custo.");
        }
    }

    return (
        <div className="CadastrarCentroCusto">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Cadastrar <span className="accent">Centro de Custo</span></h2>
                    <p className="page-subtitle">// novo centro de custo</p>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={enviarAPI} style={{ maxWidth: 480 }}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Nome *</label>
                        <input className="form-input" value={nome} required type="text"
                            placeholder="Ex: Administrativo, TI, Vendas..."
                            onChange={(e: any) => setNome(e.target.value)} />
                    </div>

                    {erro && <p className="error-text" style={{ marginBottom: 12 }}>⚠ {erro}</p>}

                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost"
                            onClick={() => navigate("/centrocusto")}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">Cadastrar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CadastrarCentroCusto;