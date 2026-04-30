// Importando EntityFramework, Models e Data
using Microsoft.EntityFrameworkCore;
using Crash.Models;
using Crash.Data;

var builder = WebApplication.CreateBuilder(args);

// Ativa o Swagger, que é a interface visual (acessada pelo navegador) para testar
// as rotas da API sem precisar de ferramentas externas como o Postman.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//Usar o SQLite em Options
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Swagger - Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();
    }
}

// Ativa a interface visual do Swagger para testar as rotas
    app.UseSwagger();
    app.UseSwaggerUI();

// Rota placeholder (adicionei uma rota mínima no / para confirmar que a API está online 
// quando acessada pelo navegador. 
// As rotas de CRUD de cada entidade ainda precisam ser implementadas)
app.MapGet("/", () => "Crash ERP API está online!");

// ROTAS DE FORNECEDORES - Utilizando Swagger
// GET request
app.MapGet("/api/fornecedores", async (AppDbContext db) =>
{
    var fornecedores = await db.Fornecedores.Where(f => f.Ativo).ToListAsync();
    return Results.Ok(fornecedores);
}).WithName("ListarFornecedores").WithOpenApi();

//POST request
app.MapPost("/api/fornecedores", async (Fornecedor fornecedor, AppDbContext db) =>
{
    //Fornecedores 'espera' o swagger (Botão de enviar)
    db.Fornecedores.Add(fornecedor);
    //Salva as alterações no banco de dados
    await db.SaveChangesAsync();
    //Mensagem de retorno Created - 201
    return Results.Created($"/api/fornecedores/{fornecedor.Id}", fornecedor);
    //WithName - Nome interno único dessa rota, evita que alterações como /api/v1/fornecedores quebrem o fluxo
    //WithOpenApi - Inclui o nome interno nos campos do Swagger
}).WithName("CriarFornecedor").WithOpenApi(); 

//PUT (UPDATE) request
app.MapPut("/api/fornecedores/{id}", async (int id, Fornecedor atualizado, AppDbContext db) =>
{
    //Espera o banco de dados procurar pelo id requisitado pelo swagger
    var fornecedor = await db.Fornecedores.FindAsync(id);
    //Caso o banco de dados não ache esse id (no caso fornecedor seria nulo) ele retorna um NotFound 404
    if (fornecedor is null) return Results.NotFound("Fornecedor não encontrado.");

    fornecedor.Nome = atualizado.Nome;
    fornecedor.CNPJ = atualizado.CNPJ;
    await db.SaveChangesAsync();
    return Results.Ok(fornecedor);
}).WithName("AtualizarFornecedor").WithOpenApi();

//DELETE request (obs: nesse caso pelas regras de negócio os fornecedores não poderão ser deletados, apenas desativados)
app.MapDelete("/api/fornecedores/{id}", async (int id, AppDbContext db) =>
{
    var fornecedor = await db.Fornecedores.FindAsync(id);
    if (fornecedor is null)
    {
        return Results.NotFound("Fornecedor não encontrado.");
    }    
    fornecedor.Ativo = false;
    await db.SaveChangesAsync();
    return Results.Ok(new { Mensagem = "Fornecedor inativado." });
}).WithName("InativarFornecedor").WithOpenApi();

// ROTAS DE CONTACONTÁBIL - Utilizando Swagger
// GET request
app.MapGet("api/contacontabil/", async (AppDbContext db) =>
{
    var contacontabil = await db.ContasContabeis.Where(f => f.Ativo).ToListAsync();
    if (contacontabil.Any())
    {
        return Results.Ok(contacontabil);
    } else
    {
        return Results.NotFound("Não há contas contábeis registrados ou ativos.");
    }
}).WithName("ListarContaContabil").WithOpenApi();

app.MapPost("/api/contacontabil/", async (ContaContabil contacontabil, AppDbContext db) =>
{
    db.ContasContabeis.Add(contacontabil);
        if (string.IsNullOrWhiteSpace(contacontabil.Nome) || string.IsNullOrWhiteSpace(contacontabil.Codigo)){
            await db.SaveChangesAsync();
            return Results.Created($"/api/contacontabil/{contacontabil.Id}", contacontabil);
        } else
        {
            return Results.BadRequest("O nome da conta contábil não pode ser vazio.");
        }
}).WithName("CriarContaContabil").WithOpenApi();

app.MapPut("/api/contacontabil/{id}", async (int id, ContaContabil atualizado, AppDbContext db) =>
{
    var contacontabil = await db.ContasContabeis.FindAsync(id);
    if (contacontabil is null)
    {
        return Results.NotFound("Conta Contábil não encontrada.");
    } 
    contacontabil.Nome = atualizado.Nome;
    contacontabil.Codigo = atualizado.Codigo;
    await db.SaveChangesAsync();
    return Results.Ok(contacontabil);
}).WithName("BuscarContaContabil").WithOpenApi();

app.MapDelete("/api/contacontabil/{id}", async (int id, AppDbContext db) =>
{
    var contacontabil = await db.ContasContabeis.FindAsync(id);
    if (contacontabil is null)
    {
        return Results.NotFound("Conta contábil não encontrada.");
    }    
    contacontabil.Ativo = false;
    await db.SaveChangesAsync();
    return Results.Ok(new { Mensagem = "Conta contábil inativada." });
}).WithName("InativarContaContabil").WithOpenApi();

app.Run();