import React, { useState, useEffect, useRef } from "react";
import studentService from "../services/studentService";
import trainingService from "../services/trainingService";
import whatsappService from "../services/whatsappService";
import WeightModal from "../components/WeightModal";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const resolverGifUrl = (gifUrl) => {
  if (!gifUrl) return null;
  if (gifUrl.startsWith("http://") || gifUrl.startsWith("https://")) return gifUrl;
  return `${BACKEND_URL}${gifUrl}`;
};

export default function Treinos() {
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState("");
  const [notes, setNotes] = useState("");
  const [exercicios, setExercicios] = useState([]);
  const [savedPlanId, setSavedPlanId] = useState(null);
  const [biblioteca, setBiblioteca] = useState([]);
  const [bibliotecaLoading, setBibliotecaLoading] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [exerciseSelected, setExerciseSelected] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sets, setSets] = useState("4");
  const [reps, setReps] = useState("10");
  const [restTime, setRestTime] = useState("60s");
  const [exNotes, setExNotes] = useState("");
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isModificado, setIsModificado] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalExerciseName, setModalExerciseName] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [whatsappTexto, setWhatsappTexto] = useState("");
  const [alunoDestino, setAlunoDestino] = useState(null);
  const [indexEditando, setIndexEditando] = useState(null);
  const [exercicioEditado, setExercicioEditado] = useState({ sets: "", reps: "", restTime: "", notes: "" });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const carregarAlunos = async () => {
      try {
        const dados = await studentService.getAllStudents();
        setAlunos(dados.filter((a) => a.status === "Ativo"));
      } catch {
        showMsg("error", "Falha ao carregar atletas para o menu.");
      }
    };
    carregarAlunos();
  }, []);

  useEffect(() => {
    const carregarBiblioteca = async () => {
      try {
        setBibliotecaLoading(true);
        const dados = await trainingService.getAllExercises();
        setBiblioteca(dados);
      } catch {} finally {
        setBibliotecaLoading(false);
      }
    };
    carregarBiblioteca();
  }, []);

  useEffect(() => {
    if (!alunoSelecionadoId) { limparFormularioCompleto(); return; }
    carregarPlanoAluno(alunoSelecionadoId);
  }, [alunoSelecionadoId]);

  const carregarPlanoAluno = async (id) => {
    try {
      setLoading(true);
      const plano = await trainingService.getPlanByStudent(id);
      if (plano) {
        setSavedPlanId(plano.id || null);
        setNotes(plano.notes || "");
        const exerciciosMapeados = plano.exercises.map((ex) => {
          const exercicioNaBiblioteca = biblioteca.find((b) => b.name.toLowerCase().trim() === ex.exerciseName.toLowerCase().trim());
          return { id: ex.id, exerciseName: ex.exerciseName, gifUrl: ex.gifUrl || exercicioNaBiblioteca?.gifUrl || "", sets: ex.sets, reps: ex.reps, restTime: ex.restTime, notes: ex.notes || "" };
        });
        setExercicios(exerciciosMapeados);
      } else {
        setSavedPlanId(null); setNotes(""); setExercicios([]);
      }
      setIsModificado(false);
    } catch (err) {
      console.error(err);
      showMsg("error", "Erro ao carregar o plano deste aluno.");
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const sugestoes = exerciseSearch.trim().length >= 1
    ? biblioteca.filter((ex) => ex.name.toLowerCase().includes(exerciseSearch.toLowerCase())).slice(0, 8)
    : [];

  const handleSelectExercise = (ex) => { setExerciseSelected(ex); setExerciseSearch(ex.name); setShowDropdown(false); };

  const handleSelectGifDropdown = (e) => {
    const urlSelecionada = e.target.value;
    if (!urlSelecionada) { setExerciseSelected((prev) => (prev ? { ...prev, gifUrl: null } : null)); return; }
    const exCorrespondente = biblioteca.find((ex) => ex.gifUrl === urlSelecionada);
    if (exCorrespondente) {
      setExerciseSelected({ id: exCorrespondente.id, name: exerciseSelected?.name || exCorrespondente.name, gifUrl: exCorrespondente.gifUrl, category: exCorrespondente.category });
      if (!exerciseSearch.trim()) setExerciseSearch(exCorrespondente.name);
    } else {
      setExerciseSelected((prev) => ({ ...prev, gifUrl: urlSelecionada }));
    }
  };

  const handleAddExercicio = (e) => {
    e.preventDefault();
    const nome = exerciseSelected?.name || exerciseSearch.trim();
    if (!nome) return;
    const novoEx = { exerciseName: nome, gifUrl: exerciseSelected?.gifUrl || null, sets: parseInt(sets) || 4, reps: parseInt(reps) || 10, restTime: restTime.trim() || "60s", notes: exNotes.trim() };
    setExercicios([...exercicios, novoEx]);
    setIsModificado(true);
    setExerciseSearch(""); setExerciseSelected(null); setExNotes("");
  };

  const handleRemoveExercicioLocal = (indexParaRemover) => {
    setExercicios(exercicios.filter((_, idx) => idx !== indexParaRemover));
    setIsModificado(true);
  };

  const handleIniciarEdicao = (index, ex) => {
    setIndexEditando(index);
    setExercicioEditado({ sets: ex.sets, reps: ex.reps, restTime: ex.restTime, notes: ex.notes || "" });
  };

  const handleMudancaEdicao = (campo, valor) => setExercicioEditado((prev) => ({ ...prev, [campo]: valor }));

  const handleSalvarEdicao = (index) => {
    const novosExercicios = [...exercicios];
    novosExercicios[index] = { ...novosExercicios[index], sets: parseInt(exercicioEditado.sets) || 4, reps: parseInt(exercicioEditado.reps) || 10, restTime: exercicioEditado.restTime.trim() || "60s", notes: exercicioEditado.notes.trim() };
    setExercicios(novosExercicios);
    setIsModificado(true);
    setIndexEditando(null);
  };

  const limparFormularioCompleto = () => { setNotes(""); setExercicios([]); setAlunoSelecionadoId(""); setSavedPlanId(null); setIsModificado(false); };

  const handleSavePlanoGeral = async () => {
    if (!alunoSelecionadoId) { showMsg("error", "Selecione primeiro um atleta da lista."); return; }
    try {
      setLoading(true);
      const payload = { studentId: alunoSelecionadoId, notes: notes.trim(), exercises: exercicios };
      const resultado = await trainingService.saveTrainingPlan(payload);
      setSavedPlanId(resultado.plan?.id || null);
      await carregarPlanoAluno(alunoSelecionadoId);
      showMsg("success", "Plano de treino atualizado e sincronizado no MySQL com sucesso!");
    } catch (err) {
      showMsg("error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWeights = (exerciseName) => { setModalExerciseName(exerciseName); setIsModalOpen(true); };

  const handleAbrirPreviewWhatsApp = () => {
    const aluno = alunos.find((a) => a.id === parseInt(alunoSelecionadoId));
    if (!aluno) return;
    setAlunoDestino(aluno);
    const textoMapeado = whatsappService.gerarTextoMensagem(aluno.nome, exercicios, notes, savedPlanId);
    setWhatsappTexto(textoMapeado);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Prescrever Treinos</h1>
        <p className="mt-1 text-sm text-neutral-400">Selecione um aluno ativo e monte a sua rotina de exercícios personalizada.</p>
      </div>

      {message.text && (
        <div className={`p-4 text-sm rounded-2xl border ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-fitnessGym" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          {message.type === "success" ? "✅" : "⚠️"} {message.text}
        </div>
      )}

      <div className="p-5 border bg-neutral-900 border-neutral-800 rounded-2xl">
        <label className="block mb-2 text-xs font-semibold tracking-wider uppercase text-neutral-400">Aluno*</label>
        <select
          value={alunoSelecionadoId}
          onChange={(e) => setAlunoSelecionadoId(e.target.value)}
          className="w-full px-4 py-3 text-sm text-white transition-colors border outline-none cursor-pointer bg-neutral-950 border-neutral-800 rounded-xl focus:border-fitnessGym"
        >
          <option value="">Escolha um aluno na lista para gerir o treino...</option>
          {alunos.map((aluno) => (
            <option key={aluno.id} value={aluno.id}>{aluno.nome} ({aluno.whatsapp})</option>
          ))}
        </select>
      </div>

      {alunoSelecionadoId && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Formulário lateral */}
          <div className="p-5 space-y-4 border h-fit bg-neutral-900 border-neutral-800 rounded-2xl">
            <h2 className="pb-2 text-lg font-bold text-white border-b border-neutral-800">➕ Adicionar Exercício</h2>
            <form onSubmit={handleAddExercicio} className="space-y-4">
              <div className="space-y-1" ref={dropdownRef}>
                <label className="text-xs text-neutral-400">
                  Nome do Exercício * {bibliotecaLoading && <span className="text-neutral-600">(a carregar...)</span>}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: Leg Press 45º"
                    value={exerciseSearch}
                    onChange={(e) => { setExerciseSearch(e.target.value); setExerciseSelected(null); setShowDropdown(true); }}
                    onFocus={() => { if (exerciseSearch.trim().length >= 1) setShowDropdown(true); }}
                    className="w-full px-3 py-2 text-sm text-white border outline-none bg-neutral-950 border-neutral-800 rounded-xl focus:border-fitnessGym"
                    required
                    autoComplete="off"
                  />
                  {showDropdown && sugestoes.length > 0 && (
                    <ul className="absolute z-50 w-full mt-1 overflow-hidden overflow-y-auto border shadow-xl border-neutral-700 rounded-xl bg-neutral-900 max-h-52">
                      {sugestoes.map((ex) => (
                        <li key={ex.id} onMouseDown={() => handleSelectExercise(ex)} className="flex items-center gap-3 px-3 py-2 transition-colors cursor-pointer hover:bg-neutral-800">
                          {ex.gifUrl ? (
                            <img src={resolverGifUrl(ex.gifUrl)} alt={ex.name} className="flex-shrink-0 object-cover w-10 h-10 border rounded-lg border-neutral-700" onError={(e) => { e.target.style.display = "none"; }} />
                          ) : (
                            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-xs border rounded-lg border-neutral-800 bg-neutral-950 text-neutral-600">🏋️</div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{ex.name}</p>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{ex.category}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400">Animação / GIF de Suporte</label>
                <select value={exerciseSelected?.gifUrl || ""} onChange={handleSelectGifDropdown} className="w-full px-3 py-2 text-sm text-white transition-colors border outline-none cursor-pointer bg-neutral-950 border-neutral-800 rounded-xl focus:border-fitnessGym">
                  <option value="">-- Sem Animação Associada --</option>
                  {biblioteca.filter((ex) => ex.gifUrl).map((ex) => (
                    <option key={`gif-opt-${ex.id}`} value={ex.gifUrl}>{ex.name} ({ex.category || "Geral"})</option>
                  ))}
                </select>
              </div>

              {exerciseSelected?.gifUrl && (
                <div className="flex items-center gap-3 p-2 mt-1 border rounded-xl bg-neutral-950 border-neutral-800">
                  <img src={resolverGifUrl(exerciseSelected.gifUrl)} alt={exerciseSelected.name} className="flex-shrink-0 object-cover w-16 h-16 border rounded-lg border-neutral-800" />
                  <div>
                    <p className="text-xs font-bold text-white">{exerciseSelected.name}</p>
                    {exerciseSelected.category && <p className="text-[10px] text-neutral-500 uppercase mt-0.5">{exerciseSelected.category}</p>}
                    <span className="text-[10px] text-emerald-400">✔ GIF Vinculado</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Séries</label>
                  <input type="number" value={sets} onChange={(e) => setSets(e.target.value)} className="w-full px-3 py-2 text-sm text-white border outline-none bg-neutral-950 border-neutral-800 rounded-xl focus:border-fitnessGym" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Reps</label>
                  <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} className="w-full px-3 py-2 text-sm text-white border outline-none bg-neutral-950 border-neutral-800 rounded-xl focus:border-fitnessGym" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Descanso</label>
                  <input type="text" value={restTime} onChange={(e) => setRestTime(e.target.value)} className="w-full px-3 py-2 text-sm text-white border outline-none bg-neutral-950 border-neutral-800 rounded-xl focus:border-fitnessGym" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400">Notas / Instruções Técnicas</label>
                <textarea placeholder="Ex: Carga progressiva, cadência 3-1-1..." rows="2" value={exNotes} onChange={(e) => setExNotes(e.target.value)} className="w-full px-3 py-2 text-sm text-white border outline-none resize-none bg-neutral-950 border-neutral-800 rounded-xl focus:border-fitnessGym" />
              </div>

              <button type="submit" className="w-full py-2 text-xs font-medium text-white transition-colors cursor-pointer bg-neutral-800 hover:bg-neutral-700 rounded-xl">
                Injetar na Lista
              </button>
            </form>
          </div>

          {/* Zona principal */}
          <div className="space-y-4 lg:col-span-2">
            <div className="p-5 space-y-4 border bg-neutral-900 border-neutral-800 rounded-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <h2 className="text-lg font-bold text-white">📋 Estrutura da Ficha de Treino</h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400 font-mono">{exercicios.length} Exercício(s)</span>
              </div>

              {loading ? (
                <div className="py-12 text-sm text-center text-neutral-500">🔄 A ler informações em tempo real do banco de dados...</div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold tracking-wider uppercase text-neutral-400">Observações do Plano de Treino (Foco Geral)</label>
                    <input
                      type="text"
                      placeholder="Ex: Foco em hipertrofia - Progressão de carga na última série."
                      value={notes}
                      onChange={(e) => { setNotes(e.target.value); setIsModificado(true); }}
                      className="w-full px-4 py-3 text-sm text-white border outline-none bg-neutral-950 border-neutral-800 rounded-xl focus:border-fitnessGym placeholder-neutral-600"
                    />
                  </div>

                  {/* 🔥 DESKTOP: Tabela (escondida no mobile) */}
                  <div className="hidden overflow-hidden border md:block border-neutral-800 rounded-xl bg-neutral-950">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead>
                        <tr className="text-xs font-medium tracking-wider uppercase border-b bg-neutral-900 text-neutral-400 border-neutral-800">
                          <th className="p-3">GIF</th>
                          <th className="p-3">Exercício</th>
                          <th className="p-3 text-center">Séries</th>
                          <th className="p-3 text-center">Reps</th>
                          <th className="p-3 text-center">Descanso</th>
                          <th className="p-3">Notas</th>
                          <th className="p-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 text-neutral-300">
                        {exercicios.length > 0 ? exercicios.map((ex, index) => {
                          const estaEditando = indexEditando === index;
                          return (
                            <tr key={index} className="transition-colors hover:bg-neutral-900/40">
                              <td className="w-20 p-3 text-center">
                                <div className="flex justify-center">
                                  {ex.gifUrl ? (
                                    <img src={resolverGifUrl(ex.gifUrl)} alt={ex.exerciseName} className="object-cover w-12 h-12 border rounded-lg border-neutral-800" onError={(e) => { e.target.style.display = "none"; }} />
                                  ) : (
                                    <div className="flex items-center justify-center w-12 h-12 text-xs border rounded-lg border-neutral-800 bg-neutral-900 text-neutral-600">—</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 pl-4 font-semibold text-left text-white">{ex.exerciseName}</td>
                              <td className="p-3 font-mono text-center">
                                {estaEditando ? <input type="number" value={exercicioEditado.sets} onChange={(e) => handleMudancaEdicao("sets", e.target.value)} className="w-16 px-1 py-1 text-xs text-center text-white border rounded outline-none bg-neutral-950 border-neutral-800 focus:border-red-500" /> : ex.sets}
                              </td>
                              <td className="p-3 font-mono text-center">
                                {estaEditando ? <input type="number" value={exercicioEditado.reps} onChange={(e) => handleMudancaEdicao("reps", e.target.value)} className="w-16 px-1 py-1 text-xs text-center text-white border rounded outline-none bg-neutral-950 border-neutral-800 focus:border-red-500" /> : ex.reps}
                              </td>
                              <td className="p-3 font-mono text-center text-neutral-400">
                                {estaEditando ? <input type="text" value={exercicioEditado.restTime} onChange={(e) => handleMudancaEdicao("restTime", e.target.value)} className="w-20 px-1 py-1 text-xs text-center text-white border rounded outline-none bg-neutral-950 border-neutral-800 focus:border-red-500" /> : ex.restTime}
                              </td>
                              <td className="p-3 text-xs text-neutral-400 max-w-[120px] truncate">
                                {estaEditando ? <input type="text" value={exercicioEditado.notes} onChange={(e) => handleMudancaEdicao("notes", e.target.value)} className="w-full px-2 py-1 text-xs text-white border rounded outline-none bg-neutral-950 border-neutral-800 focus:border-red-500" /> : ex.notes || "—"}
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  {estaEditando ? (
                                    <>
                                      <button onClick={() => handleSalvarEdicao(index)} className="text-xs font-bold cursor-pointer text-emerald-400 hover:text-emerald-300">Gravar</button>
                                      <button onClick={() => setIndexEditando(null)} className="text-xs font-medium cursor-pointer text-neutral-500 hover:text-neutral-400">Cancelar</button>
                                    </>
                                  ) : (
                                    <>
                                      <button onClick={() => handleIniciarEdicao(index, ex)} className="flex items-center gap-1 text-xs transition-colors cursor-pointer text-neutral-400 hover:text-white">✏️ Editar</button>
                                      <button onClick={() => handleOpenWeights(ex.exerciseName)} disabled={isModificado || indexEditando !== null} className={`text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${isModificado || indexEditando !== null ? "text-neutral-600 cursor-not-allowed opacity-40" : "text-fitnessGym hover:text-emerald-400"}`} title={isModificado ? "Sincronize primeiro" : "Registar/Ver Cargas"}>📈 Cargas</button>
                                      <button onClick={() => handleRemoveExercicioLocal(index)} className="text-xs font-medium text-red-400 transition-colors cursor-pointer hover:text-red-500">Remover</button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        }) : (
                          <tr><td colSpan="7" className="p-6 text-xs italic text-center text-neutral-600">Nenhum exercício adicionado. Comece a injetar no painel lateral.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* 🔥 MOBILE: Cartões (escondidos no desktop) */}
                  <div className="space-y-3 md:hidden">
                    {exercicios.length > 0 ? exercicios.map((ex, index) => {
                      const estaEditando = indexEditando === index;
                      return (
                        <div key={index} className="p-4 space-y-3 border bg-neutral-950 border-neutral-800 rounded-xl">
                          {/* Cabeçalho do cartão: GIF + Nome */}
                          <div className="flex items-center gap-3">
                            {ex.gifUrl ? (
                              <img src={resolverGifUrl(ex.gifUrl)} alt={ex.exerciseName} className="flex-shrink-0 object-cover border rounded-lg w-14 h-14 border-neutral-800" onError={(e) => { e.target.style.display = "none"; }} />
                            ) : (
                              <div className="flex items-center justify-center flex-shrink-0 text-xs border rounded-lg w-14 h-14 border-neutral-800 bg-neutral-900 text-neutral-600">—</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white truncate">{ex.exerciseName}</p>
                              {ex.notes && !estaEditando && <p className="mt-0.5 text-[11px] text-neutral-500 italic truncate">{ex.notes}</p>}
                            </div>
                          </div>

                          {/* Métricas */}
                          {estaEditando ? (
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] text-neutral-500 uppercase">Séries</label>
                                <input type="number" value={exercicioEditado.sets} onChange={(e) => handleMudancaEdicao("sets", e.target.value)} className="w-full px-2 py-1.5 mt-1 text-sm text-center text-white border rounded-lg outline-none bg-neutral-900 border-neutral-700 focus:border-red-500" />
                              </div>
                              <div>
                                <label className="text-[10px] text-neutral-500 uppercase">Reps</label>
                                <input type="number" value={exercicioEditado.reps} onChange={(e) => handleMudancaEdicao("reps", e.target.value)} className="w-full px-2 py-1.5 mt-1 text-sm text-center text-white border rounded-lg outline-none bg-neutral-900 border-neutral-700 focus:border-red-500" />
                              </div>
                              <div>
                                <label className="text-[10px] text-neutral-500 uppercase">Descanso</label>
                                <input type="text" value={exercicioEditado.restTime} onChange={(e) => handleMudancaEdicao("restTime", e.target.value)} className="w-full px-2 py-1.5 mt-1 text-sm text-center text-white border rounded-lg outline-none bg-neutral-900 border-neutral-700 focus:border-red-500" />
                              </div>
                              <div className="col-span-3">
                                <label className="text-[10px] text-neutral-500 uppercase">Notas</label>
                                <input type="text" value={exercicioEditado.notes} onChange={(e) => handleMudancaEdicao("notes", e.target.value)} className="w-full px-2 py-1.5 mt-1 text-sm text-white border rounded-lg outline-none bg-neutral-900 border-neutral-700 focus:border-red-500" />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-2 p-3 text-center border bg-neutral-900 rounded-xl border-neutral-800/50">
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
                          )}

                          {/* Ações */}
                          <div className="flex gap-2 pt-1 border-t border-neutral-800">
                            {estaEditando ? (
                              <>
                                <button onClick={() => handleSalvarEdicao(index)} className="flex-1 py-2 text-xs font-bold text-white transition-colors rounded-lg cursor-pointer bg-emerald-600 hover:bg-emerald-700">✓ Gravar</button>
                                <button onClick={() => setIndexEditando(null)} className="flex-1 py-2 text-xs font-medium transition-colors border rounded-lg cursor-pointer text-neutral-400 border-neutral-700 hover:bg-neutral-800">Cancelar</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleIniciarEdicao(index, ex)} className="flex-1 py-2 text-xs font-medium transition-colors border rounded-lg cursor-pointer text-neutral-300 border-neutral-700 hover:bg-neutral-800">✏️ Editar</button>
                                <button onClick={() => handleOpenWeights(ex.exerciseName)} disabled={isModificado} className={`flex-1 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${isModificado ? "text-neutral-600 border border-neutral-800 opacity-40" : "text-fitnessGym border border-fitnessGym/30 hover:bg-fitnessGym/10"}`}>📈 Cargas</button>
                                <button onClick={() => handleRemoveExercicioLocal(index)} className="flex-1 py-2 text-xs font-medium text-red-400 transition-colors border rounded-lg cursor-pointer border-red-900/30 hover:bg-red-950/20">Remover</button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="p-6 text-xs italic text-center border border-dashed text-neutral-600 border-neutral-800 rounded-xl">Nenhum exercício adicionado ainda.</div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                    <button
                      onClick={handleAbrirPreviewWhatsApp}
                      disabled={exercicios.length === 0 || isModificado || !alunoSelecionadoId}
                      className="flex items-center justify-center w-full gap-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm transition-colors cursor-pointer border border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto"
                    >
                      <img src="/whatsapp.png" alt="WhatsApp" className="object-contain w-5 h-5" />
                      {isModificado ? "Grave para Ativar" : "Enviar para o WhatsApp"}
                    </button>
                    <button
                      onClick={handleSavePlanoGeral}
                      disabled={loading}
                      className="w-full px-6 py-2.5 rounded-xl bg-fitnessGym hover:bg-red-700 text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto"
                    >
                      {loading ? "A Gravar..." : "Sincronizar Plano no MySQL"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <WeightModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} studentId={alunoSelecionadoId} exerciseName={modalExerciseName} />

      {isPreviewOpen && alunoDestino && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden border shadow-2xl bg-neutral-900 border-neutral-800 rounded-2xl">
            <div className="flex items-center justify-between p-4 border-b bg-neutral-950/60 border-neutral-800">
              <div>
                <h3 className="text-xs font-black tracking-wider text-red-500 uppercase">Confirmação de Envio</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Destinatário: {alunoDestino.nome}</p>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="p-1 text-sm transition-colors cursor-pointer text-neutral-500 hover:text-white">✕</button>
            </div>
            <div className="p-4 bg-[#0b141a] max-h-[380px] overflow-y-auto space-y-3">
              <div className="max-w-[85%] ml-auto bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-none p-3 shadow-md border border-[#005c4b]/50">
                <pre className="font-sans text-xs leading-relaxed tracking-wide whitespace-pre-wrap">{whatsappTexto}</pre>
                <div className="text-[10px] text-[#8696a0] text-right mt-1 font-mono">
                  {new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })} ✔✔
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 border-t bg-neutral-950/40 border-neutral-800">
              <button onClick={() => setIsPreviewOpen(false)} className="w-full py-2.5 text-xs font-bold border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer">Ajustar Treino</button>
              <button
                onClick={() => {
                  const url = whatsappService.enviarPlanoTreino(alunoDestino.whatsapp, alunoDestino.nome, exercicios, notes, savedPlanId);
                  if (url) window.open(url, "_blank");
                  setIsPreviewOpen(false);
                }}
                className="w-full py-2.5 text-xs font-black uppercase tracking-wider bg-fitnessGym text-white hover:bg-red-700 rounded-xl shadow-lg shadow-red-500/20 transition-all cursor-pointer"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}