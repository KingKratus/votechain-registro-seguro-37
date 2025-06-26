
import React from 'react';
import { ProcessingStats } from '@/types/tse';

interface HeroSectionProps {
  stats: ProcessingStats;
  totalVotes: number;
}

const HeroSection = ({ stats, totalVotes }: HeroSectionProps) => {
  return (
    <div className="mb-8 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl"></div>
      <div className="relative p-8 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Plataforma TSE Blockchain
        </h2>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-6">
          Sistema oficial de auditoria eleitoral descentralizada com tecnologia blockchain. 
          Validação rigorosa, segurança máxima e transparência total.
        </p>
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalProcessed}</div>
            <div className="text-sm text-gray-500 mt-1">Boletins Processados</div>
          </div>
          <div className="w-px h-12 bg-gray-300"></div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{totalVotes.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">Votos Validados</div>
          </div>
          <div className="w-px h-12 bg-gray-300"></div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.averageValidationScore}%</div>
            <div className="text-sm text-gray-500 mt-1">Score Médio</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
