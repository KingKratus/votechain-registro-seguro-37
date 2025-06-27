
import Web3 from 'web3';
import { TSEBoletim } from '@/types/tse';

// ABI do contrato de votação
const VOTE_CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_hash", "type": "string"},
      {"internalType": "uint256", "name": "_secao", "type": "uint256"},
      {"internalType": "uint256", "name": "_zona", "type": "uint256"},
      {"internalType": "string", "name": "_municipio", "type": "string"},
      {"internalType": "string", "name": "_estado", "type": "string"},
      {"internalType": "string", "name": "_dadosBoletim", "type": "string"}
    ],
    "name": "registrarBoletim",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_hash", "type": "string"}],
    "name": "verificarBoletim",
    "outputs": [
      {"internalType": "bool", "name": "existe", "type": "bool"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "address", "name": "registrador", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBoletins",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_indice", "type": "uint256"}],
    "name": "obterBoletimPorIndice",
    "outputs": [
      {"internalType": "string", "name": "hash", "type": "string"},
      {"internalType": "uint256", "name": "secao", "type": "uint256"},
      {"internalType": "uint256", "name": "zona", "type": "uint256"},
      {"internalType": "string", "name": "municipio", "type": "string"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Endereços dos contratos por rede (para produção, estes devem ser deployados)
const CONTRACT_ADDRESSES: Record<number, string> = {
  1: '0x742d35Cc6634C0532925a3b8D400632B10bb6185', // Ethereum Mainnet
  137: '0x742d35Cc6634C0532925a3b8D400632B10bb6185', // Polygon
  11155111: '0x742d35Cc6634C0532925a3b8D400632B10bb6185' // Sepolia Testnet
};

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
}

export interface BoletimOnChain {
  hash: string;
  secao: number;
  zona: number;
  municipio: string;
  timestamp: number;
  registrador: string;
  exists: boolean;
}

export class ProductionBlockchainService {
  private web3: Web3;
  private contract: any;
  private account: string;
  private chainId: number;

  constructor(web3: Web3, account: string, chainId: number) {
    this.web3 = web3;
    this.account = account;
    this.chainId = chainId;
    
    const contractAddress = CONTRACT_ADDRESSES[chainId];
    if (!contractAddress) {
      throw new Error(`Contrato não disponível na rede ${chainId}`);
    }
    
    this.contract = new web3.eth.Contract(VOTE_CONTRACT_ABI, contractAddress);
  }

  async registrarBoletim(boletim: TSEBoletim): Promise<TransactionResult> {
    try {
      // Preparar dados do boletim
      const dadosBoletim = JSON.stringify({
        votos: boletim.votos,
        dadosTSE: boletim.dadosTSE,
        validationScore: boletim.validationScore,
        timestamp: boletim.timestamp
      });

      // Estimar gas
      const gasEstimate = await this.contract.methods
        .registrarBoletim(
          boletim.hash,
          boletim.secao,
          boletim.zona,
          boletim.municipio,
          boletim.estado,
          dadosBoletim
        )
        .estimateGas({ from: this.account });

      // Obter preço do gas
      const gasPrice = await this.web3.eth.getGasPrice();

      // Executar transação
      const receipt = await this.contract.methods
        .registrarBoletim(
          boletim.hash,
          boletim.secao,
          boletim.zona,
          boletim.municipio,
          boletim.estado,
          dadosBoletim
        )
        .send({
          from: this.account,
          gas: Math.floor(Number(gasEstimate) * 1.2),
          gasPrice: gasPrice
        });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error: any) {
      console.error('Erro ao registrar boletim:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  async verificarBoletim(hash: string): Promise<BoletimOnChain | null> {
    try {
      const result = await this.contract.methods.verificarBoletim(hash).call();
      
      if (!result.existe) {
        return null;
      }

      return {
        hash,
        secao: 0, // Será preenchido quando buscar detalhes completos
        zona: 0,
        municipio: '',
        timestamp: Number(result.timestamp),
        registrador: result.registrador,
        exists: result.existe
      };

    } catch (error) {
      console.error('Erro ao verificar boletim:', error);
      return null;
    }
  }

  async obterTotalBoletins(): Promise<number> {
    try {
      const total = await this.contract.methods.totalBoletins().call();
      return Number(total);
    } catch (error) {
      console.error('Erro ao obter total:', error);
      return 0;
    }
  }

  async obterBoletinsPaginados(pagina: number, itensPorPagina: number): Promise<BoletimOnChain[]> {
    try {
      const total = await this.obterTotalBoletins();
      const inicio = pagina * itensPorPagina;
      const fim = Math.min(inicio + itensPorPagina, total);
      
      const boletins: BoletimOnChain[] = [];
      
      for (let i = inicio; i < fim; i++) {
        try {
          const resultado = await this.contract.methods.obterBoletimPorIndice(i).call();
          boletins.push({
            hash: resultado.hash,
            secao: Number(resultado.secao),
            zona: Number(resultado.zona),
            municipio: resultado.municipio,
            timestamp: Number(resultado.timestamp),
            registrador: '',
            exists: true
          });
        } catch (error) {
          console.error(`Erro ao buscar boletim ${i}:`, error);
        }
      }
      
      return boletins;
    } catch (error) {
      console.error('Erro ao obter boletins paginados:', error);
      return [];
    }
  }

  async obterInformacoesTransacao(txHash: string) {
    try {
      const [receipt, transaction] = await Promise.all([
        this.web3.eth.getTransactionReceipt(txHash),
        this.web3.eth.getTransaction(txHash)
      ]);
      
      if (!receipt || !transaction) {
        return null;
      }

      const gasUsed = receipt.gasUsed;
      const gasPrice = transaction.gasPrice || '0';
      const transactionFee = this.web3.utils.fromWei(
        (BigInt(gasPrice) * BigInt(gasUsed)).toString(),
        'ether'
      );

      return {
        status: receipt.status,
        blockNumber: receipt.blockNumber,
        gasUsed: gasUsed.toString(),
        gasPrice: gasPrice.toString(),
        transactionFee,
        confirmations: await this.obterConfirmacoes(receipt.blockNumber)
      };
    } catch (error) {
      console.error('Erro ao obter informações da transação:', error);
      return null;
    }
  }

  private async obterConfirmacoes(blockNumber: number): Promise<number> {
    try {
      const currentBlock = await this.web3.eth.getBlockNumber();
      return Number(currentBlock) - blockNumber;
    } catch (error) {
      return 0;
    }
  }

  getExplorerUrl(txHash: string): string {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/tx/',
      137: 'https://polygonscan.com/tx/',
      11155111: 'https://sepolia.etherscan.io/tx/'
    };
    
    const baseUrl = explorers[this.chainId];
    return baseUrl ? `${baseUrl}${txHash}` : '';
  }
}
