import React, { useState, useEffect } from 'react';
import { 
  createTrainer, 
  getTrainersList, 
  deactivateTrainer,
  activateTrainer,          
  permanentlyDeleteTrainer  
} from '../services/adminService'; 
import ModalPT from '../components/ModalPT';

export default function GestaoPTs() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 🗑️ Estado para o modal customizado de eliminação definitiva
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });

  // 🔄 Novo: Estado para o modal customizado de alteração de estado (Suspender / Reativar)
  const [statusModal, setStatusModal] = useState({ open: false, id: null, name: '', actionType: '' }); // actionType pode ser 'SUSPENDER' ou 'REATIVAR'

  const carregarTreinadores = async () => {
    try {
      setLoading(true);
      setError('');
      const dadosReais = await getTrainersList();
      setTrainers(dadosReais);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar os treinadores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTreinadores();
  }, []);

  const handleSaveTrainer = async (dadosPT) => {
    try {
      setError('');
      setSuccessMessage('');
      await createTrainer(dadosPT);
      setSuccessMessage('Conta de Personal Trainer gerada com sucesso!');
      await carregarTreinadores();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Erro ao criar conta do treinador.');
    }
  };

  // ⏸️ Executar a Suspensão de Acesso
  const handleConfirmDeactivate = async () => {
    try {
      setError('');
      setSuccessMessage('');
      await deactivateTrainer(statusModal.id);
      setSuccessMessage(`Acesso do PT ${statusModal.name} suspenso com sucesso.`);
      setStatusModal({ open: false, id: null, name: '', actionType: '' });
      await carregarTreinadores();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setStatusModal({ open: false, id: null, name: '', actionType: '' });
      setError(err.message || 'Erro ao desativar treinador.');
    }
  };

  // ▶️ Executar a Reativação de Acesso
  const handleConfirmActivate = async () => {
    try {
      setError('');
      setSuccessMessage('');
      await activateTrainer(statusModal.id);
      setSuccessMessage(`Acesso do PT ${statusModal.name} reativado com sucesso!`);
      setStatusModal({ open: false, id: null, name: '', actionType: '' });
      await carregarTreinadores();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setStatusModal({ open: false, id: null, name: '', actionType: '' });
      setError(err.message || 'Erro ao reativar treinador.');
    }
  };

  // 🗑️ Executar Eliminação Permanente
  const handleConfirmDelete = async () => {
    try {
      setError('');
      setSuccessMessage('');
      await permanentlyDeleteTrainer(deleteModal.id);
      setSuccessMessage(`Acesso e conta de ${deleteModal.name} eliminados para sempre.`);
      setDeleteModal({ open: false, id: null, name: '' });
      await carregarTreinadores();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setDeleteModal({ open: false, id: null, name: '' });
      setError(err.message || 'Não foi possível eliminar o PT. Verifique se ele não tem alunos.');
    }
  };

  const filteredTrainers = trainers.filter(pt =>
    pt.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pt.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 space-y-6 text-white bg-neutral-950">
      
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 pb-4 border-b sm:flex-row sm:items-center sm:justify-between border-neutral-900">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase">Gestão de Personal Trainers</h1>
          <p className="mt-1 text-xs text-neutral-400">Controla as credenciais, acessos ativos e monitorização da equipa de PTs.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-red-600/10 cursor-pointer text-center"
        >
          ➕ Registar Novo PT
        </button>
      </div>

      {/* Feedbacks */}
      {error && (
        <div className="p-4 border bg-red-950/20 border-red-900/30 rounded-xl">
          <p className="text-xs font-semibold text-red-400">⚠️ {error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 border bg-emerald-950/20 border-emerald-900/30 rounded-xl">
          <p className="text-xs font-semibold text-emerald-400">✅ {successMessage}</p>
        </div>
      )}

      {/* Barra de Filtro */}
      <div className="flex items-center max-w-md px-4 py-3 transition-all border bg-neutral-900/40 border-neutral-900 rounded-xl focus-within:border-neutral-800">
        <span className="mr-3 text-sm text-neutral-500">🔍</span>
        <input
          type="text"
          placeholder="Pesquisar por nome ou e-mail oficial..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm text-white bg-transparent focus:outline-none placeholder-neutral-500"
        />
      </div>

      {/* Tabela de Dados */}
      <div className="overflow-hidden border bg-neutral-900/20 border-neutral-900 rounded-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-900/40 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                <th className="px-6 py-4">Nome Profissional</th>
                <th className="px-6 py-4">E-mail de Contacto</th>
                <th className="px-6 py-4">Último Acesso</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Ações de Controlo</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-neutral-900/50 text-neutral-300">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-red-600 rounded-full border-b-transparent animate-spin"></div>
                      <span className="font-medium text-neutral-500">A carregar registos da equipa...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTrainers.length > 0 ? (
                filteredTrainers.map((pt) => (
                  <tr key={pt.id} className="transition-colors hover:bg-neutral-900/20">
                    <td className="px-6 py-4 font-semibold text-white">{pt.nome}</td>
                    <td className="px-6 py-4 text-neutral-400">{pt.email}</td>
                    <td className="px-6 py-4 text-neutral-500">
                      {pt.lastLogin ? new Date(pt.lastLogin).toLocaleString('pt-PT') : 'Nunca iniciou sessão'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${pt.isActive ? 'text-emerald-400' : 'text-amber-500'}`}>
                        <span className={`w-2 h-2 rounded-full ${pt.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-600'}`}></span>
                        {pt.isActive ? 'Ativo' : 'Suspenso'}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2 text-right">
                      {pt.isActive ? (
                        <button
                          onClick={() => setStatusModal({ open: true, id: pt.id, name: pt.nome, actionType: 'SUSPENDER' })}
                          className="px-3 py-1.5 text-xs font-bold text-amber-400 border border-amber-500/10 bg-amber-500/5 hover:bg-amber-500/20 rounded-xl transition-all cursor-pointer"
                        >
                          ⏸️ Suspender
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setStatusModal({ open: true, id: pt.id, name: pt.nome, actionType: 'REATIVAR' })}
                            className="px-3 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/20 rounded-xl transition-all cursor-pointer"
                          >
                            ▶️ Reativar
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, id: pt.id, name: pt.nome })}
                            className="px-3 py-1.5 text-xs font-bold text-red-400 border border-red-500/10 bg-red-500/5 hover:bg-red-500/20 rounded-xl transition-all cursor-pointer"
                          >
                            🗑️ Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-neutral-500">
                    Nenhum Personal Trainer encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalPT
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTrainer}
      />

      {/* 🔄 MODAL DE CONFIRMAÇÃO DE STATUS (SUSPENDER OU REATIVAR) */}
      {statusModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 space-y-4 text-center border bg-neutral-900 border-neutral-800 rounded-2xl">
            
            {statusModal.actionType === 'SUSPENDER' ? (
              <>
                <div className="flex items-center justify-center w-12 h-12 mx-auto border rounded-full bg-amber-500/10 border-amber-500/20">
                  <span className="text-lg text-amber-500">⏸️</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Suspender Acesso?</h3>
                  <p className="text-xs leading-relaxed text-neutral-400">
                    Tens a certeza que desejas retirar temporariamente o acesso de <span className="font-semibold text-amber-400">"{statusModal.name}"</span>? O utilizador não poderá entrar até reativares a conta.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-12 h-12 mx-auto border rounded-full bg-emerald-500/10 border-emerald-500/20">
                  <span className="text-lg text-emerald-400">▶️</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Reativar Acesso?</h3>
                  <p className="text-xs leading-relaxed text-neutral-400">
                    Desejas restabelecer o acesso total de <span className="font-semibold text-emerald-400">"{statusModal.name}"</span> ao sistema de gestão de treinos?
                  </p>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStatusModal({ open: false, id: null, name: '', actionType: '' })}
                className="flex-1 py-2.5 text-xs font-bold tracking-wider uppercase transition-colors bg-neutral-800 text-neutral-400 rounded-xl hover:bg-neutral-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={statusModal.actionType === 'SUSPENDER' ? handleConfirmDeactivate : handleConfirmActivate}
                className={`flex-1 py-2.5 text-xs font-bold tracking-wider uppercase transition-all text-white rounded-xl shadow-lg ${
                  statusModal.actionType === 'SUSPENDER' 
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/10' 
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10'
                } cursor-pointer`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ MODAL DE CONFIRMAÇÃO DE ELIMINAÇÃO DEFINITIVA */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 space-y-4 text-center border bg-neutral-900 border-neutral-800 rounded-2xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto border rounded-full bg-red-500/10 border-red-500/20">
              <span className="text-lg text-red-500">⚠️</span>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Remover Permanentemente?</h3>
              <p className="text-xs leading-relaxed text-neutral-400">
                Tens a certeza que desejas apagar o registo de <span className="font-semibold text-red-400">"{deleteModal.name}"</span>? Esta ação é irreversível e removerá o PT do sistema.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, id: null, name: '' })}
                className="flex-1 py-2.5 text-xs font-bold tracking-wider uppercase transition-colors bg-neutral-800 text-neutral-400 rounded-xl hover:bg-neutral-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 text-xs font-bold tracking-wider uppercase transition-all bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/10 cursor-pointer"
              >
                Sim, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}