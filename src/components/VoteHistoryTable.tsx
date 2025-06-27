
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { CheckCircle, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { TSEBoletim } from '@/types/tse';
import { useWallet } from '@/hooks/useWallet';

interface VoteHistoryTableProps {
  voteRecords: TSEBoletim[];
}

const VoteHistoryTable = ({ voteRecords }: VoteHistoryTableProps) => {
  const wallet = useWallet();

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    const colorClass = status === 'confirmed' ? 'bg-green-100 text-green-800' :
                     status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                     status === 'failed' ? 'bg-red-100 text-red-800' :
                     'bg-gray-100 text-gray-800';
    
    const label = status === 'confirmed' ? 'Confirmado' :
                 status === 'pending' ? 'Pendente' :
                 status === 'failed' ? 'Falhou' :
                 'Não Registrado';
    
    return <Badge className={colorClass}>{label}</Badge>;
  };

  const openTransactionInExplorer = (txHash: string) => {
    if (wallet.chainId) {
      const explorers: Record<number, string> = {
        1: 'https://etherscan.io/tx/',
        137: 'https://polygonscan.com/tx/',
        11155111: 'https://sepolia.etherscan.io/tx/'
      };
      
      const baseUrl = explorers[wallet.chainId];
      if (baseUrl) {
        window.open(`${baseUrl}${txHash}`, '_blank');
      }
    }
  };

  if (voteRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Boletins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum boletim foi processado ainda.</p>
            <p className="text-sm mt-2">Escaneie um QR Code para começar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Histórico de Boletins</span>
          <Badge variant="outline">{voteRecords.length} boletins</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seção/Zona</TableHead>
              <TableHead>Município</TableHead>
              <TableHead>Total Votos</TableHead>
              <TableHead>Validação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {voteRecords.slice().reverse().map((record) => {
              const totalVotos = record.dadosTSE?.totalComparecimento || 
                Object.values(record.votos).reduce((sum, votes) => sum + votes, 0);
              
              return (
                <TableRow key={record.hash}>
                  <TableCell className="font-medium">
                    {record.secao}/{record.zona}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{record.municipio}</span>
                      <span className="text-xs text-gray-500">{record.estado}</span>
                    </div>
                  </TableCell>
                  <TableCell>{totalVotos.toLocaleString()}</TableCell>
                  <TableCell>
                    {record.validationScore ? (
                      <Badge variant={record.validationScore >= 80 ? "default" : "destructive"}>
                        {record.validationScore}%
                      </Badge>
                    ) : (
                      <Badge variant="secondary">N/A</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      {getStatusBadge(record.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {new Date(record.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {record.transactionHash && (
                        <button
                          onClick={() => openTransactionInExplorer(record.transactionHash!)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Ver transação"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default VoteHistoryTable;
