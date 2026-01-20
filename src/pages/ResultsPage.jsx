import React from 'react';
import { motion } from 'framer-motion';
import { VotingResults } from '../Components/VotingResults';
import { VotingStats } from '../Components/VotingStats';
import { useStore } from '../store/useStore';
import { Card } from '../Components/ui/Card';
import { BarChart3, Users, Clock, Award } from 'lucide-react';

export function ResultsPage() {
  const { candidates, isVotingOpen, votingStats } = useStore();

  const quickStats = [
    {
      icon: Users,
      label: 'Total de Votantes',
      value: votingStats?.uniqueVoters || 0,
      color: 'text-blue-600'
    },
    {
      icon: BarChart3,
      label: 'Votos Totales',
      value: votingStats?.totalVotes || 0,
      color: 'text-green-600'
    },
    {
      icon: Clock,
      label: 'Estado',
      value: isVotingOpen ? 'En Proceso' : 'Finalizado',
      color: isVotingOpen ? 'text-orange-600' : 'text-purple-600'
    },
    {
      icon: Award,
      label: 'Candidatos',
      value: candidates.length,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isVotingOpen ? 'Resultados Parciales' : 'Resultados Finales'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isVotingOpen 
              ? 'Sigue los resultados en tiempo real de las elecciones estudiantiles'
              : 'Resultados oficiales de las elecciones estudiantiles 2025'
            }
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 text-center bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <div className={`mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Estadísticas detalladas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <VotingStats stats={votingStats} detailed />
        </motion.div>

        {/* Resultados por posición */}
        <div className="space-y-12">
          {['personeria', 'contraloria'].map((position, index) => {
            const positionCandidates = candidates.filter(c => c.position === position);
            
            return (
              <motion.section
                key={position}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 capitalize">
                    Resultados para {position}
                  </h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {positionCandidates.length} candidatos
                  </span>
                </div>

                {positionCandidates.length > 0 ? (
                  <VotingResults 
                    candidates={positionCandidates} 
                    position={position}
                    showLiveResults={isVotingOpen}
                  />
                ) : (
                  <Card className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <BarChart3 size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No hay resultados disponibles
                    </h3>
                    <p className="text-gray-600">
                      No se han registrado candidatos para esta posición
                    </p>
                  </Card>
                )}
              </motion.section>
            );
          })}
        </div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="text-blue-600" size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {isVotingOpen ? 'Votación en Proceso' : 'Votación Finalizada'}
                </h3>
                <p className="text-blue-800">
                  {isVotingOpen 
                    ? 'Los resultados se actualizan en tiempo real. Vuelve a consultar más tarde para ver los resultados finales.'
                    : 'La votación ha concluido. Estos son los resultados oficiales de las elecciones estudiantiles 2025.'
                  }
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}