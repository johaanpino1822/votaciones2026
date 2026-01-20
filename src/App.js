import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';

// Pages
import { Home } from './pages/Home';
import { ResultsPage } from './pages/ResultsPage';
import { AdminPanel } from './pages/AdminPanel';

// Components
import { VotingSystem } from './Components/VotingSystem';
import { Login } from './Components/Login';
import { Navigation } from './Components/Navigation';

// Componente para protección de rutas
function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useStore();
  
  // Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Si se requiere ser admin y el usuario no lo es, redirigir a inicio
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  const { user } = useStore();

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        {/* Navigation - Mostrar siempre para consistencia visual */}
        <Navigation />

        {/* Main Content */}
        <main>
          <Routes>
            {/* Ruta pública - Home */}
            <Route path="/" element={<Home />} />
            
            {/* Ruta de login */}
            <Route 
              path="/login" 
              element={
                !user ? <Login /> : 
                user.isAdmin ? <Navigate to="/admin" replace /> : 
                <Navigate to="/voting" replace />
              } 
            />
            
            {/* Ruta de votación - Solo para votantes (no admin) */}
            <Route 
              path="/voting" 
              element={
                <ProtectedRoute>
                  {user?.isAdmin ? <Navigate to="/admin" replace /> : <VotingSystem />}
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta de resultados - Solo para admin */}
            <Route 
              path="/results" 
              element={
                <ProtectedRoute adminOnly>
                  <ResultsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta de administración - Solo para admin */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              borderRadius: '0.5rem',
            },
            success: {
              duration: 3000,
              style: {
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
              },
              iconTheme: {
                primary: '#16a34a',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
              },
              iconTheme: {
                primary: '#dc2626',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;