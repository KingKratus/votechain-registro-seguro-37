
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

  // Validações obrigatórias
  if (!boletim.secao || boletim.secao <= 0) {
    errors.push('Número da seção inválido');
    score -= 20;
  }

  if (!boletim.zona || boletim.zona <= 0) {
    errors.push('Número da zona inválida');
    score -= 20;
  }

  if (!boletim.hash || boletim.hash.length < 10) {
    errors.push('Hash do boletim inválido ou ausente');
    score -= 25;
  }

  // Validações dos dados TSE
  if (boletim.dadosTSE) {
    const { dadosTSE } = boletim;
    
    // Validar totais
    const totalCalculado = dadosTSE.totalVotosNominais + dadosTSE.votosBrancos + dadosTSE.votosNulos;
    if (Math.abs(totalCalculado - dadosTSE.totalComparecimento) > 1) {
      errors.push('Inconsistência nos totais de votos');
      score -= 15;
    }

    // Validar comparecimento
    if (dadosTSE.totalComparecimento + dadosTSE.totalFaltas !== dadosTSE.totalEleitoresAptos) {
      warnings.push('Inconsistência entre aptos, comparecimento e faltas');
      score -= 5;
    }

    // Validar data da eleição
    if (!dadosTSE.dataEleicao || !isValidDate(dadosTSE.dataEleicao)) {
      errors.push('Data da eleição inválida');
      score -= 10;
    }

    // Validar horários
    if (!dadosTSE.horaAbertura || !dadosTSE.horaFechamento) {
      warnings.push('Horários de abertura/fechamento ausentes');
      score -= 3;
    }

    // Validar assinatura digital
    if (!dadosTSE.assinatura || dadosTSE.assinatura.length < 20) {
      errors.push('Assinatura digital inválida ou ausente');
      score -= 20;
    }
  } else {
    errors.push('Dados oficiais do TSE ausentes');
    score -= 30;
  }

  // Validar votos por candidato
  if (!boletim.votos || Object.keys(boletim.votos).length === 0) {
    errors.push('Dados de votação ausentes');
    score -= 25;
  } else {
    // Verificar se há votos negativos
    Object.entries(boletim.votos).forEach(([candidato, votos]) => {
      if (votos < 0) {
        errors.push(`Votos negativos para ${candidato}`);
        score -= 10;
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
};

const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const validateHash = (hash: string, expectedPattern?: RegExp): boolean => {
  if (!hash || hash.length < 10) return false;
  if (expectedPattern) return expectedPattern.test(hash);
  
  // Validação básica: deve conter apenas caracteres hexadecimais
  return /^[A-Fa-f0-9]+$/.test(hash);
};
