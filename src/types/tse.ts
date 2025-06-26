
export interface TSEBoletim {
  secao: number;
  zona: number;
  municipio: string;
  estado: string;
  timestamp: string;
  hash: string;
  votos: Record<string, number>;
  dadosTSE?: {
    versaoQR: string;
    dataEleicao: string;
    turno: number;
    codigoMunicipio: number;
    totalEleitoresAptos: number;
    totalComparecimento: number;
    totalFaltas: number;
    horaAbertura: string;
    horaFechamento: string;
    votosBrancos: number;
    votosNulos: number;
    totalVotosNominais: number;
    assinatura: string;
  };
  status?: 'pending' | 'confirmed' | 'failed' | 'invalid';
  validationScore?: number;
  processedAt?: string;
}

export interface ProcessingStats {
  totalProcessed: number;
  validCount: number;
  invalidCount: number;
  pendingCount: number;
  confirmedCount: number;
  averageValidationScore: number;
}
