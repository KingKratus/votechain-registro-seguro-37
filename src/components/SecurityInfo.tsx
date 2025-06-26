
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';

const SecurityInfo = () => {
  const securityFeatures = [
    {
      icon: Shield,
      title: 'Verificação Digital',
      description: 'Todos os boletins são verificados através de assinatura digital antes do registro.'
    },
    {
      icon: Lock,
      title: 'Blockchain Imutável',
      description: 'Uma vez registrados, os dados não podem ser alterados ou removidos.'
    },
    {
      icon: Eye,
      title: 'Transparência Total',
      description: 'Todos os registros são públicos e auditáveis por qualquer pessoa.'
    },
    {
      icon: CheckCircle,
      title: 'Anti-Duplicação',
      description: 'Sistema previne registro duplicado através de hash único por boletim.'
    }
  ];

  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Sistema Seguro:</strong> Este sistema utiliza tecnologia blockchain para garantir 
          a integridade e transparência dos dados eleitorais. Todos os registros são criptograficamente 
          verificados e imutáveis.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Recursos de Segurança</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="flex space-x-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold">1</div>
              <div>
                <h4 className="font-medium">Leitura do QR Code</h4>
                <p className="text-sm text-gray-600">O QR code do boletim de urna é lido e os dados são extraídos.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold">2</div>
              <div>
                <h4 className="font-medium">Verificação de Integridade</h4>
                <p className="text-sm text-gray-600">Os dados são verificados quanto à autenticidade e formato.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold">3</div>
              <div>
                <h4 className="font-medium">Registro na Blockchain</h4>
                <p className="text-sm text-gray-600">Os dados são registrados de forma imutável na blockchain pública.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold">4</div>
              <div>
                <h4 className="font-medium">Confirmação</h4>
                <p className="text-sm text-gray-600">O registro é confirmado e torna-se publicamente auditável.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityInfo;
