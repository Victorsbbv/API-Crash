# API Crash
Trabalho em C# desenvolvido para a disciplina Tópicos Especiais em Sistemas

Participantes:<br>
João Felipe Mokdse Costa<br>
Max Lopes Garcia de Oliveira<br>
Júlia Helena Buosi Teixeira<br>
Victor Schernikau Bahia Bittencourt Vieira<br>


O modelo lógico é composto por 5 entidades fundamentais:

1. *Fornecedores (Fornecedor):* Entidade credora. Armazena os dados de quem receberá o pagamento (Razão Social, CNPJ/CPF). Utiliza o tipo NUMBER(1) para representação booleana de status ativo/inativo (Padrão Oracle).
2. *Plano de Contas (ContaContabil):* Classifica a natureza da despesa (ex: Energia Elétrica, Aluguel, Material de Escritório). Permite o agrupamento de despesas por categoria.
3. *Centros de Custo (CentroCusto):* Classifica a origem gerencial da despesa (ex: Setor de Marketing, Diretoria, TI). Permite analisar qual departamento está consumindo os recursos.
4. *Contas Bancárias / Caixas (ContaBancaria):* Representa as fontes de recurso da empresa (ex: Itaú, Bradesco, Caixa Físico). Mantém o controle rigoroso do SaldoAtual.
5. *Contas a Pagar (ContaPagar):* O núcleo do sistema. Registra a obrigação financeira, contendo o valor, data de vencimento e status.

Relacionamentos e Regras de Negócio (Foreign Keys)

A arquitetura garante as seguintes restrições de integridade no nível do banco de dados:

* *Obrigatoriedade de Rastreabilidade (1:N):* Uma conta a pagar *não pode ser criada* sem estar rigidamente vinculada a um Fornecedor, a uma Conta Contábil e a um Centro de Custo. Isso impede o lançamento de "despesas órfãs" no sistema.
* *Vínculo Dinâmico de Pagamento:* A chave estrangeira ContaBancariaId na tabela de Contas a Pagar permite valores nulos (NULL / int?). Esta é uma regra de negócio vital: a origem do recurso só é definida no momento exato da *Baixa Unitária* (Liquidação do título).

Diagrama de Classes (UML)

Abaixo está o diagrama conceitual de classes que espelha o mapeamento Objeto-Relacional (ORM) utilizado pelo Entity Framework Core no projeto:

```mermaid
classDiagram
    direction BT

    class Fornecedor {
        +int Id
        +string RazaoSocial
        +string CnpjCpf
        +bool Ativo
    }

    class ContaContabil {
        +int Id
        +string Codigo
        +string Descricao
    }

    class CentroCusto {
        +int Id
        +string Codigo
        +string Nome
    }

    class ContaBancaria {
        +int Id
        +string NomeCaixa
        +decimal SaldoAtual
    }

    class ContaPagar {
        +int Id
        +string Descricao
        +decimal Valor
        +DateTime DataVencimento
        +DateTime? DataPagamento
        +string Status
        +int FornecedorId
        +int ContaContabilId
        +int CentroCustoId
        +int? ContaBancariaId
    }

    %% Relacionamentos (Multiplicidades)
    ContaPagar "*" --> "1" Fornecedor : Pertence a
    ContaPagar "*" --> "1" ContaContabil : Classificada em
    ContaPagar "*" --> "1" CentroCusto : Alocada em
    ContaPagar "*" --> "1" ContaBancaria : Paga por (Na Baixa)
