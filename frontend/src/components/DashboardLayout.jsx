import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-neutral-950 bg-gradient-to-br from-neutral-950 via-red-950/10 to-neutral-950 text-white flex relative before:absolute before:inset-0 before:bg-[linear-gradient(45deg,transparent_45%,rgba(220,38,38,0.04)_48%,rgba(220,38,38,0.08)_50%,rgba(220,38,38,0.04)_52%,transparent_55%)] before:pointer-events-none">
      {/* Barra Lateral Estática à Esquerda */}
      <Sidebar />

      {/* Zona de Conteúdo Dinâmico à Direita */}
      <main className="flex-1 max-h-screen p-8 overflow-y-auto">
        <div className="mx-auto max-w-7xl">
          <Outlet /> {/* É aqui que as páginas internas vão aparecer! */}
        </div>
      </main>
    </div>
  );
}