
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScanResult: (data: any) => void;
}

const QRScanner = ({ onScanResult }: QRScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const { toast } = useToast();

  const simulateQRScan = () => {
    setScanning(true);
    
    // Simular dados de um boletim de urna
    setTimeout(() => {
      const mockData = {
        secao: Math.floor(Math.random() * 9999) + 1,
        zona: Math.floor(Math.random() * 999) + 1,
        municipio: 'São Paulo',
        estado: 'SP',
        timestamp: new Date().toISOString(),
        hash: `0x${Math.random().toString(16).substr(2, 40)}`,
        votos: {
          candidato1: Math.floor(Math.random() * 500),
          candidato2: Math.floor(Math.random() * 500),
          brancos: Math.floor(Math.random() * 50),
          nulos: Math.floor(Math.random() * 30)
        }
      };
      
      onScanResult(mockData);
      setScanning(false);
      
      toast({
        title: "QR Code Lido com Sucesso",
        description: `Seção ${mockData.secao}, Zona ${mockData.zona}`,
      });
    }, 2000);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      try {
        const data = JSON.parse(manualInput);
        onScanResult(data);
        setManualInput('');
        toast({
          title: "Dados Processados",
          description: "Boletim inserido manualmente",
        });
      } catch (error) {
        toast({
          title: "Erro nos Dados",
          description: "Formato JSON inválido",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="relative overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <span>Scanner QR Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
            {scanning ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Lendo QR Code...</p>
              </div>
            ) : (
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Clique para ler QR Code</p>
              </div>
            )}
          </div>
          
          <Button 
            onClick={simulateQRScan} 
            disabled={scanning}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {scanning ? 'Lendo...' : 'Simular Leitura QR'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-green-600" />
            <span>Inserção Manual</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Cole aqui os dados JSON do boletim de urna..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            
            <Button 
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Processar Dados
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;
