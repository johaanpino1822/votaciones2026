import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  LogIn, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Vote,
  Eye,
  EyeOff,
  RefreshCw,
  User,
  Key,
  Check
} from 'lucide-react';

export function Login() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVotingMode, setIsVotingMode] = useState(false);
  const [currentVoterNumber, setCurrentVoterNumber] = useState(1);
  const [voteCompleted, setVoteCompleted] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const { 
    login, 
    logout, 
    user, 
    isVotingOpen, 
    candidates,
    votingStats,
    verifyJuryPassword,
    verifyAdminCredentials,
    currentVoterNumber: storeVoterNumber
  } = useStore();
  
  const navigate = useNavigate();

  // Sincronizar el contador con el store
  useEffect(() => {
    if (storeVoterNumber) {
      setCurrentVoterNumber(storeVoterNumber);
    }
  }, [storeVoterNumber]);

  // Verificar si hay una sesión activa
  useEffect(() => {
    if (user && !user.isAdmin) {
      setIsVotingMode(true);
    } else {
      setIsVotingMode(false);
    }
  }, [user]);

  // Si el usuario ya votó, mostrar pantalla de confirmación
  useEffect(() => {
    if (user && !user.isAdmin && user.hasVoted?.personeria && user.hasVoted?.contraloria) {
      setVoteCompleted(true);
      
      // Auto-logout después de 3 segundos
      const timer = setTimeout(() => {
        handleLogout();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  // Redirigir si el usuario ya está logueado y no es admin
  useEffect(() => {
    if (user && !user.isAdmin && !voteCompleted) {
      navigate('/voting');
    }
  }, [user, voteCompleted, navigate]);

  const handleJuryLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      if (verifyJuryPassword(password)) {
        // Crear votante temporal con número secuencial
        const tempVoter = {
          username: `Votante_${currentVoterNumber.toString().padStart(3, '0')}`,
          isJury: false,
          isAdmin: false,
          isTemp: true,
          voterNumber: currentVoterNumber,
          hasVoted: { 
            personeria: false, 
            contraloria: false 
          }
        };
        
        if (login(tempVoter)) {
          setIsVotingMode(true);
          setPassword('');
          // La redirección se manejará en el useEffect de arriba
        }
      } else {
        throw new Error('Contraseña incorrecta');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      if (verifyAdminCredentials(adminUsername, adminPassword)) {
        const adminUser = {
          username: adminUsername,
          isJury: false,
          isAdmin: true,
          isTemp: false,
          hasVoted: { personeria: false, contraloria: false }
        };
        
        if (login(adminUser)) {
          setAdminUsername('');
          setAdminPassword('');
          setAdminMode(false);
          navigate('/admin');
        }
      } else {
        throw new Error('Credenciales de administrador inválidas');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsVotingMode(false);
    setVoteCompleted(false);
    setPassword('');
    setError('');
    navigate('/');
  };

  const handleQuickVoter = () => {
    if (!user) {
      setError('Primero debe iniciar sesión como jurado');
      return;
    }

    // Crear un votante temporal
    const tempVoter = {
      username: `Votante_${currentVoterNumber.toString().padStart(3, '0')}`,
      isJury: false,
      isAdmin: false,
      isTemp: true,
      voterNumber: currentVoterNumber,
      hasVoted: { personeria: false, contraloria: false }
    };
    
    login(tempVoter);
    // La redirección se manejará en el useEffect de arriba
  };

  // Pantalla de confirmación después de votar
  if (voteCompleted && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white rounded-xl shadow-lg border border-emerald-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-8 text-white text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10" />
              </motion.div>
              <h1 className="text-2xl font-bold">¡Voto Registrado!</h1>
              <p className="text-emerald-100 text-sm mt-1">Gracias por participar</p>
            </div>

            <div className="p-8 text-center">
              <div className="mb-6">
                <User className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.username}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Has ejercido tu derecho al voto exitosamente
                </p>
              </div>

              <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-emerald-900 text-sm mb-2">
                  Resumen de tu voto
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Personería</div>
                    <div className={`text-lg font-bold ${user.hasVoted.personeria ? 'text-emerald-700' : 'text-red-600'}`}>
                      {user.hasVoted.personeria ? '✅ Votado' : '❌ Pendiente'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Contraloría</div>
                    <div className={`text-lg font-bold ${user.hasVoted.contraloria ? 'text-emerald-700' : 'text-red-600'}`}>
                      {user.hasVoted.contraloria ? '✅ Votado' : '❌ Pendiente'}
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-500"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Preparando estación para próximo votante...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: "linear" }}
                    className="bg-emerald-500 h-2 rounded-full"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Mostrar loading si el usuario ya está logueado y se está redirigiendo
  if (user && !user.isAdmin && !voteCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-sm">Redirigiendo al sistema de votación...</p>
        </div>
      </div>
    );
  }

  // Modo administrador (login separado)
  if (adminMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-800 to-indigo-900 p-8 text-white text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-bold">Panel Administrativo</h1>
              <p className="text-gray-300 text-sm mt-2">Acceso restringido al personal autorizado</p>
            </div>

            <form onSubmit={handleAdminLogin} className="p-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario Administrador
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="admin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-3 hover:shadow-md transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Acceder al Panel Admin
                    </>
                  )}
                </motion.button>
              </div>

              <div className="text-center pt-6">
                <button
                  type="button"
                  onClick={() => setAdminMode(false)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Volver a mesa de votación
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Login principal para jurados/votantes
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl"
      >
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header ancho con información del votante */}
          <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-emerald-800 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Vote className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">I.E.F.A.G 2025</h1>
                  <p className="text-blue-100 text-sm mt-1">Estación de Votación Electrónica</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-300">Votante Actual</div>
                <div className="text-3xl font-bold text-white">
                  #{currentVoterNumber.toString().padStart(3, '0')}
                </div>
                <div className="text-xs text-gray-300 mt-1">Mesa de votación activa</div>
              </div>
            </div>
          </div>

          {/* Contenido principal en dos columnas */}
          <div className="grid grid-cols-2 gap-8 p-8">
            {/* Columna izquierda - Formulario de login */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Acceso a Votación</h2>
                <p className="text-gray-600 text-sm mb-6">
                  {isVotingMode ? 'Sesión activa - Preparado para votar' : 'Ingrese la contraseña proporcionada por el jurado'}
                </p>
              </div>

              <form onSubmit={handleJuryLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña de la Mesa
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg tracking-wider font-medium pr-12"
                      placeholder="••••••••"
                      required
                      autoFocus
                      disabled={isVotingMode}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-red-700 text-sm">{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading || isVotingMode}
                  className={`w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all ${
                    isVotingMode
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-700 to-emerald-700 text-white hover:shadow-md'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Verificando...
                    </>
                  ) : isVotingMode ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Sesión Activa - Preparado
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Iniciar Votación
                    </>
                  )}
                </motion.button>

                {/* Botón de acceso rápido (solo para desarrollo) */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    type="button"
                    onClick={handleQuickVoter}
                    className="w-full border border-emerald-600 text-emerald-700 py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors text-sm"
                  >
                    Acceso Rápido (Modo Demo)
                  </button>
                )}
              </form>
            </div>

            {/* Columna derecha - Información y estado */}
            <div className="space-y-6">
              {/* Estado de sesión */}
              <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Estado del Sistema</h3>
                    <p className="text-gray-600 text-sm">Información de la sesión actual</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isVotingMode ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                      <span className="text-sm text-gray-700">Sesión</span>
                    </div>
                    <span className={`font-medium ${isVotingMode ? 'text-emerald-600' : 'text-gray-600'}`}>
                      {isVotingMode ? 'Activa ✓' : 'Inactiva'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Tiempo restante</span>
                    </div>
                    <span className="font-medium text-amber-600">
                      {isVotingMode ? '5:00 minutos' : 'Esperando inicio'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Votante actual</span>
                    </div>
                    <span className="font-bold text-blue-700">
                      #{currentVoterNumber.toString().padStart(3, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acceso administrativo */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-slate-800 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Acceso Administrativo</h3>
                    <p className="text-gray-600 text-sm">Solo para personal autorizado</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAdminMode(true)}
                  className="w-full bg-gradient-to-r from-gray-700 to-slate-800 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-md transition-all"
                >
                  <Shield className="w-4 h-4" />
                  Acceder al Panel de Control
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>La sesión se cerrará automáticamente después de votar</span>
              </div>
              <div className="text-xs text-gray-400">
                Sistema de Votación I.E.F.A.G © 2025
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}