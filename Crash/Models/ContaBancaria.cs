using System.ComponentModel; 
using System.ComponentModel.DataAnnotations;

namespace Crash.Models;

public class ContaBancaria
{
    public int Id { get; set; }
        [Required]
        public required string NomeBanco { get; set; } = string.Empty;
        [Required]
        public required decimal Saldo { get; set; }
        [DefaultValue(true)]
        public bool Ativo { get; set; } = true;
}
