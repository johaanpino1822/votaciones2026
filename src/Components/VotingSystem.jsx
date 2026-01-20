import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { CandidateCard } from './CandidateCard';
import { Card } from './ui/Card';
import { VotingTimer } from '../Components/VotingTimer';
import { 
  Search, 
  Users, 
  Clock, 
  Vote, 
  Shield, 
  CheckCircle2,
  ArrowRight,
  LogOut,
  AlertCircle,
  XCircle,
  Filter,
  Award,
  TrendingUp,
  BarChart3,
  UserCheck,
  Zap,
  Sparkles,
  Crown,
  Target,
  Check,
  ChevronRight,
  Info,
  RefreshCw,
  Volume2,
  VolumeX,
  Bell,
  Star
} from 'lucide-react';

// Constantes para mejorar mantenibilidad
const VOTING_POSITIONS = {
  PERSONERIA: 'personeria',
  CONTRALORIA: 'contraloria',
  REPRESENTANTE: 'representante',
  PRESIDENTE: 'presidente'
};

const POSITION_DISPLAY = {
  personeria: 'Personería',
  contraloria: 'Contraloría',
  representante: 'Representante Estudiantil',
  presidente: 'Presidente de Curso'
};

const THIRTY_MINUTES_WARNING = { hours: 0, minutes: 30 };

