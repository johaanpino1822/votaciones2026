import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  Vote, 
  Image as ImageIcon, 
  Filter, 
  Search, 
  Trash2, 
  Edit2,
  Download,
  Upload,
  Eye,
  EyeOff,
  Shield,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trophy
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../Components/ui/Buttom';
import { Card } from '../Components/ui/Card';
import toast from 'react-hot-toast';

export function AdminPanel() {
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    number: '',
    position: 'personeria',
    photoUrl: '',
    description: ''
  });

  const [isEditing, setIsEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState('');
  const [showPhotoPreview, setShowPhotoPreview] = useState(true);

  const { candidates, addCandidate, isVotingOpen, toggleVoting, removeCandidate, updateCandidate } = useStore();

  // Estadísticas
  const stats = useMemo(() => {
    const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
    const activeCandidates = candidates.filter(c => !c.inactive);
    const positions = [...new Set(candidates.map(c => c.position))];
    
    return {
      totalCandidates: candidates.length,
      activeCandidates: activeCandidates.length,
      totalVotes,
      positions: positions.length,
      leadingCandidate: candidates.length > 0 
        ? candidates.reduce((max, c) => (c.votes || 0) > (max.votes || 0) ? c : max)
        : null,
      averageVotes: totalVotes / candidates.length || 0
    };
  }, [candidates]);

  // Candidatos filtrados y ordenados
  const filteredCandidates = useMemo(() => {
    let filtered = candidates;
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.number.toString().includes(searchTerm) ||
        candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por posición
    if (positionFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.position === positionFilter);
    }
    
    // Filtrar inactivos
    if (!showInactive) {
      filtered = filtered.filter(candidate => !candidate.inactive);
    }
    
    // Ordenar
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return (b.votes || 0) - (a.votes || 0);
        case 'number':
          return a.number - b.number;
        case 'position':
          return a.position.localeCompare(b.position);
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    return filtered;
  }, [candidates, searchTerm, positionFilter, showInactive, sortBy]);

  const handleAddCandidate = (e) => {
    e.preventDefault();
    
    if (!newCandidate.name.trim() || !newCandidate.number) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar número único
    if (candidates.some(c => c.number === parseInt(newCandidate.number) && c.id !== isEditing)) {
      toast.error('Ya existe un candidato con este número');
      return;
    }

    // Validar URL de foto
    if (newCandidate.photoUrl && !isValidUrl(newCandidate.photoUrl)) {
      toast.error('Por favor ingresa una URL válida para la foto');
      return;
    }

    if (isEditing) {
      updateCandidate(isEditing, {
        ...newCandidate,
        number: parseInt(newCandidate.number)
      });
      toast.success('Candidato actualizado exitosamente');
    } else {
      addCandidate({
        ...newCandidate,
        number: parseInt(newCandidate.number),
        photoUrl: newCandidate.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop'
      });
      toast.success('Candidato agregado exitosamente');
    }

    // Reset form
    setNewCandidate({
      name: '',
      number: '',
      position: 'personeria',
      photoUrl: '',
      description: ''
    });
    setIsEditing(null);
  };

  const handleEditCandidate = (candidate) => {
    setIsEditing(candidate.id);
    setNewCandidate({
      name: candidate.name,
      number: candidate.number,
      position: candidate.position,
      photoUrl: candidate.photoUrl || '',
      description: candidate.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCandidate = (id, name) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${name}?`)) {
      removeCandidate(id);
      toast.success('Candidato eliminado exitosamente');
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(candidates, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `candidatos-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Datos exportados exitosamente');
  };

  const handleImportData = () => {
    try {
      const imported = JSON.parse(importData);
      // Validar estructura
      if (!Array.isArray(imported)) {
        throw new Error('Los datos deben ser un array');
      }
      
      // Aquí deberías implementar la lógica para importar
      toast.success(`Listo para importar ${imported.length} candidatos`);
      setImportData('');
      setIsImporting(false);
    } catch (error) {
      toast.error('Error al procesar los datos de importación');
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const positions = ['all', ...new Set(candidates.map(c => c.position))];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Candidatos</p>
              <p className="text-3xl font-bold text-blue-700">{stats.totalCandidates}</p>
              <p className="text-xs text-blue-500 mt-1">{stats.activeCandidates} activos</p>
            </div>
            <Users className="w-10 h-10 text-blue-400 opacity-70" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Votos Totales</p>
              <p className="text-3xl font-bold text-green-700">{stats.totalVotes}</p>
              <p className="text-xs text-green-500 mt-1">{stats.averageVotes.toFixed(1)} promedio</p>
            </div>
            <BarChart3 className="w-10 h-10 text-green-400 opacity-70" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Cargos Diferentes</p>
              <p className="text-3xl font-bold text-purple-700">{stats.positions}</p>
              <p className="text-xs text-purple-500 mt-1">Distribución por posición</p>
            </div>
            <Shield className="w-10 h-10 text-purple-400 opacity-70" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">Estado Votación</p>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${isVotingOpen ? 'text-green-600' : 'text-red-600'}`}>
                  {isVotingOpen ? 'Abierta' : 'Cerrada'}
                </span>
                {isVotingOpen ? 
                  <CheckCircle className="w-5 h-5 text-green-500" /> : 
                  <XCircle className="w-5 h-5 text-red-500" />
                }
              </div>
              <Button
                variant={isVotingOpen ? "danger" : "success"}
                onClick={toggleVoting}
                size="sm"
                className="mt-2 w-full"
              >
                {isVotingOpen ? 'Cerrar Votación' : 'Abrir Votación'}
              </Button>
            </div>
            <Vote className="w-10 h-10 text-orange-400 opacity-70" />
          </div>
        </Card>
      </div>

      {/* Panel principal con tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de candidato */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditing ? 'Editar Candidato' : 'Agregar Nuevo Candidato'}
              </h2>
              {isEditing && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(null);
                    setNewCandidate({
                      name: '',
                      number: '',
                      position: 'personeria',
                      photoUrl: '',
                      description: ''
                    });
                  }}
                >
                  Cancelar Edición
                </Button>
              )}
            </div>

            <form onSubmit={handleAddCandidate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información básica */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Juan Pérez Rodríguez"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Número de candidato *
                    </label>
                    <input
                      type="number"
                      value={newCandidate.number}
                      onChange={(e) => setNewCandidate({ ...newCandidate, number: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Cargo *
                    </label>
                    <select
                      value={newCandidate.position}
                      onChange={(e) => setNewCandidate({ ...newCandidate, position: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    >
                      <option value="personeria">Personería</option>
                      <option value="contraloria">Contraloría</option>
                      <option value="representante">Representante Estudiantil</option>
                      <option value="presidente">Presidente de Curso</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      value={newCandidate.description}
                      onChange={(e) => setNewCandidate({ ...newCandidate, description: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Breve descripción del candidato..."
                      rows="3"
                    />
                  </div>
                </div>

                {/* Foto del candidato */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      <ImageIcon className="inline w-4 h-4 mr-2" />
                      URL de la Foto del Candidato
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newCandidate.photoUrl}
                        onChange={(e) => setNewCandidate({ ...newCandidate, photoUrl: e.target.value })}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="https://ejemplo.com/foto-candidato.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPhotoPreview(!showPhotoPreview)}
                        className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        {showPhotoPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Recomendado: imagen cuadrada (1:1) de al menos 300x300px
                    </p>
                  </div>

                  {/* Botones de ejemplo rápido */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-blue-800 mb-2">
                      ¿Necesitas una imagen?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNewCandidate({
                            ...newCandidate,
                            photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop'
                          });
                        }}
                        className="text-sm bg-white text-blue-700 px-3 py-2 rounded border border-blue-200 hover:bg-blue-50 transition"
                      >
                        Ejemplo Masculino
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewCandidate({
                            ...newCandidate,
                            photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop'
                          });
                        }}
                        className="text-sm bg-white text-pink-700 px-3 py-2 rounded border border-pink-200 hover:bg-pink-50 transition"
                      >
                        Ejemplo Femenino
                      </button>
                    </div>
                  </div>

                  {/* Vista previa de la foto */}
                  <AnimatePresence>
                    {showPhotoPreview && newCandidate.photoUrl && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="text-sm font-medium mb-3 text-gray-700">Vista previa:</p>
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={newCandidate.photoUrl}
                                alt="Vista previa"
                                className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/150?text=Error';
                                  toast.error('No se pudo cargar la imagen');
                                }}
                              />
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <ImageIcon className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">Imagen cargada</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Esta será la foto que verán los votantes
                              </p>
                              {isValidUrl(newCandidate.photoUrl) && (
                                <p className="text-xs text-green-600 mt-2">
                                  ✓ URL válida detectada
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <p>* Campos obligatorios</p>
                  </div>
                  <Button
                    type="submit"
                    className="px-8"
                    variant={isEditing ? "warning" : "primary"}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {isEditing ? 'Actualizar Candidato' : 'Agregar Candidato'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Panel de importación/exportación */}
          <Card className="mt-6 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Gestión de Datos</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsImporting(!isImporting)}
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {isImporting && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <AlertCircle className="w-5 h-5 text-yellow-500 inline mr-2" />
                    <span className="text-sm font-medium text-yellow-700">
                      Importación de datos
                    </span>
                    <textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      className="w-full mt-3 p-3 border border-gray-300 rounded-lg text-sm font-mono"
                      placeholder='[{"name": "Candidato", "number": 1, "position": "personeria", "photoUrl": "..."}]'
                      rows="4"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        variant="ghost"
                        onClick={() => setIsImporting(false)}
                        size="sm"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleImportData}
                        size="sm"
                      >
                        Procesar Importación
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Panel de filtros y estadísticas */}
        <div className="space-y-6">
          {/* Filtros de búsqueda */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Filtros y Búsqueda</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  <Search className="inline w-4 h-4 mr-2" />
                  Buscar candidato
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Nombre, número o cargo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  <Filter className="inline w-4 h-4 mr-2" />
                  Filtrar por cargo
                </label>
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  {positions.map(pos => (
                    <option key={pos} value={pos}>
                      {pos === 'all' ? 'Todos los cargos' : pos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="name">Nombre (A-Z)</option>
                  <option value="number">Número</option>
                  <option value="votes">Votos (mayor a menor)</option>
                  <option value="position">Cargo</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showInactive"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="showInactive" className="text-sm text-gray-700">
                  Mostrar candidatos inactivos
                </label>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Mostrando {filteredCandidates.length} de {candidates.length} candidatos
              </p>
            </div>
          </Card>

          {/* Estadísticas rápidas */}
          <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Resumen Rápido</h3>
            
            <div className="space-y-3">
              {stats.leadingCandidate && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Candidato líder</p>
                    <p className="font-bold text-gray-900">{stats.leadingCandidate.name}</p>
                    <p className="text-xs text-gray-500">{stats.leadingCandidate.votes || 0} votos</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Candidatos activos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCandidates}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Votos promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageVotes.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Lista de candidatos */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Lista de Candidatos ({filteredCandidates.length})
          </h2>
          <div className="text-sm text-gray-500">
            Última actualización: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {filteredCandidates.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No se encontraron candidatos
              </h3>
              <p className="text-gray-500">
                {searchTerm || positionFilter !== 'all' 
                  ? 'Intenta con otros filtros de búsqueda' 
                  : 'Agrega tu primer candidato usando el formulario'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredCandidates.map((candidate) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <Card className={`overflow-hidden h-full transition-all hover:shadow-lg ${
                    candidate.inactive ? 'opacity-70' : ''
                  }`}>
                    {/* Encabezado con número y estado */}
                    <div className="relative">
                      <div className="h-48 bg-gradient-to-r from-blue-100 to-purple-100 relative overflow-hidden">
                        <img
                          src={candidate.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=300&fit=crop'}
                          alt={candidate.name}
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x300?text=Sin+imagen';
                          }}
                        />
                        <div className="absolute top-4 right-4">
                          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            #{candidate.number}
                          </span>
                        </div>
                        {candidate.inactive && (
                          <div className="absolute top-4 left-4">
                            <span className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium">
                              Inactivo
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información del candidato */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 truncate">
                            {candidate.name}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {candidate.position}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {candidate.votes || 0}
                          </div>
                          <div className="text-xs text-gray-500">votos</div>
                        </div>
                      </div>

                      {candidate.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {candidate.description}
                        </p>
                      )}

                      {/* Acciones */}
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditCandidate(candidate)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteCandidate(candidate.id, candidate.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Información adicional */}
                      {candidate.photoUrl && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 truncate">
                            <ImageIcon className="inline w-3 h-3 mr-1" />
                            {candidate.photoUrl.substring(0, 50)}...
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}