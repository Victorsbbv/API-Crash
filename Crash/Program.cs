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
        if (!string.IsNullOrWhiteSpace(contacontabil.Nome) || string.IsNullOrWhiteSpace(contacontabil.Codigo)){
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

//Rotas de Centro de Custo

//Get - Lista todos os centros de custo ativos
app.MapGet("/api/centrocusto", async (AppDbContext db) =>
{
    var centros = await db.CentrosCusto.Where(c => c.Ativo).
    ToListAsync();
    if(!centros.Any())
    {
        return Results.NotFound("Não há centros de custo registrados ou ativos.");
    }
    return Results.Ok(centros);
}).WithName("ListarCentrosCusto").WithOpenApi();

//Post - Criar um novo centro de custo
app.MapPost("/api/centrocusto", async (CentroCusto centrocusto, AppDbContext db)=>
{
    if(string.IsNullOrWhiteSpace(centrocusto.Nome))
    return Results.BadRequest("O nome do centro de custo é obrigatório.");
    db.CentrosCusto.Add(centrocusto);
    await db.SaveChangesAsync();
    return Results.Created($"/api/centrocusto/{centrocusto.Id}", centrocusto);
}).WithName("CriarCentroCusto").WithOpenApi();

//Put - Atualiza um centro de custo existente
app.MapPut("/api/centro/{id}", async (int id, CentroCusto atualizado, AppDbContext db)=>
{
    var centro = await db.CentrosCusto.FindAsync(id);
    if(centro is null) return Results.NotFound("Centro de custo não encontrado.");
    centro.Nome = atualizado.Nome;
    await db.SaveChangesAsync();
    return Results.Ok(centro);
}).WithName("AtualizarCentroCusto").WithOpenApi();
// DELETE - Inativa um centro de custo (inativo/ativo)
app.MapDelete("/api/centrocusto/{id}", async (int id, AppDbContext db) =>
{
    var centro = await db.CentrosCusto.FindAsync(id);
    if (centro is null) return Results.NotFound("Centro de custo não encontrado.");

    centro.Ativo = false;
    await db.SaveChangesAsync();
    return Results.Ok(new { Mensagem = "Centro de custo inativado com sucesso." });
}).WithName("InativarCentroCusto").WithOpenApi();

// Rotas de Conta Bancária

// GET - Faz a listagem de todas as contas bancárias ativas

app.MapGet("/api/contabancaria", async (AppDbContext db) => 
{
    var contas = await db.ContasBancarias.Where(c => c.Ativo).ToListAsync();
    if(!contas.Any())
    {
        return Results.NotFound("Não há contas bancárias registradas ou ativas.");
    }
    return Results.Ok(contas);
}).WithName("ListarContasBancarias").WithOpenApi();

// POST - Faz a criação de uma nova conta bancária
app.MapPost("/api/contabancaria", async (ContaBancaria conta, AppDbContext db) =>
{
if (string.IsNullOrWhiteSpace(conta.NomeBanco))
{
        return Results.BadRequest("O nome do banco é obrigatório.");
}

    db.ContasBancarias.Add(conta);
    await db.SaveChangesAsync();
    return Results.Created($"/api/contabancaria/{conta.Id}", conta);
}).WithName("CriarContaBancaria").WithOpenApi();

// PUT - Atualiza o saldo ou o nome de uma conta bancária
app.MapPut("/api/contabancaria/{id}", async (int id, ContaBancaria atualizado, AppDbContext db) =>
{
    var conta = await db.ContasBancarias.FindAsync(id);
    if (conta is null)
    {
        return Results.NotFound("Conta bancária não encontrada.");
    }

    conta.NomeBanco = atualizado.NomeBanco;
    conta.Saldo = atualizado.Saldo;
    await db.SaveChangesAsync();
    return Results.Ok(conta);
}).WithName("AtualizarContaBancaria").WithOpenApi();

// DELETE - Inativa uma conta bancária (exclusão lógica)
app.MapDelete("/api/contabancaria/{id}", async (int id, AppDbContext db) =>
{
    var conta = await db.ContasBancarias.FindAsync(id);
    if (conta is null)
    {
        return Results.NotFound("Conta bancária não encontrada.");
    }

    conta.Ativo = false;
    await db.SaveChangesAsync();
    return Results.Ok(new { Mensagem = "Conta bancária inativada com sucesso." });
}).WithName("InativarContaBancaria").WithOpenApi();

// Rotas de Contas a Pagar

// GET - lista todas as contas a pagar com relacionamentos
app.MapGet("/api/contapagar", async (int id, AppDbContext db) => 
{
    var conta = await db.ContasAPagar
        .Include(c => c.Fornecedor)
        .Include(c => c.ContaContabil)
        .Include(c => c.CentroCusto)
        .Include(c => c.ContaBancaria)
        .FirstOrDefaultAsync(c => c.Id == id);

    if (conta is null)
    { 
        return Results.NotFound("Conta a pagar não encontrada.");
    }
    return Results.Ok(conta);
}).WithName("BuscarContaPagar").WithOpenApi();

// POST - Cria uma nova conta a pagar
app.MapPost("/api/contapagar", async (ContaPagar conta, AppDbContext db) =>
{
    // AnyAsync não rastreia a entidade, evitando conflito de tracking com o body do request
    var fornecedorValido = await db.Fornecedores.AnyAsync(f => f.Id == conta.FornecedorId && f.Ativo);
    if(!fornecedorValido)
    {
        return Results.BadRequest("Fornecedor não encontrado ou inativo.");
    }

    var contaContabilValida = await db.ContasContabeis.AnyAsync(c => c.Id == conta.ContaContabilId && c.Ativo);
    if (!contaContabilValida)
    {
        return Results.BadRequest("Conta contábil não encontrada ou inativa.");
    }

    var centroCustoValido = await db.CentrosCusto.AnyAsync(c => c.Id == conta.CentroCustoId && c.Ativo);
    if (!centroCustoValido)
    {
        return Results.BadRequest("Centro de custo não encontrado ou inativo.");
    }

    // Zera navegações para o EF não tentar rastrear objetos duplicados vindos do body
    conta.Fornecedor = null;
    conta.ContaContabil = null;
    conta.CentroCusto = null;
    conta.ContaBancaria = null;

    db.ContasAPagar.Add(conta);
    await db.SaveChangesAsync();
    return Results.Created($"/api/contapagar/{conta.Id}", conta);
}).WithName("CriarContaPagar").WithOpenApi();

// PUT - Atualiza uma conta a pagar (bloqueado se já foi pago)
app.MapPut("/api/contapagar/{id}", async (int id, ContaPagar atualizado, AppDbContext db) =>
{
    var conta = await db.ContasAPagar.FindAsync(id);
    if (conta is null) 
    {
        return Results.NotFound("Conta a pagar não encontrada.");
    }
    if (conta.Pago) 
    {
        return Results.BadRequest("Não é possível editar uma conta que já foi baixada.");
    }

    // AnyAsync não rastreia a entidade, evitando conflito de tracking com o body do request
    var fornecedorValido = await db.Fornecedores.AnyAsync(f => f.Id == atualizado.FornecedorId && f.Ativo);
    if (!fornecedorValido)
    {
        return Results.BadRequest("Fornecedor não encontrado ou inativo.");
    }

    var contaContabilValida = await db.ContasContabeis.AnyAsync(c => c.Id == atualizado.ContaContabilId && c.Ativo);
    if (!contaContabilValida)
    {
        return Results.BadRequest("Conta contábil não encontrada ou inativa.");
    }

    var centroCustoValido = await db.CentrosCusto.AnyAsync(c => c.Id == atualizado.CentroCustoId && c.Ativo);
    if (!centroCustoValido)
    {
        return Results.BadRequest("Centro de custo não encontrado ou inativo.");
    }

    conta.Descricao = atualizado.Descricao;
    conta.Valor = atualizado.Valor;
    conta.DataVencimento = atualizado.DataVencimento;
    conta.FornecedorId = atualizado.FornecedorId;
    conta.ContaContabilId = atualizado.ContaContabilId;
    conta.CentroCustoId = atualizado.CentroCustoId;

    await db.SaveChangesAsync();
    return Results.Ok(conta);
}).WithName("AtualizarContaPagar").WithOpenApi();

// DELETE - Remove fisicamente uma conta a pagar (bloqueando se já foi pago
app.MapDelete("/api/contapagar/{id}", async (int id, AppDbContext db) =>
{
    var conta = await db.ContasAPagar.FindAsync(id);
    if (conta is null) 
    {
        return Results.NotFound("Conta a pagar não encontrada.");
    }
    if (conta.Pago)
    {
        return Results.BadRequest("Não é possível excluir uma conta que já foi baixada.");
    }
    db.ContasAPagar.Remove(conta);
    await db.SaveChangesAsync();
    return Results.Ok(new { Mensagem = "Conta a pagar removida com sucesso." });
}).WithName("RemoverContaPagar").WithOpenApi();





app.Run();