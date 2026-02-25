import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

// ============================================
// CONFIGURACIÓN DE MOCKAPI.IO (¡REEMPLAZA CON TU URL!)
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
        jury: 'mesa2025',
        admin: 'admin2025'
      },

      // ============================================
      // FUNCIONES DE SINCRONIZACIÓN CON LA NUBE
      // ============================================

      /**
       * Carga todos los candidatos desde MockAPI.io
       * Se llama al iniciar la aplicación
       */
      loadCandidatesFromCloud: async () => {
        set({ isLoading: true, syncError: null });

        try {
          console.log('📡 Cargando candidatos desde:', CANDIDATES_ENDPOINT);
          const response = await fetch(CANDIDATES_ENDPOINT);

          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }

          const cloudCandidates = await response.json();
          console.log('✅ Candidatos recibidos:', cloudCandidates.length);

          // Actualizar estado local con los datos de la nube
          set({
            candidates: cloudCandidates,
            isLoading: false,
            syncError: null,
            cloudSync: { lastSync: new Date().toISOString(), isSyncing: false }
          });

          // Recalcular estadísticas
          get().recalculateStats();
          toast.success('Datos sincronizados desde la nube');
        } catch (error) {
          console.error('❌ Error cargando candidatos:', error);
          set({
            isLoading: false,
            syncError: 'No se pudo conectar con la nube. Usando datos locales.'
          });
          toast.error('Error de conexión. Modo offline.');
        }
      },

      /**
       * Guarda un nuevo candidato en MockAPI.io y actualiza el estado local
       */
      addCandidate: async (candidateData) => {
        set({ cloudSync: { isSyncing: true, lastSync: get().cloudSync.lastSync } });

        const newCandidate = {
          ...candidateData,
          id: Date.now().toString(), // ID temporal
          votes: 0,
          active: true,
          createdAt: new Date().toISOString()
        };

        try {
          console.log('📤 Enviando candidato a:', CANDIDATES_ENDPOINT);
          const response = await fetch(CANDIDATES_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCandidate)
          });

          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }

          const savedCandidate = await response.json();
          console.log('✅ Candidato guardado en nube:', savedCandidate);

          // Actualizar estado local con el candidato devuelto por la API (con su ID real)
          set((state) => {
            // Filtrar el candidato temporal si existe
            const filteredCandidates = state.candidates.filter(c => c.id !== newCandidate.id);
            const updatedCandidates = [...filteredCandidates, savedCandidate];

            return {
              candidates: updatedCandidates,
              cloudSync: { lastSync: new Date().toISOString(), isSyncing: false }
            };
          });

          get().recalculateStats();
          toast.success('✅ Candidato guardado en la nube');
          return savedCandidate;

        } catch (error) {
          console.error('❌ Error guardando candidato:', error);
          // Fallback: guardar localmente si falla la nube
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

      /**
       * Actualiza un candidato existente en MockAPI.io y localmente
       */
      updateCandidate: async (candidateId, candidateData) => {
        try {
          console.log(`📝 Actualizando candidato ${candidateId} en:`, `${CANDIDATES_ENDPOINT}/${candidateId}`);
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
          console.error('❌ Error actualizando candidato:', error);
          toast.error('Error al actualizar en la nube');
          return false;
        }
      },

      /**
       * Elimina un candidato de MockAPI.io y localmente
       */
      deleteCandidate: async (candidateId) => {
        try {
          console.log(`🗑️ Eliminando candidato ${candidateId} de:`, `${CANDIDATES_ENDPOINT}/${candidateId}`);
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
          console.error('❌ Error eliminando candidato:', error);
          toast.error('Error al eliminar de la nube');
          return false;
        }
      },

      /**
       * Registra un voto, actualizando en MockAPI.io y localmente
       */
      castVote: async (candidateId, position) => {
        const state = get();
        const user = state.user;

        // Validaciones
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
          // Actualizar votos en MockAPI
          const response = await fetch(`${CANDIDATES_ENDPOINT}/${candidateId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...candidate, votes: newVoteCount })
          });

          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }

          const updatedCandidate = await response.json();

          // Actualizar estado local
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

          // Recalcular stats después del voto
          get().recalculateStats();
          get().updateCloudSyncTime();

          toast.success('✅ Voto registrado en la nube');
          return true;

        } catch (error) {
          console.error('❌ Error registrando voto:', error);
          toast.error('Error al registrar voto en la nube');
          return false;
        }
      },

      // ============================================
      // FUNCIONES AUXILIARES
      // ============================================

      /**
       * Recalcula todas las estadísticas basadas en los candidatos actuales
       */
      recalculateStats: () => {
        const state = get();
        const candidates = state.candidates;
        const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
        const activeCandidates = candidates.filter(c => c.active !== false);

        const positions = ['personeria', 'contraloria'].map(pos => {
          const posCandidates = candidates.filter(c => c.position === pos && c.active !== false);
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
            votingRate: totalVotes > 0
              ? `${Math.round((totalVotes / (state.currentVoterNumber * 2)) * 100)}%`
              : '0%',
            positions
          }
        });
      },

      /**
       * Actualiza la marca de última sincronización
       */
      updateCloudSyncTime: () => {
        set((state) => ({
          cloudSync: { ...state.cloudSync, lastSync: new Date().toISOString() }
        }));
      },

      /**
       * Fuerza una sincronización manual con la nube
       */
      forceSync: async () => {
        await get().loadCandidatesFromCloud();
      },

      // ============================================
      // FUNCIONES DE AUTENTICACIÓN Y CONTROL
      // ============================================

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

      // ============================================
      // FUNCIONES DE CONSULTA
      // ============================================

      getCandidatesByPosition: (position) => {
        return get().candidates.filter(c =>
          c.position === position && c.active !== false
        );
      },

      getTopCandidates: (limit = 5) => {
        return [...get().candidates]
          .filter(c => c.active !== false)
          .sort((a, b) => (b.votes || 0) - (a.votes || 0))
          .slice(0, limit);
      },

      resetVoting: async () => {
        // Implementa lógica para resetear votos si es necesario
        toast.success('Función de reseteo no implementada en este ejemplo');
      }
    }),
    {
      name: 'voting-app-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        // Solo persistir localmente como respaldo
        candidates: state.candidates,
        currentVoterNumber: state.currentVoterNumber,
        votingHistory: state.votingHistory,
        isVotingOpen: state.isVotingOpen,
        timeRemaining: state.timeRemaining,
        systemPasswords: state.systemPasswords
      })
    }
  )
);