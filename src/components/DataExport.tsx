
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Database, Calendar } from 'lucide-react';
import { dataManager } from '@/utils/dataManager';
import { useToast } from '@/hooks/use-toast';

const DataExport = () => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExportJSON = async () => {
    setExporting(true);
    try {
      const data = dataManager.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `boletins-tse-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Dados Exportados",
        description: "Arquivo JSON baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível exportar os dados",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const boletins = dataManager.getAllBoletins();
      
      // Cabeçalho do CSV
      const headers = [
        'Hash', 'Seção', 'Zona', 'Município', 'Estado', 'Status', 
        'Score Validação', 'Data Processamento', 'Total Votos',
        'Eleitores Aptos', 'Comparecimento', 'Faltas', 'Brancos', 'Nulos'
      ];

      // Dados do CSV
      const csvData = boletins.map(b => [
        b.hash,
        b.secao,
        b.zona,
        b.municipio,
        b.estado,
        b.status || 'pending',
        b.validationScore || 0,
        b.processedAt || b.timestamp,
        Object.values(b.votos).reduce((sum, v) => sum + v, 0),
        b.dadosTSE?.totalEleitoresAptos || 0,
        b.dadosTSE?.totalComparecimento || 0,
        b.dadosTSE?.totalFaltas || 0,
        b.dadosTSE?.votosBrancos || 0,
        b.dadosTSE?.votosNulos || 0
      ]);

      const csv = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `boletins-tse-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "CSV Exportado",
        description: "Planilha baixada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível exportar o CSV",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const stats = dataManager.getStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Exportar Dados</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-semibold text-blue-700">{stats.totalProcessed}</div>
            <div className="text-blue-600">Total</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-semibold text-green-700">{stats.confirmedCount}</div>
            <div className="text-green-600">Confirmados</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <div className="font-semibold text-yellow-700">{stats.pendingCount}</div>
            <div className="text-yellow-600">Pendentes</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-700">{stats.invalidCount}</div>
            <div className="text-red-600">Inválidos</div>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleExportJSON}
            disabled={exporting || stats.totalProcessed === 0}
            className="w-full"
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            {exporting ? 'Exportando...' : 'Exportar JSON Completo'}
          </Button>
          
          <Button
            onClick={handleExportCSV}
            disabled={exporting || stats.totalProcessed === 0}
            className="w-full"
            variant="outline"
          >
            <Database className="w-4 h-4 mr-2" />
            {exporting ? 'Exportando...' : 'Exportar CSV (Planilha)'}
          </Button>
        </div>

        <div className="text-xs text-gray-500 border-t pt-3 flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>Dados atualizados em tempo real</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExport;
