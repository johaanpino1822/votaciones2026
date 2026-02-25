import React from 'react';
import { motion } from 'framer-motion';
import { VotingResults } from '../Components/VotingResults';
import { VotingStats } from '../Components/VotingStats';
import { useStore } from '../store/useStore';
import { Card } from '../Components/ui/Card';
import { Users, BarChart3, Clock, Award } from 'lucide-react';

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
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-6 text-center">
              <stat.icon className={`mx-auto mb-3 ${stat.color}`} size={24} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Estadísticas */}
        <VotingStats stats={votingStats} detailed />

        {/* 🔥 RESULTADOS COMPLETOS (UNA SOLA VEZ) */}
        <div className="mt-12">
          <VotingResults 
            candidates={candidates}
            showLiveResults={isVotingOpen}
          />
        </div>

      </div>
    </div>
  );
}