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
  LineElement,
  PointElement,
  LineController,
  Filler
} from 'chart.js';
import { 
  TrendingUp, 
  Users, 
  Trophy, 
  Download, 
  ChevronDown, 
  Eye, 
  EyeOff,
  Printer,
  Share2,
  FileDown,
  BarChart3,
  Award,
  FileText,
  LayoutDashboard,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

// Registrar TODOS los elementos necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LineController,
  Filler
);

// Función para normalizar texto (quitar acentos y pasar a minúsculas)
const normalize = (text) =>
  text
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

// Componente Card básico
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
    {children}
  </div>
);

export function VotingResults({ candidates = [], title = "Resultados de Votación" }) {
  const [showPercentages, setShowPercentages] = useState(true);
  const [viewMode, setViewMode] = useState('bar');
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Procesar todos los candidatos con normalización
  const processedCandidates = useMemo(() => {
    // Filtramos candidatos activos
    const activeCandidates = candidates.filter(c => c.active !== false);
    
    // Separar por cargo usando normalización
    const personeria = activeCandidates
      .filter(c => normalize(c.position) === 'personeria')
      .map(c => ({
        ...c,
        cargo: 'Personería',
        cargoClass: 'personeria',
        cargoColor: 'blue'
      }));
    
    const contraloria = activeCandidates
      .filter(c => normalize(c.position) === 'contraloria')
      .map(c => ({
        ...c,
        cargo: 'Contraloría',
        cargoClass: 'contraloria',
        cargoColor: 'green'
      }));
    
    // Combinar todos
    return {
      todos: [...personeria, ...contraloria].sort((a, b) => (b.votes || 0) - (a.votes || 0)),
      personeria,
      contraloria
    };
  }, [candidates]);

  // Calcular estadísticas generales
  const stats = useMemo(() => {
    const personeriaVotos = processedCandidates.personeria.reduce((sum, c) => sum + (c.votes || 0), 0);
    const contraloriaVotos = processedCandidates.contraloria.reduce((sum, c) => sum + (c.votes || 0), 0);
    const totalVotos = personeriaVotos + contraloriaVotos;
    
    const personeriaCandidatos = processedCandidates.personeria.length;
    const contraloriaCandidatos = processedCandidates.contraloria.length;
    
    const personeriaGanador = processedCandidates.personeria.length > 0 
      ? processedCandidates.personeria.reduce((max, c) => (c.votes || 0) > (max.votes || 0) ? c : max)
      : null;
    
    const contraloriaGanador = processedCandidates.contraloria.length > 0 
      ? processedCandidates.contraloria.reduce((max, c) => (c.votes || 0) > (max.votes || 0) ? c : max)
      : null;
    
    return {
      totalVotos,
      totalCandidatos: personeriaCandidatos + contraloriaCandidatos,
      personeria: {
        votos: personeriaVotos,
        candidatos: personeriaCandidatos,
        ganador: personeriaGanador,
        promedio: personeriaCandidatos > 0 ? (personeriaVotos / personeriaCandidatos).toFixed(1) : 0
      },
      contraloria: {
        votos: contraloriaVotos,
        candidatos: contraloriaCandidatos,
        ganador: contraloriaGanador,
        promedio: contraloriaCandidatos > 0 ? (contraloriaVotos / contraloriaCandidatos).toFixed(1) : 0
      }
    };
  }, [processedCandidates]);

  // Preparar datos para el gráfico
  const chartConfig = useMemo(() => {
    if (!processedCandidates.todos.length) {
      return { 
        data: { labels: [], datasets: [] }, 
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } }
        } 
      };
    }

    const totalVotos = stats.totalVotos;

    const getBarColor = (candidato) => {
      return candidato.cargoClass === 'personeria' 
        ? 'rgba(30, 58, 138, 0.8)'
        : 'rgba(6, 95, 70, 0.8)';
    };

    const getBorderColor = (candidato) => {
      return candidato.cargoClass === 'personeria'
        ? 'rgb(30, 58, 138)'
        : 'rgb(6, 95, 70)';
    };

    const datasets = [
      {
        label: 'Votos',
        data: processedCandidates.todos.map(c => c.votes || 0),
        backgroundColor: processedCandidates.todos.map(c => getBarColor(c)),
        borderColor: processedCandidates.todos.map(c => getBorderColor(c)),
        borderWidth: 2,
        borderRadius: 8,
        barPercentage: viewMode === 'horizontal' ? 0.6 : 0.8,
        categoryPercentage: 0.9,
      }
    ];

    if (showPercentages && totalVotos > 0) {
      datasets.push({
        label: 'Porcentaje',
        data: processedCandidates.todos.map(c => ((c.votes || 0) / totalVotos * 100).toFixed(1)),
        type: 'line',
        yAxisID: 'y1',
        borderColor: 'rgba(5, 150, 105, 0.8)',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: false
      });
    }

    const labels = processedCandidates.todos.map(c => 
      `${c.name} (${c.cargoClass === 'personeria' ? 'P' : 'C'})`
    );

    const scales = {
      x: {
        grid: { color: 'rgba(229, 231, 235, 0.3)', drawBorder: false },
        ticks: { font: { size: 11 }, maxRotation: viewMode === 'bar' ? 45 : 0 }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: { color: 'rgba(229, 231, 235, 0.3)', drawBorder: false },
        ticks: { font: { size: 11 } },
        title: { display: true, text: 'Número de Votos', font: { size: 12, weight: 'bold' } }
      }
    };

    if (showPercentages && totalVotos > 0) {
      scales.y1 = {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        max: 100,
        grid: { drawOnChartArea: false },
        ticks: { callback: (value) => `${value}%` },
        title: { display: true, text: 'Porcentaje', font: { size: 12, weight: 'bold' } }
      };
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: viewMode === 'horizontal' ? 'y' : 'x',
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#f3f4f6',
          bodyColor: '#f3f4f6',
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y || context.parsed.x;
              const candidato = processedCandidates.todos[context.dataIndex];
              
              if (label === 'Porcentaje') return `Porcentaje: ${value}%`;
              
              const votos = value;
              const porcentaje = totalVotos > 0 ? ((votos / totalVotos) * 100).toFixed(1) : '0.0';
              return `${candidato.cargo}: ${votos} votos (${porcentaje}%)`;
            }
          }
        }
      },
      scales: scales,
    };

    return { data: { labels, datasets }, options };
  }, [processedCandidates.todos, stats.totalVotos, showPercentages, viewMode]);

  // Función para exportar a PDF - VERSIÓN REORGANIZADA
  const exportarPDF = useCallback(() => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Configuración de colores
      const colores = {
        azul: [30, 58, 138],
        verde: [6, 95, 70],
        gris: [240, 249, 255],
        verdeClaro: [240, 253, 244],
        grisOscuro: [100, 100, 100]
      };

      doc.setFont('helvetica');

      // ====================================================
      // PORTADA
      // ====================================================
      
      // Fondo degradado superior
      doc.setFillColor(colores.azul[0], colores.azul[1], colores.azul[2]);
      doc.rect(0, 0, 210, 70, 'F');
      
      // Franja inferior
      doc.setFillColor(colores.verde[0], colores.verde[1], colores.verde[2]);
      doc.rect(0, 70, 210, 20, 'F');

      // Título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE ELECTORAL', 105, 40, { align: 'center' });
      
      doc.setFontSize(20);
      doc.setFont('helvetica', 'normal');
      doc.text('COMPLETO', 105, 55, { align: 'center' });

      doc.setFontSize(16);
      doc.text('Personería y Contraloría Estudiantil', 105, 80, { align: 'center' });

      // Círculo decorativo
      doc.setFillColor(255, 255, 255);
      doc.circle(105, 120, 20, 'F');
      
      doc.setFillColor(colores.azul[0], colores.azul[1], colores.azul[2]);
      doc.circle(105, 120, 18, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('V', 105, 125, { align: 'center' });

      // Fecha de generación
      doc.setTextColor(colores.grisOscuro[0], colores.grisOscuro[1], colores.grisOscuro[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const fechaStr = new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      doc.text(`Generado: ${fechaStr}`, 105, 165, { align: 'center' });
      doc.text('I.E.F.A.G - Sistema Electoral', 105, 173, { align: 'center' });

      // Línea decorativa
      doc.setDrawColor(colores.azul[0], colores.azul[1], colores.azul[2]);
      doc.setLineWidth(0.5);
      doc.line(30, 185, 180, 185);

      // ====================================================
      // PÁGINA 2 - RESULTADOS
      // ====================================================
      doc.addPage();

      // Encabezado de página
      doc.setFillColor(colores.azul[0], colores.azul[1], colores.azul[2]);
      doc.rect(0, 0, 210, 15, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('I.E.F.A.G - Sistema de Votación Electrónica', 10, 10);
      doc.text(`ID: PDF-${Date.now().toString(36).toUpperCase()}`, 200, 10, { align: 'right' });

      doc.setTextColor(colores.azul[0], colores.azul[1], colores.azul[2]);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('RESULTADOS ELECTORALES', 105, 30, { align: 'center' });

      // ====================================================
      // SECCIÓN: ESTADÍSTICAS GENERALES
      // ====================================================
      doc.setFontSize(16);
      doc.setTextColor(colores.azul[0], colores.azul[1], colores.azul[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Estadísticas Generales', 20, 45);

      // Tarjetas de estadísticas - Primera fila
      doc.setFillColor(240, 249, 255); // azul muy claro
      doc.setDrawColor(colores.azul[0], colores.azul[1], colores.azul[2]);
      doc.setLineWidth(0.1);
      
      // Tarjeta 1: Total Votos
      doc.roundedRect(20, 50, 80, 25, 2, 2, 'FD');
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL VOTOS', 60, 57, { align: 'center' });
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(stats.totalVotos.toString(), 60, 70, { align: 'center' });

      // Tarjeta 2: Total Candidatos
      doc.roundedRect(110, 50, 80, 25, 2, 2, 'FD');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL CANDIDATOS', 150, 57, { align: 'center' });
      doc.setFontSize(18);
      doc.text(stats.totalCandidatos.toString(), 150, 70, { align: 'center' });

      // Tarjeta 3: Votos Personería
      doc.roundedRect(20, 85, 80, 25, 2, 2, 'FD');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('VOTOS PERSONERÍA', 60, 92, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(colores.azul[0], colores.azul[1], colores.azul[2]);
      doc.text(stats.personeria.votos.toString(), 60, 105, { align: 'center' });

      // Tarjeta 4: Votos Contraloría
      doc.roundedRect(110, 85, 80, 25, 2, 2, 'FD');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text('VOTOS CONTRALORÍA', 150, 92, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(colores.verde[0], colores.verde[1], colores.verde[2]);
      doc.text(stats.contraloria.votos.toString(), 150, 105, { align: 'center' });

      // Información adicional
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Promedio votos Personería: ${stats.personeria.promedio}`, 20, 120);
      doc.text(`Promedio votos Contraloría: ${stats.contraloria.promedio}`, 20, 128);

      let startY = 140;

      // ====================================================
      // SECCIÓN: RESULTADOS PERSONERÍA
      // ====================================================
      doc.setFontSize(16);
      doc.setTextColor(colores.azul[0], colores.azul[1], colores.azul[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Resultados Personería', 20, startY);

      if (processedCandidates.personeria.length > 0) {
        const headers = [['#', 'Candidato', 'Número', 'Votos', 'Porcentaje']];
        const data = [...processedCandidates.personeria]
          .sort((a, b) => (b.votes || 0) - (a.votes || 0))
          .map((c, i) => {
            const porcentaje = stats.personeria.votos > 0 
              ? ((c.votes || 0) / stats.personeria.votos * 100).toFixed(2)
              : '0.00';
            return [
              (i + 1).toString(),
              c.name || 'Sin nombre',
              c.number?.toString() || '-',
              (c.votes || 0).toString(),
              `${porcentaje}%`
            ];
          });

        autoTable(doc, {
          startY: startY + 5,
          head: headers,
          body: data,
          theme: 'grid',
          styles: { 
            fontSize: 9, 
            cellPadding: 4, 
            lineColor: [200, 200, 200], 
            lineWidth: 0.1,
            textColor: [50, 50, 50]
          },
          headStyles: { 
            fillColor: colores.azul, 
            textColor: [255, 255, 255], 
            fontStyle: 'bold', 
            halign: 'center' 
          },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 70 },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 25, halign: 'center' },
            4: { cellWidth: 25, halign: 'center' }
          },
          margin: { left: 20, right: 20 }
        });
        
        startY = doc.lastAutoTable?.finalY || startY + 30;
      } else {
        doc.setFontSize(11);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'italic');
        doc.text('No hay candidatos registrados para Personería', 20, startY + 15);
        startY = startY + 25;
      }

      // ====================================================
      // SECCIÓN: RESULTADOS CONTRALORÍA
      // ====================================================
      startY = startY + 15;
      
      doc.setFontSize(16);
      doc.setTextColor(colores.verde[0], colores.verde[1], colores.verde[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Resultados Contraloría', 20, startY);

      if (processedCandidates.contraloria.length > 0) {
        const headers = [['#', 'Candidato', 'Número', 'Votos', 'Porcentaje']];
        const data = [...processedCandidates.contraloria]
          .sort((a, b) => (b.votes || 0) - (a.votes || 0))
          .map((c, i) => {
            const porcentaje = stats.contraloria.votos > 0 
              ? ((c.votes || 0) / stats.contraloria.votos * 100).toFixed(2)
              : '0.00';
            return [
              (i + 1).toString(),
              c.name || 'Sin nombre',
              c.number?.toString() || '-',
              (c.votes || 0).toString(),
              `${porcentaje}%`
            ];
          });

        autoTable(doc, {
          startY: startY + 5,
          head: headers,
          body: data,
          theme: 'grid',
          styles: { 
            fontSize: 9, 
            cellPadding: 4, 
            lineColor: [200, 200, 200], 
            lineWidth: 0.1,
            textColor: [50, 50, 50]
          },
          headStyles: { 
            fillColor: colores.verde, 
            textColor: [255, 255, 255], 
            fontStyle: 'bold', 
            halign: 'center' 
          },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 70 },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 25, halign: 'center' },
            4: { cellWidth: 25, halign: 'center' }
          },
          margin: { left: 20, right: 20 }
        });
        
        startY = doc.lastAutoTable?.finalY || startY + 30;
      } else {
        doc.setFontSize(11);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'italic');
        doc.text('No hay candidatos registrados para Contraloría', 20, startY + 15);
        startY = startY + 25;
      }

      // ====================================================
      // SECCIÓN: GANADORES
      // ====================================================
      startY = startY + 20;
      
      doc.setFillColor(240, 253, 244); // verde muy claro
      doc.setDrawColor(colores.verde[0], colores.verde[1], colores.verde[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(20, startY, 170, 50, 3, 3, 'FD');
      
      doc.setFontSize(14);
      doc.setTextColor(colores.verde[0], colores.verde[1], colores.verde[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('🏆 GANADORES POR CARGO', 105, startY + 10, { align: 'center' });
      
      // Ganador Personería
      if (stats.personeria.ganador) {
        doc.setFontSize(10);
        doc.setTextColor(colores.azul[0], colores.azul[1], colores.azul[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('Personería:', 35, startY + 22);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text(stats.personeria.ganador.name || 'Desconocido', 75, startY + 22);
        const porcentajePersoneria = stats.personeria.votos > 0 
          ? ((stats.personeria.ganador.votes || 0) / stats.personeria.votos * 100).toFixed(2)
          : '0.00';
        doc.text(`${stats.personeria.ganador.votes || 0} votos (${porcentajePersoneria}%)`, 75, startY + 28);
      } else {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'italic');
        doc.text('No hay ganador de Personería', 75, startY + 25);
      }
      
      // Ganador Contraloría
      if (stats.contraloria.ganador) {
        doc.setFontSize(10);
        doc.setTextColor(colores.verde[0], colores.verde[1], colores.verde[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('Contraloría:', 35, startY + 38);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text(stats.contraloria.ganador.name || 'Desconocido', 75, startY + 38);
        const porcentajeContraloria = stats.contraloria.votos > 0 
          ? ((stats.contraloria.ganador.votes || 0) / stats.contraloria.votos * 100).toFixed(2)
          : '0.00';
        doc.text(`${stats.contraloria.ganador.votes || 0} votos (${porcentajeContraloria}%)`, 75, startY + 44);
      } else {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'italic');
        doc.text('No hay ganador de Contraloría', 75, startY + 41);
      }

      // ====================================================
      // PIE DE PÁGINA
      // ====================================================
      const totalPaginas = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFillColor(colores.azul[0], colores.azul[1], colores.azul[2]);
        doc.rect(0, 285, 210, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('I.E.F.A.G - Sistema Electoral', 10, 292);
        doc.text(`Página ${i} de ${totalPaginas}`, 105, 292, { align: 'center' });
        doc.text(new Date().toLocaleDateString(), 200, 292, { align: 'right' });
      }

      doc.save(`resultados-completos-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF generado exitosamente');

    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF');
    }
  }, [processedCandidates, stats]);

  // Función para exportar a JSON
  const exportarJSON = useCallback(() => {
    try {
      // Ordenar personeria por votos
      const personeriaOrdenada = [...processedCandidates.personeria].sort((a, b) => (b.votes || 0) - (a.votes || 0));
      const contraloriaOrdenada = [...processedCandidates.contraloria].sort((a, b) => (b.votes || 0) - (a.votes || 0));
      
      const data = {
        titulo: title,
        fecha: new Date().toISOString(),
        estadisticas: {
          total_votos: stats.totalVotos,
          total_candidatos: stats.totalCandidatos,
          personeria: {
            votos: stats.personeria.votos,
            candidatos: stats.personeria.candidatos,
            promedio_votos: stats.personeria.promedio,
            ganador: stats.personeria.ganador ? {
              nombre: stats.personeria.ganador.name || 'Sin nombre',
              numero: stats.personeria.ganador.number,
              votos: stats.personeria.ganador.votes || 0,
              porcentaje: stats.personeria.votos > 0 
                ? ((stats.personeria.ganador.votes || 0) / stats.personeria.votos * 100).toFixed(2) + '%' 
                : '0%'
            } : null
          },
          contraloria: {
            votos: stats.contraloria.votos,
            candidatos: stats.contraloria.candidatos,
            promedio_votos: stats.contraloria.promedio,
            ganador: stats.contraloria.ganador ? {
              nombre: stats.contraloria.ganador.name || 'Sin nombre',
              numero: stats.contraloria.ganador.number,
              votos: stats.contraloria.ganador.votes || 0,
              porcentaje: stats.contraloria.votos > 0 
                ? ((stats.contraloria.ganador.votes || 0) / stats.contraloria.votos * 100).toFixed(2) + '%' 
                : '0%'
            } : null
          }
        },
        resultados: {
          personeria: personeriaOrdenada.map((c, i) => ({
            posicion: i + 1,
            nombre: c.name || 'Sin nombre',
            numero: c.number,
            votos: c.votes || 0,
            porcentaje: stats.personeria.votos > 0 
              ? ((c.votes || 0) / stats.personeria.votos * 100).toFixed(2) + '%' 
              : '0%',
            ganador: i === 0
          })),
          contraloria: contraloriaOrdenada.map((c, i) => ({
            posicion: i + 1,
            nombre: c.name || 'Sin nombre',
            numero: c.number,
            votos: c.votes || 0,
            porcentaje: stats.contraloria.votos > 0 
              ? ((c.votes || 0) / stats.contraloria.votos * 100).toFixed(2) + '%' 
              : '0%',
            ganador: i === 0
          }))
        }
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resultados-completos-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('JSON exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar JSON:', error);
      toast.error('Error al exportar JSON');
    }
  }, [processedCandidates, stats, title]);

  // Función para exportar a CSV
  const exportarCSV = useCallback(() => {
    try {
      const lineas = [];
      
      // Título
      lineas.push(['RESULTADOS ELECTORALES COMPLETOS']);
      lineas.push([`Fecha: ${new Date().toLocaleDateString()}`]);
      lineas.push([]);
      
      // Estadísticas generales
      lineas.push(['ESTADÍSTICAS GENERALES']);
      lineas.push(['Métrica', 'Personería', 'Contraloría', 'Total']);
      lineas.push([
        'Votos', 
        stats.personeria.votos.toString(), 
        stats.contraloria.votos.toString(), 
        stats.totalVotos.toString()
      ]);
      lineas.push([
        'Candidatos', 
        stats.personeria.candidatos.toString(), 
        stats.contraloria.candidatos.toString(), 
        stats.totalCandidatos.toString()
      ]);
      lineas.push([
        'Promedio Votos', 
        stats.personeria.promedio.toString(), 
        stats.contraloria.promedio.toString(), 
        '-'
      ]);
      lineas.push([]);
      
      // Resultados Personería
      lineas.push(['RESULTADOS PERSONERÍA']);
      lineas.push(['Posición', 'Candidato', 'Número', 'Votos', 'Porcentaje', 'Ganador']);
      
      const personeriaOrdenada = [...processedCandidates.personeria].sort((a, b) => (b.votes || 0) - (a.votes || 0));
      
      personeriaOrdenada.forEach((c, i) => {
        const porcentaje = stats.personeria.votos > 0 
          ? ((c.votes || 0) / stats.personeria.votos * 100).toFixed(2) + '%'
          : '0%';
        lineas.push([
          (i + 1).toString(),
          c.name || 'Sin nombre',
          c.number?.toString() || '-',
          (c.votes || 0).toString(),
          porcentaje,
          i === 0 ? 'SÍ' : 'NO'
        ]);
      });
      
      if (processedCandidates.personeria.length === 0) {
        lineas.push(['No hay candidatos de Personería']);
      }
      
      lineas.push([]);
      
      // Resultados Contraloría
      lineas.push(['RESULTADOS CONTRALORÍA']);
      lineas.push(['Posición', 'Candidato', 'Número', 'Votos', 'Porcentaje', 'Ganador']);
      
      const contraloriaOrdenada = [...processedCandidates.contraloria].sort((a, b) => (b.votes || 0) - (a.votes || 0));
      
      contraloriaOrdenada.forEach((c, i) => {
        const porcentaje = stats.contraloria.votos > 0 
          ? ((c.votes || 0) / stats.contraloria.votos * 100).toFixed(2) + '%'
          : '0%';
        lineas.push([
          (i + 1).toString(),
          c.name || 'Sin nombre',
          c.number?.toString() || '-',
          (c.votes || 0).toString(),
          porcentaje,
          i === 0 ? 'SÍ' : 'NO'
        ]);
      });
      
      if (processedCandidates.contraloria.length === 0) {
        lineas.push(['No hay candidatos de Contraloría']);
      }

      const csv = lineas.map(fila => fila.map(celda => `"${celda}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resultados-completos-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      toast.error('Error al exportar CSV');
    }
  }, [processedCandidates, stats]);

  // Función para compartir
  const compartir = useCallback(() => {
    try {
      const texto = `Resultados Electorales I.E.F.A.G
📊 Total Votos: ${stats.totalVotos}
👥 Total Candidatos: ${stats.totalCandidatos}

🏆 Personería: ${stats.personeria.ganador?.name || 'No hay ganador'} (${stats.personeria.ganador?.votes || 0} votos)
🏆 Contraloría: ${stats.contraloria.ganador?.name || 'No hay ganador'} (${stats.contraloria.ganador?.votes || 0} votos)`;

      if (navigator.share) {
        navigator.share({ title, text: texto });
      } else {
        navigator.clipboard.writeText(texto);
        toast.success('Resultados copiados al portapapeles');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      toast.error('Error al compartir');
    }
  }, [stats, title]);

  // Función para imprimir
  const imprimir = useCallback(() => {
    try {
      const ventana = window.open('', '_blank');
      
      const personeriaOrdenada = [...processedCandidates.personeria].sort((a, b) => (b.votes || 0) - (a.votes || 0));
      const contraloriaOrdenada = [...processedCandidates.contraloria].sort((a, b) => (b.votes || 0) - (a.votes || 0));
      
      const personeriaRows = personeriaOrdenada.length > 0
        ? personeriaOrdenada.map((c, i) => {
            const porcentaje = stats.personeria.votos > 0 
              ? ((c.votes || 0) / stats.personeria.votos * 100).toFixed(2)
              : '0.00';
            return `
              <tr ${i === 0 ? 'class="winner"' : ''}>
                <td>${i + 1}</td>
                <td>${c.name || 'Sin nombre'}</td>
                <td>${c.number || '-'}</td>
                <td>${c.votes || 0}</td>
                <td>${porcentaje}%</td>
              </tr>
            `;
          }).join('')
        : '<tr><td colspan="5" style="text-align:center; padding:20px; color:#999;">No hay candidatos de Personería</td></tr>';
      
      const contraloriaRows = contraloriaOrdenada.length > 0
        ? contraloriaOrdenada.map((c, i) => {
            const porcentaje = stats.contraloria.votos > 0 
              ? ((c.votes || 0) / stats.contraloria.votos * 100).toFixed(2)
              : '0.00';
            return `
              <tr ${i === 0 ? 'class="winner"' : ''}>
                <td>${i + 1}</td>
                <td>${c.name || 'Sin nombre'}</td>
                <td>${c.number || '-'}</td>
                <td>${c.votes || 0}</td>
                <td>${porcentaje}%</td>
              </tr>
            `;
          }).join('')
        : '<tr><td colspan="5" style="text-align:center; padding:20px; color:#999;">No hay candidatos de Contraloría</td></tr>';

      const html = `
        <html>
          <head>
            <title>${title} - Resultados Completos</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; }
              h2 { color: #1e3a8a; margin-top: 30px; border-left: 4px solid #065f46; padding-left: 15px; }
              .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
              .stat-card { background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe; text-align: center; }
              .stat-value { font-size: 24px; font-weight: bold; color: #1e3a8a; margin-top: 5px; }
              .stat-label { font-size: 12px; color: #4b5563; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background: #dbeafe; padding: 10px; text-align: left; border-bottom: 2px solid #1e3a8a; color: #1e3a8a; }
              td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
              .winner { background: #f0fdf4; border-left: 4px solid #065f46; }
              .winners-box { background: #f0f9ff; border: 2px solid #1e3a8a; border-radius: 8px; padding: 20px; margin: 30px 0; display: flex; justify-content: space-around; }
              .winner-card { text-align: center; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #1e3a8a; text-align: center; color: #64748b; font-size: 12px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <h1>${title} - RESULTADOS COMPLETOS</h1>
            <p>Fecha: ${new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}</p>
            
            <div class="stats">
              <div class="stat-card">
                <div class="stat-label">Total Votos</div>
                <div class="stat-value">${stats.totalVotos}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Candidatos</div>
                <div class="stat-value">${stats.totalCandidatos}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Votos Personería</div>
                <div class="stat-value">${stats.personeria.votos}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Votos Contraloría</div>
                <div class="stat-value">${stats.contraloria.votos}</div>
              </div>
            </div>
            
            <div class="winners-box">
              <div class="winner-card">
                <div style="font-size:14px; color:#1e3a8a;">🏆 GANADOR PERSONERÍA</div>
                <div style="font-size:18px; font-weight:bold; color:#1e3a8a;">${stats.personeria.ganador?.name || 'No hay ganador'}</div>
                <div>${stats.personeria.ganador?.votes || 0} votos ${stats.personeria.votos > 0 ? `(${((stats.personeria.ganador?.votes || 0) / stats.personeria.votos * 100).toFixed(2)}%)` : ''}</div>
              </div>
              <div class="winner-card">
                <div style="font-size:14px; color:#065f46;">🏆 GANADOR CONTRALORÍA</div>
                <div style="font-size:18px; font-weight:bold; color:#065f46;">${stats.contraloria.ganador?.name || 'No hay ganador'}</div>
                <div>${stats.contraloria.ganador?.votes || 0} votos ${stats.contraloria.votos > 0 ? `(${((stats.contraloria.ganador?.votes || 0) / stats.contraloria.votos * 100).toFixed(2)}%)` : ''}</div>
              </div>
            </div>
            
            <h2>📋 PERSONERÍA ESTUDIANTIL</h2>
            <table>
              <thead>
                <tr><th>#</th><th>Candidato</th><th>Número</th><th>Votos</th><th>Porcentaje</th></tr>
              </thead>
              <tbody>${personeriaRows}</tbody>
            </table>
            
            <h2>📋 CONTRALORÍA ESTUDIANTIL</h2>
            <table>
              <thead>
                <tr><th>#</th><th>Candidato</th><th>Número</th><th>Votos</th><th>Porcentaje</th></tr>
              </thead>
              <tbody>${contraloriaRows}</tbody>
            </table>
            
            <div class="footer">
              <p>I.E.F.A.G - Sistema Electoral</p>
              <p>ID: PRINT-${Date.now().toString(36).toUpperCase()}</p>
            </div>
            
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 1000);
              }
            </script>
          </body>
        </html>
      `;
      
      ventana.document.write(html);
      ventana.document.close();
    } catch (error) {
      console.error('Error al imprimir:', error);
      toast.error('Error al preparar la impresión');
    }
  }, [processedCandidates, stats, title]);

  if (!candidates || candidates.length === 0) {
    return (
      <Card className="mb-8 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600">No hay datos de candidatos disponibles.</p>
      </Card>
    );
  }

  return (
    <Card className="mb-8 overflow-hidden border border-gray-200 shadow-xl">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-800 to-emerald-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-blue-100 mt-1">Resultados completos - Personería y Contraloría</p>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-800 rounded-lg hover:bg-blue-50 font-medium shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Exportar Resultados
              <ChevronDown className={`w-4 h-4 transition-transform ${showExportOptions ? 'rotate-180' : ''}`} />
            </button>
            
            {showExportOptions && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border p-4 min-w-[320px] z-50">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-blue-800 mb-2 px-2">📤 EXPORTAR RESULTADOS COMPLETOS</div>
                  
                  <button 
                    onClick={exportarPDF} 
                    className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg border-l-4 border-blue-600 transition-all"
                  >
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">PDF - Reporte Completo</div>
                      <div className="text-xs text-gray-500">Personería y Contraloría juntos</div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={exportarJSON} 
                    className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg border-l-4 border-emerald-600 transition-all"
                  >
                    <FileDown className="w-5 h-5 text-emerald-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">JSON - Datos Completos</div>
                      <div className="text-xs text-gray-500">Estructura de datos</div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={exportarCSV} 
                    className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg border-l-4 border-blue-500 transition-all"
                  >
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">CSV - Hoja de Cálculo</div>
                      <div className="text-xs text-gray-500">Excel compatible</div>
                    </div>
                  </button>
                  
                  <div className="border-t my-2"></div>
                  
                  <button 
                    onClick={compartir} 
                    className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Share2 className="w-5 h-5 text-blue-700" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Compartir resultados</div>
                      <div className="text-xs text-gray-500">Redes sociales o copiar</div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={imprimir} 
                    className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Printer className="w-5 h-5 text-gray-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Imprimir resultados</div>
                      <div className="text-xs text-gray-500">Versión para impresión</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info banner */}
        <div className="mt-4 bg-blue-900/30 p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-200" />
          <p className="text-sm text-blue-100">
            Mostrando <span className="font-bold">todos los candidatos</span> de Personería y Contraloría en una sola vista
          </p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-emerald-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-blue-800" />
              </div>
              <div>
                <p className="text-sm text-blue-800 font-medium">Total Votos</p>
                <p className="text-2xl font-bold text-blue-800">{stats.totalVotos}</p>
                <p className="text-xs text-gray-600">emitidos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-800" />
              </div>
              <div>
                <p className="text-sm text-blue-800 font-medium">Personería</p>
                <p className="text-2xl font-bold text-blue-800">{stats.personeria.votos}</p>
                <p className="text-xs text-gray-600">{stats.personeria.candidatos} candidatos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-emerald-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Users className="w-5 h-5 text-emerald-800" />
              </div>
              <div>
                <p className="text-sm text-emerald-800 font-medium">Contraloría</p>
                <p className="text-2xl font-bold text-emerald-800">{stats.contraloria.votos}</p>
                <p className="text-xs text-gray-600">{stats.contraloria.candidatos} candidatos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-amber-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Trophy className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <p className="text-sm text-amber-800 font-medium">Ganadores</p>
                <p className="text-sm font-bold text-blue-800 truncate">
                  P: {stats.personeria.ganador?.name?.split(' ')[0] || 'N/A'}
                </p>
                <p className="text-sm font-bold text-emerald-800 truncate">
                  C: {stats.contraloria.ganador?.name?.split(' ')[0] || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles gráfico */}
      <div className="p-4 border-b bg-white">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-800">Vista:</span>
            <div className="flex gap-2">
              {['bar', 'horizontal'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md'
                      : 'text-blue-800 hover:bg-blue-50 border border-blue-200'
                  }`}
                >
                  {mode === 'bar' ? 'Vertical' : 'Horizontal'}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => setShowPercentages(!showPercentages)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              showPercentages 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {showPercentages ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showPercentages ? 'Ocultar %' : 'Mostrar %'}
          </button>
        </div>
      </div>

      {/* Gráfico */}
      <div className="p-6">
        <div className="h-96">
          {processedCandidates.todos.length > 0 ? (
            <Bar data={chartConfig.data} options={chartConfig.options} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">No hay datos para mostrar</div>
          )}
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-800 rounded"></div>
            <span>Personería</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-800 rounded"></div>
            <span>Contraloría</span>
          </div>
        </div>
      </div>

      {/* Tabla completa */}
      <div className="p-6 border-t bg-gradient-to-r from-blue-50 to-emerald-50">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Todos los Candidatos</h3>
        <div className="overflow-x-auto rounded-lg border border-blue-200 bg-white shadow-sm">
          {processedCandidates.todos.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-50 to-emerald-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Candidato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Votos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">% Cargo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">% Global</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {processedCandidates.todos.map((c, i) => {
                  const votosCargo = c.cargoClass === 'personeria' ? stats.personeria.votos : stats.contraloria.votos;
                  const porcentajeCargo = votosCargo > 0 ? ((c.votes || 0) / votosCargo * 100).toFixed(2) : '0.00';
                  const porcentajeGlobal = stats.totalVotos > 0 ? ((c.votes || 0) / stats.totalVotos * 100).toFixed(2) : '0.00';
                  const esGanador = (c.cargoClass === 'personeria' && c.id === stats.personeria.ganador?.id) ||
                                   (c.cargoClass === 'contraloria' && c.id === stats.contraloria.ganador?.id);
                  
                  return (
                    <tr key={c.id} className={`${esGanador ? 'bg-yellow-50' : ''} hover:bg-blue-50/50 transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          esGanador ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                          i === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          i === 1 ? 'bg-gray-100 text-gray-800 border border-gray-300' :
                          i === 2 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                          'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          {c.name || 'Sin nombre'}
                          {esGanador && <Award className="w-4 h-4 text-yellow-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          c.cargoClass === 'personeria' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {c.cargo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{c.votes || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{porcentajeCargo}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{porcentajeGlobal}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {esGanador ? (
                          <span className={`px-3 py-1 ${
                            c.cargoClass === 'personeria' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                          } text-xs font-medium rounded-full`}>
                            🏆 Ganador
                          </span>
                        ) : i < 3 ? (
                          <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-medium rounded-full border border-amber-200">
                            Top {i + 1}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-full border border-gray-200">
                            Participante
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">No hay candidatos para mostrar</div>
          )}
        </div>
      </div>

      {/* Resumen por cargo */}
      <div className="p-6 border-t bg-white">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Resumen por Cargo</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personería */}
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3">
              <h4 className="text-white font-semibold">Personería Estudiantil</h4>
            </div>
            <div className="p-4">
              {processedCandidates.personeria.length > 0 ? (
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-xs font-medium text-blue-800">#</th>
                      <th className="text-left py-2 text-xs font-medium text-blue-800">Candidato</th>
                      <th className="text-right py-2 text-xs font-medium text-blue-800">Votos</th>
                      <th className="text-right py-2 text-xs font-medium text-blue-800">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...processedCandidates.personeria]
                      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                      .map((c, idx) => {
                        const porcentaje = stats.personeria.votos > 0 
                          ? ((c.votes || 0) / stats.personeria.votos * 100).toFixed(1)
                          : '0.0';
                        return (
                          <tr key={c.id} className={idx === 0 ? 'bg-yellow-50' : 'hover:bg-blue-50'}>
                            <td className="py-2 text-sm">{idx + 1}</td>
                            <td className="py-2 text-sm font-medium">
                              {c.name || 'Sin nombre'}
                              {idx === 0 && <span className="ml-2 text-yellow-600">🏆</span>}
                            </td>
                            <td className="py-2 text-sm text-right">{c.votes || 0}</td>
                            <td className="py-2 text-sm text-right">{porcentaje}%</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay candidatos de Personería</p>
              )}
            </div>
          </div>

          {/* Contraloría */}
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-3">
              <h4 className="text-white font-semibold">Contraloría Estudiantil</h4>
            </div>
            <div className="p-4">
              {processedCandidates.contraloria.length > 0 ? (
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-xs font-medium text-emerald-800">#</th>
                      <th className="text-left py-2 text-xs font-medium text-emerald-800">Candidato</th>
                      <th className="text-right py-2 text-xs font-medium text-emerald-800">Votos</th>
                      <th className="text-right py-2 text-xs font-medium text-emerald-800">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...processedCandidates.contraloria]
                      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                      .map((c, idx) => {
                        const porcentaje = stats.contraloria.votos > 0 
                          ? ((c.votes || 0) / stats.contraloria.votos * 100).toFixed(1)
                          : '0.0';
                        return (
                          <tr key={c.id} className={idx === 0 ? 'bg-yellow-50' : 'hover:bg-emerald-50'}>
                            <td className="py-2 text-sm">{idx + 1}</td>
                            <td className="py-2 text-sm font-medium">
                              {c.name || 'Sin nombre'}
                              {idx === 0 && <span className="ml-2 text-yellow-600">🏆</span>}
                            </td>
                            <td className="py-2 text-sm text-right">{c.votes || 0}</td>
                            <td className="py-2 text-sm text-right">{porcentaje}%</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay candidatos de Contraloría</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}