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
    fornecedor.Ativo = atualizado.Ativo;
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
    }
    else
    {
        return Results.NotFound("Não há contas contábeis registrados ou ativos.");
    }
}).WithName("ListarContaContabil").WithOpenApi();

// POST - Cria uma nova conta contábil
app.MapPost("/api/contacontabil", async (ContaContabil contacontabil, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(contacontabil.Nome) || string.IsNullOrWhiteSpace(contacontabil.Codigo))
        return Results.BadRequest("O nome e o código da conta contábil são obrigatórios.");

    contacontabil.Ativo = true;
    db.ContasContabeis.Add(contacontabil);
    await db.SaveChangesAsync();
    return Results.Created($"/api/contacontabil/{contacontabil.Id}", contacontabil);
}).WithName("CriarContaContabil").WithOpenApi();


// PUT
app.MapPut("/api/contacontabil/{id}", async (int id, ContaContabil atualizado, AppDbContext db) =>
{
    var contacontabil = await db.ContasContabeis.FindAsync(id);
    if (contacontabil is null)
    {
        return Results.NotFound("Conta Contábil não encontrada.");
    }
    contacontabil.Nome = atualizado.Nome;
    contacontabil.Codigo = atualizado.Codigo;
    contacontabil.Ativo = atualizado.Ativo;
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
    if (!centros.Any())
    {
        return Results.NotFound("Não há centros de custo registrados ou ativos.");
    }
    return Results.Ok(centros);
}).WithName("ListarCentrosCusto").WithOpenApi();

//Post - Criar um novo centro de custo
app.MapPost("/api/centrocusto", async (CentroCusto centrocusto, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(centrocusto.Nome))
        return Results.BadRequest("O nome do centro de custo é obrigatório.");
    db.CentrosCusto.Add(centrocusto);
    await db.SaveChangesAsync();
    return Results.Created($"/api/centrocusto/{centrocusto.Id}", centrocusto);
}).WithName("CriarCentroCusto").WithOpenApi();

