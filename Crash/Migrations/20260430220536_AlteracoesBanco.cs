using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Crash.Migrations
{
    /// <inheritdoc />
    public partial class AlteracoesBanco : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BaixasTitulos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DataPagamento = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ValorBaixado = table.Column<decimal>(type: "TEXT", nullable: false),
                    ContaPagarId = table.Column<int>(type: "INTEGER", nullable: false),
                    ContaBancariaId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaixasTitulos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BaixasTitulos_ContasAPagar_ContaPagarId",
                        column: x => x.ContaPagarId,
                        principalTable: "ContasAPagar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BaixasTitulos_ContasBancarias_ContaBancariaId",
                        column: x => x.ContaBancariaId,
                        principalTable: "ContasBancarias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BaixasTitulos_ContaBancariaId",
                table: "BaixasTitulos",
                column: "ContaBancariaId");

            migrationBuilder.CreateIndex(
                name: "IX_BaixasTitulos_ContaPagarId",
                table: "BaixasTitulos",
                column: "ContaPagarId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BaixasTitulos");
        }
    }
}
