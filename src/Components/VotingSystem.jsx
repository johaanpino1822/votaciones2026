import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { CandidateCard } from './CandidateCard';
import { VotingTimer } from '../Components/VotingTimer';
import { 
  Clock, 
  LogOut,
  AlertCircle,
  Filter,
  Award,
  Target,
  Check,
  Info,
  Users,
  Vote
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
    primary: '#1e40af',
    gradient: 'from-blue-800 to-emerald-800',
    light: 'from-blue-50 to-emerald-50',
    dark: 'from-blue-700 to-emerald-700',
    accent: 'text-blue-800'
  },
  contraloria: {
    primary: '#1e40af',
    gradient: 'from-blue-700 to-emerald-700',
    light: 'from-blue-50/80 to-emerald-50/80',
    dark: 'from-blue-600 to-emerald-600',
    accent: 'text-emerald-800'
  }
};

// Modal de confirmación de voto
const ConfirmationModal = ({ 
  showConfirmation, 
  setShowConfirmation, 
  selectedCandidate, 
  isSubmitting, 
  handleVoteConfirm 
}) => {
  if (!showConfirmation) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-md"
      onClick={() => {
        setShowConfirmation(false);
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
        className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl shadow-2xl max-w-lg w-full p-8 border-2 border-blue-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-800 to-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <Vote className="w-10 h-10 text-white" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 border-4 border-blue-400/30 rounded-full"
            />
          </div>
          
          <h3 className="text-2xl font-bold text-blue-800 mb-4">
            Confirmar Tu Voto
          </h3>
          
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-blue-700">Candidato seleccionado</div>
                <div className="text-xl font-bold text-blue-800">
                  {selectedCandidate?.name}
                </div>
                <div className="text-blue-700">Número #{selectedCandidate?.number}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-700">Cargo</div>
                <div className="text-lg font-semibold text-blue-800">
                  {POSITION_DISPLAY[selectedCandidate?.position]}
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white p-4 rounded-xl border border-blue-200">
              <div className="flex items-center text-sm text-blue-700">
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
                toast('Voto reconsiderado', { 
                  icon: '🤔',
                  duration: 2000
                });
              }}
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-blue-800 rounded-xl hover:from-gray-300 hover:to-gray-400 transition-all font-bold shadow-lg disabled:opacity-50"
            >
              Reconsiderar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVoteConfirm}
              disabled={isSubmitting}
              className="confirm-vote-btn flex-1 px-6 py-4 bg-gradient-to-r from-blue-800 to-emerald-800 text-white rounded-xl hover:from-blue-900 hover:to-emerald-900 transition-all font-bold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
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

