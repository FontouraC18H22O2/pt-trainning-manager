import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de Alta Ordem (HOC) para trancar ecrãs privados por Autenticação e Cargos (RBAC).
 * Se o utilizador não estiver autenticado, vai para o Login.
 * Se o cargo do utilizador não for permitido naquela rota, é redirecionado.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  // 🔥 ATUALIZADO: Extraímos o 'isAuthenticated' e também o 'role' do estado global
  const { isAuthenticated, role } = useAuth();

  // 1. Validação de Autenticação Básica
  if (!isAuthenticated) {
    // Redireciona para o login e substitui o histórico
    return <Navigate to="/" replace />;
  }

  // 🔥 2. ADICIONADO: Validação do Nível de Acesso (RBAC)
  // Se a rota exigir cargos específicos e o cargo atual não estiver incluído na lista:
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Se for um Guest bisbilheteiro, mandamo-lo de volta para a Galeria dele
    if (role === 'GUEST') {
      return <Navigate to="/dashboard/galeria" replace />;
    }
    // Caso contrário, mandamos para a raiz do Dashboard público
    return <Navigate to="/dashboard" replace />;
  }

  // Se passou todas as barreiras de segurança, renderiza a página privada
  return children;
}