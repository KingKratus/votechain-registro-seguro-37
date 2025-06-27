
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProductionWallet } from '@/hooks/useProductionWallet';
import { useSupabaseIntegration } from '@/hooks/useSupabaseIntegration';
import { useToast } from '@/hooks/use-toast';
import { ProductionBlockchainService } from '@/services/productionBlockchainService';
import { ProductionTSEValidator } from '@/services/productionTSEValidator';
import { parseTSEQRCode } from '@/utils/tseParser';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  AlertTriangle,
  Database,
  Wallet,
  Shield,
  Activity,
  FileCheck
} from 'lucide-react';

interface TestResult {
  testName: string;
  success: boolean;
  duration: number;
  details: any;
  error?: string;
}

const ProductionTester = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  
  const wallet = useProductionWallet();
  const supabase = useSupabaseIntegration();
  const { toast } = useToast();

  const testQRCode = `QRBU:1:1 VRQR:1.5 VRCH:20180830 ORIG:VOTA ORLC:LEG PROC:223 DTPL:20181007 PLEI:228 TURN:1 FASE:O UNFE:ZZ MUNI:30848 ZONA:1 SECA:483 AGRE:486.941.488.1123 IDUE:1586544 IDCA:253036502661719936089670 VERS:6.32.0.4 LOCA:1015 APTO:626 COMP:195 FALT:431 DTAB:20181007 HRAB:080000 DTFC:20181007 HRFC:170030 IDEL:295 CARG:1 TIPO:0 VERC:201809171907 12:16 13:7 15:1 17:103 18:5 19:7 27:2 30:17 45:13 50:1 51:3 APTA:626 NOMI:175 BRAN:5 NULO:15 TOTC:195 HASH:714CAF293004CB24BF312B43D3B832DDC91BB3A4501C9A652C87D7DB141DE8C915A954CEB1841582E21B5FADCFA2DB39AB6E757220ECC30C89F5B5F6B73FE7C0 ASSI:F2E52864C5853EEF7C9400013D663406C57E8BD0850256A8514D37ED989C2551816CB4D106B15EAAA3E8ED30EA48F3C81ED2D9EE79C12ACE577EC121F81BAE08`;

  const runTest = async (testName: string, testFunction: () => Promise<any>): Promise<TestResult> => {
    const startTime = Date.now();
    setCurrentTest(testName);
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      return {
        testName,
        success: true,
        duration,
        details: result
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      return {
        testName,
        success: false,
        duration,
        details: null,
        error: error.message || 'Erro desconhecido'
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentTest('');

    toast({
      title: "Iniciando Testes de Produção",
      description: "Executando bateria completa de testes...",
    });

    const tests: TestResult[] = [];

    // 1. Teste de Conexão de Carteira
    tests.push(await runTest('Conexão de Carteira', async () => {
      if (!wallet.isConnected) {
        await wallet.connectWallet();
      }
      
      if (!wallet.isConnected || !wallet.address) {
        throw new Error('Falha na conexão da carteira');
      }

      return {
        connected: wallet.isConnected,
        address: wallet.address,
        balance: wallet.balance,
        chainId: wallet.chainId
      };
    }));

    // 2. Teste de Conexão Supabase
    tests.push(await runTest('Conexão Supabase', async () => {
      if (!supabase.isConnected) {
        await supabase.connectSupabase();
      }

      const stats = await supabase.getStats();
      if (!stats) {
        throw new Error('Falha ao obter estatísticas do Supabase');
      }

      return stats;
    }));

    // 3. Teste de Parsing QR Code
    tests.push(await runTest('Parsing QR Code TSE', async () => {
      const boletim = parseTSEQRCode(testQRCode);
      if (!boletim) {
        throw new Error('Falha no parsing do QR Code');
      }

      return {
        hash: boletim.hash,
        secao: boletim.secao,
        zona: boletim.zona,
        totalVotos: Object.values(boletim.votos).reduce((sum, votes) => sum + votes, 0)
      };
    }));

    // 4. Teste de Validação TSE
    tests.push(await runTest('Validação TSE', async () => {
      const boletim = parseTSEQRCode(testQRCode);
      if (!boletim) {
        throw new Error('Boletim não parseado');
      }

      const validation = await ProductionTSEValidator.validateBoletim(boletim);
      
      return {
        isValid: validation.isValid,
        score: validation.score,
        securityLevel: validation.securityLevel,
        errorsCount: validation.errors.length,
        warningsCount: validation.warnings.length
      };
    }));

    // 5. Teste de Salvamento Supabase
    tests.push(await runTest('Salvamento Supabase', async () => {
      const boletim = parseTSEQRCode(testQRCode);
      if (!boletim) {
        throw new Error('Boletim não parseado');
      }

      const boletimId = await supabase.saveBoletim(boletim);
      if (!boletimId) {
        throw new Error('Falha ao salvar no Supabase');
      }

      return { boletimId };
    }));

    // 6. Teste de Serviço Blockchain
    tests.push(await runTest('Serviço Blockchain', async () => {
      if (!wallet.web3 || !wallet.address || !wallet.chainId) {
        throw new Error('Carteira não configurada adequadamente');
      }

      const blockchainService = new ProductionBlockchainService(
        wallet.web3,
        wallet.address,
        wallet.chainId
      );

      const boletim = parseTSEQRCode(testQRCode);
      if (!boletim) {
        throw new Error('Boletim não parseado');
      }

      // Verificar se já existe
      const existing = await blockchainService.verificarBoletim(boletim.hash);
      
      return {
        serviceCreated: true,
        alreadyExists: !!existing,
        contractAddress: wallet.chainId ? `Network ${wallet.chainId}` : 'Unknown'
      };
    }));

    // 7. Teste de Busca de Dados
    tests.push(await runTest('Busca de Dados', async () => {
      const boletins = await supabase.getBoletins(5, 0);
      
      return {
        boletinsCount: boletins.length,
        firstBoletim: boletins[0] || null
      };
    }));

    setTestResults(tests);
    setCurrentTest('');
    setIsRunning(false);

    const successCount = tests.filter(t => t.success).length;
    const totalTests = tests.length;

    toast({
      title: "Testes Concluídos",
      description: `${successCount}/${totalTests} testes passaram com sucesso`,
      variant: successCount === totalTests ? "default" : "destructive"
    });
  };

  const getStatusIcon = (success: boolean) => {
    return success ? 
      <CheckCircle className="w-4 h-4 text-green-600" /> : 
      <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? 'PASSOU' : 'FALHOU'}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="w-5 h-5 text-blue-600" />
          <span>Teste de Produção Completo</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Geral */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <Wallet className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium">Carteira</div>
              <Badge variant={wallet.isConnected ? "default" : "secondary"}>
                {wallet.isConnected ? 'Conectada' : 'Desconectada'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
            <Database className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-sm font-medium">Supabase</div>
              <Badge variant={supabase.isConnected ? "default" : "secondary"}>
                {supabase.isConnected ? 'Conectado' : 'Desconectado'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
            <Shield className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-sm font-medium">Segurança</div>
              <Badge variant="outline">TSE</Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
            <Activity className="w-5 h-5 text-orange-600" />
            <div>
              <div className="text-sm font-medium">Blockchain</div>
              <Badge variant={wallet.chainId ? "default" : "secondary"}>
                {wallet.chainId ? `Rede ${wallet.chainId}` : 'N/A'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Controle de Testes */}
        <div className="flex items-center justify-between">
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Executando Testes...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Executar Todos os Testes
              </>
            )}
          </Button>

          {isRunning && currentTest && (
            <div className="text-sm text-gray-600">
              Executando: {currentTest}
            </div>
          )}
        </div>

        {/* Resultados dos Testes */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Resultados dos Testes:</h3>
            
            {testResults.map((result, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.success)}
                    <span className="font-medium">{result.testName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{result.duration}ms</span>
                    {getStatusBadge(result.success)}
                  </div>
                </div>
                
                {result.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>{result.error}</AlertDescription>
                  </Alert>
                )}
                
                {result.details && (
                  <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Resumo Final */}
        {testResults.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Resumo dos Testes</span>
              </div>
              <div className="text-sm">
                {testResults.filter(r => r.success).length} / {testResults.length} passaram
              </div>
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              Tempo total: {testResults.reduce((sum, r) => sum + r.duration, 0)}ms
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductionTester;
