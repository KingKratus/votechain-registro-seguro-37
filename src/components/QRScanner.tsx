
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseTSEQRCode } from '@/utils/tseParser';

interface QRScannerProps {
  onScanResult: (data: any) => void;
}

const QRScanner = ({ onScanResult }: QRScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const { toast } = useToast();

  const simulateQRScan = () => {
    setScanning(true);
    
    // Simular dados reais do TSE
    setTimeout(() => {
      const mockTSEData = `QRBU:1:1 VRQR:1.5 VRCH:20180830 ORIG:VOTA ORLC:LEG PROC:223 DTPL:${new Date().toISOString().slice(0,10).replace(/-/g,'')} PLEI:228 TURN:1 FASE:O UNFE:SP MUNI:71072 ZONA:${Math.floor(Math.random() * 999) + 1} SECA:${Math.floor(Math.random() * 999) + 1} AGRE:486.941.488.1123 IDUE:1586544 IDCA:253036502661719936089670 VERS:6.32.0.4 LOCA:1015 APTO:${Math.floor(Math.random() * 500) + 300} COMP:${Math.floor(Math.random() * 200) + 150} FALT:${Math.floor(Math.random() * 100) + 50} DTAB:${new Date().toISOString().slice(0,10).replace(/-/g,'')} HRAB:080000 DTFC:${new Date().toISOString().slice(0,10).replace(/-/g,'')} HRFC:170030 IDEL:295 CARG:1 TIPO:0 VERC:201809171907 12:${Math.floor(Math.random() * 50)} 13:${Math.floor(Math.random() * 30)} 15:${Math.floor(Math.random() * 10)} 17:${Math.floor(Math.random() * 100)} 18:${Math.floor(Math.random() * 20)} APTA:${Math.floor(Math.random() * 500) + 300} NOMI:${Math.floor(Math.random() * 200) + 100} BRAN:${Math.floor(Math.random() * 10)} NULO:${Math.floor(Math.random() * 15)} TOTC:${Math.floor(Math.random() * 200) + 150} HASH:${Math.random().toString(16).substr(2).toUpperCase()}${Math.random().toString(16).substr(2).toUpperCase()} ASSI:${Math.random().toString(16).substr(2).toUpperCase()}${Math.random().toString(16).substr(2).toUpperCase()}`;
      
      const parsedData = parseTSEQRCode(mockTSEData);
      
      if (parsedData) {
        onScanResult(parsedData);
        setScanning(false);
        
        toast({
          title: "QR Code TSE Processado",
          description: `Seção ${parsedData.secao}, Zona ${parsedData.zona} - ${parsedData.municipio}`,
        });
      } else {
        setScanning(false);
        toast({
          title: "Erro no QR Code",
          description: "Não foi possível processar o QR code do TSE",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      // Tentar processar como QR code do TSE primeiro
      const tseData = parseTSEQRCode(manualInput.trim());
      
      if (tseData) {
        onScanResult(tseData);
        setManualInput('');
        toast({
          title: "Boletim TSE Processado",
          description: `Seção ${tseData.secao}, Zona ${tseData.zona}`,
        });
        return;
      }
      
      // Fallback para JSON (compatibilidade)
      try {
        const jsonData = JSON.parse(manualInput);
        onScanResult(jsonData);
        setManualInput('');
        toast({
          title: "Dados JSON Processados",
          description: "Boletim inserido em formato JSON",
        });
      } catch (error) {
        toast({
          title: "Formato Inválido",
          description: "Por favor, insira um QR code válido do TSE ou dados em formato JSON",
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
            <span>Scanner QR Code TSE</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
            {scanning ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processando QR Code do TSE...</p>
              </div>
            ) : (
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Leia o QR Code do Boletim de Urna</p>
                <p className="text-gray-400 text-xs mt-1">Formato oficial do TSE</p>
              </div>
            )}
          </div>
          
          <Button 
            onClick={simulateQRScan} 
            disabled={scanning}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {scanning ? 'Processando...' : 'Simular QR Code TSE'}
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
            <div className="text-xs text-gray-600 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
              <strong>Formato TSE:</strong> Cole aqui o conteúdo completo do QR Code do boletim de urna
            </div>
            
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="QRBU:1:1 VRQR:1.5 VRCH:20180830 ORIG:VOTA..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs font-mono"
            />
            
            <Button 
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Processar Boletim TSE
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;
