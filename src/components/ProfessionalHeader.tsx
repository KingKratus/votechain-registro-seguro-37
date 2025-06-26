
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Shield, 
  Globe, 
  Bell, 
  Settings,
  HelpCircle,
  User
} from 'lucide-react';

interface ProfessionalHeaderProps {
  walletConnected: boolean;
  onConnectWallet: () => void;
}

const ProfessionalHeader = ({ walletConnected, onConnectWallet }: ProfessionalHeaderProps) => {
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
                Rede Principal
              </Badge>
              <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                v2.1.0
              </Badge>
            </div>
          </div>

          {/* Ações do usuário */}
          <div className="flex items-center space-x-3">
            {/* Notificações */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Ajuda */}
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4" />
            </Button>

            {/* Configurações */}
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-2">
              {walletConnected ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Wallet className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Conectado
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={onConnectWallet}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Conectar Carteira
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
              <span>Rede: Ethereum Mainnet</span>
              <span>•</span>
              <span>Gas: 25 gwei</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Sistema Operacional</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfessionalHeader;
