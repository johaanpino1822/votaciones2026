import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

// ============================================
// CONFIGURACIÓN DE MOCKAPI.IO
// ============================================
const API_BASE_URL = 'https://699f414278dda56d396ccd07.mockapi.io/api/v1';
const CANDIDATES_ENDPOINT = `${API_BASE_URL}/candidates`;

export const useStore = create(
  persist(
    (set, get) => ({
      // ============================================
      // ESTADO INICIAL
      // ============================================
      user: null,
      isAuthenticated: false,
      candidates: [],
      isVotingOpen: true,
      currentVoterNumber: 1,
      isLoading: false,
      syncError: null,
      cloudSync: {
        lastSync: null,
        isSyncing: false,
      },

      // Estadísticas
      votingStats: {
        totalVotes: 0,
        uniqueVoters: 0,
        votingRate: '0%',
        participationRate: '0%',
        remainingTime: '2h 30m',
        positions: [
          { name: 'personeria', votes: 0, percentage: 0, candidates: 0 },
          { name: 'contraloria', votes: 0, percentage: 0, candidates: 0 },
          { name: 'representante', votes: 0, percentage: 0, candidates: 0 }
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

      // Tiempo restante
      timeRemaining: {
        hours: 2,
        minutes: 30,
        seconds: 0
      },

      // Historial de votación
      votingHistory: [],

      // Contraseñas del sistema
      systemPasswords: {
        jury: 'M354ieFAG',
        admin: 'ieFAG2026A9m1n'
      },

      // ============================================
      // FUNCIONES DE SINCRONIZACIÓN
      // ============================================

      loadCandidatesFromCloud: async () => {
        set({ isLoading: true, syncError: null });

        try {
          const response = await fetch(CANDIDATES_ENDPOINT);

          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }

          const cloudCandidates = await response.json();

          set({
            candidates: cloudCandidates,
            isLoading: false,
            syncError: null,
            cloudSync: { lastSync: new Date().toISOString(), isSyncing: false }
          });

          get().recalculateStats();
          toast.success('Datos sincronizados desde la nube');
        } catch (error) {
          set({
            isLoading: false,
            syncError: 'No se pudo conectar con la nube. Usando datos locales.'
          });
          toast.error('Error de conexión. Modo offline.');
        }
      },

      /**
       * FUNCIÓN CORREGIDA - Permite mismo número en diferentes cargos
       */
      addCandidate: async (candidateData) => {
        const state = get();
        
        // ===== VALIDACIÓN CORRECTA =====
        // SOLO verificar si el número ya existe en el MISMO cargo
        const existeEnMismoCargo = state.candidates.some(
          c => String(c.number) === String(candidateData.number) && 
               c.position === candidateData.position
        );

        if (existeEnMismoCargo) {
          toast.error(`El número ${candidateData.number} ya existe en ${candidateData.position}`);
          throw new Error('DUPLICADO_EN_MISMO_CARGO');
        }
        // ===============================

        set({ cloudSync: { isSyncing: true, lastSync: state.cloudSync.lastSync } });

        const newCandidate = {
          ...candidateData,
          id: Date.now().toString(),
          votes: 0,
          active: true,
          createdAt: new Date().toISOString()
        };

        try {
          const response = await fetch(CANDIDATES_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCandidate)
          });

          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }

          const savedCandidate = await response.json();

          set((state) => {
            const updatedCandidates = [...state.candidates, savedCandidate];
            return {
              candidates: updatedCandidates,
              cloudSync: { lastSync: new Date().toISOString(), isSyncing: false }
            };
          });

          get().recalculateStats();
          
          // Verificar si el número existe en otro cargo (solo informativo)
          const existeEnOtroCargo = state.candidates.some(
            c => String(c.number) === String(candidateData.number) && 
                 c.position !== candidateData.position
          );
          
          if (existeEnOtroCargo) {
            toast.success(`✅ Candidato agregado (el número ${candidateData.number} ya existe en otro cargo)`);
          } else {
            toast.success('✅ Candidato guardado en la nube');
          }
          
          return savedCandidate;

        } catch (error) {
          console.error('Error:', error);
          
          // Fallback local
          set((state) => ({
            candidates: [...state.candidates, newCandidate],
            cloudSync: { ...state.cloudSync, isSyncing: false },
            syncError: 'Error de conexión. Guardado localmente.'
          }));
          get().recalculateStats();
          toast.error('⚠️ Guardado localmente (sin conexión)');
          return newCandidate;
        }
      },

      updateCandidate: async (candidateId, candidateData) => {
        try {
          const response = await fetch(`${CANDIDATES_ENDPOINT}/${candidateId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(candidateData)
          });

          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }

          const updatedCandidate = await response.json();

          set((state) => ({
            candidates: state.candidates.map(c =>
              c.id === candidateId ? updatedCandidate : c
            ),
            cloudSync: { lastSync: new Date().toISOString(), isSyncing: false }
          }));

          get().recalculateStats();
          toast.success('✅ Candidato actualizado');
          return true;

        } catch (error) {
          toast.error('Error al actualizar en la nube');
          return false;
        }
      },

      deleteCandidate: async (candidateId) => {
        try {
          const response = await fetch(`${CANDIDATES_ENDPOINT}/${candidateId}`, {
            method: 'DELETE'
          });

          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }

          set((state) => ({
            candidates: state.candidates.filter(c => c.id !== candidateId),
            cloudSync: { lastSync: new Date().toISOString(), isSyncing: false }
          }));

          get().recalculateStats();
          toast.success('✅ Candidato eliminado');
          return true;

        } catch (error) {
          toast.error('Error al eliminar de la nube');
          return false;
        }
      },

      castVote: async (candidateId, position) => {
        const state = get();
        const user = state.user;

        if (!user) {
          toast.error('Debes iniciar sesión');
          return false;
        }

        if (user.hasVoted?.[position]) {
          toast.error(`Ya votaste en ${position}`);
          return false;
        }

        const candidate = state.candidates.find(c => c.id === candidateId);
        if (!candidate) {
          toast.error('Candidato no encontrado');
          return false;
        }

        const newVoteCount = (candidate.votes || 0) + 1;

        try {
          const response = await fetch(`${CANDIDATES_ENDPOINT}/${candidateId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...candidate, votes: newVoteCount })
          });

          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }

          const updatedCandidate = await response.json();

          set((state) => {
            const updatedCandidates = state.candidates.map(c =>
              c.id === candidateId ? updatedCandidate : c
            );

            const updatedUser = {
              ...user,
              hasVoted: { ...(user.hasVoted || {}), [position]: true }
            };

            const voteRecord = {
              id: Date.now().toString(),
              voterId: user.username || `Votante-${state.currentVoterNumber}`,
              candidateId,
              candidateName: candidate.name,
              position,
              timestamp: new Date().toISOString(),
              voterNumber: state.currentVoterNumber
            };

            return {
              candidates: updatedCandidates,
              user: updatedUser,
              votingHistory: [...state.votingHistory, voteRecord],
              currentVoterNumber: state.currentVoterNumber + 1
            };
          });

          get().recalculateStats();
          get().updateCloudSyncTime();

          toast.success('✅ Voto registrado en la nube');
          return true;

        } catch (error) {
          toast.error('Error al registrar voto en la nube');
          return false;
        }
      },

      recalculateStats: () => {
        const state = get();
        const candidates = state.candidates;
        const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

        const positions = ['personeria', 'contraloria', 'representante'].map(pos => {
          const posCandidates = candidates.filter(c => c.position === pos);
          const posVotes = posCandidates.reduce((sum, c) => sum + (c.votes || 0), 0);

          return {
            name: pos,
            votes: posVotes,
            percentage: totalVotes > 0 ? Math.round((posVotes / totalVotes) * 100) : 0,
            candidates: posCandidates.length
          };
        });

        set({
          votingStats: {
            ...state.votingStats,
            totalVotes,
            uniqueVoters: state.currentVoterNumber - 1,
            positions
          }
        });
      },

      updateCloudSyncTime: () => {
        set((state) => ({
          cloudSync: { ...state.cloudSync, lastSync: new Date().toISOString() }
        }));
      },

      forceSync: async () => {
        await get().loadCandidatesFromCloud();
      },

      login: (userData) => {
        set({
          user: userData,
          isAuthenticated: true
        });
        return true;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false
        });
      },

      toggleVoting: () => set((state) => ({
        isVotingOpen: !state.isVotingOpen
      })),

      verifyJuryPassword: (password) => {
        return password === get().systemPasswords.jury;
      },

      verifyAdminCredentials: (username, password) => {
        return username === 'admin' && password === get().systemPasswords.admin;
      },

      getCandidatesByPosition: (position) => {
        return get().candidates.filter(c => c.position === position);
      },

      getTopCandidates: (limit = 5) => {
        return [...get().candidates]
          .sort((a, b) => (b.votes || 0) - (a.votes || 0))
          .slice(0, limit);
      }
    }),
    {
      name: 'voting-app-storage',
      getStorage: () => localStorage,
    }
  )
);