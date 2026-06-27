import React, { useState, useEffect } from 'react';
import studentService from '../services/studentService';
import assessmentService from '../services/assessmentService';

// Campos do formulário organizados por secção
const SECOES = {
  pessoal: {
    titulo: '👤 Dados Pessoais',
    campos: [
      { key: 'assessmentDate', label: 'Data da Avaliação', type: 'date', required: true },
      { key: 'sexo', label: 'Sexo', type: 'select', options: ['Masculino', 'Feminino'] },
      { key: 'idade', label: 'Idade', type: 'number', unit: 'anos' },
      { key: 'profissao', label: 'Profissão', type: 'text' },
      { key: 'objetivos', label: 'Objetivos', type: 'textarea' },
      { key: 'patologias', label: 'Patologias', type: 'textarea' },
      { key: 'medicamentos', label: 'Medicamentos / Suplementos', type: 'textarea' },
      { key: 'alcoolTabaco', label: 'Álcool ou Tabaco (Frequência)', type: 'text' },
      { key: 'experienciaTreino', label: 'Experiência de Treino', type: 'text' },
      { key: 'nivelAtividade', label: 'Nível de Atividade Física', type: 'select', options: ['Sedentário', 'Levemente Ativo', 'Moderadamente Ativo', 'Muito Ativo', 'Extremamente Ativo'] },
      { key: 'vezesSemana', label: 'Vezes por Semana', type: 'number' },
    ]
  },
  medidas: {
    titulo: '📏 Medidas Corporais',
    campos: [
      { key: 'peso', label: 'Peso', unit: 'kg', type: 'decimal' },
      { key: 'altura', label: 'Altura', unit: 'cm', type: 'decimal' },
      { key: 'imc', label: 'IMC', unit: '', type: 'decimal', readOnly: true },
    ]
  },
  membros: {
    titulo: '💪 Membros',
    grupos: [
      { label: 'Braço Direito', campos: [{ key: 'bracoDireitoCm', label: 'cm' }, { key: 'bracoDireitoPct', label: '%' }, { key: 'bracoDireitoKg', label: 'kg' }] },
      { label: 'Braço Esquerdo', campos: [{ key: 'bracoEsquerdoCm', label: 'cm' }, { key: 'bracoEsquerdoPct', label: '%' }, { key: 'bracoEsquerdoKg', label: 'kg' }] },
      { label: 'Perna Direita', campos: [{ key: 'pernaDireitaCm', label: 'cm' }, { key: 'pernaDireitaPct', label: '%' }, { key: 'pernaDireitaKg', label: 'kg' }] },
      { label: 'Perna Esquerda', campos: [{ key: 'pernaEsquerdaCm', label: 'cm' }, { key: 'pernaEsquerdaPct', label: '%' }, { key: 'pernaEsquerdaKg', label: 'kg' }] },
    ]
  },
  perimetros: {
    titulo: '📐 Perímetros',
    campos: [
      { key: 'torax', label: 'Tórax', unit: 'cm', type: 'decimal' },
      { key: 'cintura', label: 'Cintura', unit: 'cm', type: 'decimal' },
      { key: 'abdomen', label: 'Abdómen', unit: 'cm', type: 'decimal' },
      { key: 'quadril', label: 'Quadril', unit: 'cm', type: 'decimal' },
    ]
  },
  composicao: {
    titulo: '🧬 Composição Corporal',
    campos: [
      { key: 'pctMassaGorda', label: '% Massa Gorda', unit: '%', type: 'decimal' },
      { key: 'pctAgua', label: '% Água', unit: '%', type: 'decimal' },
      { key: 'idadeMetabolica', label: 'Idade Metabólica', unit: 'anos', type: 'number' },
      { key: 'tmb', label: 'TMB', unit: 'kcal', type: 'decimal' },
      { key: 'gorduraVisceral', label: 'Gordura Visceral', unit: '', type: 'decimal' },
      { key: 'kgMassaMuscular', label: 'Kg Massa Muscular', unit: 'kg', type: 'decimal' },
    ]
  }
};

