import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfessionalHeader from '@/components/ProfessionalHeader';  
import QRScanner from '@/components/QRScanner';
import VoteDataCard from '@/components/VoteDataCard';
import Dashboard from '@/components/Dashboard';
import RealTimeStats from '@/components/RealTimeStats';
import SecurityInfo from '@/components/SecurityInfo';
import ValidationDetails from '@/components/ValidationDetails';
import DataExport from '@/components/DataExport';
import NotificationCenter from '@/components/NotificationCenter';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { TSEBoletim } from '@/types/tse';
import { dataManager } from '@/utils/dataManager';
import { validateTSEBoletim } from '@/utils/tseValidator';
import QRCodeReader from './../components/QRCodeReader';
import SettingsModal from './../components/SettingsModal';
import HelpModal from './../components/HelpModal';
import CandidateChart from './../components/CandidateChart';

const Index = () => {
  const [voteRecords, setVoteRecords] = useState<TSEBoletim[]>([]);
  const [lastValidation, setLastValidation] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { toast } = useToast();
  const wallet = useWallet();

  // Carregar dados do armazenamento persistente na inicialização
  useEffect(() => {
    loadPersistedData();
  }, []);

  const loadPersistedData = async () => {
    try {
      const { StorageService } = await import('@/services/storageService');
      const cachedRecords = await StorageService.getAllBoletins();
      setVoteRecords(cachedRecords);
    } catch (error) {
      console.error('Erro ao carregar dados persistentes:', error);
      // Fallback para dados em memória
      const cachedRecords = dataManager.getAllBoletins();
      setVoteRecords(cachedRecords);
    }
  };

  const handleScanResult = async (data: TSEBoletim) => {
    console.log('Novo boletim recebido:', data);
    
    // Usar o gerenciador de dados para processar o boletim
    const result = dataManager.addBoletim(data);
    
    if (result.success && result.data) {
      // Salvar no armazenamento persistente
      try {
        const { StorageService } = await import('@/services/storageService');
        await StorageService.saveBoletim(result.data);
      } catch (error) {
        console.error('Erro ao salvar no armazenamento persistente:', error);
      }
      
      // Atualizar a lista local
      await loadPersistedData();
      
      // Armazenar resultado da validação para exibição
      const validation = validateTSEBoletim(data);
      setLastValidation(validation);
      
      toast({
        title: "Boletim TSE Processado",
        description: result.message,
      });
    } else {
      toast({
        title: "Erro no Processamento",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleRegisterVote = async (data: TSEBoletim) => {
    // Atualizar a lista local após registro
    await loadPersistedData();
  };

  // Calcular estatísticas usando o gerenciador de dados
  const stats = dataManager.getStats();
  const totalVotes = voteRecords.reduce((sum, record) => {
    return sum + (record.dadosTSE?.totalComparecimento || 
      Object.values(record.votos).reduce((s, v) => s + v, 0));
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <ProfessionalHeader 
        onSettingsClick={() => setShowSettings(true)}
        onHelpClick={() => setShowHelp(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
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

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-4/5 mx-auto h-12">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex items-center space-x-2">
              <span>Scanner TSE</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center space-x-2">
              <span>Registros</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <span>Exportar</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <span>Segurança</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Dashboard stats={stats} totalVotes={totalVotes} />
              </div>
              <div>
                <NotificationCenter />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scanner" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <QRCodeReader onScanResult={handleScanResult} />
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
                      onRegister={handleRegisterVote}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            {voteRecords.length === 0 ? (
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
            ) : (
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
                      onRegister={handleRegisterVote}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <RealTimeStats stats={stats} totalVotes={totalVotes} />
              {voteRecords.length > 0 && (
                <CandidateChart boletins={voteRecords} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="export">
            <DataExport />
          </TabsContent>

          <TabsContent value="security">
            <SecurityInfo />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modais */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};

export default Index;
