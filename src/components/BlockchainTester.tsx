
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { BlockchainService } from '@/services/blockchainService';
import { parseTSEQRCode } from '@/utils/tseParser';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  AlertTriangle,
  Copy
} from 'lucide-react';

const BlockchainTester = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const wallet = useWallet();
  const { toast } = useToast();

  // Boletim de urna real fornecido pelo usuário
  const testQRCode = `QRBU:1:1 VRQR:1.5 VRCH:20180830 ORIG:VOTA ORLC:LEG PROC:223 DTPL:20181007 PLEI:228 TURN:1 FASE:O UNFE:ZZ MUNI:30848 ZONA:1 SECA:483 AGRE:486.941.488.1123 IDUE:1586544 IDCA:253036502661719936089670 VERS:6.32.0.4 LOCA:1015 APTO:626 COMP:195 FALT:431 DTAB:20181007 HRAB:080000 DTFC:20181007 HRFC:170030 IDEL:295 CARG:1 TIPO:0 VERC:201809171907 12:16 13:7 15:1 17:103 18:5 19:7 27:2 30:17 45:13 50:1 51:3 APTA:626 NOMI:175 BRAN:5 NULO:15 TOTC:195 HASH:714CAF293004CB24BF312B43D3B832DDC91BB3A4501C9A652C87D7DB141DE8C915A954CEB1841582E21B5FADCFA2DB39AB6E757220ECC30C89F5B5F6B73FE7C0 ASSI:F2E52864C5853EEF7C9400013D663406C57E8BD0850256A8514D37ED989C2551816CB4D106B15EAAA3E8ED30EA48F3C81ED2D9EE79C12ACE577EC121F81BAE08`;

  const testWalletConnection = async () => {
    console.log('=== TESTE DE CONEXÃO DA CARTEIRA ===');
    setTestResult(null);
    setIsLoading(true);

    try {
      console.log('Estado atual da carteira:', wallet);
      
      if (!wallet.isConnected) {
        console.log('Carteira não conectada, tentando conectar...');
        await wallet.connectWallet();
      }

      const result = {
        success: true,
        wallet: {
          connected: wallet.isConnected,
          address: wallet.address,
          balance: wallet.balance,
          chainId: wallet.chainId,
          provider: !!wallet.provider,
          web3: !!wallet.web3
        },
        timestamp: new Date().toISOString()
      };

      console.log('Resultado do teste da carteira:', result);
      setTestResult(result);

      toast({
        title: "Teste da Carteira",
        description: wallet.isConnected ? "Carteira conectada com sucesso!" : "Falha na conexão da carteira",
        variant: wallet.isConnected ? "default" : "destructive"
      });

    } catch (error: any) {
      console.error('Erro no teste da carteira:', error);
      const result = {
        success: false,
        error: error.message || 'Erro desconhecido',
        timestamp: new Date().toISOString()
      };
      setTestResult(result);

      toast({
        title: "Erro no Teste",
        description: error.message || 'Erro desconhecido ao conectar carteira',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testBoletimRegistration = async () => {
    console.log('=== TESTE DE REGISTRO DE BOLETIM ===');
    setTestResult(null);
    setTxHash(null);
    setIsLoading(true);

    try {
      // Verificar se a carteira está conectada
      if (!wallet.isConnected || !wallet.web3 || !wallet.address) {
        throw new Error('Carteira não conectada. Conecte primeiro.');
      }

      console.log('Parseando QR Code do boletim...');
      const boletim = parseTSEQRCode(testQRCode);
      if (!boletim) {
        throw new Error('Falha ao parsear o QR Code do boletim');
      }

      console.log('Boletim parseado:', boletim);

      // Criar serviço blockchain
      const blockchainService = new BlockchainService(
        wallet.web3,
        wallet.address,
        wallet.chainId || 1
      );

      console.log('Verificando se o boletim já foi registrado...');
      const isAlreadyRegistered = await blockchainService.verificarBoletim(boletim.hash);
      console.log('Já registrado?', isAlreadyRegistered);

      let transactionHash = null;
      if (!isAlreadyRegistered) {
        console.log('Registrando boletim na blockchain...');
        
        toast({
          title: "Iniciando Registro",
          description: "Preparando transação na blockchain...",
        });

        transactionHash = await blockchainService.registrarBoletim(boletim);
        console.log('Hash da transação:', transactionHash);
        setTxHash(transactionHash);

        toast({
          title: "Transação Enviada",
          description: `Hash: ${transactionHash.substring(0, 10)}...`,
        });

        // Aguardar confirmação
        console.log('Aguardando confirmação da transação...');
        const receipt = await wallet.web3.eth.getTransactionReceipt(transactionHash);
        console.log('Receipt da transação:', receipt);
      }

      const result = {
        success: true,
        boletim: {
          secao: boletim.secao,
          zona: boletim.zona,
          municipio: boletim.municipio,
          hash: boletim.hash,
          totalVotos: Object.values(boletim.votos).reduce((sum, votes) => sum + votes, 0)
        },
        blockchain: {
          alreadyRegistered: isAlreadyRegistered,
          transactionHash,
          chainId: wallet.chainId
        },
        timestamp: new Date().toISOString()
      };

      console.log('Resultado do teste do boletim:', result);
      setTestResult(result);

      toast({
        title: "Teste Concluído",
        description: isAlreadyRegistered ? "Boletim já estava registrado" : "Boletim registrado com sucesso!",
      });

    } catch (error: any) {
      console.error('Erro no teste do boletim:', error);
      const result = {
        success: false,
        error: error.message || 'Erro desconhecido',
        timestamp: new Date().toISOString()
      };
      setTestResult(result);

      toast({
        title: "Erro no Teste",
        description: error.message || 'Erro desconhecido ao registrar boletim',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado para a área de transferência",
    });
  };

  const openTransactionInExplorer = () => {
    if (txHash && wallet.chainId) {
      const explorers: Record<number, string> = {
        1: 'https://etherscan.io/tx/',
        137: 'https://polygonscan.com/tx/',
        56: 'https://bscscan.com/tx/',
        11155111: 'https://sepolia.etherscan.io/tx/'
      };
      
      const baseUrl = explorers[wallet.chainId];
      if (baseUrl) {
        window.open(`${baseUrl}${txHash}`, '_blank');
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="w-5 h-5 text-blue-600" />
          <span>Teste do Sistema Blockchain</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controles de Teste */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={testWalletConnection}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
            Testar Conexão da Carteira
          </Button>

          <Button
            onClick={testBoletimRegistration}
            disabled={isLoading || !wallet.isConnected}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
            Testar Registro de Boletim
          </Button>
        </div>

        {/* Status da Carteira */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Status da Carteira:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <Badge variant={wallet.isConnected ? "default" : "secondary"}>
                {wallet.isConnected ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                {wallet.isConnected ? 'Conectado' : 'Desconectado'}
              </Badge>
            </div>
            {wallet.address && (
              <div className="text-xs text-gray-600">
                Endereço: {wallet.address.substring(0, 8)}...{wallet.address.substring(-6)}
              </div>
            )}
            {wallet.chainId && (
              <div className="text-xs text-gray-600">
                Rede: {wallet.chainId}
              </div>
            )}
            {wallet.balance && (
              <div className="text-xs text-gray-600">
                Saldo: {wallet.balance} ETH
              </div>
            )}
          </div>
        </div>

        {/* Dados do Boletim de Teste */}
        <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
          <h3 className="font-medium text-gray-900 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
            Boletim de Teste (Real):
          </h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Seção: 483 | Zona: 1 | Município: Belo Horizonte</div>
            <div>Total Eleitores Aptos: 626 | Comparecimento: 195</div>
            <div>Votos Nominais: 175 | Brancos: 5 | Nulos: 15</div>
            <div className="flex items-center space-x-2 mt-2">
              <code className="bg-white px-2 py-1 rounded text-xs">
                Hash: 714CAF...FE7C0
              </code>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(testQRCode)}
                className="p-1"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Resultado do Teste */}
        {testResult && (
          <div className={`p-4 rounded-lg border-l-4 ${
            testResult.success 
              ? 'bg-green-50 border-green-400' 
              : 'bg-red-50 border-red-400'
          }`}>
            <h3 className="font-medium mb-2 flex items-center">
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 mr-2 text-red-600" />
              )}
              Resultado do Teste
            </h3>
            
            <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>

            {txHash && (
              <Button
                onClick={openTransactionInExplorer}
                variant="outline"
                size="sm"
                className="mt-2 flex items-center space-x-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Ver Transação</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockchainTester;
