import React, { useState } from 'react';
import { Plus, Users, Vote, Image as ImageIcon } from 'lucide-react';
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Total Candidatos</h3>
              <p className="text-3xl font-bold text-blue-600">{candidates.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Vote className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Estado de Votación</h3>
              <p className="text-3xl font-bold text-green-600">
                {isVotingOpen ? 'Abierta' : 'Cerrada'}
              </p>
            </div>
          </div>
          <Button
            variant={isVotingOpen ? "danger" : "success"}
            onClick={toggleVoting}
            className="w-full mt-4"
          >
            {isVotingOpen ? 'Cerrar Votación' : 'Abrir Votación'}
          </Button>
        </Card>
      </div>

      {/* FORMULARIO SIMPLIFICADO - AQUÍ ESTÁ EL CAMPO DE URL */}
      <Card className="mb-8 p-6">
        <h2 className="text-2xl font-bold mb-6">Agregar Nuevo Candidato</h2>
        
        <form onSubmit={handleAddCandidate}>
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium mb-2">Nombre del Candidato *</label>
              <input
                type="text"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Ingresa el nombre completo"
                required
              />
            </div>

            {/* Número */}
            <div>
              <label className="block text-sm font-medium mb-2">Número del Candidato *</label>
              <input
                type="number"
                value={newCandidate.number}
                onChange={(e) => setNewCandidate({ ...newCandidate, number: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Ejemplo: 1"
                required
              />
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-sm font-medium mb-2">Cargo *</label>
              <select
                value={newCandidate.position}
                onChange={(e) => setNewCandidate({ ...newCandidate, position: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="personeria">Personería</option>
                <option value="contraloria">Contraloría</option>
                <option value="representante">Representante Estudiantil</option>
              </select>
            </div>

            {/* =========== AQUÍ ESTÁ EL CAMPO DE URL DE LA FOTO =========== */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <ImageIcon className="inline w-4 h-4 mr-2" />
                URL de la Foto del Candidato
              </label>
              <input
                type="url"
                value={newCandidate.photoUrl}
                onChange={(e) => setNewCandidate({ ...newCandidate, photoUrl: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="https://ejemplo.com/foto-del-candidato.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Opcional. Ejemplo: https://images.unsplash.com/photo-1535713875002-d1d0cf377fde
              </p>
            </div>
            {/* =========== FIN DEL CAMPO DE URL =========== */}

            {/* Vista previa si hay URL */}
            {newCandidate.photoUrl && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium mb-2">Vista previa de la foto:</p>
                <img
                  src={newCandidate.photoUrl}
                  alt="Vista previa"
                  className="max-w-xs h-auto rounded-lg"
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
              <Button type="submit" className="w-full">
                <Plus className="w-5 h-5 mr-2" />
                Agregar Candidato
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* LISTA DE CANDIDATOS */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Candidatos Registrados ({candidates.length})</h2>
        
        {candidates.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No hay candidatos registrados. Agrega el primero usando el formulario.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <Card key={candidate.id} className="overflow-hidden">
                {/* Mostrar la foto del candidato */}
                <div className="h-48 bg-gray-200">
                  <img
                    src={candidate.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=300&fit=crop'}
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold">{candidate.name}</h3>
                  <p className="text-gray-600 mt-1">Número: {candidate.number}</p>
                  <p className="text-gray-600">Cargo: {candidate.position}</p>
                  <p className="text-gray-600">Votos: {candidate.votes || 0}</p>
                  
                  {/* Mostrar la URL de la foto si existe */}
                  {candidate.photoUrl && (
                    <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                      <p className="font-medium text-blue-800">Foto URL:</p>
                      <p className="text-blue-600 truncate">{candidate.photoUrl}</p>
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