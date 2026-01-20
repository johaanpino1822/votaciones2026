import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Card } from './ui/Card';
import { TrendingUp, Users, Trophy, Filter, Download, ChevronDown, Eye, EyeOff } from 'lucide-react';

// Registrar todos los elementos de Chart.js necesarios
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

export function VotingResults({ candidates, title = "Resultados de Votación" }) {
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [showPercentages, setShowPercentages] = useState(true);
  const [viewMode, setViewMode] = useState('bar'); // 'bar', 'horizontal', 'pie'

  // Extraer posiciones únicas
  const positions = useMemo(() => {
    const uniquePositions = [...new Set(candidates.map(c => c.position))];
    return ['all', ...uniquePositions];
  }, [candidates]);

  // Filtrar candidatos según posición seleccionada
  const filteredCandidates = useMemo(() => {
    if (selectedPosition === 'all') return candidates;
    return candidates.filter(c => c.position === selectedPosition);
  }, [candidates, selectedPosition]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalVotes = filteredCandidates.reduce((sum, c) => sum + (c.votes || 0), 0);
    const candidatesWithVotes = filteredCandidates.filter(c => (c.votes || 0) > 0);
    const leadingCandidate = filteredCandidates.length > 0 
      ? filteredCandidates.reduce((max, c) => (c.votes || 0) > (max.votes || 0) ? c : max)
      : null;
    
    return {
      totalVotes,
      totalCandidates: filteredCandidates.length,
      averageVotes: totalVotes / filteredCandidates.length || 0,
      leadingCandidate,
      participationRate: candidatesWithVotes.length / filteredCandidates.length * 100 || 0
    };
  }, [filteredCandidates]);

  // Preparar datos para el gráfico
  const { chartData, chartOptions } = useMemo(() => {
    const sortedCandidates = [...filteredCandidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    const totalVotes = stats.totalVotes;

    // Paleta de colores sofisticada
    const colors = {
      primary: 'rgba(59, 130, 246, 0.8)',
      secondary: 'rgba(139, 92, 246, 0.8)',
      success: 'rgba(34, 197, 94, 0.8)',
      warning: 'rgba(234, 179, 8, 0.8)',
      gradient: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)');
        return gradient;
      }
    };

    const data = {
      labels: sortedCandidates.map(c => c.name),
      datasets: [
        {
          label: 'Votos',
          data: sortedCandidates.map(c => c.votes || 0),
          backgroundColor: viewMode === 'bar' 
            ? (ctx) => colors.gradient(ctx)
            : sortedCandidates.map((_, index) => 
                index === 0 ? colors.success :
                index === 1 ? colors.primary :
                index === 2 ? colors.secondary :
                colors.warning
              ),
          borderColor: sortedCandidates.map((_, index) => 
            index === 0 ? 'rgb(34, 197, 94)' :
            index === 1 ? 'rgb(59, 130, 246)' :
            index === 2 ? 'rgb(139, 92, 246)' :
            'rgb(234, 179, 8)'
          ),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: viewMode === 'horizontal' ? 0.6 : 0.8,
          categoryPercentage: 0.9,
        },
        ...(showPercentages && totalVotes > 0 ? [{
          label: 'Porcentaje',
          data: sortedCandidates.map(c => ((c.votes || 0) / totalVotes * 100).toFixed(1)),
          type: 'line',
          yAxisID: 'percentage',
          borderColor: 'rgba(239, 68, 68, 0.8)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.3,
        }] : [])
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: viewMode === 'horizontal' ? 'y' : 'x',
      plugins: {
        legend: {
          position: 'top',
          labels: {
            padding: 20,
            font: {
              size: 12,
              family: "'Inter', sans-serif"
            },
            usePointStyle: true,
          }
        },
        title: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#f3f4f6',
          bodyColor: '#f3f4f6',
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: (context) => {
              if (context.datasetIndex === 0) {
                const votes = context.raw;
                const percentage = totalVotes > 0 
                  ? ((votes / totalVotes) * 100).toFixed(1)
                  : '0.0';
                return [
                  `Votos: ${votes}`,
                  `Porcentaje: ${percentage}%`
                ];
              }
              return `Porcentaje: ${context.raw}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(229, 231, 235, 0.3)',
            drawBorder: false,
          },
          ticks: {
            font: {
              size: 11
            },
            maxRotation: viewMode === 'bar' ? 45 : 0
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(229, 231, 235, 0.3)',
            drawBorder: false,
          },
          ticks: {
            font: {
              size: 11
            },
            callback: (value) => {
              if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
              return value;
            }
          },
          title: {
            display: true,
            text: 'Número de Votos',
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        },
        ...(showPercentages && totalVotes > 0 ? {
          percentage: {
            position: 'right',
            beginAtZero: true,
            max: 100,
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              callback: (value) => `${value}%`
            },
            title: {
              display: true,
              text: 'Porcentaje',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }
        } : {})
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      animations: {
        tension: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    };

    return { chartData: data, chartOptions: options };
  }, [filteredCandidates, stats.totalVotes, showPercentages, viewMode]);

  // Función para exportar datos
  const exportData = () => {
    const dataStr = JSON.stringify(filteredCandidates.map(c => ({
      nombre: c.name,
      cargo: c.position,
      votos: c.votes || 0,
      porcentaje: stats.totalVotes > 0 ? ((c.votes || 0) / stats.totalVotes * 100).toFixed(2) + '%' : '0%'
    })), null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resultados-votacion-${selectedPosition}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <Card className="mb-8 overflow-hidden border border-gray-200 shadow-xl">
      {/* Header del Dashboard */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-600 mt-1">
              Visualización interactiva de resultados electorales
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Filtros y controles */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar por cargo:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {positions.map(pos => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPosition === pos
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pos === 'all' ? 'Todos los cargos' : pos.charAt(0).toUpperCase() + pos.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Estadísticas destacadas */}
      <div className="p-6 border-b bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Votos</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalVotes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tasa de Participación</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.participationRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Candidato Líder</p>
                <p className="text-lg font-bold text-gray-800 truncate">
                  {stats.leadingCandidate?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.leadingCandidate?.votes || 0} votos
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ChevronDown className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Promedio de Votos</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.averageVotes.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles del gráfico */}
      <div className="p-4 border-b bg-white">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Vista:</span>
            <div className="flex gap-2">
              {['bar', 'horizontal'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {mode === 'bar' ? 'Barras Verticales' : 'Barras Horizontales'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPercentages(!showPercentages)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                showPercentages
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              {showPercentages ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Porcentajes
            </button>
          </div>
        </div>
      </div>

      {/* Gráfico principal */}
      <div className="p-6">
        <div className="h-96">
          <Bar data={chartData} options={chartOptions} />
        </div>
        
        {/* Leyenda personalizada */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">Interpretación del Gráfico</h4>
            <p className="text-sm text-blue-700">
              Barras más altas indican mayor cantidad de votos. El color verde representa al líder, 
              azul al segundo lugar, y púrpura al tercero.
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
            <h4 className="font-semibold text-green-800 mb-2">Línea de Porcentajes</h4>
            <p className="text-sm text-green-700">
              {showPercentages 
                ? "La línea roja muestra el porcentaje de votos que representa cada candidato."
                : "Activa 'Porcentajes' para ver la distribución porcentual."}
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
            <h4 className="font-semibold text-purple-800 mb-2">Interactividad</h4>
            <p className="text-sm text-purple-700">
              Pasa el cursor sobre las barras para ver detalles. Usa los filtros para analizar por cargo específico.
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de resultados detallada */}
      <div className="p-6 border-t bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resultados Detallados</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posición
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Porcentaje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diferencia
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCandidates
                .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                .map((candidate, index) => {
                  const percentage = stats.totalVotes > 0 
                    ? ((candidate.votes || 0) / stats.totalVotes * 100).toFixed(2)
                    : '0.00';
                  const difference = index > 0 
                    ? ((candidate.votes || 0) - (filteredCandidates[0].votes || 0)).toFixed(0)
                    : '-';
                  
                  return (
                    <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {candidate.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {candidate.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{candidate.votes || 0}</span>
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${Math.min((candidate.votes || 0) / stats.totalVotes * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium">{percentage}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {index > 0 ? (
                          <span className="text-red-600 font-medium">{difference}</span>
                        ) : (
                          <span className="text-green-600 font-medium">Líder</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}