import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { CandidateCard } from './CandidateCard';
import { Card } from './ui/Card';
import { VotingTimer } from '../Components/VotingTimer';
import { 
  Users, 
  Clock, 
  Vote, 
  Shield, 
  CheckCircle2,
  LogOut,
  AlertCircle,
  XCircle,
  Filter,
  Award,
  TrendingUp,
  BarChart3,
  UserCheck,
  Zap,
  Crown,
  Target,
  Check,
  Info,
  Volume2,
  VolumeX,
  Trophy,
  Medal,
  Flag,
  CheckSquare,
  Vote as VoteIcon,
  UserPlus
} from 'lucide-react';

// Constantes específicas para Personería y Contraloría solamente
const VOTING_POSITIONS = {
  PERSONERIA: 'personeria',
  CONTRALORIA: 'contraloria'
};

const POSITION_DISPLAY = {
  personeria: 'Personería Estudiantil',
  contraloria: 'Contraloría Estudiantil'
};

const POSITION_COLORS = {
  personeria: {
    primary: '#3b82f6',
    gradient: 'from-blue-500 to-blue-600',
    light: 'from-blue-50 to-blue-100',
    dark: 'from-blue-600 to-blue-700'
  },
  contraloria: {
    primary: '#8b5cf6',
    gradient: 'from-purple-500 to-purple-600',
    light: 'from-purple-50 to-purple-100',
    dark: 'from-purple-600 to-purple-700'
  }
};

const THIRTY_MINUTES_WARNING = { hours: 0, minutes: 30 };

