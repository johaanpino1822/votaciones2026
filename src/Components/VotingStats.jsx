import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { 
  Users, 
  Vote, 
  TrendingUp, 
  Clock, 
  BarChart3, 
  Activity,
  ChevronRight,
  RefreshCw,
  Target,
  Percent,
  UserCheck,
  Timer
} from 'lucide-react';

export function VotingStats({ 
  stats, 
  compact = false, 
  detailed = false,
  interactive = false,
  showComparison = false,
  showTrends = false,
  className = '',
  onRefresh,
  candidates = [] 
}) {
  
  // Calcular estadísticas a partir de los datos proporcionados
  const calculatedStats = useMemo(() => {
    if (!stats && !candidates.length) {
      return {
        totalVotes: 0,
        uniqueVoters: 0,
        votingRate: '0%',
        participationRate: '0%',
        remainingTime: 'N/A',
        positions: [],
        hourlyActivity: [],
        candidatesStats: [],
        trends: {}
      };
    }

    // Si stats ya está calculado, úsalo directamente
    if (stats) {
      return stats;
    }

    // Calcular estadísticas basadas en candidatos
    const totalVotes = candidates.reduce((sum, candidate) => 
      sum + (candidate.votes || 0), 0
    );

    // Agrupar votos por posición
    const votesByPosition = candidates.reduce((acc, candidate) => {
      if (!acc[candidate.position]) {
        acc[candidate.position] = {
          name: candidate.position,
          votes: 0,
          candidates: []
        };
      }
      acc[candidate.position].votes += candidate.votes || 0;
      acc[candidate.position].candidates.push(candidate);
      return acc;
    }, {});

    // Convertir a array y calcular porcentajes
    const positions = Object.values(votesByPosition).map(position => ({
      name: position.name,
      votes: position.votes,
      percentage: totalVotes > 0 ? Math.round((position.votes / totalVotes) * 100) : 0,
      candidates: position.candidates.length
    }));

    // Estadísticas de candidatos individuales
    const candidatesStats = candidates.map(candidate => ({
      name: candidate.name,
      position: candidate.position,
      votes: candidate.votes || 0,
      percentage: totalVotes > 0 ? Math.round(((candidate.votes || 0) / totalVotes) * 100) : 0
    }));

    return {
      totalVotes,
      uniqueVoters: stats?.uniqueVoters || 0, // Esto debería venir del backend
      votingRate: stats?.votingRate || '0%',
      participationRate: stats?.participationRate || '0%',
      remainingTime: stats?.remainingTime || 'N/A',
      positions,
      candidatesStats,
      hourlyActivity: stats?.hourlyActivity || [],
      recentVotes: stats?.recentVotes || [],
      trends: stats?.trends || {}
    };
  }, [stats, candidates]);

  // Manejar estado de carga para modo interactivo
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // Componente para mostrar tendencias
  const TrendIndicator = ({ change, isUp }) => (
    <span className={`inline-flex items-center text-sm font-medium ${isUp ? 'text-green-600' : 'text-red-600'}`}>
      {isUp ? (
        <TrendingUp className="w-4 h-4 mr-1" />
      ) : (
        <TrendingUp className="w-4 h-4 mr-1 transform rotate-180" />
      )}
      {change}
    </span>
  );

  // Formatear números grandes
  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (compact) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex gap-3 ${className}`}
      >
        <Card className="flex-1 px-4 py-3 border-l-4 border-blue-500 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Votos Totales</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-900">{formatNumber(calculatedStats.totalVotes)}</p>
                {showTrends && calculatedStats.trends?.hour && (
                  <TrendIndicator 
                    change={calculatedStats.trends.hour.change} 
                    isUp={calculatedStats.trends.hour.up} 
                  />
                )}
              </div>
            </div>
            <Vote className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </Card>
        
        <Card className="flex-1 px-4 py-3 border-l-4 border-green-500 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Votantes Únicos</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-900">{formatNumber(calculatedStats.uniqueVoters)}</p>
                {showTrends && calculatedStats.trends?.day && (
                  <TrendIndicator 
                    change={calculatedStats.trends.day.change} 
                    isUp={calculatedStats.trends.day.up} 
                  />
                )}
              </div>
            </div>
            <UserCheck className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </Card>

        {interactive && onRefresh && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        )}
      </motion.div>
    );
  }

  if (detailed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`space-y-8 ${className}`}
      >
        {/* Header con acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Dashboard Estadístico
            </h2>
            <p className="text-gray-600 mt-2">
              Métricas en tiempo real del proceso electoral
            </p>
          </div>
          
          {interactive && onRefresh && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar Datos
            </motion.button>
          )}
        </div>

        {/* Cards principales de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Vote className="w-6 h-6 text-blue-600" />
                </div>
                {showTrends && calculatedStats.trends?.hour && (
                  <TrendIndicator 
                    change={calculatedStats.trends.hour.change} 
                    isUp={calculatedStats.trends.hour.up} 
                  />
                )}
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatNumber(calculatedStats.totalVotes)}
              </div>
              <p className="text-gray-600 font-medium">Votos Totales</p>
              <p className="text-sm text-gray-500 mt-2">
                {calculatedStats.candidatesStats?.length || 0} candidatos activos
              </p>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                {showTrends && calculatedStats.trends?.day && (
                  <TrendIndicator 
                    change={calculatedStats.trends.day.change} 
                    isUp={calculatedStats.trends.day.up} 
                  />
                )}
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatNumber(calculatedStats.uniqueVoters)}
              </div>
              <p className="text-gray-600 font-medium">Votantes Únicos</p>
              <p className="text-sm text-gray-500 mt-2">
                Participación: {calculatedStats.participationRate}
              </p>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Percent className="w-6 h-6 text-purple-600" />
                </div>
                {showTrends && calculatedStats.trends?.week && (
                  <TrendIndicator 
                    change={calculatedStats.trends.week.change} 
                    isUp={calculatedStats.trends.week.up} 
                  />
                )}
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {calculatedStats.votingRate}
              </div>
              <p className="text-gray-600 font-medium">Tasa de Votación</p>
              <p className="text-sm text-gray-500 mt-2">
                Basado en votantes registrados
              </p>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Timer className="w-6 h-6 text-orange-600" />
                </div>
                {interactive && (
                  <span className="text-sm text-gray-500">Actualizado ahora</span>
                )}
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {calculatedStats.remainingTime}
              </div>
              <p className="text-gray-600 font-medium">Tiempo Restante</p>
              <p className="text-sm text-gray-500 mt-2">
                Hasta el cierre de votación
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Sección de análisis detallado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Distribución por posición */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Distribución por Cargo
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Votos distribuidos entre las diferentes posiciones
                  </p>
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {calculatedStats.positions.length} posiciones
                </span>
              </div>
              
              <div className="space-y-6">
                {calculatedStats.positions.length > 0 ? (
                  calculatedStats.positions.map((position, index) => (
                    <div key={position.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-medium capitalize text-gray-900">
                              {position.name}
                            </span>
                            <div className="text-xs text-gray-500">
                              {position.candidates} candidatos
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {formatNumber(position.votes)} votos
                          </div>
                          <div className="text-sm text-gray-500">
                            {position.percentage}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Barra de progreso */}
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${position.percentage}%` }}
                            transition={{ 
                              duration: 1,
                              delay: index * 0.1,
                              ease: "easeOut"
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay datos de votación por posición</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Actividad por hora */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    Actividad por Período
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Patrones de votación a lo largo del tiempo
                  </p>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {calculatedStats.hourlyActivity.length} períodos
                </span>
              </div>
              
              <div className="space-y-6">
                {calculatedStats.hourlyActivity.length > 0 ? (
                  calculatedStats.hourlyActivity.map((hour, index) => (
                    <div key={hour.time} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              {hour.time}
                            </span>
                            <div className="text-xs text-gray-500">
                              Período de votación
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {formatNumber(hour.votes)} votos
                          </div>
                          <div className="text-sm text-gray-500">
                            {hour.percentage}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Barra de progreso */}
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${hour.percentage}%` }}
                            transition={{ 
                              duration: 1,
                              delay: index * 0.1 + 0.3,
                              ease: "easeOut"
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-500 to-green-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay datos de actividad por hora</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Top candidatos si hay datos */}
        {calculatedStats.candidatesStats?.length > 0 && showComparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Top Candidatos por Votos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {calculatedStats.candidatesStats
                  .sort((a, b) => b.votes - a.votes)
                  .slice(0, 6)
                  .map((candidate, index) => (
                    <div
                      key={`${candidate.name}-${candidate.position}`}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {candidate.name}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full capitalize">
                          {candidate.position}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatNumber(candidate.votes)} votos
                      </div>
                      <div className="text-sm text-gray-500">
                        {candidate.percentage}% del total
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Votos recientes si hay datos */}
        {calculatedStats.recentVotes?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Votos Recientes
              </h3>
              <div className="space-y-3">
                {calculatedStats.recentVotes.slice(0, 5).map((vote, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Vote className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{vote.voter}</p>
                        <p className="text-sm text-gray-500">Votó por {vote.candidate}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{vote.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Vista por defecto (media)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Resumen de Votación</h3>
        {interactive && onRefresh && (
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </motion.button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-sm text-gray-500">Votos Totales</div>
          <div className="text-2xl font-bold text-blue-600">{calculatedStats.totalVotes}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm text-gray-500">Votantes Únicos</div>
          <div className="text-2xl font-bold text-green-600">{calculatedStats.uniqueVoters}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm text-gray-500">Tasa de Participación</div>
          <div className="text-2xl font-bold text-purple-600">{calculatedStats.votingRate}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm text-gray-500">Tiempo Restante</div>
          <div className="text-2xl font-bold text-orange-600">{calculatedStats.remainingTime}</div>
        </div>
      </div>
    </motion.div>
  );
}