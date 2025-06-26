
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, MapPin, Vote, Users, ExternalLink, AlertTriangle } from 'lucide-react';
import { TSEBoletim } from '@/types/tse';
import { useWallet } from '@/hooks/useWallet';
import { BlockchainService } from '@/services/blockchainService';
import { useToast } from '@/hooks/use-toast';

interface VoteDataCardProps {
  data: TSEBoletim;
  onRegister: (data: TSEBoletim) => void;
}

const VoteDataCard = ({ data, onRegister }: VoteDataCardProps) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const wallet = useWallet();
  const { toast } = useToast();

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

  const handleRegisterOnBlockchain = async () => {
    if (!wallet.isConnected || !wallet.web3 || !wallet.address) {
      toast({
        title: "Carteira Não Conectada",
        description: "Por favor, conecte sua carteira primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (data.validationScore && data.validationScore < 80) {
      toast({
        title: "Score de Validação Baixo",
        description: `Score: ${data.validationScore}/100. Recomendado: mínimo 80 pontos.`,
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    
    try {
      const blockchainService = new BlockchainService(
        wallet.web3,
        wallet.address,
        wallet.chainId || 1
      );

      // Verificar se já está registrado
      const isAlreadyRegistered = await blockchainService.verificarBoletim(data.hash);
      if (isAlreadyRegistered) {
        toast({
          title: "Boletim Já Registrado",
          description: "Este boletim já foi registrado na blockchain.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Iniciando Registro",
        description: "Preparando transação na blockchain...",
      });

      // Registrar na blockchain
      const transactionHash = await blockchainService.registrarBoletim(data);
      setTxHash(transactionHash);

      toast({
        title: "Transação Enviada",
        description: `Hash: ${transactionHash.substring(0, 10)}...`,
      });

      // Aguardar confirmação
      const receipt = await wallet.web3.eth.getTransactionReceipt(transactionHash);
      
      if (receipt.status) {
        onRegister({ ...data, status: 'confirmed' });
        toast({
          title: "Registro Confirmado",
          description: `Boletim registrado com sucesso na blockchain!`,
        });
      } else {
        toast({
          title: "Transação Falhou",
          description: "A transação foi rejeitada pela rede.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('Erro ao registrar na blockchain:', error);
      toast({
        title: "Erro no Registro",
        description: error.message || "Erro desconhecido ao registrar na blockchain.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
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
              {data.status === 'invalid' && <AlertTriangle className="w-3 h-3 mr-1" />}
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
          {txHash && (
            <button
              onClick={openTransactionInExplorer}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>Ver transação</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {data.status !== 'confirmed' && data.status !== 'pending' && (
          <button
            onClick={handleRegisterOnBlockchain}
            disabled={isRegistering || !wallet.isConnected}
            className={`w-full mt-4 py-2 px-4 rounded-lg transition-colors font-medium ${
              isRegistering || !wallet.isConnected
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRegistering 
              ? 'Registrando na Blockchain...' 
              : !wallet.isConnected
              ? 'Conecte a Carteira para Registrar'
              : 'Registrar na Blockchain'
            }
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default VoteDataCard;
