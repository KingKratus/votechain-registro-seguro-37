
import { useState, useEffect } from 'react';
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
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    provider: null,
    web3: null,
    chainId: null
  });

  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      let provider;
      
      // Try MetaMask first
      if (window.ethereum) {
        provider = window.ethereum;
        await provider.request({ method: 'eth_requestAccounts' });
      } else {
        // Dynamic import for WalletConnect
        const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
        
        provider = await EthereumProvider.init({
          projectId: '2f05a7cec156478db512ab481b6159d4', // Default project ID for demo
          chains: [1, 137, 56], // Ethereum, Polygon, BSC
          showQrModal: true,
          metadata: {
            name: 'TSE Blockchain',
            description: 'Sistema Eleitoral Descentralizado',
            url: window.location.origin,
            icons: ['https://walletconnect.com/walletconnect-logo.png']
          }
        });
        
        await provider.enable();
      }

      const web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts();
      const chainId = await web3.eth.getChainId();
      const balance = await web3.eth.getBalance(accounts[0]);
      const balanceInEth = web3.utils.fromWei(balance, 'ether');

      setWallet({
        isConnected: true,
        address: accounts[0],
        balance: parseFloat(balanceInEth).toFixed(4),
        provider,
        web3,
        chainId: Number(chainId)
      });

      // Listen for account changes
      provider.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWallet(prev => ({ ...prev, address: accounts[0] }));
        }
      });

      // Listen for network changes
      provider.on('chainChanged', (chainId: string) => {
        setWallet(prev => ({ ...prev, chainId: Number(chainId) }));
      });

    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    if (wallet.provider?.disconnect) {
      wallet.provider.disconnect();
    }
    setWallet({
      isConnected: false,
      address: null,
      balance: null,
      provider: null,
      web3: null,
      chainId: null
    });
  };

  const switchNetwork = async (chainId: number) => {
    if (!wallet.provider) return;
    
    try {
      await wallet.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
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
          56: {
            chainId: '0x38',
            chainName: 'BNB Smart Chain',
            nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com/']
          }
        };

        if (networkConfigs[chainId]) {
          await wallet.provider.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfigs[chainId]],
          });
        }
      }
    }
  };

  return {
    ...wallet,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchNetwork
  };
};
