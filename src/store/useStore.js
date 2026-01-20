import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // Estado
      user: null,
      isAuthenticated: false,
      candidates: [], // Vacío inicialmente - se llenará desde el admin
      isVotingOpen: true,
      currentVoterNumber: 1,
      
      // Estadísticas
      votingStats: {
        totalVotes: 0,
        uniqueVoters: 0,
        votingRate: '0%',
        participationRate: '0%',
        remainingTime: '2h 30m',
        positions: [
          { name: 'personeria', votes: 0, percentage: 0, candidates: 0 },
          { name: 'contraloria', votes: 0, percentage: 0, candidates: 0 }
        ],
        hourlyActivity: [
          { time: '09:00-10:00', votes: 0, percentage: 0 },
          { time: '10:00-11:00', votes: 0, percentage: 0 },
          { time: '11:00-12:00', votes: 0, percentage: 0 }
        ],
        trends: {
          hour: { up: true, change: '0%' },
          day: { up: false, change: '0%' },
          week: { up: true, change: '0%' }
        }
      },
      
      // Tiempo
      timeRemaining: {
        hours: 2,
        minutes: 30,
        seconds: 0
      },
      
      // Historial de votación (para admin)
      votingHistory: [],
      
      // Contraseñas del sistema
      systemPasswords: {
        jury: 'mesa2025',      // Contraseña única para jurados
        admin: 'admin2025'     // Contraseña de administrador
      },
      
      // Funciones
      login: (userData) => {
        // userData debe contener: username, isJury, isAdmin, hasVoted, isTemp
        set({ 
          user: userData,
          isAuthenticated: true 
        });
        
        // Si no es temporal, guardar en localStorage
        if (!userData.isTemp) {
          localStorage.setItem('votingUser', JSON.stringify(userData));
        }
        
        return true;
      },
      
      logout: () => {
        const currentUser = get().user;
        
        // Si era un votante temporal, incrementar contador
        if (currentUser?.isTemp) {
          set(state => ({ 
            currentVoterNumber: state.currentVoterNumber + 1 
          }));
        }
        
        set({ 
          user: null, 
          isAuthenticated: false 
        });
        
        localStorage.removeItem('votingUser');
      },
      
      // Verificar credenciales de jurado
      verifyJuryPassword: (password) => {
        const systemPasswords = get().systemPasswords;
        return password === systemPasswords.jury;
      },
      
      // Verificar credenciales de admin
      verifyAdminCredentials: (username, password) => {
        const systemPasswords = get().systemPasswords;
        return username === 'admin' && password === systemPasswords.admin;
      },
      
      // Agregar candidato (admin)
      addCandidate: (candidateData) => {
        const newCandidate = {
          ...candidateData,
          id: Math.random().toString(36).substr(2, 9),
          votes: 0,
          active: true,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          candidates: [...state.candidates, newCandidate]
        }));
        
        // Actualizar estadísticas de posiciones
        updatePositionsStats();
        
        return newCandidate;
      },
      
      // Editar candidato (admin)
      updateCandidate: (candidateId, candidateData) => {
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === candidateId ? { ...c, ...candidateData } : c
          )
        }));
        
        updatePositionsStats();
        return true;
      },
      
      // Eliminar candidato (admin)
      deleteCandidate: (candidateId) => {
        set((state) => ({
          candidates: state.candidates.filter(c => c.id !== candidateId)
        }));
        
        updatePositionsStats();
        return true;
      },
      
      // Activar/desactivar candidato (admin)
      toggleCandidateActive: (candidateId) => {
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === candidateId ? { ...c, active: !c.active } : c
          )
        }));
        
        updatePositionsStats();
        return true;
      },
      
      // Registrar voto
      castVote: (candidateId, position) => {
        const state = get();
        const user = state.user;
        
        if (!user) {
          console.error('No hay usuario activo');
          return false;
        }
        
        if (user.hasVoted[position]) {
          console.error(`Ya votaste en ${position}`);
          return false;
        }
        
        set((state) => {
          // Actualizar votos del candidato
          const updatedCandidates = state.candidates.map((c) =>
            c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
          );
          
          // Actualizar estado del usuario
          const updatedUser = {
            ...user,
            hasVoted: { ...user.hasVoted, [position]: true }
          };
          
          // Calcular nuevas estadísticas
          const totalVotes = updatedCandidates.reduce((sum, candidate) => sum + candidate.votes, 0);
          const uniqueVoters = state.currentVoterNumber - 1; // Votantes únicos = contador - 1
          
          // Calcular porcentajes por posición
          const positions = ['personeria', 'contraloria'].map(pos => {
            const positionCandidates = updatedCandidates.filter(c => c.position === pos && c.active !== false);
            const positionVotes = positionCandidates.reduce((sum, candidate) => sum + candidate.votes, 0);
            return {
              name: pos,
              votes: positionVotes,
              percentage: totalVotes > 0 ? Math.round((positionVotes / totalVotes) * 100) : 0,
              candidates: positionCandidates.length
            };
          });
          
          // Actualizar actividad por hora (simplificado)
          const currentHour = new Date().getHours();
          const hourIndex = Math.floor((currentHour - 9) / 1); // Desde 9:00
          
          const updatedHourlyActivity = [...state.votingStats.hourlyActivity];
          if (hourIndex >= 0 && hourIndex < updatedHourlyActivity.length) {
            updatedHourlyActivity[hourIndex].votes += 1;
            updatedHourlyActivity[hourIndex].percentage = Math.round(
              (updatedHourlyActivity[hourIndex].votes / totalVotes) * 100
            );
          }
          
          // Registrar en historial
          const voteRecord = {
            voterId: user.username,
            candidateId,
            position,
            timestamp: new Date().toISOString(),
            voterNumber: state.currentVoterNumber
          };
          
          return {
            candidates: updatedCandidates,
            user: updatedUser,
            votingStats: {
              ...state.votingStats,
              totalVotes,
              uniqueVoters,
              votingRate: `${Math.round((totalVotes / (state.currentVoterNumber * 2)) * 100)}%`,
              participationRate: `${Math.round(((state.currentVoterNumber - 1) / 100) * 100)}%`, // Ejemplo: 100 votantes máx
              positions,
              hourlyActivity: updatedHourlyActivity
            },
            votingHistory: [...state.votingHistory, voteRecord]
          };
        });
        
        return true;
      },
      
      // Toggle estado de votación (admin)
      toggleVoting: () => set((state) => ({ 
        isVotingOpen: !state.isVotingOpen 
      })),
      
      // Resetear toda la votación (admin) - CUIDADO: Esto borra todo
      resetVoting: () => {
        set({
          candidates: get().candidates.map(candidate => ({
            ...candidate,
            votes: 0
          })),
          currentVoterNumber: 1,
          user: null,
          isAuthenticated: false,
          votingStats: {
            totalVotes: 0,
            uniqueVoters: 0,
            votingRate: '0%',
            participationRate: '0%',
            remainingTime: '2h 30m',
            positions: [
              { name: 'personeria', votes: 0, percentage: 0, candidates: 0 },
              { name: 'contraloria', votes: 0, percentage: 0, candidates: 0 }
            ],
            hourlyActivity: [
              { time: '09:00-10:00', votes: 0, percentage: 0 },
              { time: '10:00-11:00', votes: 0, percentage: 0 },
              { time: '11:00-12:00', votes: 0, percentage: 0 }
            ],
            trends: {
              hour: { up: false, change: '0%' },
              day: { up: false, change: '0%' },
              week: { up: false, change: '0%' }
            }
          },
          votingHistory: []
        });
        
        localStorage.clear();
        return true;
      },
      
      // Resetear solo votos (admin) - Mantiene candidatos
      resetVotesOnly: () => {
        set((state) => ({
          candidates: state.candidates.map(candidate => ({
            ...candidate,
            votes: 0
          })),
          currentVoterNumber: 1,
          user: null,
          isAuthenticated: false,
          votingStats: {
            ...state.votingStats,
            totalVotes: 0,
            uniqueVoters: 0,
            votingRate: '0%',
            participationRate: '0%',
            positions: state.votingStats.positions.map(pos => ({
              ...pos,
              votes: 0,
              percentage: 0
            })),
            hourlyActivity: state.votingStats.hourlyActivity.map(hour => ({
              ...hour,
              votes: 0,
              percentage: 0
            }))
          },
          votingHistory: []
        }));
        
        localStorage.removeItem('votingUser');
        return true;
      },
      
      // Actualizar tiempo restante
      updateTimeRemaining: (newTime) => set({ timeRemaining: newTime }),
      
      // Cambiar contraseñas del sistema (admin)
      updateSystemPasswords: (newPasswords) => {
        set(state => ({
          systemPasswords: { ...state.systemPasswords, ...newPasswords }
        }));
        return true;
      },
      
      // Obtener candidatos activos por posición
      getCandidatesByPosition: (position) => {
        const candidates = get().candidates;
        return candidates.filter(c => 
          c.position === position && c.active !== false
        );
      },
      
      // Obtener top candidatos
      getTopCandidates: (limit = 5) => {
        const candidates = get().candidates;
        return [...candidates]
          .sort((a, b) => b.votes - a.votes)
          .slice(0, limit);
      },
      
      // Obtener estadísticas en tiempo real
      getLiveStats: () => {
        const state = get();
        const candidates = state.candidates;
        const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
        
        return {
          totalVotes,
          uniqueVoters: state.currentVoterNumber - 1,
          votingRate: `${Math.round((totalVotes / (state.currentVoterNumber * 2)) * 100)}%`,
          candidateCount: candidates.filter(c => c.active !== false).length,
          positions: ['personeria', 'contraloria'].map(pos => ({
            name: pos,
            candidates: candidates.filter(c => c.position === pos && c.active !== false).length,
            votes: candidates.filter(c => c.position === pos).reduce((sum, c) => sum + c.votes, 0)
          }))
        };
      }
    }),
    {
      name: 'voting-storage',
      partialize: (state) => ({
        candidates: state.candidates,
        currentVoterNumber: state.currentVoterNumber,
        votingStats: state.votingStats,
        votingHistory: state.votingHistory,
        systemPasswords: state.systemPasswords,
        isVotingOpen: state.isVotingOpen,
        timeRemaining: state.timeRemaining
      })
    }
  )
);

