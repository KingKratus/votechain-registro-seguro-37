
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
  ExternalLink,
  Menu
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';

interface ProfessionalHeaderProps {
  onSettingsClick: () => void;
  onHelpClick: () => void;
}

const ProfessionalHeader = ({ onSettingsClick, onHelpClick }: ProfessionalHeaderProps) => {
  const { toast } = useToast();
  const wallet = useWallet();
  const [notifications, setNotifications] = useState(0);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    // Simular notificações em tempo real
    const interval = setInterval(() => {
      if (Math.random() > 0.90) {
        setNotifications(prev => prev + 1);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleConnectWallet = async () => {
    try {
      await wallet.connectWallet();
      toast({
        title: "Carteira Conectada",
        description: `Conectado com ${wallet.address?.substring(0, 6)}...${wallet.address?.substring(-4)}`,
      });
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      let errorMessage = "Não foi possível conectar a carteira.";
      
      if (error.message?.includes('User rejected')) {
        errorMessage = "Conexão cancelada pelo usuário.";
      } else if (error.message?.includes('No provider')) {
        errorMessage = "Nenhuma carteira encontrada. Instale MetaMask ou use WalletConnect.";
      } else if (error.code === 4001) {
        errorMessage = "Conexão rejeitada. Tente novamente.";
      }
      
      toast({
        title: "Erro na Conexão",
        description: errorMessage,
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
      title: `${notifications} Notificações`,
      description: notifications > 0 ? "Verifique o centro de notificações para mais detalhes." : "Nenhuma notificação pendente.",
    });
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

  const getExplorerUrl = (address: string, chainId: number) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/address/',
      137: 'https://polygonscan.com/address/',
      56: 'https://bscscan.com/address/',
      11155111: 'https://sepolia.etherscan.io/address/'
    };
    return explorers[chainId] ? `${explorers[chainId]}${address}` : null;
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
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
                <p className="text-xs text-gray-500 hidden sm:block">
                  Sistema Oficial de Auditoria Eleitoral
                </p>
              </div>
            </div>
            
            {/* Badge de Status - Desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50 flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>{wallet.chainId ? getNetworkName(wallet.chainId) : 'Desconectado'}</span>
              </Badge>
              <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                v2.1.0
              </Badge>
            </div>
          </div>

          {/* Menu Mobile Toggle */}
          <div className="lg:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Ações do usuário - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Notificações */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative flex items-center space-x-2 px-3 py-2" 
              onClick={handleNotifications}
            >
              <Bell className="w-4 h-4" />
              <span className="hidden xl:inline">Notificações</span>
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </Button>

            {/* Ajuda */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onHelpClick}
              className="flex items-center space-x-2 px-3 py-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden xl:inline">Ajuda</span>
            </Button>

            {/* Configurações */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSettingsClick}
              className="flex items-center space-x-2 px-3 py-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden xl:inline">Configurações</span>
            </Button>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-2">
              {wallet.isConnected ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
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
                      className="p-2"
                    >
                      <User className="w-4 h-4" />
                    </Button>
                    
                    {showWalletDetails && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Endereço:</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all flex-1">
                                {wallet.address}
                              </code>
                              <Button variant="ghost" size="sm" onClick={copyAddress} className="p-1">
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Saldo:</p>
                              <p className="text-sm text-gray-600">{wallet.balance} ETH</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Rede:</p>
                              <p className="text-sm text-gray-600">
                                {wallet.chainId ? getNetworkName(wallet.chainId) : 'Desconhecida'}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2 pt-2 border-t">
                            {wallet.address && wallet.chainId && getExplorerUrl(wallet.address, wallet.chainId) && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.open(getExplorerUrl(wallet.address!, wallet.chainId!), '_blank')}
                                className="flex-1 flex items-center justify-center space-x-1 px-2 py-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Explorer</span>
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleDisconnectWallet}
                              className="flex-1 flex items-center justify-center space-x-1 px-2 py-1"
                            >
                              <LogOut className="w-3 h-3" />
                              <span>Sair</span>
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center space-x-2 px-4 py-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{wallet.isConnecting ? 'Conectando...' : 'Conectar Carteira'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200 py-4 space-y-3">
            <div className="flex flex-col space-y-3">
              {/* Status e Badges */}
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50 flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span>{wallet.chainId ? getNetworkName(wallet.chainId) : 'Desconectado'}</span>
                </Badge>
                <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                  v2.1.0
                </Badge>
              </div>
              
              {/* Botões de Ação */}
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={handleNotifications} className="flex items-center space-x-1 px-2 py-2">
                  <Bell className="w-4 h-4" />
                  <span>Notificações</span>
                  {notifications > 0 && (
                    <span className="ml-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications > 9 ? '9+' : notifications}
                    </span>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={onHelpClick} className="flex items-center space-x-1 px-2 py-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Ajuda</span>
                </Button>
                <Button variant="outline" size="sm" onClick={onSettingsClick} className="flex items-center space-x-1 px-2 py-2">
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </Button>
              </div>
              
              {/* Carteira Mobile */}
              <div className="w-full">
                {wallet.isConnected ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <Wallet className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-green-700">
                          {wallet.address?.substring(0, 8)}...{wallet.address?.substring(-6)}
                        </div>
                        <div className="text-xs text-green-600">
                          {wallet.balance} ETH • {wallet.chainId ? getNetworkName(wallet.chainId) : 'Desconhecida'}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={copyAddress} className="flex-1 flex items-center space-x-1 px-2 py-2">
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDisconnectWallet} className="flex-1 flex items-center space-x-1 px-2 py-2">
                        <LogOut className="w-3 h-3" />
                        <span>Desconectar</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={handleConnectWallet}
                    disabled={wallet.isConnecting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center space-x-2 px-4 py-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{wallet.isConnecting ? 'Conectando...' : 'Conectar Carteira'}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Barra de status */}
        <div className="border-t border-gray-100 py-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Última sincronização: {new Date().toLocaleTimeString('pt-BR')}</span>
              <span>•</span>
              <span>Rede: {wallet.chainId ? getNetworkName(wallet.chainId) : 'Desconectado'}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Status: {wallet.isConnected ? 'Conectado' : 'Desconectado'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${wallet.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="hidden sm:inline">{wallet.isConnected ? 'Sistema Operacional' : 'Aguardando Conexão'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfessionalHeader;
