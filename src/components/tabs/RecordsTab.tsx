
import React from 'react';
import CandidateChart from '@/components/CandidateChart';
import VoteDataCard from '@/components/VoteDataCard';
import { TSEBoletim } from '@/types/tse';

interface RecordsTabProps {
  voteRecords: TSEBoletim[];
  onRegister: (data: TSEBoletim) => void;
}

const RecordsTab = ({ voteRecords, onRegister }: RecordsTabProps) => {
  if (voteRecords.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          Nenhum Boletim TSE Processado
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Comece escaneando um QR code oficial do TSE para processar e validar boletins de urna.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-gray-900">
          Todos os Registros ({voteRecords.length})
        </h3>
        <div className="text-sm text-gray-500">
          Total: {voteRecords.length} boletins processados
        </div>
      </div>
      
      {/* Gráficos de Candidatos */}
      <CandidateChart boletins={voteRecords} />
      
      {/* Lista de Boletins */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {voteRecords.map((record) => (
          <VoteDataCard 
            key={record.hash} 
            data={record} 
            onRegister={onRegister}
          />
        ))}
      </div>
    </div>
  );
};

export default RecordsTab;
