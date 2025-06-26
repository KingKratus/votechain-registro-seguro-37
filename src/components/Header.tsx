
import React from 'react';
import { Shield, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  walletConnected: boolean;
  onConnectWallet: () => void;
}

const Header = ({ walletConnected, onConnectWallet }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">VoteChain</h1>
              <p className="text-xs text-gray-500">Sistema Eleitoral Descentralizado</p>
            </div>
          </div>
          
          <Button 
            onClick={onConnectWallet}
            className={`${
              walletConnected 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            <Wallet className="w-4 h-4 mr-2" />
            {walletConnected ? 'Carteira Conectada' : 'Conectar Carteira'}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
