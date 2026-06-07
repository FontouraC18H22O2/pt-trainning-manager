import React, { useState } from 'react';
import ModalAluno from '../components/ModalAluno';

export default function Alunos() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lista de alunos inicial em memória (Mock)
  const [alunos, setAlunos] = useState([
    { id: 1, nome: 'João Carlos Silva', whatsapp: '912345678', plano: 'Hipertrofia ABC', status: 'Ativo' },
    { id: 2, nome: 'Maria Eduarda Santos', whatsapp: '934567890', plano: 'Perda de Peso / Cardio', status: 'Ativo' },
    { id: 3, nome: 'Pedro Miguel Costa', whatsapp: '961234567', plano: 'Força OHP', status: 'Inativo' },
    { id: 4, nome: 'Ana Catarina Ribeiro', whatsapp: '929876543', plano: 'Condicionamento Geral', status: 'Ativo' },
  ]);

  // Função para adicionar um novo aluno (Passo anterior)
  const handleSaveAluno = (novoAluno) => {
    const proximoId = alunos.length > 0 ? Math.max(...alunos.map(a => a.id)) + 1 : 1;
    const alunoCompleto = { id: proximoId, ...novoAluno };
    setAlunos([...alunos, alunoCompleto]);
  };

  // 🔥 NOVA FUNÇÃO: Remover um aluno com confirmação de segurança
  const handleDeleteAluno = (id, nome) => {
    const confirmar = window.confirm(`Tem a certeza que deseja remover o(a) aluno(a) ${nome} do sistema?`);
    
    if (confirmar) {
      // Filtra o array mantendo apenas os alunos que têm o ID diferente do que queremos apagar
      const listaAtualizada = alunos.filter(aluno => aluno.id !== id);
      setAlunos(listaAtualizada);
    }
  };

  // Filtragem dinâmica com base na barra de pesquisa
  const alunosFiltrados = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(search.toLowerCase()) ||
    aluno.plano.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Ecrã */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Gerir Alunos</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Consulte, pesquise e faça a gestão completa de todos os seus atletas inscritos.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-fitnessGym hover:bg-emerald-600 text-neutral-950 font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer text-sm font-medium"
        >
          + Novo Aluno
        </button>
      </div>

      {/* Barra de Ferramentas (Filtros e Pesquisa) */}
      <div className="flex items-center px-4 py-3 border bg-neutral-900 border-neutral-800 rounded-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Pesquisar por nome do aluno ou plano de treino..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-3 text-sm text-white bg-transparent outline-none placeholder-neutral-500"
        />
      </div>

      {/* Contentor da Tabela Responsiva */}
      <div className="overflow-hidden border shadow-sm bg-neutral-900 border-neutral-800 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="font-medium border-b border-neutral-800 bg-neutral-900/50 text-neutral-400">
                <th className="p-4">Aluno</th>
                <th className="p-4">Contacto WhatsApp</th>
                <th className="p-4">Plano Associado</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {alunosFiltrados.length > 0 ? (
                alunosFiltrados.map((aluno) => (
                  <tr key={aluno.id} className="transition-colors hover:bg-neutral-800/30">
                    <td className="p-4 font-semibold text-white">{aluno.nome}</td>
                    <td className="p-4 font-mono text-neutral-400">{aluno.whatsapp}</td>
                    <td className="p-4 text-neutral-400">{aluno.plano}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        aluno.status === 'Ativo' 
                          ? 'bg-emerald-500/10 text-fitnessGym' 
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {aluno.status}
                      </span>
                    </td>
                    <td className="p-4 space-x-2 text-right">
                      <button className="p-1 transition-colors cursor-pointer text-neutral-400 hover:text-white" title="Editar Ficha">
                        ✏️
                      </button>
                      {/* 🔥 Vinculação do clique do botão de eliminar à nossa nova função */}
                      <button 
                        onClick={() => handleDeleteAluno(aluno.id, aluno.nome)}
                        className="p-1 text-red-400 transition-colors cursor-pointer hover:text-red-500" 
                        title="Remover Aluno"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 italic text-center text-neutral-500">
                    Nenhum aluno encontrado correspondente à pesquisa "{search}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalAluno 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveAluno} 
      />

    </div>
  );
}