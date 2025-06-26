
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import QRScanner from '@/components/QRScanner';
import VoteDataCard from '@/components/VoteDataCard';
import StatsOverview from '@/components/StatsOverview';
import SecurityInfo from '@/components/SecurityInfo';
import { useToast } from '@/hooks/use-toast';

interface TSEBoletim {
  secao: number;
  zona: number;
  municipio: string;
  estado: string;
  timestamp: string;
  hash: string;
  votos: Record<string, number>;
  dadosTSE?: {
    versaoQR: string;
    dataEleicao: string;
    turno: number;
    codigoMunicipio: number;
    totalEleitoresAptos: number;
    totalComparecimento: number;
    totalFaltas: number;
    horaAbertura: string;
    horaFechamento: string;
    votosBrancos: number;
    votosNulos: number;
    totalVotosNominais: number;
    assinatura: string;
  };
  status?: 'pending' | 'confirmed' | 'failed';
}

const Index = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [voteRecords, setVoteRecords] = useState<TSEBoletim[]>([]);
  const { toast } = useToast();

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
    
    // Verificar duplicatas por hash (principal) e também por seção/zona
    const isDuplicateHash = voteRecords.some(record => record.hash === data.hash);
    const isDuplicateSection = voteRecords.some(record => 
      record.secao === data.secao && 
      record.zona === data.zona &&
      record.municipio === data.municipio
    );
    
    if (isDuplicateHash) {
      toast({
        title: "Boletim Duplicado - Hash",
        description: "Este boletim já foi registrado anteriormente (mesmo hash).",
        variant: "destructive",
      });
      return;
    }
    
    if (isDuplicateSection) {
      toast({
        title: "Boletim Duplicado - Seção",
        description: `Já existe um registro para Seção ${data.secao}, Zona ${data.zona} em ${data.municipio}.`,
        variant: "destructive",
      });
      return;
    }

    setVoteRecords(prev => [data, ...prev]);
    
    toast({
      title: "Boletim TSE Adicionado",
      description: `Seção ${data.secao}, Zona ${data.zona} - ${data.municipio}`,
    });
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

    // Simular registro na blockchain
    setVoteRecords(prev => 
      prev.map(record => 
        record.hash === data.hash 
          ? { ...record, status: 'pending' as const }
          : record
      )
    );

    toast({
      title: "Registrando na Blockchain",
      description: `Smart contract sendo criado para Seção ${data.secao}...`,
    });

    // Simular confirmação após alguns segundos
    setTimeout(() => {
      setVoteRecords(prev => 
        prev.map(record => 
          record.hash === data.hash 
            ? { ...record, status: 'confirmed' as const }
            : record
        )
      );

      toast({
        title: "Smart Contract Criado",
        description: `Boletim da Seção ${data.secao} registrado com sucesso na blockchain!`,
      });
    }, 3000);
  };

  const totalVotes = voteRecords.reduce((sum, record) => {
    return sum + (record.dadosTSE?.totalComparecimento || 
      Object.values(record.votos).reduce((s, v) => s + v, 0));
  }, 0);

  const verifiedCount = voteRecords.filter(r => r.status === 'confirmed').length;
  const pendingCount = voteRecords.filter(r => r.status === 'pending').length;

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
            Sistema com proteção anti-duplicação e validação de integridade.
          </p>
        </div>

        <Tabs defaultValue="scanner" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-2/3">
            <TabsTrigger value="scanner">Scanner TSE</TabsTrigger>
            <TabsTrigger value="records">Registros</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-6">
            <QRScanner onScanResult={handleScanResult} />
            
            {voteRecords.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Boletins Processados ({voteRecords.length})
                </h3>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {voteRecords.slice(0, 6).map((record, index) => (
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
              totalSections={voteRecords.length}
              verifiedCount={verifiedCount}
              pendingCount={pendingCount}
            />
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
