// App.tsx — componente raiz da aplicação
// Padrão do professor: BrowserRouter envolve tudo, Routes define as páginas,
// Links na navegação apontam para as rotas sem recarregar a página

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';

// Importação de todas as páginas organizadas por entidade
// Cadastros (dependências)
import ListarFornecedor from './components/pages/fornecedor/ListarFornecedor';
import CadastrarFornecedor from './components/pages/fornecedor/CadastrarFornecedor';
import AlterarFornecedor from './components/pages/fornecedor/AlterarFornecedor';

import ListarContaContabil from './components/pages/contacontabil/ListarContaContabil';
import CadastrarContaContabil from './components/pages/contacontabil/CadastrarContaContabil';
import AlterarContaContabil from './components/pages/contacontabil/AlterarContaContabil';

import ListarCentroCusto from './components/pages/centrocusto/ListarCentroCusto';
import CadastrarCentroCusto from './components/pages/centrocusto/CadastrarCentroCusto';
import AlterarCentroCusto from './components/pages/centrocusto/AlterarCentroCusto';

import ListarContaBancaria from './components/pages/contabancaria/ListarContaBancaria';
import CadastrarContaBancaria from './components/pages/contabancaria/CadastrarContaBancaria';
import AlterarContaBancaria from './components/pages/contabancaria/AlterarContaBancaria';

// Financeiro (entidade principal)
import ListarContaPagar from './components/pages/contapagar/ListarContaPagar';
import CadastrarContaPagar from './components/pages/contapagar/CadastrarContaPagar';
import AlterarContaPagar from './components/pages/contapagar/AlterarContaPagar';

import ListarBaixas from './components/pages/baixa/ListarBaixas';
import RealizarBaixa from './components/pages/baixa/RealizarBaixa';

import Relatorio from './components/pages/relatorio/Relatorio';
import Dashboard from './components/pages/dashboard/Dashboard';
import NotFound from './components/pages/NotFound';

function App() {
  return (
    // BrowserRouter: habilita a navegação via URL no React
    // Tudo dentro dele pode usar Link, NavLink, useNavigate, useParams
    <BrowserRouter>

      {/* Sidebar de navegação — usa NavLink para destacar o link ativo */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <h1>Crash</h1>
          <span>contas a pagar</span>
        </div>

        <div className="sidebar-nav">
          {/* NavLink: como o Link do professor, mas adiciona classe "active" automaticamente */}
          <NavLink to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end>
            <span className="icon">📊</span>
            Dashboard
          </NavLink>

          <div className="sidebar-section">Financeiro</div>

          {/* NavLink recebe uma função no className para aplicar "active" quando a rota bate */}
          <NavLink to="/contapagar"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">💳</span>
            Cadastrar Contas
          </NavLink>

          <NavLink to="/baixa"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">✓</span>
            Baixas de Títulos
          </NavLink>

          <NavLink to="/relatorio"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">📈</span>
            Relatório
          </NavLink>

          <div className="sidebar-section">Cadastros</div>

          <NavLink to="/fornecedor"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">🏭</span>
            Fornecedores
          </NavLink>

          <NavLink to="/contacontabil"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">📊</span>
            Conta Contábil
          </NavLink>

          <NavLink to="/centrocusto"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">🗂️</span>
            Centro de Custo
          </NavLink>

          <NavLink to="/contabancaria"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">🏦</span>
            Conta Bancária
          </NavLink>
        </div>

        <div style={{ marginTop: 'auto', padding: '16px 24px 0', borderTop: '1px solid var(--border-dim)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
            API → localhost:5128
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Tópicos Especiais 2026.01
          </div>
        </div>
      </nav>

      {/* Conteúdo principal — Routes define qual componente renderizar por URL */}
      <main className="main">
        <Routes>
          {/* Rota padrão "/" → Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Rotas de Contas a Pagar */}
          <Route path="/contapagar" element={<ListarContaPagar />} />
          <Route path="/contapagar/cadastrar" element={<CadastrarContaPagar />} />
          {/* :id é um parâmetro dinâmico — lido pelo useParams() no componente */}
          <Route path="/contapagar/alterar/:id" element={<AlterarContaPagar />} />

          {/* Rotas de Baixas */}
          <Route path="/baixa" element={<ListarBaixas />} />
          <Route path="/baixa/realizar" element={<RealizarBaixa />} />

          {/* Rotas de Relatório */}
          <Route path="/relatorio" element={<Relatorio />} />

          {/* Rotas de Fornecedores */}
          <Route path="/fornecedor" element={<ListarFornecedor />} />
          <Route path="/fornecedor/cadastrar" element={<CadastrarFornecedor />} />
          <Route path="/fornecedor/alterar/:id" element={<AlterarFornecedor />} />

          {/* Rotas de Conta Contábil */}
          <Route path="/contacontabil" element={<ListarContaContabil />} />
          <Route path="/contacontabil/cadastrar" element={<CadastrarContaContabil />} />
          <Route path="/contacontabil/alterar/:id" element={<AlterarContaContabil />} />

          {/* Rotas de Centro de Custo */}
          <Route path="/centrocusto" element={<ListarCentroCusto />} />
          <Route path="/centrocusto/cadastrar" element={<CadastrarCentroCusto />} />
          <Route path="/centrocusto/alterar/:id" element={<AlterarCentroCusto />} />

          {/* Rotas de Conta Bancária */}
          <Route path="/contabancaria" element={<ListarContaBancaria />} />
          <Route path="/contabancaria/cadastrar" element={<CadastrarContaBancaria />} />
          <Route path="/contabancaria/alterar/:id" element={<AlterarContaBancaria />} />

          {/* Rota curinga — exibe 404 para qualquer URL não mapeada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

    </BrowserRouter>
  );
}

export default App;
