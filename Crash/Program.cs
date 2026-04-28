using Crash.Data;
using Crash.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Ativa o Swagger, que é a interface visual (acessada pelo navegador) para testar
// as rotas da API sem precisar de ferramentas externas como o Postman.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Registra o Entity Framework com SQLite.
// O Entity Framework é um ORM (Object-Relational Mapper): ele faz a ponte entre
// os Models em C# e as tabelas do banco de dados, traduzindo operações como
// db.Fornecedores.Add() para SQL automaticamente, sem precisar escrever SQL manual.
// O "Data Source=crash.db" define o nome do arquivo do banco SQLite que será criado.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=crash.db"));

var app = builder.Build();

// Ao iniciar a aplicação, abre uma conexão com o banco e chama EnsureCreated().
// EnsureCreated() verifica se o banco já existe: se não existir, cria o arquivo
// crash.db e todas as tabelas com base nos Models registrados no AppDbContext.
// Isso substitui a necessidade de rodar Migrations manualmente pelo terminal
// (comandos: dotnet ef migrations add / dotnet ef database update).
// Migrations são mais indicadas para produção pois permitem atualizar o banco
// sem perder dados. Para este projeto, EnsureCreated() é suficiente.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Ativa a interface visual do Swagger para testar as rotas
    app.UseSwagger();
    app.UseSwaggerUI();

// Rota placeholder (adicionei uma rota mínima no / para confirmar que a API está online 
// quando acessada pelo navegador. 
// As rotas de CRUD de cada entidade ainda precisam ser implementadas)

app.MapGet("/", () => "Crash ERP API está online!");

app.Run();