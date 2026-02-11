import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  School, 
  Home, 
  Vote, 
  BarChart3, 
  Settings, 
  Shield,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react';

export function Navigation() {
  const { user, logout, isVotingOpen } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Items de navegación según tipo de usuario
  const getNavItems = () => {
    const baseItems = [
      { path: '/', label: 'Inicio', icon: Home, showAlways: true },
    ];

    // Si no hay usuario, solo inicio
    if (!user) {
      return baseItems;
    }

    // Usuario es ADMINISTRADOR
    if (user.isAdmin) {
      return [
        ...baseItems,
        { path: '/admin', label: 'Administración', icon: Settings },
        { path: '/results', label: 'Resultados', icon: BarChart3 },
      ];
    }

    // Usuario es VOTANTE (incluye jurado/mesa) - SOLO VOTACIÓN
    return [
      ...baseItems,
      { path: '/voting', label: 'Votación', icon: Vote },
      // NO se incluye resultados para votantes
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y marca */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-8 h-8 bg-gradient-to-br from-blue-800 to-indigo-900 rounded-lg flex items-center justify-center"
              >
                <School className="w-5 h-5 text-white" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">
                  I.E.F.A.G
                </h1>
                <p className="text-xs text-gray-500">Elecciones 2025</p>
              </div>
            </Link>

            {/* Estado de votación */}
            {isVotingOpen !== undefined && (
              <div className="hidden md:flex items-center ml-4 pl-4 border-l border-gray-200">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  isVotingOpen 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${isVotingOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span>{isVotingOpen ? 'Votación Abierta' : 'Votación Cerrada'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Items de navegación (centro) */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-emerald-50 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Información del usuario y logout */}
          <div className="flex items-center space-x-4">
            {/* Información del usuario */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {user.username}
                  </p>
                  <div className="flex items-center space-x-1">
                    {user.isAdmin ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-800/10 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Administrador
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <Users className="w-3 h-3 mr-1" />
                        Votante Activo
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Avatar del usuario */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  user.isAdmin 
                    ? 'bg-blue-800/10 text-blue-700' 
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {user.isAdmin ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <span className="font-semibold text-sm">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Botón de logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline text-sm">Salir</span>
                </button>
              </div>
            ) : (
              // Botón para login si no hay usuario
              <Link
                to="/login"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-800 to-emerald-800 text-white rounded-lg hover:shadow-md transition-all duration-200"
              >
                <Vote className="w-4 h-4" />
                <span className="text-sm font-medium">Acceder al Sistema</span>
              </Link>
            )}
          </div>
        </div>

        {/* Navegación móvil */}
        {navItems.length > 1 && (
          <div className="md:hidden border-t border-gray-200 pt-3 pb-2">
            <div className="flex justify-around">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}