
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseTSEQRCode } from '@/utils/tseParser';

interface QRCodeReaderProps {
  onScanResult: (data: any) => void;
}

const QRCodeReader = ({ onScanResult }: QRCodeReaderProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [manualInput, setManualInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsScanning(true);
      startQRDetection();
      
      toast({
        title: "Câmera Ativada",
        description: "Posicione o QR Code do TSE na frente da câmera",
      });
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      toast({
        title: "Erro na Câmera",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const startQRDetection = () => {
    const detectQR = () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Usar biblioteca de detecção de QR Code
        // Para simplicidade, vamos usar uma detecção básica
        // Em produção, usar uma biblioteca como qr-scanner
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Simular detecção (em produção usar biblioteca real)
        // Esta é uma implementação simplificada
      }
      
      if (isScanning) {
        requestAnimationFrame(detectQR);
      }
    };
    
    detectQR();
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      const tseData = parseTSEQRCode(manualInput.trim());
      
      if (tseData) {
        onScanResult(tseData);
        setManualInput('');
        toast({
          title: "Boletim TSE Processado",
          description: `Seção ${tseData.secao}, Zona ${tseData.zona}`,
        });
      } else {
        toast({
          title: "Formato Inválido",
          description: "QR Code do TSE inválido ou corrompido",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center space-x-3">
            <Camera className="w-5 h-5 text-blue-600" />
            <span>Leitor QR Code TSE</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4 relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-center text-white">
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-60" />
                  <p className="text-sm">Toque para ativar a câmera</p>
                </div>
              </div>
            )}
            
            {isScanning && (
              <div className="absolute inset-0 border-2 border-green-400 rounded-lg">
                <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-green-400"></div>
                <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-green-400"></div>
                <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-green-400"></div>
                <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-green-400"></div>
                
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-xs">
                  Escaneando QR Code...
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            {!isScanning ? (
              <Button 
                onClick={startCamera} 
                className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Ativar Câmera</span>
              </Button>
            ) : (
              <Button 
                onClick={stopCamera} 
                variant="destructive"
                className="w-full flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Parar Escaneamento</span>
              </Button>
            )}
            
            <p className="text-xs text-gray-500 text-center">
              Posicione o QR Code do boletim de urna dentro da área de escaneamento
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="flex items-center space-x-3">
            <Upload className="w-5 h-5 text-green-600" />
            <span>Inserção Manual</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-xs text-gray-600 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <strong>Formato TSE:</strong> Cole o conteúdo completo do QR Code do boletim de urna
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
              className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Processar Boletim</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeReader;
