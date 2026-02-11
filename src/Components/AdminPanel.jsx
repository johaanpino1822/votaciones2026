import React, { useState } from 'react';
import { Plus, Users, Vote, Image as ImageIcon, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Button } from './ui/Buttom';
import { Card } from './ui/Card';
import toast from 'react-hot-toast';

export function AdminPanel() {
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    number: '',
    position: 'personeria',
    photoUrl: '',  // <-- Este campo SÍ existe
  });

  const { candidates, addCandidate, isVotingOpen, toggleVoting } = useStore();

  const handleAddCandidate = (e) => {
    e.preventDefault();
    
    if (!newCandidate.name.trim() || !newCandidate.number) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    addCandidate({
      ...newCandidate,
      number: parseInt(newCandidate.number),
      // photoUrl ya está incluido aquí
    });
    
    toast.success('Candidato agregado exitosamente');
    setNewCandidate({
      name: '',
      number: '',
      position: 'personeria',
      photoUrl: '',  // <-- Se limpia el campo
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header de administración */}
      <div className="mb-8 bg-gradient-to-r from-blue-800 to-indigo-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Panel Administrativo</h1>
            <p className="text-blue-100 text-sm mt-1">Gestión completa del sistema de votación</p>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-800/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Total Candidatos</h3>
              <p className="text-3xl font-bold text-blue-800">{candidates.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Vote className="w-6 h-6 text-emerald-800" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Estado de Votación</h3>
              <p className={`text-3xl font-bold ${
                isVotingOpen ? 'text-emerald-800' : 'text-red-600'
              }`}>
                {isVotingOpen ? 'ABIERTA' : 'CERRADA'}
              </p>
            </div>
          </div>
          <Button
            variant={isVotingOpen ? "danger" : "success"}
            onClick={toggleVoting}
            className="w-full mt-4 bg-gradient-to-r from-blue-800 to-emerald-800 hover:from-blue-900 hover:to-emerald-900"
          >
            {isVotingOpen ? '🔒 Cerrar Votación' : '🔓 Abrir Votación'}
          </Button>
        </Card>
      </div>

      {/* FORMULARIO SIMPLIFICADO - AQUÍ ESTÁ EL CAMPO DE URL */}
      <Card className="mb-8 p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-800" />
          Agregar Nuevo Candidato
        </h2>
        
        <form onSubmit={handleAddCandidate}>
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Candidato *
              </label>
              <input
                type="text"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ingresa el nombre completo"
                required
              />
            </div>

            {/* Número */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número del Candidato *
              </label>
              <input
                type="number"
                value={newCandidate.number}
                onChange={(e) => setNewCandidate({ ...newCandidate, number: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ejemplo: 1"
                required
              />
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo *
              </label>
              <select
                value={newCandidate.position}
                onChange={(e) => setNewCandidate({ ...newCandidate, position: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="personeria">Personería</option>
                <option value="contraloria">Contraloría</option>
                <option value="representante">Representante Estudiantil</option>
              </select>
            </div>

            {/* =========== AQUÍ ESTÁ EL CAMPO DE URL DE LA FOTO =========== */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-800" />
                URL de la Foto del Candidato
              </label>
              <input
                type="url"
                value={newCandidate.photoUrl}
                onChange={(e) => setNewCandidate({ ...newCandidate, photoUrl: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://ejemplo.com/foto-del-candidato.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Opcional. Ejemplo: https://images.unsplash.com/photo-1535713875002-d1d0cf377fde
              </p>
            </div>
            {/* =========== FIN DEL CAMPO DE URL =========== */}

            {/* Vista previa si hay URL */}
            {newCandidate.photoUrl && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-2">Vista previa de la foto:</p>
                <img
                  src={newCandidate.photoUrl}
                  alt="Vista previa"
                  className="max-w-xs h-auto rounded-lg border border-gray-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=Error+en+la+URL';
                    toast.error('No se pudo cargar la imagen. Verifica la URL.');
                  }}
                />
              </div>
            )}

            {/* Botón de enviar */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-800 to-emerald-800 hover:from-blue-900 hover:to-emerald-900 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar Candidato
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* LISTA DE CANDIDATOS */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-800" />
          Candidatos Registrados ({candidates.length})
        </h2>
        
        {candidates.length === 0 ? (
          <Card className="p-8 text-center border border-gray-200 shadow-sm">
            <p className="text-gray-500">No hay candidatos registrados. Agrega el primero usando el formulario.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <Card key={candidate.id} className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                {/* Mostrar la foto del candidato */}
                <div className="h-48 bg-gradient-to-br from-blue-50 to-emerald-50 relative overflow-hidden">
                  <img
                    src={candidate.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=300&fit=crop'}
                    alt={candidate.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-800 to-emerald-800 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                    #{candidate.number}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Cargo:</span>
                      <span className="text-sm text-blue-800 font-medium capitalize">
                        {candidate.position}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Votos:</span>
                      <span className="text-sm text-emerald-800 font-bold">
                        {candidate.votes || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Mostrar la URL de la foto si existe */}
                  {candidate.photoUrl && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-medium text-blue-800 mb-1">Foto URL:</p>
                      <p className="text-xs text-blue-600 truncate">{candidate.photoUrl}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}