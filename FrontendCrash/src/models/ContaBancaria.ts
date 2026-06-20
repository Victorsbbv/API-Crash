// Interface que representa o modelo ContaBancaria
export default interface ContaBancaria {
    id?: number;
    nomeBanco: string;
    saldo?: number;
    ativo?: boolean;
}
