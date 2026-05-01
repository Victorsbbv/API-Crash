using System;

namespace Crash.Models;

public class ContaPagar
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public DateTime DataVencimento { get; set; }
    public bool Pago { get; set; } = false;

    // Relacionamentos Obrigatórios (Base)
    public int FornecedorId { get; set; }
    public Fornecedor? Fornecedor { get; set; }

    public int ContaContabilId { get; set; }
    public ContaContabil? ContaContabil { get; set; }

    public int CentroCustoId { get; set; }
    public CentroCusto? CentroCusto { get; set; }

    // Relacionamento com Conta Bancária (Preenchido só quando ocorrer a baixa)
    public int? ContaBancariaId { get; set; }
    public ContaBacancaria? ContaBancaria { get; set; }
}