export function VotingSystem() {
  const { 
    candidates, 
    user, 
    isVotingOpen, 
    castVote, 
    votingStats, 
    timeRemaining,
    logout
  } = useStore();
  
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const notificationAudioRef = useRef(null);
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [votingHistory, setVotingHistory] = useState([]);
  const [pulseEffect, setPulseEffect] = useState(false);

  // Efectos de sonido
  const playSound = (soundType) => {
    if (!soundEnabled) return;
    
    const audio = new Audio();
    switch(soundType) {
      case 'vote':
        audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3';
        break;
      case 'confirm':
        audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3';
        break;
      case 'error':
        audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3';
        break;
      default:
        return;
    }
    audio.volume = 0.3;
    audio.play();
  };

  // Debug en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 VotingSystem Debug');
      console.log('User:', user);
      console.log('Candidates:', candidates);
      console.log('Voting Open:', isVotingOpen);
      console.groupEnd();
    }
  }, [user, candidates, isVotingOpen]);

  // Notificaciones de tiempo
  useEffect(() => {
    if (timeRemaining && 
        timeRemaining.hours === THIRTY_MINUTES_WARNING.hours && 
        timeRemaining.minutes <= THIRTY_MINUTES_WARNING.minutes) {
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
            max-w-md w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xl rounded-2xl pointer-events-auto flex ring-2 ring-amber-300 ring-opacity-20 overflow-hidden`}
        >
          <div className="flex-1 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="animate-pulse">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-lg font-bold">⚠️ Tiempo Crítico</p>
                <p className="mt-1 text-amber-100">
                  ¡Quedan menos de 30 minutos para el cierre de votaciones!
                </p>
                <div className="mt-3 flex items-center text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                    ⏳ {timeRemaining.minutes}:{timeRemaining.seconds.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ), { 
        duration: 10000,
        position: 'top-right'
      });
    }
  }, [timeRemaining]);

  // Efecto de pulso para llamar la atención
  useEffect(() => {
    if (!user) return;
    
    const hasPendingVotes = Object.values(user?.hasVoted || {}).some(voted => !voted);
    if (hasPendingVotes) {
      const interval = setInterval(() => {
        setPulseEffect(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Redirigir si no hay usuario o si es admin
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    // Si es admin, redirigir a panel de admin
    if (user?.isAdmin) {
      navigate('/admin');
    }
  }, [user, navigate]);

  // Cargar historial de votación desde localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('votingHistory');
    if (savedHistory) {
      setVotingHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Filtrado optimizado de candidatos
  const filteredCandidates = useMemo(() => {
    let filtered = candidates.filter(c => c.active !== false);
    
    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(candidate =>
        candidate.name?.toLowerCase().includes(term) ||
        candidate.number?.toString().includes(term) ||
        candidate.position?.toLowerCase().includes(term) ||
        candidate.description?.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por posición
    if (activeFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.position === activeFilter);
    }
    
    // Ordenar
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return (b.votes || 0) - (a.votes || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'number':
          return a.number - b.number;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [candidates, searchTerm, activeFilter, sortBy]);

  // Agrupar candidatos por posición
  const candidatesByPosition = useMemo(() => {
    return Object.values(VOTING_POSITIONS).reduce((acc, position) => {
      acc[position] = filteredCandidates.filter(c => c.position === position);
      return acc;
    }, {});
  }, [filteredCandidates]);

  // Estadísticas de votación
  const votingStatsData = useMemo(() => {
    const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
    const votedPositions = Object.values(user?.hasVoted || {}).filter(voted => voted).length;
    const totalPositions = Object.keys(VOTING_POSITIONS).length;
    const percentage = Math.round((votedPositions / totalPositions) * 100);
    
    return {
      totalVotes,
      votedPositions,
      totalPositions,
      percentage,
      remainingPositions: totalPositions - votedPositions
    };
  }, [candidates, user]);

  // Handler de votación con validaciones
  const handleVoteInit = useCallback((candidateId, position, candidateName, candidateNumber) => {
    if (!user) {
      toast.error('Autenticación requerida', {
        description: 'Debes iniciar sesión para participar en la votación.',
        icon: '🔐',
        duration: 4000
      });
      playSound('error');
      return;
    }
    
    if (!isVotingOpen) {
      toast.error('Período de votación finalizado', {
        description: 'La ventana de votación ha cerrado. Consulta los resultados finales.',
        icon: '⏰',
        duration: 4000
      });
      playSound('error');
      return;
    }
    
    if (user.hasVoted[position]) {
      toast.error('Voto ya registrado', {
        description: `Ya has ejercido tu derecho al voto para ${POSITION_DISPLAY[position]}.`,
        icon: '✅',
        duration: 4000
      });
      playSound('error');
      return;
    }

    setSelectedCandidate({ 
      id: candidateId, 
      position, 
      name: candidateName,
      number: candidateNumber
    });
    setShowConfirmation(true);
    playSound('confirm');
  }, [user, isVotingOpen]);

  const handleVoteConfirm = useCallback(async () => {
    if (!selectedCandidate) return;
    
    setIsSubmitting(true);
    
    try {
      // Efecto visual de carga
      const votingBtn = document.querySelector('.confirm-vote-btn');
      if (votingBtn) {
        votingBtn.classList.add('loading');
      }
      
      // Simular procesamiento (puedes quitar esto en producción)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Registrar el voto
      const success = castVote(selectedCandidate.id, selectedCandidate.position);
      
      if (success) {
        playSound('vote');
        
        // Guardar en historial
        const newVote = {
          candidateId: selectedCandidate.id,
          candidateName: selectedCandidate.name,
          position: selectedCandidate.position,
          timestamp: new Date().toISOString(),
          voterId: user?.id
        };
        
        const updatedHistory = [...votingHistory, newVote];
        setVotingHistory(updatedHistory);
        localStorage.setItem('votingHistory', JSON.stringify(updatedHistory));
        
        toast.success('¡Voto Registrado! 🗳️', {
          description: `Has votado por ${selectedCandidate.name} (#${selectedCandidate.number})`,
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none'
          },
          icon: '✅'
        });
        
        // Mostrar confetti
        if (typeof window !== 'undefined') {
          import('canvas-confetti').then(confetti => {
            confetti.default({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          });
        }
        
        // Verificar si ya votó en todas las posiciones
        const hasVotedAll = Object.values(user?.hasVoted || {}).every(voted => voted);
        
        if (hasVotedAll) {
          setTimeout(() => {
            toast.success('🎉 ¡Votación Completada!', {
              description: 'Has ejercido tu derecho al voto en todas las categorías.',
              duration: 4000,
              style: {
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white'
              }
            });
            
            // Esperar y luego cerrar sesión
            setTimeout(() => {
              logout();
              navigate('/');
            }, 4000);
          }, 1000);
        }
      } else {
        throw new Error('Error al registrar el voto');
      }
    } catch (error) {
      toast.error('Error al registrar voto', {
        description: 'Por favor, intenta nuevamente.',
        icon: '❌',
        duration: 4000
      });
      playSound('error');
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
      setSelectedCandidate(null);
    }
  }, [selectedCandidate, castVote, user, logout, navigate, votingHistory]);

  // Estado de votación del usuario
  const userVotingStatus = useMemo(() => {
    const completed = Object.values(user?.hasVoted || {}).every(voted => voted);
    const pendingPositions = Object.entries(user?.hasVoted || {})
      .filter(([_, voted]) => !voted)
      .map(([position]) => ({
        key: position,
        display: POSITION_DISPLAY[position],
        remaining: candidatesByPosition[position]?.length || 0
      }));
    
    return {
      completed,
      pendingPositions,
      progress: completed ? 100 : (Object.values(user?.hasVoted || {}).filter(voted => voted).length / Object.keys(VOTING_POSITIONS).length) * 100
    };
  }, [user, candidatesByPosition]);

  // Si no hay usuario autenticado
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Acceso Requerido</h2>
          <p className="text-blue-200 mb-8 text-lg">Debes iniciar sesión para acceder al sistema de votación.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg"
          >
            Volver al inicio
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Vista de votación cerrada
  if (!isVotingOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-red-900/30 to-amber-900/30 border-l-4 border-red-500 rounded-2xl p-8 mb-8 shadow-2xl backdrop-blur-sm">
              <div className="flex flex-col items-center space-y-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="bg-red-100 p-6 rounded-full"
                >
                  <Clock className="w-12 h-12 text-red-600" />
                </motion.div>
                <h1 className="text-4xl font-bold text-white">
                  Votación Concluida
                </h1>
                <p className="text-red-200 max-w-2xl text-lg">
                  El período electoral ha finalizado. Gracias por tu participación democrática.
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-6 py-3 rounded-full text-lg font-bold bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg">
                    <Clock className="w-5 h-5 mr-2" />
                    Votación Cerrada
                  </span>
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all shadow-xl inline-flex items-center gap-3"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Si el usuario ya completó su votación
  if (userVotingStatus.completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 to-green-800 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-3xl shadow-2xl border border-emerald-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-12 text-white text-center relative overflow-hidden">
              {/* Partículas flotantes */}
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -100, x: Math.random() * 100 }}
                    animate={{ 
                      y: [0, 100, 0],
                      x: [Math.random() * 100, Math.random() * 100],
                      rotate: 360
                    }}
                    transition={{ 
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute text-2xl opacity-20"
                    style={{ left: `${Math.random() * 100}%` }}
                  >
                    ★
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative z-10 w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Crown className="w-16 h-16" />
                </motion.div>
              </motion.div>
              <h1 className="text-4xl font-bold">¡Votación Completada!</h1>
              <p className="text-emerald-100 mt-3 text-xl">Democracia en Acción</p>
            </div>

            <div className="p-12 text-center">
              <div className="mb-10">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <UserCheck className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {user.username}
                </h2>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  Has ejercido tu derecho al voto exitosamente. 
                  Tu participación fortalece nuestra comunidad estudiantil.
                </p>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8 mb-10 shadow-lg">
                <h3 className="font-bold text-emerald-900 mb-6 text-2xl">
                  📊 Resumen de tu Participación
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(VOTING_POSITIONS).map(([key, position]) => (
                    <motion.div
                      key={position}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + (key * 0.1) }}
                      className="bg-white p-6 rounded-xl shadow-sm border border-emerald-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-emerald-700 font-semibold">
                            {POSITION_DISPLAY[position]}
                          </div>
                          <div className="text-2xl font-bold text-emerald-900 mt-2">
                            Votado ✓
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Check className="w-6 h-6 text-emerald-600" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Clock className="w-6 h-6 text-gray-500" />
                  <span className="text-gray-600 font-medium">
                    Preparando estación para próximo votante...
                  </span>
                </div>
                <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: "linear" }}
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Componentes UI inline mejorados
  const VotingStatusBadge = ({ status }) => (
    <motion.span
      animate={pulseEffect ? { scale: 1.05 } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center px-5 py-2.5 rounded-full text-base font-bold shadow-lg ${
        status === 'open' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
        status === 'closed' ? 'bg-gradient-to-r from-red-500 to-amber-600 text-white' :
        status === 'live' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' :
        'bg-gradient-to-r from-gray-500 to-slate-600 text-white'
      }`}
    >
      {status === 'open' && (
        <>
          <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse"></div>
          VOTACIÓN ABIERTA
        </>
      )}
      {status === 'closed' && (
        <>
          <Clock className="w-5 h-5 mr-3" />
          VOTACIÓN CERRADA
        </>
      )}
      {status === 'live' && (
        <>
          <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse"></div>
          EN VIVO
        </>
      )}
    </motion.span>
  );

  const SearchBar = () => (
    <div className="relative flex-1 max-w-3xl">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        placeholder="🔍 Buscar candidatos por nombre, número o cargo..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border-2 border-gray-300/50 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 shadow-lg text-lg"
      />
      {searchTerm && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSearchTerm('')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );

  const ConfirmationModal = () => {
    if (!showConfirmation) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-md"
        onClick={() => {
          setShowConfirmation(false);
          setSelectedCandidate(null);
          toast('Voto cancelado', { 
            icon: '↩️',
            duration: 2000
          });
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl max-w-lg w-full p-8 border-2 border-blue-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <Vote className="w-10 h-10 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 border-4 border-blue-400/30 rounded-full"
              />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Confirmar Tu Voto
            </h3>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-500">Candidato seleccionado</div>
                  <div className="text-xl font-bold text-blue-700">
                    {selectedCandidate?.name}
                  </div>
                  <div className="text-gray-600">Número #{selectedCandidate?.number}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Cargo</div>
                  <div className="text-lg font-semibold text-purple-600 capitalize">
                    {POSITION_DISPLAY[selectedCandidate?.position]}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Esta acción es irreversible y constituye tu decisión final.</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowConfirmation(false);
                  setSelectedCandidate(null);
                  toast('Voto reconsiderado', { 
                    icon: '🤔',
                    duration: 2000
                  });
                }}
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-xl hover:from-gray-300 hover:to-gray-400 transition-all font-bold shadow-lg disabled:opacity-50"
              >
                Reconsiderar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVoteConfirm}
                disabled={isSubmitting}
                className="confirm-vote-btn flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Procesando...
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center">
                      <Check className="w-5 h-5 mr-3" />
                      Confirmar Voto
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const EmptyState = ({ icon, title, description }) => (
    <Card className="text-center py-16 border-3 border-dashed border-gray-300/50 rounded-3xl bg-gradient-to-br from-gray-50 to-white">
      <div className="text-gray-400/50 mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-700 mb-4">
        {title}
      </h3>
      <p className="text-gray-600 max-w-md mx-auto text-lg">
        {description}
      </p>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Principal */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10">
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Sistema de Votación Estudiantil
                </h1>
                <p className="text-xl text-gray-600 mt-3">
                  I.E.F.A.G - Elecciones {new Date().getFullYear()}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Votante</div>
                    <div className="font-bold text-gray-900">{user.username}</div>
                  </div>
                </div>
                <VotingStatusBadge status="open" />
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-lg">
                  <div className="text-sm space-y-3 min-w-[200px]">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Estado:
                      </span>
                      <span className="font-bold text-green-600 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Activo
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Sesión:</span>
                      <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Votante
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-mono text-gray-800">{user?.id?.slice(-8)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-amber-600 text-white rounded-xl hover:from-red-600 hover:to-amber-700 transition-all font-semibold shadow-lg"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </motion.button>
            </div>
          </div>

          {/* Timer y Estadísticas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-blue-900 flex items-center gap-3">
                  <Clock className="w-6 h-6" />
                  Tiempo Restante
                </h3>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                  ⌛ ACTIVO
                </div>
              </div>
              <VotingTimer initialTime={timeRemaining} />
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-purple-900 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6" />
                  Estadísticas de Votación
                </h3>
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-purple-200">
                  <div className="text-sm text-purple-600 mb-1">Tu Progreso</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {votingStatsData.percentage}%
                  </div>
                  <div className="w-full bg-purple-100 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ width: `${votingStatsData.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-purple-200">
                  <div className="text-sm text-purple-600 mb-1">Votos Totales</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {votingStatsData.totalVotes}
                  </div>
                  <div className="text-xs text-purple-500 mt-1">
                    En todo el sistema
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Panel de Control */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <SearchBar />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-gray-700 font-medium"
                >
                  <option value="all">Todos los cargos</option>
                  {Object.entries(VOTING_POSITIONS).map(([key, position]) => (
                    <option key={position} value={position}>
                      {POSITION_DISPLAY[position]}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                <TrendingUp className="w-5 h-5 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-gray-700 font-medium"
                >
                  <option value="default">Ordenar por</option>
                  <option value="name">Nombre (A-Z)</option>
                  <option value="votes">Más votados</option>
                  <option value="number">Número</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Panel de Progreso del Usuario */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 backdrop-blur-sm shadow-xl">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-blue-900">
                        Tu Progreso de Votación
                      </h3>
                      <p className="text-gray-600">
                        Completa todas las categorías para finalizar tu participación
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(VOTING_POSITIONS).map(([key, position]) => (
                      <motion.div
                        key={position}
                        whileHover={{ scale: 1.05 }}
                        className={`flex items-center space-x-3 px-5 py-3 rounded-xl border-2 shadow-lg transition-all ${
                          user?.hasVoted[position]
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300'
                            : 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300'
                        }`}
                      >
                        {user?.hasVoted[position] ? (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold capitalize text-gray-900">
                            {POSITION_DISPLAY[position]}
                          </div>
                          <div className={`text-sm font-medium ${
                            user?.hasVoted[position] ? 'text-green-700' : 'text-amber-700'
                          }`}>
                            {user?.hasVoted[position] ? '✓ Completado' : '⏳ Pendiente'}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-48 h-48">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * userVotingStatus.progress) / 100}
                        initial={{ strokeDashoffset: 283 }}
                        animate={{ strokeDashoffset: 283 - (283 * userVotingStatus.progress) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {Math.round(userVotingStatus.progress)}%
                      </div>
                      <div className="text-sm text-gray-600">Completado</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Lista de Candidatos por Posición */}
        {userVotingStatus.pendingPositions.map((positionInfo) => {
          const positionCandidates = candidatesByPosition[positionInfo.key] || [];

          return (
            <motion.section
              key={positionInfo.key}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-16"
            >
              <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-100">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Award className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900">
                            Candidatos a {positionInfo.display}
                          </h2>
                          <p className="text-gray-600 text-lg mt-2">
                            Selecciona tu candidato preferido. {positionInfo.remaining} opciones disponibles.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-800">
                              {positionInfo.remaining} candidatos
                            </span>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-lg border border-amber-200">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span className="font-medium text-amber-800">
                              Voto pendiente
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
                    >
                      <div className="text-center">
                        <div className="text-2xl">{positionInfo.remaining}</div>
                        <div className="text-sm opacity-90">Disponibles</div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div className="p-8">
                  {positionCandidates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {positionCandidates.map((candidate, index) => (
                        <motion.div
                          key={candidate.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -5 }}
                        >
                          <CandidateCard
                            candidate={candidate}
                            onVote={() => handleVoteInit(
                              candidate.id, 
                              candidate.position, 
                              candidate.name,
                              candidate.number
                            )}
                            hasVoted={user?.hasVoted[positionInfo.key]}
                            index={index}
                            disabled={user?.hasVoted[positionInfo.key] || !isVotingOpen}
                            showDetails
                            enhanced
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<Users className="w-16 h-16" />}
                      title="No hay candidatos disponibles"
                      description={
                        searchTerm 
                          ? 'No se encontraron candidatos con esos criterios'
                          : 'Aún no hay candidatos registrados para esta posición'
                      }
                    />
                  )}
                </div>
              </div>
            </motion.section>
          );
        })}

        {/* Instrucciones Flotantes */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-8 right-8 z-40"
        >
          <button
            onClick={() => setShowTutorial(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all"
          >
            <Info className="w-6 h-6" />
          </button>
        </motion.div>
      </div>

      {/* Modal de Confirmación */}
      <ConfirmationModal />

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={() => setShowTutorial(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl max-w-2xl w-full p-8 border-2 border-blue-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                  Guía de Votación
                </h3>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Explora los candidatos</h4>
                    <p className="text-gray-600">
                      Revisa la información de cada candidato antes de tomar tu decisión.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-green-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Selecciona tu candidato</h4>
                    <p className="text-gray-600">
                      Haz clic en "Votar por este candidato" para seleccionar tu preferencia.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-amber-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Confirma tu voto</h4>
                    <p className="text-gray-600">
                      Verifica tu selección en la ventana de confirmación. ¡Tu voto es secreto e irreversible!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-purple-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Completa todas las categorías</h4>
                    <p className="text-gray-600">
                      Debes votar en cada categoría disponible para completar el proceso.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-200">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <h4 className="font-bold text-gray-900">Tu voto es seguro</h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    El sistema garantiza la confidencialidad de tu voto. 
                    Una vez confirmado, no puede ser modificado ni visto por otros.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio elements */}
      <audio ref={audioRef} />
      <audio ref={notificationAudioRef} />
    </div>
  );
}

// Agrega estos estilos CSS personalizados
const styles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;

// Inyecta los estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}