// Función helper para actualizar estadísticas de posiciones
function updatePositionsStats() {
  const state = useStore.getState();
  const candidates = state.candidates;
  
  const positions = ['personeria', 'contraloria'].map(pos => {
    const positionCandidates = candidates.filter(c => c.position === pos && c.active !== false);
    const positionVotes = positionCandidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    
    return {
      name: pos,
      votes: positionVotes,
      percentage: totalVotes > 0 ? Math.round((positionVotes / totalVotes) * 100) : 0,
      candidates: positionCandidates.length
    };
  });
  
  useStore.setState(state => ({
    votingStats: {
      ...state.votingStats,
      positions,
      totalVotes: candidates.reduce((sum, candidate) => sum + candidate.votes, 0),
      uniqueVoters: state.currentVoterNumber - 1
    }
  }));
}

// Si quieres inicializar con algunos datos vacíos (opcional)
if (typeof window !== 'undefined') {
  const store = useStore.getState();
  
  // Si no hay candidatos y queremos ver el formato esperado
  if (store.candidates.length === 0) {
    console.log('✅ Store inicializado sin candidatos. Puedes agregarlos desde el panel de administración.');
  }
  
  // Verificar contraseñas por defecto (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 Contraseñas por defecto:');
    console.log('- Jurado:', store.systemPasswords.jury);
    console.log('- Admin:', store.systemPasswords.admin);
    console.log('⚠️ Cambia estas contraseñas en producción');
  }
}