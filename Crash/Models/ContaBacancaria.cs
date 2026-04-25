using System;

namespace Crash.Models;

public class ContaBacancaria
{
    public int Id { get; set; }
        public string NomeBanco { get; set; } = string.Empty;
        public decimal Saldo { get; set; }
        public bool Ativo { get; set; } = true;
}
