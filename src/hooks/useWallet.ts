
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

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
      
      // Try MetaMask first if available
      if (window.ethereum && window.ethereum.isMetaMask) {
        provider = window.ethereum;
        await provider.request({ method: 'eth_requestAccounts' });
      } else {
        // Use WalletConnect for mobile wallets
        provider = await EthereumProvider.init({
          projectId: '2f05a7cec156478db512ab481b6159d4', // Free public project ID
          chains: [1], // Ethereum mainnet
          optionalChains: [137, 56, 11155111], // Polygon, BSC, Sepolia
          showQrModal: true,
          qrModalOptions: {
            themeMode: 'light',
            themeVariables: {
              '--wcm-z-index': '1000'
            }
          },
          metadata: {
            name: 'TSE Blockchain',
            description: 'Sistema Eleitoral Descentralizado',
            url: typeof window !== 'undefined' ? window.location.origin : 'https://tse-blockchain.app',
            icons: ['https://avatars.githubusercontent.com/u/37784886']
          }
        });
        
        // Enable session (triggers the modal)
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
      if (provider.on) {
        provider.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            disconnectWallet();
          } else {
            setWallet(prev => ({ ...prev, address: accounts[0] }));
          }
        });

        // Listen for network changes
        provider.on('chainChanged', (chainId: string) => {
          setWallet(prev => ({ ...prev, chainId: parseInt(chainId, 16) }));
        });

        // Listen for disconnect
        provider.on('disconnect', (code: number, reason: string) => {
          console.log('Wallet disconnected:', code, reason);
          disconnectWallet();
        });
      }

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
          },
          11155111: {
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
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
    }
  };

  // Auto-connect on page load if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      try {
        // Check if MetaMask is connected
        if (window.ethereum && window.ethereum.isMetaMask) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const web3 = new Web3(window.ethereum);
            const chainId = await web3.eth.getChainId();
            const balance = await web3.eth.getBalance(accounts[0]);
            const balanceInEth = web3.utils.fromWei(balance, 'ether');

            setWallet({
              isConnected: true,
              address: accounts[0],
              balance: parseFloat(balanceInEth).toFixed(4),
              provider: window.ethereum,
              web3,
              chainId: Number(chainId)
            });
          }
        }
      } catch (error) {
        console.log('Auto-connect failed:', error);
      }
    };

    autoConnect();
  }, []);

  return {
    ...wallet,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchNetwork
  };
};
