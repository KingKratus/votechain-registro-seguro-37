import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, MapPin, Vote, Users } from 'lucide-react';
import { TSEBoletim } from '@/types/tse';

interface VoteDataCardProps {
  data: TSEBoletim;
  onRegister: (data: TSEBoletim) => void;
}

const VoteDataCard = ({ data, onRegister }: VoteDataCardProps) => {
  const totalVotos = data.dadosTSE?.totalComparecimento || 
    Object.values(data.votos).reduce((sum, votes) => sum + votes, 0);
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'invalid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      case 'invalid': return 'Inválido';
      default: return 'Novo';
    }
  };

  const candidatosVotos = Object.entries(data.votos)
    .filter(([key]) => key.startsWith('candidato_'))
    .sort((a, b) => b[1] - a[1]);

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
              {getStatusLabel(data.status)}
            </Badge>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="text-sm text-gray-600">
            {data.municipio}, {data.estado}
            {data.dadosTSE && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                TSE Turno {data.dadosTSE.turno}
              </span>
            )}
          </div>
          
          {data.dadosTSE && (
            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3 text-gray-500" />
                <span>Aptos: {data.dadosTSE.totalEleitoresAptos}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Vote className="w-3 h-3 text-gray-500" />
                <span>Comparecimento: {data.dadosTSE.totalComparecimento}</span>
              </div>
              <div>Faltas: {data.dadosTSE.totalFaltas}</div>
              <div>Data: {data.dadosTSE.dataEleicao}</div>
            </div>
          )}
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Votos por Candidato:</h4>
            <div className="grid grid-cols-1 gap-1 text-sm max-h-32 overflow-y-auto">
              {candidatosVotos.map(([candidato, votos]) => (
                <div key={candidato} className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {candidato.replace('candidato_', 'Candidato ')}:
                  </span>
                  <span className="font-medium">{votos}</span>
                </div>
              ))}
              
              {data.dadosTSE && (
                <>
                  <div className="flex justify-between items-center border-t pt-1">
                    <span className="text-gray-600">Brancos:</span>
                    <span className="font-medium">{data.dadosTSE.votosBrancos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nulos:</span>
                    <span className="font-medium">{data.dadosTSE.votosNulos}</span>
                  </div>
                </>
              )}
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
          {data.dadosTSE?.assinatura && (
            <div className="text-xs text-gray-500">
              Assinatura TSE: {data.dadosTSE.assinatura.substring(0, 20)}...
            </div>
          )}
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
