
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import QRScanner from '@/components/QRScanner';
import VoteDataCard from '@/components/VoteDataCard';
import StatsOverview from '@/components/StatsOverview';
import SecurityInfo from '@/components/SecurityInfo';
import ValidationDetails from '@/components/ValidationDetails';
import DataExport from '@/components/DataExport';
import { useToast } from '@/hooks/use-toast';
import { TSEBoletim } from '@/types/tse';
import { dataManager } from '@/utils/dataManager';
import { validateTSEBoletim } from '@/utils/tseValidator';

const Index = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [voteRecords, setVoteRecords] = useState<TSEBoletim[]>([]);
  const [lastValidation, setLastValidation] = useState<any>(null);
  const { toast } = useToast();

  // Carregar dados do cache na inicialização
  useEffect(() => {
    const cachedRecords = dataManager.getAllBoletins();
    setVoteRecords(cachedRecords);
  }, []);

  const handleConnectWallet = () => {
    if (!walletConnected) {
      // Simular conexão da carteira
      setTimeout(() => {
        setWalletConnected(true);
        toast({
          title: "Carteira Conectada",
          description: "MetaMask conectada com sucesso!",
        });
      }, 1000);
    }
  };

  const handleScanResult = (data: TSEBoletim) => {
    console.log('Novo boletim recebido:', data);
    
    // Usar o gerenciador de dados para processar o boletim
    const result = dataManager.addBoletim(data);
    
    if (result.success && result.data) {
      // Atualizar a lista local
      setVoteRecords(dataManager.getAllBoletins());
      
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

  const handleRegisterVote = (data: TSEBoletim) => {
    if (!walletConnected) {
      toast({
        title: "Carteira Não Conectada",
        description: "Por favor, conecte sua carteira primeiro.",
        variant: "destructive",
      });
      return;
    }

    // Verificar score de validação
    if (data.validationScore && data.validationScore < 80) {
      toast({
        title: "Score de Validação Baixo",
        description: `Score: ${data.validationScore}/100. Recomendado: mínimo 80 pontos.`,
        variant: "destructive",
      });
      return;
    }

    // Simular registro na blockchain
    dataManager.updateBoletimStatus(data.hash, 'pending');
    setVoteRecords(dataManager.getAllBoletins());

    toast({
      title: "Registrando na Blockchain",
      description: `Smart contract sendo criado para Seção ${data.secao}...`,
    });

    // Simular confirmação após alguns segundos
    setTimeout(() => {
      dataManager.updateBoletimStatus(data.hash, 'confirmed');
      setVoteRecords(dataManager.getAllBoletins());

      toast({
        title: "Smart Contract Criado",
        description: `Boletim da Seção ${data.secao} registrado com sucesso na blockchain!`,
      });
    }, 3000);
  };

  // Calcular estatísticas usando o gerenciador de dados
  const stats = dataManager.getStats();
  const totalVotes = voteRecords.reduce((sum, record) => {
    return sum + (record.dadosTSE?.totalComparecimento || 
      Object.values(record.votos).reduce((s, v) => s + v, 0));
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header 
        walletConnected={walletConnected} 
        onConnectWallet={handleConnectWallet} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sistema Descentralizado de Registro Eleitoral - TSE
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl">
            Processe boletins de urna oficiais do TSE e registre-os de forma segura na blockchain. 
            Sistema com validação rigorosa, proteção anti-duplicação e auditoria completa.
          </p>
        </div>

        <Tabs defaultValue="scanner" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-3/4">
            <TabsTrigger value="scanner">Scanner TSE</TabsTrigger>
            <TabsTrigger value="records">Registros</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="export">Exportar</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <QRScanner onScanResult={handleScanResult} />
              </div>
              <div>
                {lastValidation && (
                  <ValidationDetails validation={lastValidation} />
                )}
              </div>
            </div>
            
            {voteRecords.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Boletins Processados ({voteRecords.length})
                </h3>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {voteRecords.slice(0, 6).map((record) => (
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
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum Boletim TSE Processado</h3>
                <p className="text-gray-500">Escaneie ou insira um QR code do TSE para começar.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {voteRecords.map((record) => (
                  <VoteDataCard 
                    key={record.hash} 
                    data={record} 
                    onRegister={handleRegisterVote}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats">
            <StatsOverview 
              totalVotes={totalVotes}
              totalSections={stats.totalProcessed}
              verifiedCount={stats.confirmedCount}
              pendingCount={stats.pendingCount}
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
    </div>
  );
};

export default Index;
