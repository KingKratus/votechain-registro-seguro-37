
import React from 'react';
import QRCodeReader from '@/components/QRCodeReader';
import ValidationDetails from '@/components/ValidationDetails';
import NotificationCenter from '@/components/NotificationCenter';
import VoteDataCard from '@/components/VoteDataCard';
import BlockchainTester from '@/components/BlockchainTester';
import { TSEBoletim } from '@/types/tse';

interface ScannerTabProps {
  onScanResult: (data: TSEBoletim) => void;
  lastValidation: any;
  voteRecords: TSEBoletim[];
  onRegister: (data: TSEBoletim) => void;
}

const ScannerTab = ({ onScanResult, lastValidation, voteRecords, onRegister }: ScannerTabProps) => {
  return (
    <div className="space-y-6">
      {/* Testador de Blockchain */}
      <BlockchainTester />
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QRCodeReader onScanResult={onScanResult} />
        </div>
        <div className="space-y-4">
          {lastValidation && (
            <ValidationDetails validation={lastValidation} />
          )}
          <div className="lg:hidden">
            <NotificationCenter />
          </div>
        </div>
      </div>
      
      {voteRecords.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Boletins Processados Recentemente
            </h3>
            <div className="text-sm text-gray-500">
              {voteRecords.length} de {voteRecords.length} boletins
            </div>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {voteRecords.slice(-6).reverse().map((record) => (
              <VoteDataCard 
                key={record.hash} 
                data={record} 
                onRegister={onRegister}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannerTab;