//Put - Atualiza um centro de custo existente
app.MapPut("/api/centro/{id}", async (int id, CentroCusto atualizado, AppDbContext db) =>
{
    var centro = await db.CentrosCusto.FindAsync(id);
    if (centro is null) return Results.NotFound("Centro de custo não encontrado.");
    centro.Nome = atualizado.Nome;
    centro.Ativo = atualizado.Ativo;
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
    if (!contas.Any())
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
    conta.Ativo = atualizado.Ativo;
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
    if (!fornecedorValido)
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

//Rotas de baixas de titulos

// POST - baixa individual: informa os ids de conta a pagar e conta bancaria

app.MapPost("/api/baixa/{contaPagarId}", async (int contaPagarId, BaixaTitulo pedido, AppDbContext db) =>
{
    var conta = await db.ContasAPagar.FindAsync(contaPagarId);
    if (conta is null)
        return Results.NotFound("Conta a pagar não encontrada.");
    if (conta.Pago)
        return Results.BadRequest("Este título já foi baixado.");

    var contaBancaria = await db.ContasBancarias.FindAsync(pedido.ContaBancariaId);
    if (contaBancaria is null || !contaBancaria.Ativo)
        return Results.BadRequest("Conta bancária não encontrada ou inativa.");

    if (contaBancaria.Saldo < conta.Valor)
        return Results.BadRequest($"Saldo insuficiente. Saldo disponível: {contaBancaria.Saldo:C}");

    contaBancaria.Saldo -= conta.Valor;
    conta.Pago = true;
    conta.ContaBancariaId = contaBancaria.Id;

    var baixa = new BaixaTitulo
    {
        ContaPagarId = conta.Id,
        ContaBancariaId = contaBancaria.Id,
        ValorBaixado = conta.Valor,
        DataPagamento = DateTime.Now
    };
    db.BaixasTitulos.Add(baixa);
    await db.SaveChangesAsync();
    return Results.Ok(new
    {
        Mensagem = "Título baixado com sucesso.",
        BaixaId = baixa.Id,
        ValorDebitado = baixa.ValorBaixado,
        SaldoRestante = contaBancaria.Saldo
    });
}
).WithName("BaixarTituloIndividual").WithOpenApi();

// POST - baixa em lote: informa uma lista de ids e a conta bancária 
app.MapPost("/api/baixa/lote", async (BaixaLote pedido, AppDbContext db) =>
{
    if (pedido.ContaPagarIds == null || !pedido.ContaPagarIds.Any())
        return Results.BadRequest("Informe ao menos um título para baixa.");

    var contaBancaria = await db.ContasBancarias.FindAsync(pedido.ContaBancariaId);
    if (contaBancaria is null || !contaBancaria.Ativo)
        return Results.BadRequest("Conta bancária não encontrada ou inativa.");

    var contas = await db.ContasAPagar
        .Where(c => pedido.ContaPagarIds.Contains(c.Id))
        .ToListAsync();

    var naoEncontrados = pedido.ContaPagarIds.Except(contas.Select(c => c.Id)).ToList();
    if (naoEncontrados.Any())
        return Results.NotFound(new { Mensagem = "Títulos não encontrados.", Ids = naoEncontrados });

    var jaPagos = contas.Where(c => c.Pago).Select(c => c.Id).ToList();
    if (jaPagos.Any())
        return Results.BadRequest(new { Mensagem = "Os seguintes títulos já foram baixados.", Ids = jaPagos });

    var totalLote = contas.Sum(c => c.Valor);
    if (contaBancaria.Saldo < totalLote)
        return Results.BadRequest($"Saldo insuficiente. Total necessário: {totalLote:C} | Disponível: {contaBancaria.Saldo:C}");

    var baixasRealizadas = new List<object>();

    foreach (var conta in contas)
    {
        contaBancaria.Saldo -= conta.Valor;
        conta.Pago = true;
        conta.ContaBancariaId = contaBancaria.Id;

        var baixa = new BaixaTitulo
        {
            ContaPagarId = conta.Id,
            ContaBancariaId = contaBancaria.Id,
            ValorBaixado = conta.Valor,
            DataPagamento = DateTime.Now
        };

        db.BaixasTitulos.Add(baixa);
        baixasRealizadas.Add(new { TituloId = conta.Id, Descricao = conta.Descricao, ValorBaixado = conta.Valor });

    }

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        Mensagem = $"{contas.Count} título(s) baixado(s) com sucesso.",
        TotalDebitado = totalLote,
        SaldoRestante = contaBancaria.Saldo,
        Titulos = baixasRealizadas
    });
}).WithName("BaixarTitulosEmLote").WithOpenApi();

// GET - Histórico de todas as baixas realizadas
app.MapGet("/api/baixa", async (AppDbContext db) =>
{
    var baixas = await db.BaixasTitulos
        .Include(b => b.ContaPagar)
            .ThenInclude(cp => cp!.Fornecedor)
        .Include(b => b.ContaBancaria)
        .OrderByDescending(b => b.DataPagamento)
        .ToListAsync();

    if (!baixas.Any())
        return Results.NotFound("Nenhuma baixa registrada.");

    return Results.Ok(baixas);
}).WithName("ListarBaixas").WithOpenApi();

// GET - Detalhes de uma baixa específica
app.MapGet("/api/baixa/{baixaId}", async (int baixaId, AppDbContext db) =>
{
    var baixa = await db.BaixasTitulos
        .Include(b => b.ContaPagar)
            .ThenInclude(cp => cp!.Fornecedor)
        .Include(b => b.ContaBancaria)
        .FirstOrDefaultAsync(b => b.Id == baixaId);

    if (baixa is null)
        return Results.NotFound("Baixa não encontrada.");

    return Results.Ok(baixa);
}).WithName("DetalhesBaixa").WithOpenApi();

