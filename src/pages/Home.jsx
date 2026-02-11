import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card } from '../Components/ui/Card';
import { 
  Shield, 
  Lock, 
  BarChart3, 
  Zap, 
  Vote, 
  Users, 
  TrendingUp,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export function Home() {
  const { user, isVotingOpen, votingStats, timeRemaining, candidates } = useStore();

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Votación Certificada',
      description: 'Sistema blockchain-verifiable con auditoría en tiempo real',
      color: 'from-blue-800 to-emerald-800',
      bgColor: 'bg-gradient-to-r from-blue-50 to-emerald-50',
      points: ['Encriptación end-to-end', 'Trail de auditoría completo', 'Certificación ISO 27001']
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analítica en Vivo',
      description: 'Dashboard interactivo con métricas avanzadas y predicciones',
      color: 'from-blue-700 to-emerald-700',
      bgColor: 'bg-gradient-to-r from-blue-50/80 to-emerald-50/80',
      points: ['Gráficos en tiempo real', 'Análisis predictivo', 'Reportes automáticos']
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Seguridad Multinivel',
      description: 'Autenticación biométrica y protocolos de seguridad militar',
      color: 'from-blue-800 to-emerald-800',
      bgColor: 'bg-gradient-to-r from-blue-50 to-emerald-50',
      points: ['2FA obligatorio', 'IP Whitelisting', 'Detección de anomalías']
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Experiencia UX Premium',
      description: 'Interfaz diseñada para máxima accesibilidad y velocidad',
      color: 'from-blue-700 to-emerald-700',
      bgColor: 'bg-gradient-to-r from-blue-50/80 to-emerald-50/80',
      points: ['100% Responsive', 'WCAG 2.1 AA', 'Load time < 500ms']
    }
  ];

  const stats = [
    { 
      label: 'Votos Totales', 
      value: votingStats?.totalVotes || 0,
      icon: <Vote className="w-5 h-5" />,
      trend: votingStats?.trends?.hour?.up ? 'up' : 'down',
      change: votingStats?.trends?.hour?.change || '0%',
      color: 'text-blue-800',
      bgColor: 'bg-gradient-to-r from-blue-50 to-blue-100'
    },
    { 
      label: 'Participación Única', 
      value: votingStats?.uniqueVoters || 0,
      icon: <Users className="w-5 h-5" />,
      trend: votingStats?.trends?.day?.up ? 'up' : 'down',
      change: votingStats?.trends?.day?.change || '0%',
      color: 'text-emerald-800',
      bgColor: 'bg-gradient-to-r from-emerald-50 to-emerald-100'
    },
    { 
      label: 'Tasa de Votación', 
      value: votingStats?.votingRate || '0%',
      icon: <TrendingUp className="w-5 h-5" />,
      trend: votingStats?.trends?.week?.up ? 'up' : 'down',
      change: votingStats?.trends?.week?.change || '0%',
      color: 'text-blue-700',
      bgColor: 'bg-gradient-to-r from-blue-100/50 to-emerald-100/50'
    },
    { 
      label: 'Tiempo Restante', 
      value: timeRemaining ? `${timeRemaining.hours}h ${timeRemaining.minutes}m` : 'N/A',
      icon: <Clock className="w-5 h-5" />,
      status: isVotingOpen ? 'active' : 'closed',
      color: isVotingOpen ? 'text-emerald-800' : 'text-blue-800',
      bgColor: isVotingOpen ? 'bg-gradient-to-r from-emerald-50 to-green-50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'
    }
  ];

  const candidateCount = candidates?.filter(c => c.active !== false).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-emerald-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            {/* Badge de estado */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-200 rounded-full mb-8"
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${isVotingOpen ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
              <span className="text-sm font-medium text-blue-700">
                {isVotingOpen ? 'VOTACIÓN EN CURSO' : 'VOTACIÓN CERRADA'}
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-800 via-blue-700 to-emerald-800 bg-clip-text text-transparent">
                Elecciones Estudiantiles
              </span>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mt-4">
                I.E.F.A.G 2026
              </div>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-800/80 mb-10 max-w-4xl mx-auto leading-relaxed">
              Plataforma de votación digital certificada donde tu voz construye el futuro institucional. 
              Transparencia, seguridad y tecnología de vanguardia en cada voto.
            </p>

            {/* Stats Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex flex-wrap justify-center gap-6 mb-12"
            >
              <div className="text-center px-4">
                <div className="text-3xl font-bold text-blue-800">{candidateCount}</div>
                <div className="text-sm text-blue-700">Candidatos Activos</div>
              </div>
              <div className="text-center px-4">
                <div className="text-3xl font-bold text-emerald-800">{votingStats?.positions?.length || 2}</div>
                <div className="text-sm text-emerald-700">Cargos Electivos</div>
              </div>
              <div className="text-center px-4">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-emerald-800 bg-clip-text text-transparent">
                  {isVotingOpen ? 'En Vivo' : 'Finalizado'}
                </div>
                <div className="text-sm text-blue-700">Estado del Sistema</div>
              </div>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {!user ? (
                <>
                  <Link
                    to="/voting"
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-800 to-emerald-800 rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <Sparkles className="w-5 h-5 mr-3" />
                    Iniciar Sesión para Votar
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <Link
                    to="/results"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-800 bg-white border-2 border-blue-200 rounded-xl hover:border-emerald-300 hover:shadow-xl transition-all duration-300"
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    Explorar Resultados
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/voting"
                    className={`group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
                      isVotingOpen 
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600' 
                        : 'bg-gradient-to-r from-blue-800 to-emerald-800'
                    }`}
                  >
                    {isVotingOpen ? (
                      <>
                        <Vote className="w-5 h-5 mr-3" />
                        Ir al Sistema de Votación
                      </>
                    ) : (
                      <>
                        <Award className="w-5 h-5 mr-3" />
                        Ver Resultados Finales
                      </>
                    )}
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <Link
                    to="/results"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-800 bg-white border-2 border-blue-200 rounded-xl hover:border-emerald-300 hover:shadow-xl transition-all duration-300"
                  >
                    <TrendingUp className="w-5 h-5 mr-3" />
                    Ver Estadísticas
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Live Stats Section */}
      {user && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-blue-800 flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    Métricas en Tiempo Real
                  </h2>
                  <p className="text-blue-700/80 mt-2">
                    Seguimiento activo del proceso electoral
                  </p>
                </div>
                {isVotingOpen && (
                  <div className="text-sm text-blue-800 font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Actualizando en tiempo real
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index + 0.4 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="p-6 bg-gradient-to-r from-blue-50/50 to-emerald-50/50 backdrop-blur-sm border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                          <div className={stat.color}>
                            {stat.icon}
                          </div>
                        </div>
                        {stat.trend && (
                          <div className={`flex items-center text-sm font-medium ${
                            stat.trend === 'up' ? 'text-emerald-600' : 'text-blue-600'
                          }`}>
                            {stat.trend === 'up' ? '↗' : '↘'}
                            {stat.change}
                          </div>
                        )}
                      </div>
                      <div className={`text-3xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
                      <div className="text-blue-700 font-medium">{stat.label}</div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-emerald-50 text-blue-800 rounded-full mb-6 border border-blue-200">
              <Sparkles className="w-4 h-4 mr-2" />
              Tecnología de Vanguardia
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-800 mb-6">
              Por qué elegir nuestra plataforma
            </h2>
            <p className="text-xl text-blue-700/80 max-w-3xl mx-auto">
              Combinamos seguridad bancaria con experiencia de usuario premium para revolucionar la democracia digital
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.3 }}
                whileHover={{ y: -8 }}
              >
                <Card className="p-8 h-full bg-white border border-blue-100 hover:shadow-2xl hover:border-blue-300 transition-all duration-500">
                  <div className="flex items-start gap-6">
                    <div className={`p-4 rounded-2xl ${feature.bgColor} border border-blue-200`}>
                      <div className={`bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-blue-800 mb-3">{feature.title}</h3>
                      <p className="text-blue-700/80 mb-6">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.points.map((point, idx) => (
                          <li key={idx} className="flex items-center text-blue-700">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50/70 to-emerald-50/70">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-blue-800 mb-6">Proceso Electoral en 4 Pasos</h2>
            <p className="text-xl text-blue-700/80 max-w-2xl mx-auto">
              Desde la autenticación hasta la certificación, cada paso está optimizado
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Autenticación Segura', desc: 'Verificación biométrica de identidad' },
              { step: '02', title: 'Selección de Candidatos', desc: 'Interfaz intuitiva con información completa' },
              { step: '03', title: 'Confirmación del Voto', desc: 'Doble verificación y encriptación' },
              { step: '04', title: 'Certificación del Proceso', desc: 'Certificado digital y auditoría' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 * index }}
                className="relative"
              >
                <Card className="p-8 text-center bg-gradient-to-r from-white to-blue-50/50 border border-blue-100">
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-800 to-emerald-800 bg-clip-text text-transparent mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-blue-800 mb-3">{item.title}</h3>
                  <p className="text-blue-700/80">{item.desc}</p>
                </Card>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 w-8 h-0.5 bg-gradient-to-r from-blue-200 to-emerald-200 transform translate-x-4" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-700 to-emerald-800" />
        {/* Patrón de puntos alternativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8 border border-white/30">
              <Award className="w-5 h-5 text-white mr-2" />
              <span className="text-white font-medium">Plataforma Certificada</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Tu voto, nuestra democracia
            </h2>
            
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Cada voto cuenta en la construcción de una comunidad estudiantil más fuerte y representativa.
              Ejerce tu derecho con la confianza de un sistema diseñado para la excelencia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={user ? "/voting" : "/voting"}
                className="group inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-blue-800 bg-white rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                {user ? 'Continuar al Dashboard' : 'Comenzar a Votar'}
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
              </Link>
              
              <Link
                to="/results"
                className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Explorar Resultados
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-blue-900 to-blue-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Vote className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                Sistema Electoral I.E.F.A.G
              </h3>
              <p className="text-blue-200">Plataforma de votación digital de última generación</p>
            </div>

            <div className="mb-10">
              <h4 className="text-lg font-semibold mb-6 text-emerald-200">Desarrollado con excelencia por</h4>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-blue-200">
                <div className="text-center">
                  <div className="font-bold text-xl">Johaan David</div>
                  <div className="text-blue-300 text-sm">Monsalvel Pino</div>
                  <div className="text-blue-400 text-xs mt-1">Arquitecto Full-Stack</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
                <div className="text-center">
                  <div className="font-bold text-xl">John Fernando</div>
                  <div className="text-blue-300 text-sm">Jaramillo Berrio</div>
                  <div className="text-blue-400 text-xs mt-1">Ingeniero de Seguridad</div>
                </div>
              </div>
            </div>

            <div className="border-t border-blue-800 pt-8">
              <p className="text-blue-300">
                Sistema de Votación Electrónica I.E.F.A.G © 2025 • Versión 3.0 • Certificado ISO 27001
              </p>
              <p className="text-sm text-blue-400 mt-2">
                Todos los derechos reservados • Sistema auditado y verificado
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}