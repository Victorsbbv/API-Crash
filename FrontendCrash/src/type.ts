export interface Fornecedor {
  id: number;
  nome: string;
  cnpj: string;
  ativo: boolean;
}

export interface ContaContabil {
  id: number;
  nome: string;
  codigo: string;
  ativo: boolean;
}

export interface CentroCusto {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface ContaBancaria {
  id: number;
  nomeBanco: string;
  saldo: number;
  ativo: boolean;
}

export interface ContaPagar {
  id: number;
  descricao: string;
  valor: number;
  dataVencimento: string;
  pago: boolean;
  fornecedorId: number;
  fornecedor?: Fornecedor;
  contaContabilId: number;
  contaContabil?: ContaContabil;
  centroCustoId: number;
  centroCusto?: CentroCusto;
  contaBancariaId?: number;
  contaBancaria?: ContaBancaria;
}

export interface BaixaTitulo {
  id: number;
  dataPagamento: string;
  valorBaixado: number;
  contaPagarId: number;
  contaPagar?: ContaPagar;
  contaBancariaId: number;
  contaBancaria?: ContaBancaria;
}

export interface RelatorioResult {
  titulos: ContaPagar[];
  resumo: {
    totalTitulos: number;
    totalPago: number;
    totalPendente: number;
    totalGeral: number;
  };
}
