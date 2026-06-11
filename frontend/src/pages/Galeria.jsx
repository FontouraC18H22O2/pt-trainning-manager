import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Galeria() {
  const { role } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Peito');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const BACKEND_URL = 'http://localhost:5000';

  const categories = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Cardio'];
  const formCategories = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Cardio'];

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await api.get('/exercises');
      setExercises(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar a galeria de exercícios. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const filteredExercises = selectedCategory === 'Todos'
    ? exercises
    : exercises.filter(ex => ex.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    setFormError('');

    if (role === 'GUEST') {
      setFormError('Apenas Administradores ou Treinadores podem adicionar exercícios.');
      return;
    }

    if (!newName.trim() || !newCategory || !selectedFile) {
      setFormError('Por favor, preencha todos os campos e selecione um GIF/Imagem.');
      return;
    }

    try {
      setSubmitLoading(true);
      const formData = new FormData();
      formData.append('name', newName.trim());
      formData.append('category', newCategory);
      formData.append('gif', selectedFile);

      await api.post('/exercises', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setNewName('');
      setNewCategory('Peito');
      setSelectedFile(null);
      setIsModalOpen(false);
      fetchExercises();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Erro ao tentar guardar o exercício.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6 text-white bg-neutral-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight">
            Galeria de <span className="font-extrabold text-white-500">Exercícios</span>
          </h1>
          <p className="text-sm text-neutral-400">
            Consulta a biblioteca global de movimentos, execuções corretas e GIFs informativos.
          </p>
        </div>

        {role !== 'GUEST' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start px-5 py-3 text-xs font-bold tracking-wider uppercase transition-all duration-200 bg-red-500 shadow-lg text-neutral-950 rounded-xl hover:bg-red-400 shadow-red-500/10 active:scale-95"
          >
            ➕ Adicionar Exercício
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pb-2 border-b border-neutral-800">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-red-500 text-neutral-950 shadow-lg shadow-red-500/20 scale-105'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-20 font-medium text-center text-neutral-400 animate-pulse">
          🏋️‍♂️ A carregar a biblioteca de exercícios...
        </div>
      )}

      {error && !loading && (
        <div className="p-4 text-sm text-center text-red-400 border border-red-900 bg-red-950/30 rounded-xl">
          {error}
        </div>
      )}

      {!loading && !error && filteredExercises.length === 0 && (
        <div className="p-12 text-center border border-neutral-800 bg-neutral-900/50 rounded-2xl">
          <p className="text-sm text-neutral-400">
            Nenhum exercício encontrado para a categoria <span className="font-bold text-red-500">"{selectedCategory}"</span>.
          </p>
        </div>
      )}

      {!loading && !error && filteredExercises.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex flex-col overflow-hidden transition-all duration-300 border border-neutral-800 bg-neutral-900 rounded-2xl hover:border-neutral-700 group"
            >
              <div className="relative flex items-center justify-center w-full overflow-hidden border-b aspect-video bg-neutral-950 border-neutral-800/50">
                {exercise.gifUrl ? (
                  <img
                    src={`${BACKEND_URL}${exercise.gifUrl}`}
                    alt={exercise.name}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400/171717/a3a3a3?text=Sem+Visualiza%C3%A7%C3%A3o';
                    }}
                  />
                ) : (
                  <div className="text-xs font-medium text-neutral-600">Sem imagem disponível</div>
                )}

                <span className="absolute top-3 right-3 px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-neutral-950/80 backdrop-blur-md text-red-500 border border-neutral-800 rounded-md">
                  {exercise.category}
                </span>
              </div>

              <div className="flex flex-col flex-grow p-4 space-y-2">
                <h3 className="text-base font-bold tracking-tight transition-colors duration-200 text-neutral-100 group-hover:text-red-500">
                  {exercise.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && role !== 'GUEST' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md overflow-hidden border shadow-2xl border-neutral-800 bg-neutral-900 rounded-2xl">
            <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-900/50">
              <h2 className="text-lg font-black tracking-tight">Novo Exercício</h2>
              <button
                onClick={() => { setIsModalOpen(false); setFormError(''); }}
                className="text-sm transition-colors text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExercise} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 text-xs text-red-400 border bg-red-950/20 border-red-900/50 rounded-xl">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Nome do Exercício</label>
                <input
                  type="text"
                  placeholder="Ex: Supino Inclinado com Halteres"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white transition-colors border bg-neutral-950 border-neutral-800 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Grupo Muscular</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white transition-colors border appearance-none bg-neutral-950 border-neutral-800 rounded-xl focus:outline-none focus:border-red-500"
                >
                  {formCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Demonstração (GIF / Foto)</label>
                <div className="relative flex items-center justify-center w-full px-4 py-4 transition-colors border border-dashed cursor-pointer rounded-xl bg-neutral-950 border-neutral-800 hover:border-neutral-600 group">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1 text-center pointer-events-none">
                    <span className="block text-sm font-medium transition-colors text-neutral-300 group-hover:text-white">
                      {selectedFile ? '📁 ' + selectedFile.name : '📥 Selecionar ficheiro'}
                    </span>
                    <span className="text-[10px] block text-neutral-500">
                      Formatos aceites: .gif, .png, .jpg (Máx: 10MB)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={submitLoading}
                  onClick={() => { setIsModalOpen(false); setFormError(''); }}
                  className="flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors bg-neutral-800 text-neutral-300 rounded-xl hover:bg-neutral-700 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex items-center justify-center flex-1 gap-2 py-3 text-xs font-bold tracking-wider uppercase transition-all bg-red-500 shadow-lg text-neutral-950 rounded-xl hover:bg-red-600 shadow-red-500/10 disabled:opacity-50"
                >
                  {submitLoading ? 'A Guardar...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}