import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Alunos from './pages/Alunos'; 
import Treinos from './pages/Treinos'; 
import Galeria from './pages/Galeria'; 
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout'; 

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 🟢 Rotas Públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔴 Grupo de Rotas Privadas - Todas passam pelo DashboardLayout */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PT', 'GUEST']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* O URL "/dashboard" (Visão Geral) - Apenas ADMIN e PT */}
            <Route 
              index 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PT']}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* O URL "/dashboard/alunos" - Apenas ADMIN e PT */}
            <Route 
              path="alunos" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PT']}>
                  <Alunos />
                </ProtectedRoute>
              } 
            />
            
            {/* O URL "/dashboard/treinos" - Apenas ADMIN e PT */}
            <Route 
              path="treinos" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PT']}>
                  <Treinos />
                </ProtectedRoute>
              } 
            />

            {/* O URL "/dashboard/galeria" - Todos podem ver */}
            <Route 
              path="galeria" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PT', 'GUEST']}>
                  <Galeria />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Fallback Global */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;