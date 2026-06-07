import axios from 'axios';

// 1. Criar a instância central do Axios com o URL base do teu backend Express
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // 10 segundos de limite para evitar pedidos pendentes infinitamente
  headers: {
    'Content-Type': 'application/json',
  }
});

// 2. INTERCEPTOR DE PEDIDOS (Request Interceptor)
// Este "segurança" analisa cada pedido antes de ele sair do frontend.
// Se existir um token guardado no localStorage, ele injeta-o no cabeçalho Authorization.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Formato padrão de cibersegurança: Bearer <token>
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. INTERCEPTOR DE RESPOSTAS (Response Interceptor)
// Analisa as respostas do backend. Se o backend disser que o token expirou (Erro 401),
// limpa as credenciais caducadas e redireciona o utilizador para o login automaticamente.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('🔒 Token expirado ou inválido. A redirecionar para o login...');
     // COMENTADO TEMPORARIAMENTE para não seres expulso enquanto desenhamos as rotas:
      // localStorage.removeItem('token');
      // localStorage.removeItem('user');
      // window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default api;