const campoVazio = () => ({
  assessmentDate: new Date().toISOString().split('T')[0],
  sexo: '', profissao: '', idade: '', objetivos: '', patologias: '',
  medicamentos: '', alcoolTabaco: '', experienciaTreino: '', nivelAtividade: '', vezesSemana: '',
  peso: '', altura: '', imc: '',
  bracoDireitoCm: '', bracoDireitoPct: '', bracoDireitoKg: '',
  bracoEsquerdoCm: '', bracoEsquerdoPct: '', bracoEsquerdoKg: '',
  pernaDireitaCm: '', pernaDireitaPct: '', pernaDireitaKg: '',
  pernaEsquerdaCm: '', pernaEsquerdaPct: '', pernaEsquerdaKg: '',
  torax: '', cintura: '', abdomen: '', quadril: '',
  pctMassaGorda: '', pctAgua: '', idadeMetabolica: '', tmb: '', gorduraVisceral: '', kgMassaMuscular: ''
});

// Silhueta SVG do corpo humano com pontos de medida
function SilhuetaCorporal({ dados }) {
  const val = (key) => dados[key] ? `${dados[key]}` : '—';
  return (
    <div className="relative flex items-center justify-center w-full">
      <svg viewBox="0 0 200 420" className="w-full max-w-[280px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cabeça */}
        <ellipse cx="100" cy="35" rx="22" ry="26" fill="#262626" stroke="#404040" strokeWidth="1.5"/>
        {/* Pescoço */}
        <rect x="91" y="58" width="18" height="14" rx="4" fill="#262626" stroke="#404040" strokeWidth="1.5"/>
        {/* Tronco */}
        <path d="M65 72 Q60 90 58 130 Q56 160 62 190 L138 190 Q144 160 142 130 Q140 90 135 72 Z" fill="#262626" stroke="#404040" strokeWidth="1.5"/>
        {/* Braço Direito */}
        <path d="M65 80 Q45 100 40 140 Q38 160 42 175" stroke="#404040" strokeWidth="12" strokeLinecap="round" fill="none"/>
        {/* Braço Esquerdo */}
        <path d="M135 80 Q155 100 160 140 Q162 160 158 175" stroke="#404040" strokeWidth="12" strokeLinecap="round" fill="none"/>
        {/* Perna Direita */}
        <path d="M85 190 Q80 230 78 270 Q76 310 78 350 Q79 365 84 375" stroke="#404040" strokeWidth="14" strokeLinecap="round" fill="none"/>
        {/* Perna Esquerda */}
        <path d="M115 190 Q120 230 122 270 Q124 310 122 350 Q121 365 116 375" stroke="#404040" strokeWidth="14" strokeLinecap="round" fill="none"/>

        {/* Tórax */}
        <circle cx="100" cy="105" r="5" fill="#ef4444"/>
        <text x="108" y="102" fontSize="8.5" fill="#ef4444" fontWeight="bold">Tórax</text>
        <text x="108" y="113" fontSize="8.5" fill="#ef4444">{val('torax')}cm</text>
        {/* Cintura */}
        <circle cx="100" cy="145" r="5" fill="#f97316"/>
        <text x="108" y="142" fontSize="8.5" fill="#f97316" fontWeight="bold">Cintura</text>
        <text x="108" y="153" fontSize="8.5" fill="#f97316">{val('cintura')}cm</text>
        {/* Abdómen */}
        <circle cx="100" cy="165" r="5" fill="#eab308"/>
        <text x="108" y="162" fontSize="8.5" fill="#eab308" fontWeight="bold">Abd</text>
        <text x="108" y="172" fontSize="8.5" fill="#eab308">{val('abdomen')}cm</text>
        {/* Quadril */}
        <circle cx="100" cy="185" r="5" fill="#22c55e"/>
        <text x="108" y="182" fontSize="8.5" fill="#22c55e" fontWeight="bold">Quadril</text>
        <text x="108" y="193" fontSize="8.5" fill="#22c55e">{val('quadril')}cm</text>
        {/* Braço D */}
        <circle cx="44" cy="130" r="5" fill="#3b82f6"/>
        <text x="2" y="122" fontSize="8" fill="#3b82f6" fontWeight="bold">B.D</text>
        <text x="2" y="133" fontSize="8" fill="#3b82f6">{val('bracoDireitoCm')}cm</text>
        {/* Braço E */}
        <circle cx="156" cy="130" r="5" fill="#8b5cf6"/>
        <text x="161" y="122" fontSize="8" fill="#8b5cf6" fontWeight="bold">B.E</text>
        <text x="161" y="133" fontSize="8" fill="#8b5cf6">{val('bracoEsquerdoCm')}cm</text>
        {/* Perna D */}
        <circle cx="80" cy="280" r="5" fill="#06b6d4"/>
        <text x="22" y="274" fontSize="8" fill="#06b6d4" fontWeight="bold">P.D</text>
        <text x="22" y="285" fontSize="8" fill="#06b6d4">{val('pernaDireitaCm')}cm</text>
        {/* Perna E */}
        <circle cx="120" cy="280" r="5" fill="#ec4899"/>
        <text x="126" y="274" fontSize="8" fill="#ec4899" fontWeight="bold">P.E</text>
        <text x="126" y="285" fontSize="8" fill="#ec4899">{val('pernaEsquerdaCm')}cm</text>
      </svg>
    </div>
  );
}

