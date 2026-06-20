import { useEffect, useState } from "react";
import type CentroCusto from "../../../models/CentroCusto";
import api from "../../../services/api";
import { useNavigate, useParams } from "react-router-dom";

function AlterarCentroCusto() {

    const [nome, setNome] = useState("");
    const [erro, setErro] = useState("");
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        buscarAPI();
    }, []);

    async function buscarAPI() {
        try {
            const resposta = await api.get("/api/centrocusto");
            const todos: CentroCusto[] = [
                ...resposta.data.ativos,
                ...resposta.data.inativos
            ];
            const centro = todos.find((c: CentroCusto) => c.id === Number(id));
            if (centro) setNome(centro.nome);
        } catch (error) {
            console.log(error);
        }
    }

    async function enviarAPI(e: any) {
        e.preventDefault();

        if (!nome.trim()) {
            setErro("Nome é obrigatório.");
            return;
        }

        try {
            const centro: CentroCusto = { id: Number(id), nome, ativo: true };
            await api.put(`/api/centrocusto/${id}`, centro);
            navigate("/centrocusto");
        } catch (error: any) {
            console.log(error);
            setErro(error.response?.data ?? "Erro ao alterar centro de custo.");
        }
    }

    return (
        <div className="AlterarCentroCusto">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Alterar <span className="accent">Centro de Custo</span></h2>
                    <p className="page-subtitle">// editar registro #{id}</p>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={enviarAPI} style={{ maxWidth: 480 }}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Nome *</label>
                        <input className="form-input" value={nome} required type="text"
                            onChange={(e: any) => setNome(e.target.value)} />
                    </div>

                    {erro && <p className="error-text" style={{ marginBottom: 12 }}>⚠ {erro}</p>}

                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost"
                            onClick={() => navigate("/centrocusto")}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AlterarCentroCusto;