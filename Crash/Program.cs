// Importando EntityFramework, Models e Data
using Microsoft.EntityFrameworkCore;
using Crash.Models;
using Crash.Data;

var builder = WebApplication.CreateBuilder(args);

// Swagger - Add services to the container.
// Swagger - Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//Usar o SQLite em Options
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Swagger - Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

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
    if (fornecedor is null) return Results.NotFound("Fornecedor não encontrado.");

    fornecedor.Ativo = false;
    await db.SaveChangesAsync();
    return Results.Ok(new { Mensagem = "Fornecedor inativado." });
}).WithName("InativarFornecedor").WithOpenApi();


app.Run();