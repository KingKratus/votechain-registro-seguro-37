
import { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';

// Declare window.ethereum type
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  provider: any;
  web3: Web3 | null;
  chainId: number | null;
  error: string | null;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    provider: null,
    web3: null,
    chainId: null,
    error: null
  });

  const [isConnecting, setIsConnecting] = useState(false);

  const clearError = useCallback(() => {
    setWallet(prev => ({ ...prev, error: null }));
  }, []);

  const updateBalance = useCallback(async (web3: Web3, address: string) => {
    try {
      const balance = await web3.eth.getBalance(address);
      const balanceInEth = web3.utils.fromWei(balance, 'ether');
      return parseFloat(balanceInEth).toFixed(4);
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      return '0.0000';
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    clearError();
    console.log('🔄 Iniciando conexão da carteira...');
    
    try {
      if (window.ethereum && window.ethereum.isMetaMask) {
        console.log('🦊 MetaMask detectado, conectando...');
        
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length === 0) {
          throw new Error('Nenhuma conta disponível no MetaMask');
        }

        const web3 = new Web3(window.ethereum);
        const chainId = await web3.eth.getChainId();
        const balance = await updateBalance(web3, accounts[0]);

        console.log('✅ MetaMask conectado:', {
          address: accounts[0],
          chainId: Number(chainId),
          balance
        });

        setWallet({
          isConnected: true,
          address: accounts[0],
          balance,
          provider: window.ethereum,
          web3,
          chainId: Number(chainId),
          error: null
        });

        // Setup event listeners
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          console.log('📝 Contas alteradas:', accounts);
          if (accounts.length === 0) {
            disconnectWallet();
          } else {
            setWallet(prev => ({ ...prev, address: accounts[0] }));
          }
        });

        window.ethereum.on('chainChanged', (chainId: string) => {
          console.log('🔗 Rede alterada:', chainId);
          setWallet(prev => ({ ...prev, chainId: parseInt(chainId, 16) }));
          window.location.reload(); // Reload on network change
        });

      } else {
        throw new Error('MetaMask não encontrado. Por favor, instale o MetaMask.');
      }

    } catch (error: any) {
      console.error('❌ Erro ao conectar carteira:', error);
      const errorMessage = error.message || 'Erro desconhecido ao conectar carteira';
      setWallet(prev => ({
        ...prev,
        error: errorMessage
      }));
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [clearError, updateBalance]);

  const disconnectWallet = useCallback(() => {
    console.log('🔌 Desconectando carteira...');
    setWallet({
      isConnected: false,
      address: null,
      balance: null,
      provider: null,
      web3: null,
      chainId: null,
      error: null
    });
  }, []);

  const switchNetwork = useCallback(async (chainId: number) => {
    if (!wallet.provider) {
      throw new Error('Carteira não conectada');
    }
    
    console.log(`🔄 Trocando para rede ${chainId}...`);
    try {
      await wallet.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      console.error('❌ Erro ao trocar rede:', error);
      
      // If network doesn't exist, add it
      if (error.code === 4902) {
        const networkConfigs: Record<number, any> = {
          137: {
            chainId: '0x89',
            chainName: 'Polygon Mainnet',
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com/'],
            blockExplorerUrls: ['https://polygonscan.com/']
          },
          11155111: {
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            nativeCuracy: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io/']
          }
        };

        if (networkConfigs[chainId]) {
          await wallet.provider.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfigs[chainId]],
          });
        }
      }
      throw error;
    }
  }, [wallet.provider]);

  // Auto-connect on page load if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      try {
        if (window.ethereum && window.ethereum.isMetaMask) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            console.log('🔄 Auto-conectando com MetaMask...');
            const web3 = new Web3(window.ethereum);
            const chainId = await web3.eth.getChainId();
            const balance = await updateBalance(web3, accounts[0]);

            setWallet({
              isConnected: true,
              address: accounts[0],
              balance,
              provider: window.ethereum,
              web3,
              chainId: Number(chainId),
              error: null
            });
          }
        }
      } catch (error) {
        console.log('⚠️ Auto-connect falhou:', error);
      }
    };

    autoConnect();
  }, [updateBalance]);

  return {
    ...wallet,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    clearError
  };
};
