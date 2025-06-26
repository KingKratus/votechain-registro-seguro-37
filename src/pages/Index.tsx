
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfessionalHeader from '@/components/ProfessionalHeader';  
import HeroSection from '@/components/HeroSection';
import DashboardTab from '@/components/tabs/DashboardTab';
import ScannerTab from '@/components/tabs/ScannerTab';
import RecordsTab from '@/components/tabs/RecordsTab';
import AnalyticsTab from '@/components/tabs/AnalyticsTab';
import DataExport from '@/components/DataExport';
import SecurityInfo from '@/components/SecurityInfo';
import SettingsModal from '@/components/SettingsModal';
import HelpModal from '@/components/HelpModal';
import { useToast } from '@/hooks/use-toast';
import { TSEBoletim } from '@/types/tse';
import { dataManager } from '@/utils/dataManager';
import { validateTSEBoletim } from '@/utils/tseValidator';

const Index = () => {
  const [voteRecords, setVoteRecords] = useState<TSEBoletim[]>([]);
  const [lastValidation, setLastValidation] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { toast } = useToast();

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
        <HeroSection stats={stats} totalVotes={totalVotes} />

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

          <TabsContent value="dashboard">
            <DashboardTab stats={stats} totalVotes={totalVotes} />
          </TabsContent>

          <TabsContent value="scanner">
            <ScannerTab 
              onScanResult={handleScanResult}
              lastValidation={lastValidation}
              voteRecords={voteRecords}
              onRegister={handleRegisterVote}
            />
          </TabsContent>

          <TabsContent value="records">
            <RecordsTab 
              voteRecords={voteRecords}
              onRegister={handleRegisterVote}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab 
              stats={stats}
              totalVotes={totalVotes}
              voteRecords={voteRecords}
            />
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
