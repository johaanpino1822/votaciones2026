import React, { useEffect } from 'react';
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

// Componente de carga global
function GlobalLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-800 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600 font-medium">Cargando aplicación...</p>
        <p className="text-sm text-gray-500 mt-2">Conectando con la nube</p>
      </div>
    </div>
  );
}

function App() {
  const { 
    user, 
    isLoading, 
    loadCandidatesFromCloud, 
    cloudSync 
  } = useStore();

  // Cargar candidatos desde MockAPI al iniciar la aplicación
  useEffect(() => {
    loadCandidatesFromCloud();
  }, []);

  // Mostrar spinner mientras carga
  if (isLoading) {
    return <GlobalLoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        {/* Navigation - Mostrar siempre para consistencia visual */}
        <Navigation />

        {/* Indicador de sincronización (opcional) */}
        {cloudSync?.lastSync && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 text-xs text-gray-600 border border-gray-200 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Última sincronización: {new Date(cloudSync.lastSync).toLocaleTimeString()}</span>
            </div>
          </div>
        )}

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