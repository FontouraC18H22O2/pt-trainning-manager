import api from './api';

const assessmentService = {
  // Listar avaliações de um aluno (histórico)
  getByStudent: async (studentId) => {
    try {
      const response = await api.get(`/assessments/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao carregar avaliações.';
    }
  },

  // Criar nova avaliação
  create: async (studentId, data) => {
    try {
      const response = await api.post(`/assessments/student/${studentId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao guardar avaliação.';
    }
  },

  // Apagar avaliação
  delete: async (assessmentId) => {
    try {
      const response = await api.delete(`/assessments/${assessmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao apagar avaliação.';
    }
  }
};

export default assessmentService;