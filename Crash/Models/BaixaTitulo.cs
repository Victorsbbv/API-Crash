using System;

namespace Crash.Models;

public class BaixaTitulo
{
    public int Id { get; set; }
    public DateTime DataPagamento { get; set; } = DateTime.Now;
    public decimal ValorBaixado { get; set; }

    // Relacionamentos
    public int ContaPagarId { get; set; }
    public ContaPagar? ContaPagar { get; set; }

    public int ContaBancariaId { get; set; }
    public ContaBacancaria? ContaBancaria { get; set; }
}
