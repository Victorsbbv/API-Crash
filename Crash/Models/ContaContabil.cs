using System.ComponentModel; 
using System.ComponentModel.DataAnnotations;

namespace Crash.Models;

public class ContaContabil
{
    public int Id { get; set; }
    [Required]
    public required string Nome { get; set; } = string.Empty;
    [Required]
    public required string Codigo { get; set; } = string.Empty;
    [DefaultValue(true)] 
    public bool Ativo { get; set; } = true;
}