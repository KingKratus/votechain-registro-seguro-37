
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { ValidationResult } from '@/utils/tseValidator';

interface ValidationDetailsProps {
  validation: ValidationResult;
  className?: string;
}

const ValidationDetails = ({ validation, className }: ValidationDetailsProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertTriangle;
    return XCircle;
  };

  const ScoreIcon = getScoreIcon(validation.score);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <ScoreIcon className="w-5 h-5" />
            <span>Validação do Boletim</span>
          </span>
          <Badge className={getScoreColor(validation.score)}>
            Score: {validation.score}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {validation.errors.length > 0 && (
          <Alert variant="destructive">
            <XCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Erros Encontrados:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validation.warnings.length > 0 && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Avisos:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="text-sm">{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validation.isValid && validation.warnings.length === 0 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Boletim Válido:</strong> Todos os critérios de validação foram atendidos.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 border-t pt-3">
          <div className="flex items-center space-x-1">
            <Info className="w-3 h-3" />
            <span>
              Status: {validation.isValid ? 'Válido' : 'Inválido'} • 
              Score mínimo recomendado: 80 pontos
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationDetails;
