
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, MapPin } from 'lucide-react';

interface VoteData {
  secao: number;
  zona: number;
  municipio: string;
  estado: string;
  timestamp: string;
  hash: string;
  votos: {
    candidato1: number;
    candidato2: number;
    brancos: number;
    nulos: number;
  };
  status?: 'pending' | 'confirmed' | 'failed';
}

interface VoteDataCardProps {
  data: VoteData;
  onRegister: (data: VoteData) => void;
}

const VoteDataCard = ({ data, onRegister }: VoteDataCardProps) => {
  const totalVotos = Object.values(data.votos).reduce((sum, votes) => sum + votes, 0);
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900">
              Seção {data.secao} - Zona {data.zona}
            </span>
          </div>
          {data.status && (
            <Badge className={getStatusColor(data.status)}>
              {data.status === 'confirmed' && <CheckCircle className="w-3 h-3 mr-1" />}
              {data.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
              {data.status === 'confirmed' ? 'Confirmado' : 
               data.status === 'pending' ? 'Pendente' : 'Falhou'}
            </Badge>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="text-sm text-gray-600">
            {data.municipio}, {data.estado}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Candidato 1:</span>
                <span className="font-medium">{data.votos.candidato1}</span>
              </div>
              <div className="flex justify-between">
                <span>Candidato 2:</span>
                <span className="font-medium">{data.votos.candidato2}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Brancos:</span>
                <span className="font-medium">{data.votos.brancos}</span>
              </div>
              <div className="flex justify-between">
                <span>Nulos:</span>
                <span className="font-medium">{data.votos.nulos}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between font-semibold">
              <span>Total de Votos:</span>
              <span>{totalVotos}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-gray-500">
            Hash: {data.hash.substring(0, 20)}...
          </div>
          <div className="text-xs text-gray-500">
            {new Date(data.timestamp).toLocaleString('pt-BR')}
          </div>
        </div>

        {!data.status && (
          <button
            onClick={() => onRegister(data)}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
          >
            Registrar na Blockchain
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default VoteDataCard;
