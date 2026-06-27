import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function VisualizarTreino() {
  const { studentId } = useParams();
  const [studentName, setStudentName] = useState('');
  const [planos, setPlanos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const resolverGifUrl = (gifUrl) => {
    if (!gifUrl) return null;
    if (gifUrl.startsWith('http://') || gifUrl.startsWith('https://')) return gifUrl;
    return `${BACKEND_URL}${gifUrl}`;
  };

  useEffect(() => {
    const fetchDados = async () => {
      try {
        setLoading(true);
        const [resTreinos, resAvaliacoes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/training/public/student/${studentId}`),
          axios.get(`${BACKEND_URL}/api/assessments/public/student/${studentId}`)
        ]);
        setStudentName(resTreinos.data.studentName || 'Atleta');
        setPlanos(resTreinos.data.planos || []);
        setAvaliacoes(resAvaliacoes.data || []);
        if (resTreinos.data.planos?.length > 0) {
          setAbaAtiva(resTreinos.data.planos[0].dayNumber ?? 1);
        } else {
          setAbaAtiva('avaliacao');
        }
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar o teu plano de treino. Confirme o link enviado pelo teu treinador.');
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 text-white bg-neutral-950">
        <div className="w-10 h-10 border-4 border-red-500 rounded-full border-t-transparent animate-spin"></div>
        <p className="text-sm font-medium text-neutral-400">A preparar a tua rotina de treino...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 text-white bg-neutral-950">
        <div className="w-full max-w-md p-6 text-center border border-red-900 bg-red-950/20 rounded-2xl">
          <p className="text-sm font-semibold text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const planoAtivo = planos.find(p => p.dayNumber === abaAtiva);

  return (
    <div className="min-h-screen text-white bg-neutral-950 bg-gradient-to-br from-neutral-950 via-red-950/10 to-neutral-950 relative before:absolute before:inset-0 before:bg-[linear-gradient(45deg,transparent_45%,rgba(220,38,38,0.04)_48%,rgba(220,38,38,0.08)_50%,rgba(220,38,38,0.04)_52%,transparent_55%)] before:pointer-events-none">
      {/* Cabeçalho */}
      <div className="p-4 border-b md:p-6 bg-neutral-900 border-neutral-800">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-black tracking-widest text-red-500 uppercase">PT Control</span>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">
            Olá, {studentName}! 💪
          </h1>
          <p className="mt-1 text-sm text-neutral-400">Aqui tens o teu plano de treino completo.</p>
        </div>
      </div>

      {/* Abas de navegação */}
      <div className="sticky top-0 z-10 border-b bg-neutral-900/95 backdrop-blur border-neutral-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex overflow-x-auto scrollbar-none">
            {planos.map(plano => (
              <button
                key={plano.id}
                onClick={() => setAbaAtiva(plano.dayNumber)}
                className={`flex-shrink-0 px-5 py-3.5 text-sm font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  abaAtiva === plano.dayNumber
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-600'
                }`}
              >
                {plano.name || `Dia ${plano.dayNumber}`}
              </button>
            ))}
            {/* Aba de Avaliação Física (placeholder) */}
            <button
              onClick={() => setAbaAtiva('avaliacao')}
              className={`flex-shrink-0 px-5 py-3.5 text-sm font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                abaAtiva === 'avaliacao'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-600'
              }`}
            >
              📊 Avaliação Física
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo da aba ativa */}
      <div className="max-w-4xl p-4 mx-auto space-y-4 md:p-6">

        {/* Aba de treino */}
        {abaAtiva !== 'avaliacao' && planoAtivo && (
          <>
            {planoAtivo.notes && (
              <div className="p-4 border bg-neutral-900 border-neutral-800 rounded-2xl">
                <p className="text-xs font-bold tracking-wider uppercase text-neutral-400">Recomendações do Treinador:</p>
                <p className="mt-1 text-sm italic text-neutral-300">"{planoAtivo.notes}"</p>
              </div>
            )}

            {planoAtivo.exercises.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-neutral-800 rounded-2xl">
                <p className="text-sm text-neutral-500">Nenhum exercício neste dia ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {planoAtivo.exercises.map((ex, index) => (
                  <div
                    key={ex.id || index}
                    className="flex flex-col overflow-hidden transition-colors border md:flex-row border-neutral-800 bg-neutral-900 rounded-2xl group hover:border-neutral-700"
                  >
                    {/* GIF */}
                    <div className="flex items-center justify-center w-full overflow-hidden border-b md:w-56 aspect-video md:aspect-square bg-neutral-950 md:border-b-0 md:border-r border-neutral-800">
                      {ex.gifUrl ? (
                        <img
                          src={resolverGifUrl(ex.gifUrl)}
                          alt={ex.exerciseName}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/400x400/171717/a3a3a3?text=Sem+GIF';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-neutral-600">
                          <span className="text-3xl">🏋️‍♂️</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest">Sem Demonstração</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-between flex-1 p-5 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black bg-neutral-950 px-2 py-1 border border-neutral-800 rounded-md text-red-500 uppercase tracking-wider">
                          Exercício {index + 1}
                        </span>
                        <h3 className="pt-1 text-lg font-bold text-neutral-100 group-hover:text-red-500">
                          {ex.exerciseName}
                        </h3>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-3 text-center border bg-neutral-950/60 rounded-xl border-neutral-800/50">
                        <div>
                          <span className="block text-[10px] font-bold text-neutral-500 uppercase">Séries</span>
                          <span className="text-sm font-black text-white">{ex.sets}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-neutral-500 uppercase">Reps</span>
                          <span className="text-sm font-black text-white">{ex.reps}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-neutral-500 uppercase">Descanso</span>
                          <span className="text-sm font-black text-red-400">{ex.restTime}</span>
                        </div>
                      </div>

                      {ex.notes && (
                        <div className="p-3 border bg-neutral-950/30 border-neutral-800/40 rounded-xl">
                          <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Nota de execução:</span>
                          <p className="text-xs italic text-neutral-300">"{ex.notes}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Aba sem plano (dia novo ainda sem exercícios) */}
        {abaAtiva !== 'avaliacao' && !planoAtivo && (
          <div className="p-12 text-center border border-dashed border-neutral-800 rounded-2xl">
            <p className="text-sm text-neutral-500">Nenhum plano disponível.</p>
          </div>
        )}

        {/* Aba de Avaliação Física */}
        {abaAtiva === 'avaliacao' && (
          <div className="space-y-4">
            {avaliacoes.length === 0 ? (
              <div className="p-10 space-y-3 text-center border border-dashed border-neutral-800 rounded-2xl">
                <span className="text-4xl">📊</span>
                <h3 className="text-lg font-bold text-white">Avaliação Física</h3>
                <p className="text-sm text-neutral-500">A tua avaliação física será disponibilizada aqui em breve pelo teu treinador.</p>
              </div>
            ) : (
              avaliacoes.map((av, idx) => (
                <div key={av.id} className="p-5 space-y-4 border bg-neutral-900 border-neutral-800 rounded-2xl">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <h3 className="font-bold text-white">
                      📊 Avaliação {idx === 0 ? '(Mais Recente) — ' : '— '}
                      {new Date(av.assessmentDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      ['Peso', av.peso, 'kg'], ['Altura', av.altura, 'cm'], ['IMC', av.imc, ''],
                      ['% Massa Gorda', av.pctMassaGorda, '%'], ['% Água', av.pctAgua, '%'],
                      ['Massa Muscular', av.kgMassaMuscular, 'kg'], ['TMB', av.tmb, 'kcal'],
                      ['Idade Metabólica', av.idadeMetabolica, 'anos'], ['Gordura Visceral', av.gorduraVisceral, ''],
                      ['Tórax', av.torax, 'cm'], ['Cintura', av.cintura, 'cm'],
                      ['Abdómen', av.abdomen, 'cm'], ['Quadril', av.quadril, 'cm'],
                    ].map(([label, val, unit]) => val !== null && val !== undefined && (
                      <div key={label} className="p-3 border bg-neutral-950 border-neutral-800 rounded-xl">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{label}</p>
                        <p className="text-lg font-black text-white">{val}{unit ? ` ${unit}` : ''}</p>
                      </div>
                    ))}
                  </div>
                  {av.objetivos && (
                    <div className="p-3 border bg-neutral-950 border-neutral-800 rounded-xl">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Objetivos</p>
                      <p className="text-sm text-neutral-300">{av.objetivos}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}