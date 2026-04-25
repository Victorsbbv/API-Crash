using System;

namespace Crash.Models;

public class ContaContabil
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty; 
    public bool Ativo { get; set; } = true;
}
