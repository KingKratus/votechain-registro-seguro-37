
import Web3 from 'web3';
import { TSEBoletim } from '@/types/tse';

// ABI simplificado para o smart contract
const VOTE_CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "_secao", "type": "uint256"},
      {"internalType": "uint256", "name": "_zona", "type": "uint256"},
      {"internalType": "string", "name": "_municipio", "type": "string"},
      {"internalType": "string", "name": "_hash", "type": "string"},
      {"internalType": "string", "name": "_dadosVotacao", "type": "string"}
    ],
    "name": "registrarBoletim",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_hash", "type": "string"}],
    "name": "verificarBoletim",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBoletins",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Endereços dos contratos por rede (substitua pelos endereços reais)
const CONTRACT_ADDRESSES: Record<number, string> = {
  1: '0x...', // Ethereum Mainnet - substitua pelo endereço real
  137: '0x...', // Polygon - substitua pelo endereço real
  56: '0x...', // BSC - substitua pelo endereço real
  11155111: '0x...' // Sepolia Testnet - substitua pelo endereço real
};

export class BlockchainService {
  private web3: Web3;
  private contract: any;
  private account: string;

  constructor(web3: Web3, account: string, chainId: number) {
    this.web3 = web3;
    this.account = account;
    
    const contractAddress = CONTRACT_ADDRESSES[chainId];
    if (!contractAddress) {
      throw new Error(`Contrato não disponível na rede ${chainId}`);
    }
    
    this.contract = new web3.eth.Contract(VOTE_CONTRACT_ABI, contractAddress);
  }

  async registrarBoletim(boletim: TSEBoletim): Promise<string> {
    try {
      // Preparar dados para o smart contract
      const dadosVotacao = JSON.stringify({
        votos: boletim.votos,
        dadosTSE: boletim.dadosTSE,
        timestamp: boletim.timestamp,
        validationScore: boletim.validationScore
      });

      // Estimar gas
      const gasEstimate = await this.contract.methods
        .registrarBoletim(
          boletim.secao,
          boletim.zona,
          boletim.municipio,
          boletim.hash,
          dadosVotacao
        )
        .estimateGas({ from: this.account });

      // Obter preço do gas
      const gasPrice = await this.web3.eth.getGasPrice();

      // Executar transação
      const tx = await this.contract.methods
        .registrarBoletim(
          boletim.secao,
          boletim.zona,
          boletim.municipio,
          boletim.hash,
          dadosVotacao
        )
        .send({
          from: this.account,
          gas: Math.floor(Number(gasEstimate) * 1.2), // 20% de margem
          gasPrice: gasPrice
        });

      return tx.transactionHash;
    } catch (error) {
      console.error('Erro ao registrar boletim na blockchain:', error);
      throw error;
    }
  }

  async verificarBoletim(hash: string): Promise<boolean> {
    try {
      return await this.contract.methods.verificarBoletim(hash).call();
    } catch (error) {
      console.error('Erro ao verificar boletim:', error);
      return false;
    }
  }

  async obterTotalBoletins(): Promise<number> {
    try {
      const total = await this.contract.methods.totalBoletins().call();
      return Number(total);
    } catch (error) {
      console.error('Erro ao obter total de boletins:', error);
      return 0;
    }
  }

  async obterInformacoesTransacao(txHash: string) {
    try {
      const receipt = await this.web3.eth.getTransactionReceipt(txHash);
      const tx = await this.web3.eth.getTransaction(txHash);
      
      return {
        status: receipt.status,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        transactionFee: this.web3.utils.fromWei(
          (BigInt(tx.gasPrice || 0) * BigInt(receipt.gasUsed)).toString(),
          'ether'
        )
      };
    } catch (error) {
      console.error('Erro ao obter informações da transação:', error);
      return null;
    }
  }
}

// Função para deployar o smart contract (para desenvolvimento)
export const deployVoteContract = async (web3: Web3, account: string) => {
  const contractCode = `
    pragma solidity ^0.8.0;
    
    contract VoteRegistry {
        struct Boletim {
            uint256 secao;
            uint256 zona;
            string municipio;
            string hash;
            string dadosVotacao;
            address registradoPor;
            uint256 timestamp;
        }
        
        mapping(string => bool) public boletimsRegistrados;
        mapping(string => Boletim) public boletins;
        string[] public hashesBoletins;
        
        event BoletimRegistrado(string indexed hash, uint256 secao, uint256 zona, string municipio);
        
        function registrarBoletim(
            uint256 _secao,
            uint256 _zona,
            string memory _municipio,     
            string memory _hash,
            string memory _dadosVotacao
        ) public payable {
            require(!boletimsRegistrados[_hash], "Boletim ja registrado");
            
            boletins[_hash] = Boletim({
                secao: _secao,
                zona: _zona,
                municipio: _municipio,
                hash: _hash,
                dadosVotacao: _dadosVotacao,
                registradoPor: msg.sender,
                timestamp: block.timestamp
            });
            
            boletimsRegistrados[_hash] = true;
            hashesBoletins.push(_hash);
            
            emit BoletimRegistrado(_hash, _secao, _zona, _municipio);
        }
        
        function verificarBoletim(string memory _hash) public view returns (bool) {
            return boletimsRegistrados[_hash];
        }
        
        function totalBoletins() public view returns (uint256) {
            return hashesBoletins.length;
        }
    }
  `;
  
  // Este é um exemplo - em produção você compilaria o contrato com ferramentas apropriadas
  console.log('Para deploy do contrato, compile e deploye o código Solidity acima');
  return null;
};
