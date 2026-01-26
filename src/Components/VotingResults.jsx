
import React, { useState, useMemo, useCallback } from 'react';
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
import { 
  TrendingUp, 
  Users, 
  Trophy, 
  Filter, 
  Download, 
  ChevronDown, 
  Eye, 
  EyeOff,
  FileText,
  Printer,
  Share2,
  FileDown,
  BarChart3,
  Percent,
  Award,
  TrendingDown,
  Medal
} from 'lucide-react';

// Importar react-pdf
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

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

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '2 solid #3b82f6',
  },
  title: {
    fontSize: 24,
    color: '#1e3a8a',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 5,
  },
  electionTitle: {
    fontSize: 20,
    color: '#2563eb',
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
    border: '1 solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 3,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    flex: 2,
  },
  value: {
    fontSize: 12,
    color: '#1e293b',
    flex: 3,
    fontWeight: 'bold',
  },
  candidateCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    border: '1 solid #cbd5e1',
    borderRadius: 5,
  },
  candidateName: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  candidateInfo: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 1,
  },
  positionHeader: {
    fontSize: 16,
    color: '#3b82f6',
    marginTop: 15,
    marginBottom: 8,
    fontWeight: 'bold',
    paddingBottom: 3,
    borderBottom: '1 solid #dbeafe',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#94a3b8',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
  totalVotes: {
    fontSize: 14,
    color: '#059669',
    fontWeight: 'bold',
    marginTop: 5,
  },
  timestamp: {
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 5,
  },
  winnerBadge: {
    fontSize: 10,
    color: '#059669',
    fontWeight: 'bold',
    marginTop: 3,
  },
  voteCount: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: 'bold',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  statBox: {
    width: '48%',
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 5,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1 dashed #cbd5e1',
    borderRadius: 5,
    marginVertical: 20,
  },
  chartText: {
    fontSize: 12,
    color: '#94a3b8',
  }
});

