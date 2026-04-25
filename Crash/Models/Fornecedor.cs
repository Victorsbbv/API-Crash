using System;

namespace Crash.Models;

public class Fornecedor
{
    public int Id {get;set;}
    public string? Nome {get;set;}
    public string? CNPJ {get;set;}
    public bool Ativo {get;set;} = true;
}
