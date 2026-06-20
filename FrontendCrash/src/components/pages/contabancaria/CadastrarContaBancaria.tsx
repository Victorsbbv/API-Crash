import { useState } from "react";
import type ContaBancaria from "../../../models/ContaBancaria";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";

function CadastrarContaBancaria() {

    const [nomeBanco, setNomeBanco] = useState("");
    const [saldo, setSaldo] = useState("");
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    async function enviarAPI(e: any) {
        e.preventDefault();

        if (!nomeBanco.trim()) {
            setErro("Nome do banco é obrigatório.");
            return;
        }

        try {
            // Converte o saldo de string para número
            const conta: ContaBancaria = {
                nomeBanco,
                saldo: Number(saldo) || 0
            };
            await api.post("/api/contabancaria", conta);
            navigate("/contabancaria");
        } catch (error: any) {
            console.log(error);
            setErro(error.response?.data ?? "Erro ao cadastrar conta bancária.");
        }
    }

    return (
        <div className="CadastrarContaBancaria">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Cadastrar <span className="accent">Conta Bancária</span></h2>
                    <p className="page-subtitle">// nova conta bancária</p>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={enviarAPI} style={{ maxWidth: 480 }}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Nome do Banco *</label>
                        <input className="form-input" value={nomeBanco} required type="text"
                            placeholder="Ex: Banco do Brasil, Caixa..."
                            onChange={(e: any) => setNomeBanco(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Saldo Inicial (R$)</label>
                        <input className="form-input mono" value={saldo} type="number"
                            min="0" step="0.01" placeholder="0.00"
                            onChange={(e: any) => setSaldo(e.target.value)} />
                    </div>

                    {erro && <p className="error-text" style={{ marginBottom: 12 }}>⚠ {erro}</p>}

                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost"
                            onClick={() => navigate("/contabancaria")}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">Cadastrar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CadastrarContaBancaria;