// Componente PDF para resultados
const ResultsPDF = ({ title, stats, filteredCandidates, selectedPosition, totalVotes }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Resultados Electorales</Text>
        <Text style={styles.electionTitle}>{title}</Text>
        <Text style={styles.subtitle}>
          {selectedPosition === 'all' 
            ? 'Todos los Cargos Electivos' 
            : `Cargo: ${selectedPosition.charAt(0).toUpperCase() + selectedPosition.slice(1)}`}
        </Text>
        <Text style={styles.subtitle}>
          Fecha de generación: {new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>

      {/* Estadísticas Resumen */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Resumen Estadístico</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total de Votos</Text>
            <Text style={styles.statValue}>{stats.totalVotes}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Candidatos Totales</Text>
            <Text style={styles.statValue}>{stats.totalCandidates}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Promedio de Votos</Text>
            <Text style={styles.statValue}>{stats.averageVotes.toFixed(1)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Tasa de Participación</Text>
            <Text style={styles.statValue}>{stats.participationRate.toFixed(1)}%</Text>
          </View>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Candidato Líder:</Text>
          <Text style={styles.value}>{stats.leadingCandidate?.name || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Votos del Líder:</Text>
          <Text style={styles.value}>{stats.leadingCandidate?.votes || 0}</Text>
        </View>
      </View>

      {/* Resultados por Posición */}
      <Text style={styles.sectionTitle}>🗳️ Resultados Detallados</Text>
      
      {/* Agrupar por posición si se muestran todos */}
      {selectedPosition === 'all' ? (
        // Agrupar candidatos por posición
        (() => {
          const groupedByPosition = filteredCandidates.reduce((acc, candidate) => {
            if (!acc[candidate.position]) {
              acc[candidate.position] = [];
            }
            acc[candidate.position].push(candidate);
            return acc;
          }, {});

          return Object.entries(groupedByPosition).map(([position, candidates]) => {
            const positionTotalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
            const sortedCandidates = [...candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
            
            return (
              <View key={position} style={styles.section}>
                <Text style={styles.positionHeader}>
                  {position.charAt(0).toUpperCase() + position.slice(1)} 
                  (Total votos: {positionTotalVotes})
                </Text>
                
                {sortedCandidates.map((candidate, index) => (
                  <View key={candidate.id} style={styles.candidateCard}>
                    <Text style={styles.candidateName}>
                      {index + 1}. {candidate.name} - #{candidate.number}
                    </Text>
                    <Text style={styles.voteCount}>
                      Votos: {candidate.votes || 0}
                    </Text>
                    <Text style={styles.candidateInfo}>
                      Porcentaje: {positionTotalVotes > 0 
                        ? `${((candidate.votes || 0) / positionTotalVotes * 100).toFixed(1)}%` 
                        : '0%'}
                    </Text>
                    {index === 0 && (
                      <Text style={styles.winnerBadge}>
                        🏆 GANADOR EN ESTA CATEGORÍA
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            );
          });
        })()
      ) : (
        // Mostrar solo la posición seleccionada
        <View style={styles.section}>
          {filteredCandidates
            .sort((a, b) => (b.votes || 0) - (a.votes || 0))
            .map((candidate, index) => (
              <View key={candidate.id} style={styles.candidateCard}>
                <Text style={styles.candidateName}>
                  {index + 1}. {candidate.name} - #{candidate.number}
                </Text>
                <Text style={styles.candidateInfo}>
                  Descripción: {candidate.description || 'Sin descripción disponible'}
                </Text>
                <Text style={styles.voteCount}>
                  Votos: {candidate.votes || 0}
                </Text>
                <Text style={styles.candidateInfo}>
                  Porcentaje: {totalVotes > 0 
                    ? `${((candidate.votes || 0) / totalVotes * 100).toFixed(1)}%` 
                    : '0%'}
                </Text>
                {index === 0 && (
                  <Text style={styles.winnerBadge}>
                    🏆 GANADOR OFICIAL
                  </Text>
                )}
              </View>
            ))}
        </View>
      )}

      {/* Información Adicional */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Análisis de Resultados</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Diferencia entre 1ro y 2do:</Text>
          <Text style={styles.value}>
            {filteredCandidates.length > 1 
              ? Math.abs((filteredCandidates[0]?.votes || 0) - (filteredCandidates[1]?.votes || 0))
              : 'N/A'} votos
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Margen de victoria:</Text>
          <Text style={styles.value}>
            {filteredCandidates.length > 1 && totalVotes > 0
              ? `${(((filteredCandidates[0]?.votes || 0) - (filteredCandidates[1]?.votes || 0)) / totalVotes * 100).toFixed(1)}%`
              : 'N/A'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Votos válidos:</Text>
          <Text style={styles.value}>{totalVotes}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Candidatos con votos:</Text>
          <Text style={styles.value}>
            {filteredCandidates.filter(c => (c.votes || 0) > 0).length} de {filteredCandidates.length}
          </Text>
        </View>
      </View>

      {/* Pie de página */}
      <View style={styles.footer}>
        <Text>________________________________________________</Text>
        <Text>Documento generado por el Sistema Electoral I.E.F.A.G</Text>
        <Text>Este documento es de carácter oficial y certifica los resultados electorales</Text>
        <Text style={styles.timestamp}>
          ID del reporte: RES-{Date.now().toString(36).toUpperCase()}
          {' - '}
          Filtro aplicado: {selectedPosition === 'all' ? 'Todos los cargos' : selectedPosition}
        </Text>
      </View>
    </Page>
  </Document>
);

export function VotingResults({ candidates, title = "Resultados de Votación" }) {
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [showPercentages, setShowPercentages] = useState(true);
  const [viewMode, setViewMode] = useState('bar'); // 'bar', 'horizontal', 'pie'
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf'); // 'pdf', 'json', 'csv'

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

  // Función para exportar a JSON
  const exportToJSON = useCallback(() => {
    const data = filteredCandidates.map(c => ({
      nombre: c.name,
      numero: c.number,
      cargo: c.position,
      votos: c.votes || 0,
      porcentaje: stats.totalVotes > 0 ? ((c.votes || 0) / stats.totalVotes * 100).toFixed(2) + '%' : '0%',
      descripcion: c.description || ''
    }));
    
    const dataStr = JSON.stringify({
      titulo: title,
      filtro: selectedPosition === 'all' ? 'Todos los cargos' : selectedPosition,
      fecha: new Date().toISOString(),
      estadisticas: stats,
      resultados: data
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resultados-${selectedPosition}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredCandidates, stats, title, selectedPosition]);

  // Función para exportar a CSV
  const exportToCSV = useCallback(() => {
    const headers = ['Nombre', 'Número', 'Cargo', 'Votos', 'Porcentaje', 'Descripción'];
    const rows = filteredCandidates.map(c => [
      c.name,
      c.number,
      c.position,
      c.votes || 0,
      stats.totalVotes > 0 ? `${((c.votes || 0) / stats.totalVotes * 100).toFixed(2)}%` : '0%',
      c.description || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resultados-${selectedPosition}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredCandidates, stats.totalVotes, selectedPosition]);

  // Función para compartir resultados
  const shareResults = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `${title} - I.E.F.A.G Elecciones`,
        text: `Resultados electorales: ${stats.totalVotes} votos totales. Candidato líder: ${stats.leadingCandidate?.name || 'N/A'}`,
        url: window.location.href
      });
    } else {
      // Copiar al portapapeles como alternativa
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Enlace copiado al portapapeles');
      });
    }
  }, [title, stats]);

  // Función para imprimir resultados
  const printResults = useCallback(() => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${title} - I.E.F.A.G</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
            .stat-card { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f1f5f9; padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .winner { background: #f0fdf4; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Fecha: ${new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          
          <div class="stats">
            <div class="stat-card">
              <strong>Total de Votos:</strong> ${stats.totalVotes}
            </div>
            <div class="stat-card">
              <strong>Candidatos Totales:</strong> ${stats.totalCandidates}
            </div>
            <div class="stat-card">
              <strong>Promedio de Votos:</strong> ${stats.averageVotes.toFixed(1)}
            </div>
            <div class="stat-card">
              <strong>Tasa de Participación:</strong> ${stats.participationRate.toFixed(1)}%
            </div>
          </div>
          
          <h2>Resultados Detallados</h2>
          <table>
            <thead>
              <tr>
                <th>Posición</th>
                <th>Candidato</th>
                <th>Cargo</th>
                <th>Votos</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              ${filteredCandidates
                .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                .map((candidate, index) => {
                  const percentage = stats.totalVotes > 0 
                    ? ((candidate.votes || 0) / stats.totalVotes * 100).toFixed(2)
                    : '0.00';
                  return `
                    <tr ${index === 0 ? 'class="winner"' : ''}>
                      <td>${index + 1}</td>
                      <td>${candidate.name}</td>
                      <td>${candidate.position}</td>
                      <td>${candidate.votes || 0}</td>
                      <td>${percentage}%</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Documento generado por el Sistema Electoral I.E.F.A.G</p>
            <p>ID del reporte: PRINT-${Date.now().toString(36).toUpperCase()}</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [title, stats, filteredCandidates]);

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
          
          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-medium shadow-md"
            >
              <Download className="w-4 h-4" />
              Exportar Resultados
            </button>
            
            {/* Menú de opciones de exportación */}
            {showExportOptions && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[300px] z-50">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-700 mb-3 px-2 border-b pb-2">
                    📤 Opciones de Exportación
                  </div>
                  
                  <PDFDownloadLink
                    document={
                      <ResultsPDF 
                        title={title}
                        stats={stats}
                        filteredCandidates={filteredCandidates}
                        selectedPosition={selectedPosition}
                        totalVotes={stats.totalVotes}
                      />
                    }
                    fileName={`resultados-${selectedPosition}-${new Date().toISOString().split('T')[0]}.pdf`}
                    className="block"
                  >
                    {({ loading }) => (
                      <button
                        disabled={loading}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">
                              Exportar a PDF
                            </div>
                            <div className="text-xs text-gray-500">
                              Documento oficial con resultados
                            </div>
                          </div>
                        </div>
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    )}
                  </PDFDownloadLink>
                  
                  <button
                    onClick={exportToJSON}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileDown className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Exportar a JSON
                        </div>
                        <div className="text-xs text-gray-500">
                          Datos estructurados para análisis
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  <button
                    onClick={exportToCSV}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Exportar a CSV
                        </div>
                        <div className="text-xs text-gray-500">
                          Compatible con Excel y hojas de cálculo
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  <button
                    onClick={shareResults}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Share2 className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Compartir resultados
                        </div>
                        <div className="text-xs text-gray-500">
                          Compartir en redes o por enlace
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  <button
                    onClick={printResults}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Printer className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Imprimir resultados
                        </div>
                        <div className="text-xs text-gray-500">
                          Versión optimizada para impresión
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            )}
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
                <Percent className="w-5 h-5 text-orange-600" />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
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
                    ? ((candidate.votes || 0) - (filteredCandidates[0].votes || 0))
                    : 0;
                  
                  return (
                    <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                          index === 1 ? 'bg-gray-100 text-gray-800 border border-gray-300' :
                          index === 2 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                          'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {index + 1}
                          {index === 0 && <Medal className="w-3 h-3 ml-1" />}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          {candidate.name}
                          {index === 0 && (
                            <Award className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {candidate.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{candidate.votes || 0}</span>
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all duration-500"
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
                          <div className="flex items-center gap-1 text-red-600 font-medium">
                            <TrendingDown className="w-4 h-4" />
                            {Math.abs(difference)}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-green-600 font-medium">
                            <TrendingUp className="w-4 h-4" />
                            Líder
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {index === 0 ? (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-medium rounded-full">
                            Ganador
                          </span>
                        ) : index === 1 ? (
                          <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-medium rounded-full">
                            Segundo
                          </span>
                        ) : index === 2 ? (
                          <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 text-xs font-medium rounded-full">
                            Tercero
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                            Participante
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información adicional sobre exportación */}
      <div className="p-6 border-t bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">¿Necesitas los resultados completos?</h4>
            <p className="text-sm text-gray-600">
              Exporta los datos en múltiples formatos para análisis, reportes o presentaciones.
            </p>
          </div>
          <button
            onClick={() => setShowExportOptions(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-medium shadow-md"
          >
            <Download className="w-4 h-4" />
            Exportar Ahora
          </button>
        </div>
      </div>
    </Card>
  );
}