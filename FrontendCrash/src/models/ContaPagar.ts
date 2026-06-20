import type Fornecedor from "./Fornecedor";
import type ContaContabil from "./ContaContabil";
import type CentroCusto from "./CentroCusto";
import type ContaBancaria from "./ContaBancaria";

// Interface que representa o modelo ContaPagar (título a pagar)
// Possui relacionamentos com Fornecedor, ContaContabil, CentroCusto e ContaBancaria
export default interface ContaPagar {
    id?: number;
    descricao: string;
    valor: number;
    dataVencimento: string;
    pago?: boolean;
    // FKs — ids das entidades relacionadas (enviados no POST/PUT)
    fornecedorId: number;
    contaContabilId: number;
    centroCustoId: number;
    contaBancariaId?: number;
    // Objetos de navegação — retornados pelo GET com Include
    fornecedor?: Fornecedor;
    contaContabil?: ContaContabil;
    centroCusto?: CentroCusto;
    contaBancaria?: ContaBancaria;
}
