import { useEffect, useState } from "react";
import api from "../../../services/api";
import type BaixaTitulo from "../../../models/BaixaTitulo";
import { Link } from "react-router-dom";

// Lista o histórico de todas as baixas realizadas
// Baixa = registro de pagamento de um título (conta a pagar)
function ListarBaixas() {

    const [baixas, setBaixas] = useState<BaixaTitulo[]>([]);
    const [erro, setErro] = useState("");

    useEffect(() => {
        carregarAPI();
    }, []);

    async function carregarAPI() {
        try {
            // GET /api/baixa retorna o histórico de baixas com Include dos objetos de navegação
            const resposta = await api.get<BaixaTitulo[]>("/api/baixa");
            // Garante array mesmo se a API retornar null
            setBaixas(Array.isArray(resposta.data) ? resposta.data : []);
            setErro("");
        } catch (error) {
            console.log(error);
            // Limpa a lista para não deixar dados obsoletos na tela
            setBaixas([]);
            setErro("Nenhuma baixa registrada.");
        }
    }

    // Cancela uma baixa — devolve o saldo para a conta bancária
    async function cancelarBaixa(id: number) {
        // Remove otimisticamente da lista antes da resposta da API
        setBaixas(prev => prev.filter(b => b.id !== id));
        try {
            // DELETE /api/baixa/{id} cancela e estorna o valor
            await api.delete(`/api/baixa/${id}`);
            // Recarrega para confirmar estado real do servidor
            carregarAPI();
        } catch (error: any) {
            console.log(error);
            // Se falhou, restaura recarregando
            carregarAPI();
            alert(error.response?.data ?? "Erro ao cancelar baixa.");
        }
    }

    const fmt = (v: number) =>
        v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const fmtData = (d: string) =>
        new Date(d).toLocaleDateString("pt-BR");

    return (
        <div className="ListarBaixas">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Baixa de <span className="accent">Títulos</span></h2>
                    <p className="page-subtitle">// histórico de pagamentos realizados</p>
                </div>
                {/* Link para a página de realizar nova baixa */}
                <Link to="/baixa/realizar" className="btn btn-primary">+ Realizar Baixa</Link>
            </div>

            <div className="page-body">
                {erro && <p className="error-text">⚠ {erro}</p>}

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Data Pagamento</th>
                                <th>Título</th>
                                <th>Fornecedor</th>
                                <th>Banco</th>
                                <th>Valor Baixado</th>
                                <th>Cancelar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {baixas.map((b: BaixaTitulo) => (
                                <tr key={b.id}>
                                    <td>{b.id}</td>
                                    <td className="mono">{fmtData(b.dataPagamento!)}</td>
                                    {/* Acessa objeto de navegação: b.contaPagar.descricao */}
                                    <td>{b.contaPagar?.descricao ?? `#${b.contaPagarId}`}</td>
                                    <td>{b.contaPagar?.fornecedor?.nome ?? "—"}</td>
                                    <td>{b.contaBancaria?.nomeBanco ?? `#${b.contaBancariaId}`}</td>
                                    <td className="mono">{fmt(b.valorBaixado ?? 0)}</td>
                                    <td>
                                        <button className="btn btn-danger btn-sm"
                                            onClick={() => cancelarBaixa(b.id!)}>
                                            Cancelar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ListarBaixas;
