import React, { useState, useEffect } from 'react';
import { Plus, Users, Vote, Image as ImageIcon, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button } from './ui/Buttom';
import { Card } from './ui/Card';
import toast from 'react-hot-toast';

export function AdminPanel() {
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    number: '',
    position: 'personeria',
    photoUrl: '',
  });

  const { 
    candidates, 
    addCandidate, 
    isVotingOpen, 
    toggleVoting,
    loadCandidatesFromCloud,
    isLoading
  } = useStore();

  useEffect(() => {
    loadCandidatesFromCloud();
  }, []);

  const getPositionName = (position) => {
    switch(position) {
      case 'personeria': return 'Personería';
      case 'contraloria': return 'Contraloría';
      case 'representante': return 'Representante';
      default: return position;
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    
    if (!newCandidate.name.trim() || !newCandidate.number) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const numero = parseInt(newCandidate.number);
    
    // Verificación local rápida
    const existeEnMismoCargo = candidates.some(
      c => String(c.number) === String(numero) && c.position === newCandidate.position
    );

    if (existeEnMismoCargo) {
      toast.error(`El número ${numero} ya existe en ${getPositionName(newCandidate.position)}`);
      return;
    }
    
    try {
      await addCandidate({
        ...newCandidate,
        number: numero,
      });
      
      setNewCandidate({
        name: '',
        number: '',
        position: 'personeria',
        photoUrl: '',
      });
      
    } catch (error) {
      // El error ya se maneja en el store
    }
  };

  // Verificar disponibilidad en tiempo real
  const getNumberStatus = () => {
    if (!newCandidate.number) return null;
    
    const numero = parseInt(newCandidate.number);
    
    const enMismoCargo = candidates.find(
      c => String(c.number) === String(numero) && c.position === newCandidate.position
    );
    
    if (enMismoCargo) {
      return {
        disponible: false,
        mensaje: `❌ El número ${numero} ya está siendo usado en ${getPositionName(newCandidate.position)}`
      };
    }
    
    const enOtroCargo = candidates.find(
      c => String(c.number) === String(numero) && c.position !== newCandidate.position
    );
    
    if (enOtroCargo) {
      return {
        disponible: true,
        mensaje: `✅ El número ${numero} está disponible (ya existe en ${getPositionName(enOtroCargo.position)})`
      };
    }
    
    return {
      disponible: true,
      mensaje: `✅ El número ${numero} está disponible`
    };
  };

  const numberStatus = getNumberStatus();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-800 to-indigo-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Shield className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Panel Administrativo</h1>
        </div>
        
        <div className="bg-green-600/30 p-3 rounded-lg text-sm">
          <strong>ℹ️ REGLA:</strong> Puedes tener el MISMO número en DIFERENTES cargos.
          Ej: #1 en Personería, #1 en Contraloría y #1 en Representantes.
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-800">{candidates.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-800">
              {candidates.filter(c => c.position === 'personeria').length}
            </div>
            <div className="text-sm text-gray-600">Personería</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-800">
              {candidates.filter(c => c.position === 'contraloria').length}
            </div>
            <div className="text-sm text-gray-600">Contraloría</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-800">
              {candidates.filter(c => c.position === 'representante').length}
            </div>
            <div className="text-sm text-gray-600">Representantes</div>
          </div>
        </Card>
      </div>

      {/* Botón votación */}
      <Card className="mb-8 p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold">Estado votación:</span>
            <span className={`ml-2 font-bold ${isVotingOpen ? 'text-green-600' : 'text-red-600'}`}>
              {isVotingOpen ? 'ABIERTA' : 'CERRADA'}
            </span>
          </div>
          <Button
            onClick={toggleVoting}
            className={isVotingOpen ? 'bg-red-600' : 'bg-green-600'}
          >
            {isVotingOpen ? 'Cerrar' : 'Abrir'}
          </Button>
        </div>
      </Card>

      {/* Formulario */}
      <Card className="mb-8 p-6">
        <h2 className="text-xl font-bold mb-6">Agregar Candidato</h2>
        
        <form onSubmit={handleAddCandidate}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombre completo"
              value={newCandidate.name}
              onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            />

            <select
              value={newCandidate.position}
              onChange={(e) => setNewCandidate({...newCandidate, position: e.target.value})}
              className="w-full p-3 border rounded-lg"
            >
              <option value="personeria">Personería</option>
              <option value="contraloria">Contraloría</option>
              <option value="representante">Representante</option>
            </select>

            <div>
              <input
                type="number"
                placeholder="Número"
                value={newCandidate.number}
                onChange={(e) => setNewCandidate({...newCandidate, number: e.target.value})}
                className={`w-full p-3 border rounded-lg ${
                  numberStatus && !numberStatus.disponible 
                    ? 'border-red-500 bg-red-50' 
                    : numberStatus?.disponible 
                    ? 'border-green-500 bg-green-50'
                    : ''
                }`}
                required
              />
              {numberStatus && (
                <p className={`text-sm mt-1 ${numberStatus.disponible ? 'text-green-600' : 'text-red-600'}`}>
                  {numberStatus.mensaje}
                </p>
              )}
            </div>

            <input
              type="url"
              placeholder="URL de la foto (opcional)"
              value={newCandidate.photoUrl}
              onChange={(e) => setNewCandidate({...newCandidate, photoUrl: e.target.value})}
              className="w-full p-3 border rounded-lg"
            />

            <Button
              type="submit"
              disabled={!numberStatus?.disponible}
              className="w-full bg-blue-800 text-white py-3 rounded-lg disabled:opacity-50"
            >
              Agregar
            </Button>
          </div>
        </form>
      </Card>

      {/* Lista de candidatos */}
      <div className="space-y-8">
        {['personeria', 'contraloria', 'representante'].map(pos => {
          const posCandidates = candidates.filter(c => c.position === pos);
          if (posCandidates.length === 0) return null;

          return (
            <div key={pos}>
              <h3 className="text-xl font-bold mb-4 capitalize">{getPositionName(pos)}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {posCandidates.map(candidate => (
                  <Card key={candidate.id} className="overflow-hidden">
                    <img
                      src={candidate.photoUrl || 'https://via.placeholder.com/400x300?text=Sin+foto'}
                      alt={candidate.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Error'}
                    />
                    <div className="p-4">
                      <div className="font-bold">{candidate.name}</div>
                      <div className="text-sm text-gray-600">#{candidate.number}</div>
                      <div className="mt-2 font-semibold">Votos: {candidate.votes || 0}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}