import api from './api'; // Importa a tua instância central do Axios

/**
 * Procura o estado de saúde de todos os serviços ligados ao sistema:
 * Backend (Railway), Base de Dados, Resend (Email), Cloudinary (Imagens) e Frontend (Vercel).
 * Rota exclusiva para utilizadores com a Role 'ADMIN'.
 * @returns {Promise<Object>} Objeto com o estado de cada serviço + resumo geral
 */
export const getSystemStatus = async () => {
  try {
    const response = await api.get('/diagnostics/status');
    return response.data;
  } catch (error) {
    const msgErro = error.response?.data?.error || 'Erro ao verificar o estado dos serviços ligados.';
    console.error('❌ Erro em diagnosticsService -> getSystemStatus:', msgErro);
    throw new Error(msgErro);
  }
};