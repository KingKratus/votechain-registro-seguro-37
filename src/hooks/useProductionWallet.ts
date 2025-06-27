
import { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  provider: any;
  web3: Web3 | null;
  error: string | null;
}

interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  1: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io/']
  },
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
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/']
  }
};

export const useProductionWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    provider: null,
    web3: null,
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
      return null;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    clearError();

    try {
      if (!window.ethereum?.isMetaMask) {
        throw new Error('MetaMask não encontrado. Por favor, instale o MetaMask.');
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('Nenhuma conta disponível');
      }

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

      // Setup event listeners
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWallet(prev => ({ ...prev, address: accounts[0] }));
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setWallet(prev => ({ ...prev, chainId: parseInt(chainId, 16) }));
      });

      window.ethereum.on('disconnect', () => {
        disconnectWallet();
      });

    } catch (error: any) {
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
    setWallet({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
      provider: null,
      web3: null,
      error: null
    });
  }, []);

  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (!wallet.provider) {
      throw new Error('Carteira não conectada');
    }

    const networkConfig = SUPPORTED_NETWORKS[targetChainId];
    if (!networkConfig) {
      throw new Error('Rede não suportada');
    }

    try {
      await wallet.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }]
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await wallet.provider.request({
          method: 'wallet_addEthereumChain',
          params: [networkConfig]
        });
      } else {
        throw error;
      }
    }
  }, [wallet.provider]);

  // Auto-connect on page load
  useEffect(() => {
    const autoConnect = async () => {
      try {
        if (window.ethereum?.isMetaMask) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        }
      } catch (error) {
        console.log('Auto-connect falhou:', error);
      }
    };

    autoConnect();
  }, [connectWallet]);

  return {
    ...wallet,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    clearError,
    supportedNetworks: Object.keys(SUPPORTED_NETWORKS).map(Number)
  };
};
