using System.ComponentModel; 
using System.ComponentModel.DataAnnotations;

namespace Crash.Models;

public class ContaPagar
{
    public int Id { get; set; }
    [Required]
    public required string Descricao { get; set; } = string.Empty;
    [Required]
    public required decimal Valor { get; set; }
    [Required]
    public required DateTime DataVencimento { get; set; }

    [DefaultValue(false)]

    public bool Pago { get; set; } = false;

    // Relacionamentos Obrigatórios (Base)
    [Required]
    public required int FornecedorId { get; set; }
    public Fornecedor? Fornecedor { get; set; }
    [Required]
    public required int ContaContabilId { get; set; }
    public ContaContabil? ContaContabil { get; set; }
    [Required]
    public required int CentroCustoId { get; set; }
    public CentroCusto? CentroCusto { get; set; }

    // Relacionamento com Conta Bancária (Preenchido só quando ocorrer a baixa)
    public int? ContaBancariaId { get; set; }
    public ContaBancaria? ContaBancaria { get; set; }
}