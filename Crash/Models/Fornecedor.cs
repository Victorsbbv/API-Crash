using System.ComponentModel; 
using System.ComponentModel.DataAnnotations;

namespace Crash.Models;

public class Fornecedor
{
    public int Id {get;set;}
    [Required]
    public required string Nome {get;set;}
    [Required]
    public required string CNPJ {get;set;}
    [DefaultValue(true)]
    public bool Ativo {get;set;} = true;
}
