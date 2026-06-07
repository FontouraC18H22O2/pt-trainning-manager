import React, { useState, useEffect } from 'react';
import weightService from '../services/weightService';

export default function WeightModal({ isOpen, onClose, studentId, exerciseName }) {
  const [history, setHistory] = useState([]);
  const [weight, setWeight] = useState('');
  const [repsDone, setRepsDone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Carrega o histórico sempre que o modal abre para um exercício diferente
  useEffect(() => {
    if (isOpen && studentId && exerciseName) {
      carregarHistorico();
    }
  }, [isOpen, studentId, exerciseName]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      setError('');
      const dados = await weightService.getWeightHistory(studentId, exerciseName);
      setHistory(dados);
    } catch (err) {
      setError('Falha ao carregar a linha temporal de cargas.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || isNaN(weight)) return;

    try {
      setLoading(true);
      await weightService.logWeight({
        studentId,
        exerciseName,
        weight: parseFloat(weight),
        repsDone: repsDone ? parseInt(repsDone) : null
      });
      
      setWeight('');
      setRepsDone('');
      // Recarrega a lista para mostrar a nova linha imediatamente
      await carregarHistorico();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md p-6 space-y-6 border shadow-2xl bg-neutral-900 border-neutral-800 rounded-2xl">
        
        {/* Topo do Modal */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white truncate max-w-[280px]" title={exerciseName}>
              📈 {exerciseName}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">Histórico e Evolução de Cargas</p>
          </div>
          <button 
            onClick={onClose}
            className="px-2 py-1 text-sm font-bold transition-colors border rounded-lg cursor-pointer text-neutral-500 hover:text-white bg-neutral-950 border-neutral-800"
          >
            Fechar
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs text-red-400 border bg-red-500/10 border-red-500/20 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {/* Formulário de Novo Registo Rápido */}
        <form onSubmit={handleSubmit} className="grid items-end grid-cols-2 gap-3 p-4 border bg-neutral-950 border-neutral-800/80 rounded-xl">
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400 font-medium">Nova Carga (kg) *</label>
            <input 
              type="number" 
              step="0.5"
              placeholder="Ex: 85"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 text-sm text-white border outline-none bg-neutral-900 border-neutral-800 rounded-xl focus:border-fitnessGym"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400 font-medium">Reps Feitas (Opcional)</label>
            <input 
              type="number" 
              placeholder="Ex: 10"
              value={repsDone}
              onChange={(e) => setRepsDone(e.target.value)}
              className="w-full px-3 py-2 text-sm text-white border outline-none bg-neutral-900 border-neutral-800 rounded-xl focus:border-fitnessGym"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
           className="col-span-2 py-2.5 mt-1 rounded-xl bg-fitnessGym hover:bg-emerald-600 text-neutral-950 font-bold text-xs transition-all duration-200 cursor-pointer shadow-md shadow-emerald-500/5 disabled:opacity-40"
          >
            {loading ? 'A registar...' : 'Injetar Novo Pico de Carga'}
          </button>
        </form>

        {/* Lista Histórica em Linha de Tempo */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold tracking-wider uppercase text-neutral-400">Registos Anteriores</h4>
          <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {loading && history.length === 0 ? (
              <div className="py-6 text-xs text-center text-neutral-500">🔄 A ler base de dados...</div>
            ) : history.length > 0 ? (
              history.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 text-sm border rounded-xl bg-neutral-950 border-neutral-800/40">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-base font-bold text-white">{log.weight} kg</span>
                    {log.repsDone && (
                      <span className="font-mono text-xs text-neutral-500">({log.repsDone} reps)</span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    {new Date(log.createdAt).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-xs italic text-center text-neutral-600">
                Nenhum peso registado para este exercício ainda.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}