// DELETE - Cancela uma baixa e devolve o saldo para a conta bancária
app.MapDelete("/api/baixa/{baixaId}", async (int baixaId, AppDbContext db) =>
{
    var baixa = await db.BaixasTitulos.FindAsync(baixaId);
    if (baixa is null)
        return Results.NotFound("Baixa não encontrada.");

    var conta = await db.ContasAPagar.FindAsync(baixa.ContaPagarId);
    if (conta is null)
        return Results.NotFound("Conta a pagar relacionada não encontrada.");

    var contaBancaria = await db.ContasBancarias.FindAsync(baixa.ContaBancariaId);
    if (contaBancaria is null)
        return Results.NotFound("Conta bancária relacionada não encontrada.");

    // Devolve o saldo para a conta bancária
    contaBancaria.Saldo += baixa.ValorBaixado;

    // Marca a conta como não paga
    conta.Pago = false;
    conta.ContaBancariaId = null;

    // Remove o registro de baixa
    db.BaixasTitulos.Remove(baixa);
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        Mensagem = "Baixa cancelada com sucesso.",
        SaldoDevolvido = baixa.ValorBaixado,
        SaldoAtualizado = contaBancaria.Saldo,
        ContaBancaria = contaBancaria.NomeBanco,
        ContaPagar = conta.Descricao
    });
}).WithName("CancelarBaixa").WithOpenApi();

// PUT - Reativa uma conta a pagar após cancelamento de baixa
app.MapPut("/api/baixa/reativar/{contaPagarId}", async (int contaPagarId, AppDbContext db) =>
{
    var conta = await db.ContasAPagar.FindAsync(contaPagarId);
    if (conta is null)
        return Results.NotFound("Conta a pagar não encontrada.");

    if (!conta.Pago)
        return Results.BadRequest("Esta conta não foi baixada, portanto não precisa ser reativada.");

    // Verifica se há uma baixa associada
    var baixa = await db.BaixasTitulos
        .FirstOrDefaultAsync(b => b.ContaPagarId == contaPagarId);

    if (baixa is null)
        return Results.BadRequest("Nenhuma baixa encontrada para esta conta.");

    // Reativa a conta (apenas marca como não paga)
    conta.Pago = false;
    conta.ContaBancariaId = null;

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        Mensagem = "Conta reativada com sucesso.",
        ContaId = conta.Id,
        Descricao = conta.Descricao,
        Valor = conta.Valor,
        Status = "Pendente"
    });
}).WithName("ReativarContaPagar").WithOpenApi();

// RELATÓRIO PARAMETRIZADO

// GET - Todos os parâmetros são opcionais.
app.MapGet("/api/relatorio", async (
    AppDbContext db,
    DateTime? dataInicio,
    DateTime? dataFim,
    bool? pago,
    int? fornecedorId,
    int? contaContabilId,
    int? centroCustoId
) =>
{
    var query = db.ContasAPagar
        .Include(c => c.Fornecedor)
        .Include(c => c.ContaContabil)
        .Include(c => c.CentroCusto)
        .Include(c => c.ContaBancaria)
        .AsQueryable();

    if (dataInicio.HasValue)
        query = query.Where(c => c.DataVencimento >= dataInicio.Value);

    if (dataFim.HasValue)
        query = query.Where(c => c.DataVencimento <= dataFim.Value);

    if (pago.HasValue)
        query = query.Where(c => c.Pago == pago.Value);

    if (fornecedorId.HasValue)
        query = query.Where(c => c.FornecedorId == fornecedorId.Value);

    if (contaContabilId.HasValue)
        query = query.Where(c => c.ContaContabilId == contaContabilId.Value);

    if (centroCustoId.HasValue)
        query = query.Where(c => c.CentroCustoId == centroCustoId.Value);

    var titulos = await query.OrderBy(c => c.DataVencimento).ToListAsync();

    if (!titulos.Any())
        return Results.NotFound("Nenhuma conta encontrada com os filtros aplicados.");

    var totalPago = titulos.Where(c => c.Pago).Sum(c => c.Valor);
    var totalPendente = titulos.Where(c => !c.Pago).Sum(c => c.Valor);

    return Results.Ok(new
    {
        Titulos = titulos,
        Resumo = new
        {
            TotalTitulos = titulos.Count,
            TotalPago = totalPago,
            TotalPendente = totalPendente,
            TotalGeral = totalPago + totalPendente
        }
    });
}).WithName("RelatorioContasAPagar").WithOpenApi();

app.Run();

// Body da baixa em lote: { "contaPagarIds": [1, 2, 3], "contaBancariaId": 1 }
record BaixaLote(List<int> ContaPagarIds, int ContaBancariaId);
