// Interface que representa o modelo Fornecedor
// Espelha as propriedades da classe C# Fornecedor no backend
export default interface Fornecedor {
    id?: number;
    nome: string;
    cnpj: string;
    ativo?: boolean;
}
