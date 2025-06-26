import { TSEBoletim } from '@/types/tse';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

export const validateTSEBoletim = (boletim: TSEBoletim): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Validações críticas de segurança
  if (!boletim.secao || boletim.secao <= 0 || boletim.secao > 9999) {
    errors.push('Número da seção inválido ou fora do intervalo permitido (1-9999)');
    score -= 25;
  }

  if (!boletim.zona || boletim.zona <= 0 || boletim.zona > 999) {
    errors.push('Número da zona inválido ou fora do intervalo permitido (1-999)');
    score -= 25;
  }

  if (!boletim.hash || boletim.hash.length < 16) {
    errors.push('Hash do boletim muito curto ou ausente (mínimo 16 caracteres)');
    score -= 30;
  } else if (!/^[A-Fa-f0-9]+$/.test(boletim.hash)) {
    errors.push('Hash do boletim contém caracteres inválidos');
    score -= 25;
  }

  // Validações rigorosas dos dados TSE
  if (boletim.dadosTSE) {
    const { dadosTSE } = boletim;
    
    // Validação de totais com maior precisão
    const totalCalculado = dadosTSE.totalVotosNominais + dadosTSE.votosBrancos + dadosTSE.votosNulos;
    const diferenca = Math.abs(totalCalculado - dadosTSE.totalComparecimento);
    
    if (diferenca > 1) {
      errors.push(`Inconsistência crítica nos totais: diferença de ${diferenca} votos`);
      score -= 20;
    } else if (diferenca === 1) {
      warnings.push('Pequena diferença nos totais (1 voto) - verificar arredondamentos');
      score -= 3;
    }

    // Validação de comparecimento e faltas
    const totalEleitores = dadosTSE.totalComparecimento + dadosTSE.totalFaltas;
    if (totalEleitores !== dadosTSE.totalEleitoresAptos) {
      const diferenca = Math.abs(totalEleitores - dadosTSE.totalEleitoresAptos);
      if (diferenca > 5) {
        errors.push(`Inconsistência grave: diferença de ${diferenca} entre aptos e total`);
        score -= 15;
      } else {
        warnings.push(`Pequena inconsistência entre aptos, comparecimento e faltas (${diferenca})`);
        score -= 5;
      }
    }

    // Validação de data da eleição
    if (!dadosTSE.dataEleicao || !isValidElectionDate(dadosTSE.dataEleicao)) {
      errors.push('Data da eleição inválida ou não está em formato correto');
      score -= 15;
    }

    // Validação de horários
    if (!dadosTSE.horaAbertura || !dadosTSE.horaFechamento) {
      warnings.push('Horários de abertura/fechamento ausentes');
      score -= 5;
    } else if (!isValidTimeRange(dadosTSE.horaAbertura, dadosTSE.horaFechamento)) {
      errors.push('Horários de votação inválidos (abertura >= fechamento)');
      score -= 10;
    }

    // Validação robusta de assinatura digital
    if (!dadosTSE.assinatura || dadosTSE.assinatura.length < 32) {
      errors.push('Assinatura digital inválida, muito curta ou ausente');
      score -= 25;
    } else if (!/^[A-Fa-f0-9]+$/.test(dadosTSE.assinatura)) {
      errors.push('Assinatura digital contém caracteres inválidos');
      score -= 20;
    }

    // Validação de versão do QR
    if (!dadosTSE.versaoQR || dadosTSE.versaoQR.length === 0) {
      warnings.push('Versão do QR code não especificada');
      score -= 3;
    }

    // Validação de turno
    if (dadosTSE.turno < 1 || dadosTSE.turno > 2) {
      errors.push('Turno eleitoral inválido (deve ser 1 ou 2)');
      score -= 10;
    }
  } else {
    errors.push('Dados oficiais do TSE completamente ausentes');
    score -= 40;
  }

  // Validação detalhada de votos por candidato
  if (!boletim.votos || Object.keys(boletim.votos).length === 0) {
    errors.push('Dados de votação completamente ausentes');
    score -= 30;
  } else {
    let totalVotosDetectados = 0;
    let candidatosComVotosNegativos = 0;
    
    Object.entries(boletim.votos).forEach(([candidato, votos]) => {
      if (votos < 0) {
        candidatosComVotosNegativos++;
        errors.push(`Votos negativos detectados para ${candidato}: ${votos}`);
        score -= 15;
      } else if (votos > 100000) {
        warnings.push(`Número muito alto de votos para ${candidato}: ${votos}`);
        score -= 5;
      }
      totalVotosDetectados += Math.max(0, votos);
    });

    // Verificar se o total de votos está coerente
    if (boletim.dadosTSE && totalVotosDetectados !== boletim.dadosTSE.totalVotosNominais) {
      const diferenca = Math.abs(totalVotosDetectados - boletim.dadosTSE.totalVotosNominais);
      if (diferenca > 1) {
        errors.push(`Total de votos nominais inconsistente: diferença de ${diferenca}`);
        score -= 12;
      }
    }
  }

  // Validação de integridade temporal
  if (boletim.timestamp) {
    const timestampDate = new Date(boletim.timestamp);
    const now = new Date();
    if (timestampDate > now) {
      errors.push('Timestamp do boletim é futuro');
      score -= 10;
    }
    
    if (boletim.dadosTSE?.dataEleicao) {
      const electionDate = new Date(boletim.dadosTSE.dataEleicao);
      const diffDays = Math.abs(timestampDate.getTime() - electionDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        warnings.push('Timestamp muito distante da data da eleição');
        score -= 5;
      }
    }
  }

  return {
    isValid: errors.length === 0 && score >= 70, // Score mínimo aumentado
    errors,
    warnings,
    score: Math.max(0, score)
  };
};

const isValidElectionDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  if (!(date instanceof Date) || isNaN(date.getTime())) return false;
  
  // Verificar se a data está em um intervalo razoável (últimos 10 anos)
  const now = new Date();
  const tenYearsAgo = new Date(now.getFullYear() - 10, 0, 1);
  const oneYearFromNow = new Date(now.getFullYear() + 1, 11, 31);
  
  return date >= tenYearsAgo && date <= oneYearFromNow;
};

const isValidTimeRange = (horaAbertura: string, horaFechamento: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(horaAbertura) || !timeRegex.test(horaFechamento)) {
    return false;
  }
  
  const [horaAb, minAb] = horaAbertura.split(':').map(Number);
  const [horaFe, minFe] = horaFechamento.split(':').map(Number);
  
  const minutosAbertura = horaAb * 60 + minAb;
  const minutosFechamento = horaFe * 60 + minFe;
  
  return minutosFechamento > minutosAbertura;
};

export const validateHash = (hash: string, expectedPattern?: RegExp): boolean => {
  if (!hash || hash.length < 10) return false;
  if (expectedPattern) return expectedPattern.test(hash);
  
  // Validação básica: deve conter apenas caracteres hexadecimais
  return /^[A-Fa-f0-9]+$/.test(hash);
};
