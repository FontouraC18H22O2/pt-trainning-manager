import React, { useState } from 'react';

export default function Treinos() {
  // 1. Estado para dados estáticos em memória (Mock) dos planos
  const [planos] = useState([
    { 
      id: 1, 
      nome: 'Hipertrofia ABC - Avançado', 
      categoria: 'Massa Muscular', 
      exercicios: 18, 
      nivel: 'Alta Intensidade', 
      corNivel: 'text-red-400 bg-red-500/10 border-red-500/20'
    },
    { 
      id: 2, 
      nome: 'Perda de Peso & Cardio Rápido', 
      categoria: 'Definição / Endurance', 
      exercicios: 12, 
      nivel: 'Média Intensidade', 
      corNivel: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    },
    { 
      id: 3, 
      nome: 'Força Pura - Progressão OHP', 
      categoria: 'Powerlifting / Força', 
      exercicios: 8, 
      nivel: 'Alta Intensidade', 
      corNivel: 'text-red-400 bg-red-500/10 border-red-500/20'
    },
    { 
      id: 4, 
      nome: 'Adaptação Anatómica Inicial', 
      categoria: 'Condicionamento', 
      exercicios: 10, 
      nivel: 'Baixa Intensidade', 
      corNivel: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
  ]);

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho do Ecrã */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Planos de Treino</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Configure as rotinas, exercícios, séries e tempos de descanso dos seus atletas.
          </p>
        </div>
        <button className="bg-fitnessGym hover:bg-emerald-600 text-neutral-950 font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer text-sm font-medium">
          + Criar Plano
        </button>
      </div>

      {/* Grelha de Cartões (Cards Grid) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {planos.map((plano) => (
          <div 
            key={plano.id}
            className="flex flex-col justify-between p-6 transition-all border bg-neutral-900 border-neutral-800 rounded-2xl hover:border-neutral-700 group"
          >
            {/* Bloco Superior do Card */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${plano.corNivel}`}>
                  {plano.nivel}
                </span>
                <div className="flex gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                  <button className="p-1 cursor-pointer text-neutral-400 hover:text-white" title="Editar Plano">
                    ✏️
                  </button>
                  <button className="p-1 text-red-400 cursor-pointer hover:text-red-500" title="Excluir Plano">
                    🗑️
                  </button>
                </div>
              </div>

              <h2 className="mt-4 text-xl font-bold tracking-tight text-white transition-colors group-hover:text-fitnessGym">
                {plano.nome}
              </h2>
              
              <p className="text-neutral-400 text-sm mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span>
                {plano.categoria}
              </p>
            </div>

            {/* Bloco Inferior (Métricas e Acesso) */}
            <div className="flex items-center justify-between pt-4 mt-8 border-t border-neutral-800/60">
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-fitnessGym" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>
                  <strong className="font-semibold text-white">{plano.exercicios}</strong> exercícios rotulados
                </span>
              </div>

              <button className="flex items-center gap-1 text-xs font-bold tracking-wider uppercase cursor-pointer text-fitnessGym hover:text-emerald-300 group/btn">
                Ver Ficha 
                <span className="transition-transform transform group-hover/btn:translate-x-1">→</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}