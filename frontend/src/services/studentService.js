import api from "./api";

/**
 * Serviço responsável por fazer a ponte de comunicação entre
 * o ecrã de Alunos do Frontend e a API Express do Backend.
 */
const studentService = {
  // 1. GET - Ir buscar a lista completa de alunos à Base de Dados
  getAllStudents: async () => {
    try {
      const response = await api.get("/students");
      return response.data; // Devolve o array de alunos enviado pelo express
    } catch (error) {
      console.error("Erro ao listar alunos da API:", error);
      throw (
        error.response?.data?.error || "Não foi possível carregar os alunos."
      );
    }
  },

  // 2. POST - Registar um novo aluno na Base de Dados
  createStudent: async (studentData) => {
    try {
      const response = await api.post("/students", studentData);
      return response.data; // Devolve o aluno criado com o ID gerado pelo Prisma
    } catch (error) {
      console.error("Erro ao criar aluno na API:", error);
      throw error.response?.data?.error || "Não foi possível registar o aluno.";
    }
  },
  // 3. PUT - Atualizar os dados de um aluno existente
  updateStudent: async (id, studentData) => {
    try {
      const response = await api.put(`/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar o aluno ${id} na API:`, error);
      throw (
        error.response?.data?.error || "Não foi possível atualizar o atleta."
      );
    }
  },

  // 4. DELETE - Remover um aluno pelo seu ID único
  deleteStudent: async (id) => {
    try {
      const response = await api.delete(`/students/${id}`);
      return response.data; // Devolve a confirmação de sucesso
    } catch (error) {
      console.error(`Erro ao eliminar o aluno ${id} da API:`, error);
      throw error.response?.data?.error || "Não foi possível remover o atleta.";
    }
  },
};

export default studentService;