export function VotingSystem() {
  const { 
    candidates, 
    user, 
    isVotingOpen, 
    castVote, 
    timeRemaining,
    logout
  } = useStore();
  
  const navigate = useNavigate();
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showInstructions, setShowInstructions] = useState(true);

  // Redirigir si no hay usuario o si es admin
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
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

  // Estado de votación del usuario
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

  // Handler de votación
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
  }, [user, isVotingOpen]);

  const handleVoteConfirm = useCallback(async () => {
    if (!selectedCandidate) return;
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const success = castVote(selectedCandidate.id, selectedCandidate.position);
      
      if (success) {
        toast.success('¡Voto Registrado! 🗳️', {
          description: `Has votado por ${selectedCandidate.name} (#${selectedCandidate.number}) para ${POSITION_DISPLAY[selectedCandidate.position]}`,
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #1e40af 0%, #059669 100%)',
            color: 'white',
            border: 'none'
          },
          icon: '✅'
        });
        
        const personeriaVoted = user?.hasVoted?.personeria || false;
        const contraloriaVoted = user?.hasVoted?.contraloria || false;
        const justVotedPersoneria = selectedCandidate.position === 'personeria';
        const justVotedContraloria = selectedCandidate.position === 'contraloria';
        
        const hasVotedBoth = (personeriaVoted || justVotedPersoneria) && 
                            (contraloriaVoted || justVotedContraloria);
        
        if (hasVotedBoth) {
          // Esperar un momento y cerrar sesión
          setTimeout(() => {
            logout();
            navigate('/');
          }, 3000);
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

  // Si no hay usuario autenticado
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-emerald-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <div className="text-3xl font-bold text-white mb-4">Acceso Requerido</div>
          <p className="text-blue-200 mb-8 text-lg">Debes iniciar sesión para acceder al sistema de votación.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-800 to-emerald-800 hover:from-blue-900 hover:to-emerald-900 text-white px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-emerald-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-blue-800/30 to-emerald-800/30 border-l-4 border-blue-500 rounded-2xl p-8 mb-8 shadow-2xl backdrop-blur-sm">
              <div className="flex flex-col items-center space-y-6">
                <Clock className="w-12 h-12 text-white" />
                <h1 className="text-4xl font-bold text-white">
                  Votación Concluida
                </h1>
                <p className="text-blue-200 max-w-2xl text-lg">
                  El período electoral ha finalizado. Gracias por tu participación democrática.
                </p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="bg-gradient-to-r from-blue-800 to-emerald-800 hover:from-blue-900 hover:to-emerald-900 text-white px-8 py-4 rounded-2xl font-semibold transition-all shadow-xl inline-flex items-center gap-3"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-emerald-900 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-3xl shadow-2xl border border-blue-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-800 to-emerald-800 p-12 text-white text-center">
              <h1 className="text-4xl font-bold">¡Votación Completada!</h1>
              <p className="text-blue-100 mt-3 text-xl">Democracia en Acción</p>
            </div>

            <div className="p-12 text-center">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-blue-800 mb-4">
                  {user.username}
                </h2>
                <p className="text-blue-700 text-lg max-w-md mx-auto">
                  Has ejercido tu derecho al voto exitosamente en Personería y Contraloría.
                </p>
              </div>

              <div className="mb-10">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Clock className="w-6 h-6 text-gray-500" />
                  <span className="text-gray-600 font-medium">
                    Cerrando sesión...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-emerald-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header simplificado - Solo reloj y cerrar sesión */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-800 to-emerald-800 text-white px-4 py-2 rounded-xl flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <VotingTimer initialTime={timeRemaining} compact />
            </div>
            
            {/* Info del votante */}
            <div className="hidden sm:flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-200 shadow-sm">
              <Users className="w-5 h-5 text-blue-800" />
              <div>
                <div className="text-sm text-blue-700">Votante</div>
                <div className="font-bold text-blue-800">{user.username}</div>
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
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-800 to-emerald-800 text-white rounded-xl hover:from-blue-900 hover:to-emerald-900 transition-all font-semibold shadow-lg"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </motion.button>
        </div>

        {/* Instrucciones iniciales */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border-2 border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-800 to-emerald-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-800 mb-2">
                      Instrucciones de Votación
                    </h3>
                    <p className="text-blue-700 text-sm">
                      <strong>Debes votar por 2 cargos:</strong> Personería Estudiantil y Contraloría Estudiantil.
                      Una vez hayas votado en ambos cargos, el sistema se cerrará automáticamente.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel de Progreso - Simplificado */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-50/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl border border-blue-200 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-800 to-emerald-800 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-800">Tu Progreso</h3>
                  <p className="text-sm text-blue-700">
                    {userVotingStatus.votedCount}/2 cargos votados
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {Object.entries(VOTING_POSITIONS).map(([key, position]) => {
                  const voted = user?.hasVoted[position];
                  return (
                    <div
                      key={position}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        voted 
                          ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {voted ? <Check className="w-3 h-3" /> : <span className="text-xs">{key === 'PERSONERIA' ? 'P' : 'C'}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filtros de posición */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-700" />
              <span className="text-sm font-medium text-blue-800">Filtrar por cargo:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === 'all'
                    ? 'bg-gradient-to-r from-blue-800 to-emerald-800 text-white shadow-md'
                    : 'bg-white text-blue-800 border border-blue-300 hover:bg-blue-50'
                }`}
              >
                Ambos Cargos
              </button>
              
              {Object.entries(VOTING_POSITIONS).map(([key, position]) => {
                const voted = user?.hasVoted[position];
                
                return (
                  <button
                    key={position}
                    onClick={() => setActiveFilter(position)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeFilter === position
                        ? 'bg-gradient-to-r from-blue-800 to-emerald-800 text-white shadow-md'
                        : 'bg-white text-blue-800 border border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        position === 'personeria' ? 'bg-blue-800' : 'bg-emerald-800'
                      }`} />
                      {position === 'personeria' ? 'Personería' : 'Contraloría'}
                      {voted && <Check className="w-3 h-3 ml-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Lista de Candidatos - VOTACIÓN PRIMERO */}
        {userVotingStatus.pendingPositions
          .filter(positionInfo => activeFilter === 'all' || positionInfo.key === activeFilter)
          .map((positionInfo) => {
            const positionCandidates = candidatesByPosition[positionInfo.key] || [];

            if (positionCandidates.length === 0) return null;

            return (
              <motion.section
                key={positionInfo.key}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-12"
              >
                <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-200 overflow-hidden">
                  <div className={`p-6 border-b border-blue-200 ${
                    positionInfo.key === 'personeria' 
                      ? 'bg-gradient-to-r from-blue-50 to-emerald-50' 
                      : 'bg-gradient-to-r from-blue-50/80 to-emerald-50/80'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          positionInfo.key === 'personeria'
                            ? 'bg-gradient-to-r from-blue-800 to-blue-900'
                            : 'bg-gradient-to-r from-blue-700 to-emerald-700'
                        }`}>
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-blue-800">
                            {positionInfo.display}
                          </h2>
                          <p className="text-sm text-blue-700">
                            {positionInfo.remaining} candidatos disponibles
                          </p>
                        </div>
                      </div>
                      
                      {!user?.hasVoted[positionInfo.key] && (
                        <div className="bg-gradient-to-r from-blue-100 to-emerald-100 px-3 py-1 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-blue-800" />
                            <span className="text-xs font-medium text-blue-800">
                              Pendiente
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {positionCandidates.map((candidate, index) => (
                        <motion.div
                          key={candidate.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -3 }}
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
                            compact
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
            );
          })}
      </div>

      {/* Modal de Confirmación */}
      <ConfirmationModal 
        showConfirmation={showConfirmation}
        setShowConfirmation={setShowConfirmation}
        selectedCandidate={selectedCandidate}
        isSubmitting={isSubmitting}
        handleVoteConfirm={handleVoteConfirm}
      />
    </div>
  );
}

// Estilos CSS personalizados
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