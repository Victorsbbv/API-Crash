using System;
using Crash.Models;
using Microsoft.EntityFrameworkCore;

namespace Crash.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base (options) {}
    public DbSet<Fornecedor> Fornecedores {get;set;}
    public DbSet<ContaContabil> ContasContabeis {get; set;}
    public DbSet<CentroCusto> CentrosCusto { get; set; }
    public DbSet<ContaBacancaria> ContasBancarias { get; set; }
    public DbSet<ContaPagar> ContasAPagar { get; set; }
    public DbSet<BaixaTitulo> BaixasTitulos { get; set; }
}
