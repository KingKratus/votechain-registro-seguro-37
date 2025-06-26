
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  HelpCircle, 
  Camera, 
  Shield, 
  Database,
  Smartphone,
  Globe,
  Lock
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>Central de Ajuda - TSE Blockchain</span>
            </CardTitle>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Como Usar */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Camera className="w-5 h-5 text-blue-600" />
                <span>Como Escanear QR Codes do TSE</span>
              </h3>
              
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <p><strong>1. Ative a Câmera:</strong> Clique no botão "Ativar Câmera" na aba Scanner TSE.</p>
                <p><strong>2. Posicione o QR Code:</strong> Mantenha o QR Code do boletim de urna dentro da área de escaneamento.</p>
                <p><strong>3. Aguarde o Processamento:</strong> O sistema irá automaticamente detectar e processar o código.</p>
                <p><strong>4. Verifique os Dados:</strong> Confirme se os dados foram extraídos corretamente.</p>
              </div>
            </div>

            {/* Segurança */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Recursos de Segurança</span>
              </h3>
              
              <div className="bg-green-50 p-4 rounded-lg space-y-3">
                <p><strong>✓ Validação TSE:</strong> Todos os boletins são validados conforme padrões oficiais do TSE.</p>
                <p><strong>✓ Hash Criptográfico:</strong> Cada boletim possui um hash único para garantir integridade.</p>
                <p><strong>✓ Blockchain:</strong> Registros são armazenados de forma imutável na blockchain.</p>
                <p><strong>✓ Auditoria:</strong> Histórico completo de todas as operações realizadas.</p>
              </div>
            </div>

            {/* Carteira Digital */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-purple-600" />
                <span>Conectar Carteira Digital</span>
              </h3>
              
              <div className="bg-purple-50 p-4 rounded-lg space-y-3">
                <p><strong>Carteiras Suportadas:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>MetaMask (Web e Mobile)</li>
                  <li>WalletConnect (Mais de 300 carteiras)</li>
                  <li>Trust Wallet</li>
                  <li>Coinbase Wallet</li>
                  <li>Rainbow Wallet</li>
                </ul>
                <p className="text-sm text-gray-600">
                  <strong>Nota:</strong> Para usar no celular, instale um dos aplicativos de carteira mencionados acima.
                </p>
              </div>
            </div>

            {/* Armazenamento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Database className="w-5 h-5 text-orange-600" />
                <span>Armazenamento de Dados</span>
              </h3>
              
              <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                <p><strong>Local:</strong> Dados são armazenados localmente no seu dispositivo para acesso rápido.</p>
                <p><strong>Blockchain:</strong> Registros oficiais são gravados na blockchain para transparência.</p>
                <p><strong>Backup:</strong> Use as opções de exportação para fazer backup dos seus dados.</p>
                <p><strong>Sincronização:</strong> Dados são sincronizados automaticamente entre dispositivos conectados.</p>
              </div>
            </div>

            {/* Redes Suportadas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Globe className="w-5 h-5 text-cyan-600" />
                <span>Redes Blockchain Suportadas</span>
              </h3>
              
              <div className="bg-cyan-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="font-semibold">Ethereum</div>
                    <div className="text-sm text-gray-600">Mainnet</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Polygon</div>
                    <div className="text-sm text-gray-600">MATIC</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">BSC</div>
                    <div className="text-sm text-gray-600">Binance</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Sepolia</div>
                    <div className="text-sm text-gray-600">Testnet</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacidade */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Lock className="w-5 h-5 text-red-600" />
                <span>Privacidade e Conformidade</span>
              </h3>
              
              <div className="bg-red-50 p-4 rounded-lg space-y-3">
                <p><strong>✓ LGPD:</strong> Sistema em conformidade com a Lei Geral de Proteção de Dados.</p>
                <p><strong>✓ Transparência:</strong> Dados eleitorais são públicos conforme legislação eleitoral.</p>
                <p><strong>✓ Anonimização:</strong> Dados pessoais são tratados de forma anonimizada.</p>
                <p><strong>✓ Auditoria:</strong> Sistema auditável por autoridades competentes.</p>
              </div>
            </div>

            {/* Suporte */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Precisa de Mais Ajuda?</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <p><strong>Documentação Técnica:</strong> Acesse nossa documentação completa online.</p>
                <p><strong>Suporte Técnico:</strong> Entre em contato através dos canais oficiais.</p>
                <p><strong>Comunidade:</strong> Participe das discussões na comunidade de desenvolvedores.</p>
                <p><strong>Atualizações:</strong> Mantenha o sistema sempre atualizado para melhor segurança.</p>
              </div>
            </div>

            {/* Botão de Fechar */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
                Entendi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpModal;
