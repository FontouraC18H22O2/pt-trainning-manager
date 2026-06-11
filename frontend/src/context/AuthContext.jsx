import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Criar o Contexto de Autenticação
const AuthContext = createContext(null);

// Provedor do Contexto (Wrapper global)
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); 
  const [role, setRole] = useState(null); // 🔥 NOVO: Estado para guardar o nível de acesso (ADMIN, PT, GUEST)
  const [loading, setLoading] = useState(true);

  // Efeito executado ao iniciar a aplicação para recuperar o token e dados guardados
  useEffect(() => {
    const storedToken = localStorage.getItem('pt_api_token');
    const storedUser = localStorage.getItem('pt_api_user'); 
    const storedRole = localStorage.getItem('pt_api_role'); // 🔥 NOVO: Recuperar o role guardado

    if (storedToken && storedUser && storedRole) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRole(storedRole); // 🔥 NOVO: Injetar o role no estado ao iniciar a app
      
      // Define o token por padrão para todos os pedidos HTTP futuros do Axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  // 🔥 ATUALIZADO: Função para registar o login com sucesso recebendo os dados do backend
  const login = (newToken, userData) => {
    localStorage.setItem('pt_api_token', newToken);
    localStorage.setItem('pt_api_user', JSON.stringify(userData)); 
    localStorage.setItem('pt_api_role', userData.role); // 🔥 NOVO: Guardar o nível de acesso no localStorage
    
    // Injeta o token no cabeçalho padrão do Axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    setToken(newToken);
    setUser(userData);
    setRole(userData.role); // 🔥 NOVO: Injetar o role no estado global
  };

  // 🔥 ADICIONADO: Função para comunicar com o endpoint de criar conta (registo)
  const register = async (nome, email, password) => {
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        nome,
        email,
        password
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao registar Personal Trainer:', error);
      const mensagemErro = error.response?.data?.error || 'Erro ao criar conta.';
      throw new Error(mensagemErro);
    }
  };

  // 🔥 ATUALIZADO: Função para fazer logout e limpar todo o sistema
  const logout = () => {
    localStorage.removeItem('pt_api_token');
    localStorage.removeItem('pt_api_user'); 
    localStorage.removeItem('pt_api_role'); // 🔥 NOVO: Limpar o nível de acesso do localStorage
    
    // Remove o cabeçalho de autorização do Axios
    delete axios.defaults.headers.common['Authorization'];
    
    setToken(null);
    setUser(null);
    setRole(null); // 🔥 NOVO: Limpar o estado do role
  };

  // Enquanto verifica o localStorage, evita renderizar caminhos errados
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-neutral-950">
        <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-fitnessGym"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!token, 
      token, 
      user, 
      role, // 🔥 NOVO: Exposto globalmente para que as páginas e a Sidebar saibam o nível do utilizador
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para consumir a autenticação de forma simples e limpa nos componentes
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado obrigatoriamente dentro de um AuthProvider');
  }
  return context;
}