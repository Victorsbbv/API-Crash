using System.ComponentModel.DataAnnotations;
namespace Crash.Models;

public class BaixaTitulo
{
    public int Id { get; set; }
    [Required]
    public required DateTime DataPagamento { get; set; } = DateTime.Now;
    [Required]
    public required decimal ValorBaixado { get; set; }

    // Relacionamentos
    [Required]
    public required int ContaPagarId { get; set; }
    public ContaPagar? ContaPagar { get; set; }
    [Required]
    public required int ContaBancariaId { get; set; }
    public ContaBancaria? ContaBancaria { get; set; }
}
