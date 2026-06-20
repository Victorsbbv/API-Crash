import type ContaPagar from "./ContaPagar";
import type ContaBancaria from "./ContaBancaria";

// Interface que representa uma baixa de título (registro de pagamento)
export default interface BaixaTitulo {
    id?: number;
    dataPagamento?: string;
    valorBaixado?: number;
    contaPagarId: number;
    contaBancariaId: number;
    // Objetos de navegação retornados pelo GET
    contaPagar?: ContaPagar;
    contaBancaria?: ContaBancaria;
}