export default function AvaliacaoFisica() {
  const [alunos, setAlunos] = useState([]);
  const [alunoId, setAlunoId] = useState('');
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [avaliacaoAtiva, setAvaliacaoAtiva] = useState(null); // avaliação a visualizar
  const [modoFormulario, setModoFormulario] = useState(false);
  const [form, setForm] = useState(campoVazio());
  const [loading, setLoading] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [confirmarApagar, setConfirmarApagar] = useState(null);

  // Carregar alunos
  useEffect(() => {
    studentService.getAllStudents().then(dados => {
      setAlunos(dados.filter(a => a.status === 'Ativo'));
    }).catch(() => {});
  }, []);

  // Ao mudar aluno
  useEffect(() => {
    if (!alunoId) { setAvaliacoes([]); setAvaliacaoAtiva(null); setAlunoSelecionado(null); return; }
    const aluno = alunos.find(a => a.id === parseInt(alunoId));
    setAlunoSelecionado(aluno || null);
    carregarAvaliacoes(alunoId);
    setModoFormulario(false);
  }, [alunoId]);

  const carregarAvaliacoes = async (id) => {
    try {
      setLoading(true);
      const dados = await assessmentService.getByStudent(id);
      setAvaliacoes(dados);
      setAvaliacaoAtiva(dados[0] || null);
    } catch (err) {
      showMsg('error', 'Erro ao carregar avaliações.');
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Cálculo automático do IMC
  const handleFormChange = (key, value) => {
    setForm(prev => {
      const novo = { ...prev, [key]: value };
      if ((key === 'peso' || key === 'altura') && novo.peso && novo.altura) {
        const alturaVal = parseFloat(novo.altura);
        // Detecta se a altura está em cm (> 3) ou metros (<= 3)
        const alturaM = alturaVal > 3 ? alturaVal / 100 : alturaVal;
        const imc = alturaM > 0 ? (parseFloat(novo.peso) / (alturaM * alturaM)).toFixed(1) : '';
        novo.imc = imc;
      }
      return novo;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!alunoId) return;
    try {
      setLoadingForm(true);
      await assessmentService.create(alunoId, form);
      showMsg('success', 'Avaliação física guardada com sucesso!');
      setModoFormulario(false);
      setForm(campoVazio());
      await carregarAvaliacoes(alunoId);
    } catch (err) {
      showMsg('error', typeof err === 'string' ? err : 'Erro ao guardar avaliação.');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleApagar = async (id) => {
    try {
      await assessmentService.delete(id);
      showMsg('success', 'Avaliação eliminada.');
      setConfirmarApagar(null);
      await carregarAvaliacoes(alunoId);
    } catch (err) {
      showMsg('error', 'Erro ao apagar avaliação.');
    }
  };

  const renderCampo = (campo) => {
    const valor = form[campo.key] ?? '';
    const baseClass = "w-full px-3 py-2 text-sm text-white border outline-none bg-neutral-950 border-neutral-800 rounded-xl focus:border-fitnessGym";

    if (campo.readOnly) {
      return <input key={campo.key} type="text" value={valor} readOnly className={`${baseClass} opacity-60 cursor-not-allowed`} />;
    }
    if (campo.type === 'select') {
      return (
        <select key={campo.key} value={valor} onChange={e => handleFormChange(campo.key, e.target.value)} className={`${baseClass} cursor-pointer`}>
          <option value="">-- Selecionar --</option>
          {campo.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (campo.type === 'textarea') {
      return <textarea key={campo.key} value={valor} onChange={e => handleFormChange(campo.key, e.target.value)} rows="2" className={`${baseClass} resize-none`} />;
    }
    return (
      <input
        key={campo.key}
        type={campo.type === 'decimal' ? 'number' : campo.type}
        step={campo.type === 'decimal' ? '0.01' : undefined}
        value={valor}
        onChange={e => handleFormChange(campo.key, e.target.value)}
        className={baseClass}
      />
    );
  };

  const renderValor = (av, key, unit = '') => {
    const v = av[key];
    if (v === null || v === undefined || v === '') return <span className="text-neutral-600">—</span>;
    return <span className="font-semibold text-white">{v}{unit ? ` ${unit}` : ''}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Avaliação Física</h1>
        <p className="mt-1 text-sm text-neutral-400">Regista e acompanha a evolução física dos teus atletas.</p>
      </div>

      {message.text && (
        <div className={`p-4 text-sm rounded-2xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      {/* Seleção de aluno */}
      <div className="p-5 border bg-neutral-900 border-neutral-800 rounded-2xl">
        <label className="block mb-2 text-xs font-semibold tracking-wider uppercase text-neutral-400">Aluno*</label>
        <select value={alunoId} onChange={e => setAlunoId(e.target.value)} className="w-full px-4 py-3 text-sm text-white border outline-none cursor-pointer bg-neutral-950 border-neutral-800 rounded-xl focus:border-fitnessGym">
          <option value="">Escolha um aluno...</option>
          {alunos.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.whatsapp})</option>)}
        </select>
      </div>

      {alunoId && !modoFormulario && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Coluna esquerda: histórico */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">📋 Histórico</h3>
              <button onClick={() => { setForm(campoVazio()); setModoFormulario(true); }} className="px-3 py-1.5 text-xs font-bold text-white transition-colors rounded-lg cursor-pointer bg-fitnessGym hover:bg-red-700">
                + Nova
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-xs text-center text-neutral-500">A carregar...</div>
            ) : avaliacoes.length === 0 ? (
              <div className="p-6 text-xs italic text-center border border-dashed text-neutral-600 border-neutral-800 rounded-xl">
                Nenhuma avaliação ainda.<br />Clica em "+ Nova" para começar.
              </div>
            ) : (
              avaliacoes.map(av => (
                <div
                  key={av.id}
                  onClick={() => setAvaliacaoAtiva(av)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all ${avaliacaoAtiva?.id === av.id ? 'border-red-500 bg-red-500/5' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {new Date(av.assessmentDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {av.peso ? `${av.peso}kg` : '—'} · IMC {av.imc || '—'} · {av.pctMassaGorda ? `${av.pctMassaGorda}% gorda` : '—'}
                      </p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmarApagar(av.id); }}
                      className="p-1 text-xs transition-colors cursor-pointer text-neutral-500 hover:text-red-400"
                    >🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Coluna direita: detalhe da avaliação selecionada */}
          <div className="lg:col-span-2">
            {avaliacaoAtiva ? (
              <div className="p-5 space-y-6 border bg-neutral-900 border-neutral-800 rounded-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div>
                    <h3 className="font-bold text-white">
                      Avaliação de {new Date(avaliacaoAtiva.assessmentDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-xs text-neutral-500">{alunoSelecionado?.nome}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Silhueta */}
                  <div className="flex flex-col items-center gap-4">
                    <SilhuetaCorporal dados={avaliacaoAtiva} />
                    <div className="w-full p-3 space-y-1 border bg-neutral-950 border-neutral-800 rounded-xl">
                      <div className="flex justify-between text-xs"><span className="text-neutral-500">Peso</span>{renderValor(avaliacaoAtiva, 'peso', 'kg')}</div>
                      <div className="flex justify-between text-xs"><span className="text-neutral-500">Altura</span>{renderValor(avaliacaoAtiva, 'altura', 'cm')}</div>
                      <div className="flex justify-between text-xs"><span className="text-neutral-500">IMC</span>{renderValor(avaliacaoAtiva, 'imc')}</div>
                    </div>
                  </div>

                  {/* Dados */}
                  <div className="space-y-4">
                    {/* Pessoal */}
                    <div className="p-3 space-y-2 border bg-neutral-950 border-neutral-800 rounded-xl">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Dados Pessoais</p>
                      {[['Sexo', 'sexo'], ['Idade', 'idade', 'anos'], ['Profissão', 'profissao'], ['Atividade', 'nivelAtividade'], ['Vezes/sem.', 'vezesSemana']].map(([l, k, u]) => (
                        <div key={k} className="flex justify-between text-xs"><span className="text-neutral-500">{l}</span>{renderValor(avaliacaoAtiva, k, u)}</div>
                      ))}
                    </div>
                    {/* Composição */}
                    <div className="p-3 space-y-2 border bg-neutral-950 border-neutral-800 rounded-xl">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Composição Corporal</p>
                      {[['% Massa Gorda', 'pctMassaGorda', '%'], ['% Água', 'pctAgua', '%'], ['Idade Metabólica', 'idadeMetabolica', 'anos'], ['TMB', 'tmb', 'kcal'], ['Gordura Visceral', 'gorduraVisceral'], ['Massa Muscular', 'kgMassaMuscular', 'kg']].map(([l, k, u]) => (
                        <div key={k} className="flex justify-between text-xs"><span className="text-neutral-500">{l}</span>{renderValor(avaliacaoAtiva, k, u)}</div>
                      ))}
                    </div>
                    {/* Objetivos */}
                    {avaliacaoAtiva.objetivos && (
                      <div className="p-3 border bg-neutral-950 border-neutral-800 rounded-xl">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Objetivos</p>
                        <p className="text-xs text-neutral-300">{avaliacaoAtiva.objetivos}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center border border-dashed border-neutral-800 rounded-2xl">
                <p className="text-sm text-neutral-500">Seleciona uma avaliação do histórico ou cria uma nova.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formulário de nova avaliação */}
      {alunoId && modoFormulario && (
        <div className="p-5 space-y-6 border bg-neutral-900 border-neutral-800 rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h2 className="font-bold text-white">Nova Avaliação Física</h2>
              <p className="text-xs text-neutral-500">{alunoSelecionado?.nome}</p>
            </div>
            <button onClick={() => setModoFormulario(false)} className="text-xs cursor-pointer text-neutral-400 hover:text-white">✕ Cancelar</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Grid com silhueta + dados pessoais */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <SilhuetaCorporal dados={form} />
              </div>
              <div className="space-y-4 md:col-span-2">
                <p className="text-xs font-bold tracking-wider uppercase text-neutral-400">👤 Dados Pessoais</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SECOES.pessoal.campos.map(campo => (
                    <div key={campo.key} className={campo.type === 'textarea' ? 'sm:col-span-2' : ''}>
                      <label className="block mb-1 text-[11px] font-semibold text-neutral-400">{campo.label}{campo.required ? ' *' : ''}</label>
                      {renderCampo(campo)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Medidas básicas */}
            <div>
              <p className="mb-3 text-xs font-bold tracking-wider uppercase text-neutral-400">📏 Medidas Corporais</p>
              <div className="grid grid-cols-3 gap-3">
                {SECOES.medidas.campos.map(campo => (
                  <div key={campo.key}>
                    <label className="block mb-1 text-[11px] font-semibold text-neutral-400">{campo.label}{campo.unit ? ` (${campo.unit})` : ''}</label>
                    {renderCampo(campo)}
                  </div>
                ))}
              </div>
            </div>

            {/* Membros */}
            <div>
              <p className="mb-3 text-xs font-bold tracking-wider uppercase text-neutral-400">💪 Membros</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {SECOES.membros.grupos.map(grupo => (
                  <div key={grupo.label} className="p-4 border bg-neutral-950 border-neutral-800 rounded-xl">
                    <p className="mb-3 text-xs font-bold text-neutral-300">{grupo.label}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {grupo.campos.map(c => (
                        <div key={c.key}>
                          <label className="block mb-1 text-[10px] text-neutral-500 uppercase">{c.label}</label>
                          <input type="number" step="0.01" value={form[c.key] ?? ''} onChange={e => handleFormChange(c.key, e.target.value)} className="w-full px-2 py-1.5 text-sm text-center text-white border outline-none bg-neutral-900 border-neutral-800 rounded-lg focus:border-fitnessGym" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Perímetros */}
            <div>
              <p className="mb-3 text-xs font-bold tracking-wider uppercase text-neutral-400">📐 Perímetros (cm)</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SECOES.perimetros.campos.map(campo => (
                  <div key={campo.key}>
                    <label className="block mb-1 text-[11px] font-semibold text-neutral-400">{campo.label}</label>
                    {renderCampo(campo)}
                  </div>
                ))}
              </div>
            </div>

            {/* Composição Corporal */}
            <div>
              <p className="mb-3 text-xs font-bold tracking-wider uppercase text-neutral-400">🧬 Composição Corporal</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SECOES.composicao.campos.map(campo => (
                  <div key={campo.key}>
                    <label className="block mb-1 text-[11px] font-semibold text-neutral-400">{campo.label}{campo.unit ? ` (${campo.unit})` : ''}</label>
                    {renderCampo(campo)}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModoFormulario(false)} className="px-5 py-2.5 text-sm border rounded-xl cursor-pointer text-neutral-400 border-neutral-700 hover:bg-neutral-800">Cancelar</button>
              <button type="submit" disabled={loadingForm} className="px-6 py-2.5 text-sm font-bold text-white rounded-xl cursor-pointer bg-fitnessGym hover:bg-red-700 disabled:opacity-50">
                {loadingForm ? 'A Guardar...' : 'Guardar Avaliação'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal confirmar apagar */}
      {confirmarApagar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 space-y-4 text-center border shadow-2xl bg-neutral-900 border-neutral-800 rounded-2xl">
            <span className="text-3xl">🗑️</span>
            <div>
              <h3 className="font-bold text-white">Eliminar Avaliação?</h3>
              <p className="mt-1 text-xs text-neutral-400">Esta ação é permanente e não pode ser desfeita.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarApagar(null)} className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-neutral-800 text-neutral-400 hover:bg-neutral-700 cursor-pointer">Cancelar</button>
              <button onClick={() => handleApagar(confirmarApagar)} className="flex-1 py-2.5 text-xs font-bold text-white rounded-xl bg-red-600 hover:bg-red-700 cursor-pointer">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}