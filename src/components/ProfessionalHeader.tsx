
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Shield, 
  Globe, 
  Bell, 
  Settings,
  HelpCircle,
  User,
  LogOut,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';

interface ProfessionalHeaderProps {
  walletConnected: boolean;
  onConnectWallet: () => void;
}

const ProfessionalHeader = ({ walletConnected, onConnectWallet }: ProfessionalHeaderProps) => {
  const { toast } = useToast();
  const wallet = useWallet();
  const [notifications, setNotifications] = useState(3);
  const [showWalletDetails, setShowWalletDetails] = useState(false);

  useEffect(() => {
    // Simular notificações em tempo real
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setNotifications(prev => prev + 1);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleConnectWallet = async () => {
    try {
      await wallet.connectWallet();
      onConnectWallet();
      toast({
        title: "Carteira Conectada",
        description: `Conectado com ${wallet.address?.substring(0, 6)}...${wallet.address?.substring(-4)}`,
      });
    } catch (error) {
      toast({
        title: "Erro na Conexão",
        description: "Não foi possível conectar a carteira. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectWallet = () => {
    wallet.disconnectWallet();
    setShowWalletDetails(false);
    toast({
      title: "Carteira Desconectada",
      description: "Sua carteira foi desconectada com sucesso.",
    });
  };

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      toast({
        title: "Endereço Copiado",
        description: "Endereço copiado para a área de transferência.",
      });
    }
  };

  const handleNotifications = () => {
    setNotifications(0);
    toast({
      title: "Notificações",
      description: `Você tem ${notifications} notificações não lidas.`,
    });
  };

  const handleSettings = () => {
    toast({
      title: "Configurações",
      description: "Abrindo painel de configurações...",
    });
  };

  const handleHelp = () => {
    window.open('https://docs.lovable.dev/', '_blank');
  };

  const getNetworkName = (chainId: number) => {
    const networks: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      56: 'BSC',
      11155111: 'Sepolia'
    };
    return networks[chainId] || `Chain ${chainId}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  TSE Blockchain
                </h1>
                <p className="text-xs text-gray-500">
                  Sistema Oficial de Auditoria Eleitoral
                </p>
              </div>
            </div>
            
            {/* Badge de Status */}
            <div className="hidden md:flex items-center space-x-2">
              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                <Globe className="w-3 h-3 mr-1" />
                {wallet.chainId ? getNetworkName(wallet.chainId) : 'Desconectado'}
              </Badge>
              <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                v2.1.0
              </Badge>
            </div>
          </div>

          {/* Ações do usuário */}
          <div className="flex items-center space-x-3">
            {/* Notificações */}
            <Button variant="ghost" size="sm" className="relative" onClick={handleNotifications}>
              <Bell className="w-4 h-4" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Button>

            {/* Ajuda */}
            <Button variant="ghost" size="sm" onClick={handleHelp}>
              <HelpCircle className="w-4 h-4" />
            </Button>

            {/* Configurações */}
            <Button variant="ghost" size="sm" onClick={handleSettings}>
              <Settings className="w-4 h-4" />
            </Button>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-2">
              {wallet.isConnected ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Wallet className="w-4 h-4 text-green-600" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-green-700">
                        {wallet.address?.substring(0, 6)}...{wallet.address?.substring(-4)}
                      </span>
                      <span className="text-xs text-green-600">
                        {wallet.balance} ETH
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowWalletDetails(!showWalletDetails)}
                    >
                      <User className="w-4 h-4" />
                    </Button>
                    
                    {showWalletDetails && (
                      <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium">Endereço:</p>
                            <div className="flex items-center space-x-2">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {wallet.address}
                              </code>
                              <Button variant="ghost" size="sm" onClick={copyAddress}>
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Saldo:</p>
                            <p className="text-sm text-gray-600">{wallet.balance} ETH</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Rede:</p>
                            <p className="text-sm text-gray-600">
                              {wallet.chainId ? getNetworkName(wallet.chainId) : 'Desconhecida'}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => window.open(`https://etherscan.io/address/${wallet.address}`, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Ver no Explorer
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDisconnectWallet}>
                              <LogOut className="w-3 h-3 mr-1" />
                              Desconectar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleConnectWallet}
                  disabled={wallet.isConnecting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {wallet.isConnecting ? 'Conectando...' : 'Conectar Carteira'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Barra de navegação secundária */}
        <div className="border-t border-gray-100 py-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Última sincronização: há 2 minutos</span>
              <span>•</span>
              <span>Rede: {wallet.chainId ? getNetworkName(wallet.chainId) : 'Desconectado'}</span>
              <span>•</span>
              <span>Gas: 25 gwei</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${wallet.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{wallet.isConnected ? 'Sistema Operacional' : 'Desconectado'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfessionalHeader;