// Modal de voto exitoso
const SuccessModal = ({ onClose }) => {
  useEffect(() => {
    // Mostrar confeti cuando se abre el modal
    if (typeof window !== 'undefined') {
      import('canvas-confetti').then(confetti => {
        confetti.default({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        // Segundo efecto de confeti después de un breve retraso
        setTimeout(() => {
          confetti.default({
            particleCount: 100,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
        }, 250);
        
        // Tercer efecto de confeti
        setTimeout(() => {
          confetti.default({
            particleCount: 100,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 500);
      }).catch(console.error);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 z-[100]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl shadow-2xl border-2 border-emerald-200 overflow-hidden">
          {/* Decoración superior */}
          <div className="relative h-48 bg-gradient-to-r from-emerald-500 to-green-500 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
                className="relative"
              >
                <div className="w-32 h-32 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                  <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center">
                    <Trophy className="w-16 h-16 text-white" />
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Partículas flotantes */}
            {[...Array(15)].map((_, i) => (
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
                className="absolute text-2xl text-white/50"
                style={{ left: `${Math.random() * 100}%` }}
              >
                ★
              </motion.div>
            ))}
          </div>

          {/* Contenido del modal */}
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center shadow-lg">
                <Check className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              ¡Votación Exitosa!
            </h2>
            
            <p className="text-lg text-gray-600 mb-6">
              Has ejercido tu derecho al voto en Personería y Contraloría. 
              Tu participación fortalece nuestra democracia estudiantil.
            </p>

            <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl p-6 mb-8 border border-emerald-200">
              <h3 className="font-bold text-emerald-800 mb-4 text-lg">
                Tu Contribución Democrática
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700 font-medium">Personería:</span>
                  <span className="bg-white px-3 py-1 rounded-full text-emerald-800 font-bold">
                    Votado ✓
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700 font-medium">Contraloría:</span>
                  <span className="bg-white px-3 py-1 rounded-full text-emerald-800 font-bold">
                    Votado ✓
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-sm text-gray-500 mb-2">
                Cerrando sesión automáticamente en:
              </div>
              <div className="flex justify-center">
                <div className="w-48 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                  />
                </div>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-500 italic"
            >
              "La democracia no es un espectáculo, es una participación activa"
            </motion.p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

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
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Efectos de sonido corregidos
  const playSound = useCallback((soundType) => {
    if (!soundEnabled) return;
    
    try {
      const audio = new Audio();
      
      // Usar sonidos base64 simples o eliminar sonidos externos
      if (soundType === 'confirm') {
        // Beep simple
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.5);
      }
    } catch (error) {
      console.log('Error de audio:', error);
      // Silenciar el error si no se pueden reproducir sonidos
    }
  }, [soundEnabled]);

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
                    ⏳ {timeRemaining.minutes}:{timeRemaining.seconds?.toString().padStart(2, '0') || '00'}
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

  // Cerrar instrucciones automáticamente después de 10 segundos
  useEffect(() => {
    if (showInstructions) {
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showInstructions]);

  // Filtrar solo candidatos de Personería y Contraloría
  const filteredCandidates = useMemo(() => {
    let filtered = candidates.filter(c => 
      c.active !== false && 
      (c.position === 'personeria' || c.position === 'contraloria')
    );
    
    // Filtrar por posición seleccionada
    if (activeFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.position === activeFilter);
    }
    
    return filtered.sort((a, b) => a.number - b.number);
  }, [candidates, activeFilter]);

  // Agrupar candidatos por posición
  const candidatesByPosition = useMemo(() => {
    return Object.values(VOTING_POSITIONS).reduce((acc, position) => {
      acc[position] = filteredCandidates.filter(c => c.position === position);
      return acc;
    }, {});
  }, [filteredCandidates]);

  // Estadísticas de votación para Personería y Contraloría
  const votingStatsData = useMemo(() => {
    const personeriaCandidates = candidates.filter(c => c.position === 'personeria');
    const contraloriaCandidates = candidates.filter(c => c.position === 'contraloria');
    
    const personeriaVotes = personeriaCandidates.reduce((sum, c) => sum + (c.votes || 0), 0);
    const contraloriaVotes = contraloriaCandidates.reduce((sum, c) => sum + (c.votes || 0), 0);
    
    const votedPositions = Object.entries(user?.hasVoted || {})
      .filter(([position]) => position === 'personeria' || position === 'contraloria')
      .filter(([_, voted]) => voted)
      .length;
    
    const totalPositions = 2; // Solo Personería y Contraloría
    const percentage = Math.round((votedPositions / totalPositions) * 100);
    
    return {
      totalVotes: personeriaVotes + contraloriaVotes,
      personeriaVotes,
      contraloriaVotes,
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
      return;
    }
    
    if (!isVotingOpen) {
      toast.error('Período de votación finalizado', {
        description: 'La ventana de votación ha cerrado. Consulta los resultados finales.',
        icon: '⏰',
        duration: 4000
      });
      return;
    }
    
    if (user.hasVoted[position]) {
      toast.error('Voto ya registrado', {
        description: `Ya has ejercido tu derecho al voto para ${POSITION_DISPLAY[position]}.`,
        icon: '✅',
        duration: 4000
      });
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
  }, [user, isVotingOpen, playSound]);

  const handleVoteConfirm = useCallback(async () => {
    if (!selectedCandidate) return;
    
    setIsSubmitting(true);
    
    try {
      // Efecto visual de carga
      const votingBtn = document.querySelector('.confirm-vote-btn');
      if (votingBtn) {
        votingBtn.classList.add('loading');
      }
      
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Registrar el voto
      const success = castVote(selectedCandidate.id, selectedCandidate.position);
      
      if (success) {
        toast.success('¡Voto Registrado! 🗳️', {
          description: `Has votado por ${selectedCandidate.name} (#${selectedCandidate.number}) para ${POSITION_DISPLAY[selectedCandidate.position]}`,
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none'
          },
          icon: '✅'
        });
        
        // Verificar si ya votó en ambas posiciones (Personería y Contraloría)
        const personeriaVoted = user?.hasVoted?.personeria || false;
        const contraloriaVoted = user?.hasVoted?.contraloria || false;
        const justVotedPersoneria = selectedCandidate.position === 'personeria';
        const justVotedContraloria = selectedCandidate.position === 'contraloria';
        
        const hasVotedBoth = (personeriaVoted || justVotedPersoneria) && 
                            (contraloriaVoted || justVotedContraloria);
        
        if (hasVotedBoth) {
          // Esperar un momento y mostrar modal de éxito
          setTimeout(() => {
            setShowSuccessModal(true);
          }, 1500);
          
          // Cerrar sesión después de 5 segundos (tiempo del modal)
          setTimeout(() => {
            logout();
            navigate('/');
          }, 5000);
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
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
      setSelectedCandidate(null);
    }
  }, [selectedCandidate, castVote, user, logout, navigate]);

  // Estado de votación del usuario (solo Personería y Contraloría)
  const userVotingStatus = useMemo(() => {
    const personeriaVoted = user?.hasVoted?.personeria || false;
    const contraloriaVoted = user?.hasVoted?.contraloria || false;
    const completed = personeriaVoted && contraloriaVoted;
    
    const pendingPositions = Object.entries(VOTING_POSITIONS)
      .filter(([_, position]) => !user?.hasVoted[position])
      .map(([key, position]) => ({
        key: position,
        display: POSITION_DISPLAY[position],
        color: POSITION_COLORS[position],
        remaining: candidatesByPosition[position]?.length || 0
      }));
    
    const votedCount = (personeriaVoted ? 1 : 0) + (contraloriaVoted ? 1 : 0);
    const progress = (votedCount / 2) * 100;
    
    return {
      completed,
      pendingPositions,
      progress,
      personeriaVoted,
      contraloriaVoted,
      votedCount
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

  // Si el usuario ya completó su votación en ambas posiciones
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
                  <Crown className="w-16 h-16 text-white" />
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
                  Has ejercido tu derecho al voto exitosamente en Personería y Contraloría.
                  Tu participación fortalece nuestra comunidad estudiantil.
                </p>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8 mb-10 shadow-lg">
                <h3 className="font-bold text-emerald-900 mb-6 text-2xl">
                  📊 Tu Votación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

  // Componentes UI inline
  const VotingStatusBadge = () => (
    <motion.span
      animate={pulseEffect ? { scale: 1.05 } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-flex items-center px-5 py-2.5 rounded-full text-base font-bold shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white"
    >
      <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse"></div>
      VOTACIÓN ABIERTA
    </motion.span>
  );

  const ConfirmationModal = () => {
    if (!showConfirmation) return null;

    const positionColor = selectedCandidate?.position ? 
      POSITION_COLORS[selectedCandidate.position] : 
      POSITION_COLORS.personeria;

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
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
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
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 mb-8 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-500">Candidato seleccionado</div>
                  <div className="text-xl font-bold text-gray-900">
                    {selectedCandidate?.name}
                  </div>
                  <div className="text-gray-600">Número #{selectedCandidate?.number}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Cargo</div>
                  <div className="text-lg font-semibold text-gray-900">
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
                className="confirm-vote-btn flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
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
                <p className="text-lg text-gray-500 mt-1">
                  Personería y Contraloría Estudiantil
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
                <VotingStatusBadge />
                
                {/* Indicador de progreso */}
                <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Tu Progreso</div>
                    <div className="font-bold text-gray-900">
                      {userVotingStatus.votedCount}/2 cargos
                    </div>
                  </div>
                </div>
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
                  <div className="text-sm text-purple-600 mb-1">Personería</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {votingStatsData.personeriaVotes}
                  </div>
                  <div className="text-xs text-purple-500 mt-1">
                    votos totales
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-purple-200">
                  <div className="text-sm text-purple-600 mb-1">Contraloría</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {votingStatsData.contraloriaVotes}
                  </div>
                  <div className="text-xs text-purple-500 mt-1">
                    votos totales
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Instrucciones iniciales */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-blue-900 mb-2">
                        Instrucciones de Votación
                      </h3>
                      <p className="text-gray-700">
                        <strong>Debes votar por 2 cargos:</strong> Personería Estudiantil y Contraloría Estudiantil.
                        Una vez hayas votado en ambos cargos, el sistema se cerrará automáticamente.
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Personería</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Contraloría</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowInstructions(false)}
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                      <XCircle className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel de Progreso */}
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
                        Debes votar por Personería y Contraloría para completar
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(VOTING_POSITIONS).map(([key, position]) => {
                      const voted = user?.hasVoted[position];
                      const positionColor = POSITION_COLORS[position];
                      
                      return (
                        <motion.div
                          key={position}
                          whileHover={{ scale: 1.05 }}
                          className={`flex items-center space-x-3 px-5 py-3 rounded-xl border-2 shadow-lg transition-all ${
                            voted
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300'
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300'
                          }`}
                        >
                          {voted ? (
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                              <VoteIcon className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold capitalize text-gray-900">
                              {POSITION_DISPLAY[position]}
                            </div>
                            <div className={`text-sm font-medium ${
                              voted ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {voted ? '✓ Votado' : '⏳ Pendiente'}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
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
                      <div className="text-xs text-gray-500 mt-1">
                        {userVotingStatus.votedCount}/2 cargos
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filtros de posición */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrar por cargo:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeFilter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Ambos Cargos
                </div>
              </button>
              
              {Object.entries(VOTING_POSITIONS).map(([key, position]) => {
                const positionColor = POSITION_COLORS[position];
                const voted = user?.hasVoted[position];
                
                return (
                  <button
                    key={position}
                    onClick={() => setActiveFilter(position)}
                    className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeFilter === position
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        position === 'personeria' ? 'bg-blue-500' : 'bg-purple-500'
                      }`} />
                      {POSITION_DISPLAY[position]}
                      {voted && (
                        <CheckSquare className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Lista de Candidatos */}
        {userVotingStatus.pendingPositions
          .filter(positionInfo => activeFilter === 'all' || positionInfo.key === activeFilter)
          .map((positionInfo) => {
            const positionCandidates = candidatesByPosition[positionInfo.key] || [];
            const positionColor = positionInfo.color;

            if (positionCandidates.length === 0) return null;

            return (
              <motion.section
                key={positionInfo.key}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-16"
              >
                <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className={`p-8 border-b border-gray-200 ${
                    positionInfo.key === 'personeria' 
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100' 
                      : 'bg-gradient-to-r from-purple-50 to-purple-100'
                  }`}>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                            positionInfo.key === 'personeria'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                              : 'bg-gradient-to-r from-purple-500 to-purple-600'
                          }`}>
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
                          <div className={`px-4 py-2 rounded-lg border ${
                            positionInfo.key === 'personeria'
                              ? 'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-200'
                              : 'bg-gradient-to-r from-purple-100 to-purple-200 border-purple-200'
                          }`}>
                            <div className="flex items-center gap-2">
                              <UserPlus className="w-4 h-4" />
                              <span className="font-medium text-gray-800">
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
                        className={`px-6 py-3 rounded-xl font-bold shadow-lg ${
                          positionInfo.key === 'personeria'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                            : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl">{positionInfo.remaining}</div>
                          <div className="text-sm opacity-90">Disponibles</div>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  <div className="p-8">
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
            onClick={() => setShowInstructions(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all"
          >
            <Info className="w-6 h-6" />
          </button>
        </motion.div>
      </div>

      {/* Modal de Confirmación */}
      <ConfirmationModal />

      {/* Modal de Voto Exitoso */}
      <AnimatePresence>
        {showSuccessModal && (
          <SuccessModal onClose={() => {}} />
        )}
      </AnimatePresence>
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