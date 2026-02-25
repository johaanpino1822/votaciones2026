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
  Award,
  Target,
  Check,
  Users,
  Vote,
  ArrowRight
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

// Modal de confirmación de voto simplificado
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
          </div>
          
          <h3 className="text-2xl font-bold text-blue-800 mb-4">
            Confirmar Voto
          </h3>
          
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-blue-200">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-800 mb-2">
                #{selectedCandidate?.number}
              </div>
              <div className="text-xl font-bold text-blue-800">
                {selectedCandidate?.name}
              </div>
              <div className="text-blue-700 mt-2">
                {POSITION_DISPLAY[selectedCandidate?.position]}
              </div>
            </div>
            
            <div className="mt-4 bg-white p-3 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700">
                Esta acción es irreversible
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowConfirmation(false)}
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-gray-200 text-blue-800 rounded-xl hover:bg-gray-300 transition-all font-bold shadow-lg disabled:opacity-50"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVoteConfirm}
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-800 to-emerald-800 text-white rounded-xl hover:from-blue-900 hover:to-emerald-900 transition-all font-bold shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Procesando...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Check className="w-5 h-5 mr-2" />
                  Confirmar
                </div>
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
  const [votingPhase, setVotingPhase] = useState('personeria'); // 'personeria' o 'contraloria'

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

  // Actualizar fase de votación basado en el estado del usuario
  useEffect(() => {
    if (user) {
      if (!user.hasVoted?.personeria) {
        setVotingPhase('personeria');
      } else if (!user.hasVoted?.contraloria) {
        setVotingPhase('contraloria');
      } else {
        setVotingPhase('completed');
      }
    }
  }, [user]);

  // Filtrar solo candidatos activos de Personería y Contraloría
  const candidatesByPosition = useMemo(() => {
    const personeria = candidates
      .filter(c => c.active !== false && c.position === 'personeria')
      .sort((a, b) => a.number - b.number);
    
    const contraloria = candidates
      .filter(c => c.active !== false && c.position === 'contraloria')
      .sort((a, b) => a.number - b.number);
    
    return { personeria, contraloria };
  }, [candidates]);

  // Estado de votación del usuario
  const userVotingStatus = useMemo(() => {
    const personeriaVoted = user?.hasVoted?.personeria || false;
    const contraloriaVoted = user?.hasVoted?.contraloria || false;
    const completed = personeriaVoted && contraloriaVoted;
    const votedCount = (personeriaVoted ? 1 : 0) + (contraloriaVoted ? 1 : 0);
    
    return {
      completed,
      personeriaVoted,
      contraloriaVoted,
      votedCount,
      currentPhase: votingPhase
    };
  }, [user, votingPhase]);

  // Handler de votación
  const handleVoteInit = useCallback((candidateId, position, candidateName, candidateNumber) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }
    
    if (!isVotingOpen) {
      toast.error('Votación cerrada');
      return;
    }
    
    // Verificar orden de votación
    if (position === 'contraloria' && !user.hasVoted?.personeria) {
      toast.error('Primero debes votar por Personería');
      return;
    }
    
    if (user.hasVoted?.[position]) {
      toast.error(`Ya votaste por ${POSITION_DISPLAY[position]}`);
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
        toast.success(`¡Votaste por ${selectedCandidate.name}!`);
        
        if (selectedCandidate.position === 'personeria') {
          setVotingPhase('contraloria');
          toast.success('Ahora vota por Contraloría');
        } else if (selectedCandidate.position === 'contraloria') {
          setVotingPhase('completed');
          setTimeout(() => {
            logout();
            navigate('/');
          }, 2000);
        }
      }
    } catch (error) {
      toast.error('Error al registrar voto');
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
      setSelectedCandidate(null);
    }
  }, [selectedCandidate, castVote, logout, navigate]);

  // Si no hay usuario
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-emerald-900">
        <div className="text-center p-8">
          <div className="text-3xl font-bold text-white mb-4">Acceso Requerido</div>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-semibold"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Vista de votación cerrada
  if (!isVotingOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-emerald-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
              <Clock className="w-12 h-12 text-white mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-white mb-4">
                Votación Concluida
              </h1>
              <p className="text-blue-200 text-lg">
                Gracias por tu participación
              </p>
            </div>
            
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-semibold inline-flex items-center gap-3"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si ya votó en ambos
  if (userVotingStatus.completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-emerald-900 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-800 to-emerald-800 p-8 text-white text-center">
              <h1 className="text-3xl font-bold">¡Gracias por votar!</h1>
            </div>
            <div className="p-8 text-center">
              <p className="text-blue-800 text-lg mb-6">
                Has completado tu votación
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>Cerrando sesión...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      {/* Header mínimo - solo lo esencial */}
     

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Progreso mínimo */}
        

        {/* SECCIÓN DE VOTACIÓN - PERSONERÍA PRIMERO */}
        {votingPhase === 'personeria' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key="personeria"
          >
            {/* Título grande y visible */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-blue-800 mb-2">
                Personería Estudiantil
              </h1>
              <p className="text-blue-600 text-lg">
                Selecciona tu candidato
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-blue-100 px-6 py-3 rounded-full border border-blue-300">
                <ArrowRight className="w-5 h-5 text-blue-800" />
                <span className="text-blue-800 font-medium">
                  Después votarás por Contraloría
                </span>
              </div>
            </div>

            {/* Grid de candidatos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {candidatesByPosition.personeria.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CandidateCard
                    candidate={candidate}
                    onVote={() => handleVoteInit(
                      candidate.id, 
                      candidate.position, 
                      candidate.name,
                      candidate.number
                    )}
                    index={index}
                    compact
                  />
                </motion.div>
              ))}
            </div>

            {candidatesByPosition.personeria.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-blue-200">
                <p className="text-blue-800 text-lg">No hay candidatos disponibles</p>
              </div>
            )}
          </motion.div>
        )}

        {/* SECCIÓN DE VOTACIÓN - CONTRALORÍA DESPUÉS */}
        {votingPhase === 'contraloria' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key="contraloria"
          >
            {/* Título grande y visible */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-emerald-800 mb-2">
                Contraloría Estudiantil
              </h1>
              <p className="text-emerald-600 text-lg">
                Selecciona tu candidato
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-emerald-100 px-6 py-3 rounded-full border border-emerald-300">
                <Check className="w-5 h-5 text-emerald-800" />
                <span className="text-emerald-800 font-medium">
                  Último cargo por votar
                </span>
              </div>
            </div>

            {/* Grid de candidatos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {candidatesByPosition.contraloria.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CandidateCard
                    candidate={candidate}
                    onVote={() => handleVoteInit(
                      candidate.id, 
                      candidate.position, 
                      candidate.name,
                      candidate.number
                    )}
                    index={index}
                    compact
                  />
                </motion.div>
              ))}
            </div>

            {candidatesByPosition.contraloria.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-emerald-200">
                <p className="text-emerald-800 text-lg">No hay candidatos disponibles</p>
              </div>
            )}
          </motion.div>
        )}
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