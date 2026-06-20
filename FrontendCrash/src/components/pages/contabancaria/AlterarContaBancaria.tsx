import { useEffect, useState } from "react";
import type ContaBancaria from "../../../models/ContaBancaria";
import api from "../../../services/api";
import { useNavigate, useParams } from "react-router-dom";

function AlterarContaBancaria() {

    const [nomeBanco, setNomeBanco] = useState("");
    const [saldo, setSaldo] = useState("");
    const [erro, setErro] = useState("");
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        buscarAPI();
    }, []);

    async function buscarAPI() {
        try {
            const resposta = await api.get("/api/contabancaria");
            const todos: ContaBancaria[] = [
                ...resposta.data.ativos,
                ...resposta.data.inativos
            ];
            const conta = todos.find((c: ContaBancaria) => c.id === Number(id));
            if (conta) {
                setNomeBanco(conta.nomeBanco);
                setSaldo(String(conta.saldo ?? 0));
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function enviarAPI(e: any) {
        e.preventDefault();

        if (!nomeBanco.trim()) {
            setErro("Nome do banco é obrigatório.");
            return;
        }

        try {
            const conta: ContaBancaria = {
                id: Number(id),
                nomeBanco,
                saldo: Number(saldo) || 0,
                ativo: true
            };
            await api.put(`/api/contabancaria/${id}`, conta);
            navigate("/contabancaria");
        } catch (error: any) {
            console.log(error);
            setErro(error.response?.data ?? "Erro ao alterar conta bancária.");
        }
    }

    return (
        <div className="AlterarContaBancaria">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Alterar <span className="accent">Conta Bancária</span></h2>
                    <p className="page-subtitle">// editar registro #{id}</p>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={enviarAPI} style={{ maxWidth: 480 }}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Nome do Banco *</label>
                        <input className="form-input" value={nomeBanco} required type="text"
                            onChange={(e: any) => setNomeBanco(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Saldo (R$)</label>
                        <input className="form-input mono" value={saldo} type="number"
                            min="0" step="0.01"
                            onChange={(e: any) => setSaldo(e.target.value)} />
                    </div>

                    {erro && <p className="error-text" style={{ marginBottom: 12 }}>⚠ {erro}</p>}

                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost"
                            onClick={() => navigate("/contabancaria")}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AlterarContaBancaria;
