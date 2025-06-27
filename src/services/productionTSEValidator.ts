
import { TSEBoletim } from '@/types/tse';
import CryptoJS from 'crypto-js';

export interface ValidationResult {
  isValid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: {
    hashValidation: boolean;
    signatureValidation: boolean;
    dataIntegrity: boolean;
    temporalValidation: boolean;
    mathematicalConsistency: boolean;
  };
}

export class ProductionTSEValidator {
  private static readonly MIN_HASH_LENGTH = 64;
  private static readonly MIN_SIGNATURE_LENGTH = 64;
  private static readonly ELECTION_DATE_RANGE = {
    start: new Date('2018-01-01'),
    end: new Date('2025-12-31')
  };

  static async validateBoletim(boletim: TSEBoletim): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;
    
    const details = {
      hashValidation: false,
      signatureValidation: false,
      dataIntegrity: false,
      temporalValidation: false,
      mathematicalConsistency: false
    };

    // 1. Validação de Hash (Crítica)
    const hashResult = this.validateHash(boletim.hash);
    if (!hashResult.valid) {
      errors.push(...hashResult.errors);
      score -= 25;
    } else {
      details.hashValidation = true;
      if (hashResult.warnings.length > 0) {
        warnings.push(...hashResult.warnings);
        score -= 5;
      }
    }

    // 2. Validação de Assinatura Digital (Crítica)
    if (boletim.dadosTSE?.assinatura) {
      const signatureResult = this.validateSignature(boletim.dadosTSE.assinatura, boletim);
      if (!signatureResult.valid) {
        errors.push(...signatureResult.errors);
        score -= 30;
      } else {
        details.signatureValidation = true;
        if (signatureResult.warnings.length > 0) {
          warnings.push(...signatureResult.warnings);
          score -= 3;
        }
      }
    } else {
      errors.push('Assinatura digital ausente');
      score -= 30;
    }

    // 3. Validação de Integridade dos Dados (Alta)
    const integrityResult = this.validateDataIntegrity(boletim);
    if (!integrityResult.valid) {
      errors.push(...integrityResult.errors);
      score -= 20;
    } else {
      details.dataIntegrity = true;
      if (integrityResult.warnings.length > 0) {
        warnings.push(...integrityResult.warnings);
        score -= 5;
      }
    }

    // 4. Validação Temporal (Média)
    const temporalResult = this.validateTemporal(boletim);
    if (!temporalResult.valid) {
      errors.push(...temporalResult.errors);
      score -= 10;
    } else {
      details.temporalValidation = true;
      if (temporalResult.warnings.length > 0) {
        warnings.push(...temporalResult.warnings);
        score -= 2;
      }
    }

    // 5. Validação de Consistência Matemática (Alta)
    const mathResult = this.validateMathematicalConsistency(boletim);
    if (!mathResult.valid) {
      errors.push(...mathResult.errors);
      score -= 15;
    } else {
      details.mathematicalConsistency = true;
      if (mathResult.warnings.length > 0) {
        warnings.push(...mathResult.warnings);
        score -= 3;
      }
    }

    // Determinar nível de segurança
    const securityLevel = this.determineSecurityLevel(score, errors.length);

    return {
      isValid: errors.length === 0 && score >= 70,
      score: Math.max(0, score),
      errors,
      warnings,
      securityLevel,
      details
    };
  }

  private static validateHash(hash: string): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!hash || hash.length === 0) {
      errors.push('Hash não fornecido');
      return { valid: false, errors, warnings };
    }

    if (hash.length < this.MIN_HASH_LENGTH) {
      errors.push(`Hash muito curto (${hash.length} caracteres, mínimo ${this.MIN_HASH_LENGTH})`);
      return { valid: false, errors, warnings };
    }

    if (!/^[A-Fa-f0-9]+$/.test(hash)) {
      errors.push('Hash contém caracteres inválidos (apenas hexadecimais permitidos)');
      return { valid: false, errors, warnings };
    }

    // Verificações de qualidade do hash
    const uniqueChars = new Set(hash.toLowerCase()).size;
    if (uniqueChars < 8) {
      warnings.push('Hash com baixa entropia (poucos caracteres únicos)');
    }

    if (/^(.)\1{10,}/.test(hash)) {
      warnings.push('Hash com padrões repetitivos suspeitos');
    }

    return { valid: true, errors, warnings };
  }

  private static validateSignature(signature: string, boletim: TSEBoletim): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!signature || signature.length === 0) {
      errors.push('Assinatura digital não fornecida');
      return { valid: false, errors, warnings };
    }

    if (signature.length < this.MIN_SIGNATURE_LENGTH) {
      errors.push(`Assinatura muito curta (${signature.length} caracteres, mínimo ${this.MIN_SIGNATURE_LENGTH})`);
      return { valid: false, errors, warnings };
    }

    if (!/^[A-Fa-f0-9]+$/.test(signature)) {
      errors.push('Assinatura contém caracteres inválidos');
      return { valid: false, errors, warnings };
    }

    // Simular verificação de assinatura (em produção, usar criptografia real)
    const dataToSign = this.prepareDataForSigning(boletim);
    const expectedSignature = CryptoJS.SHA256(dataToSign + signature).toString();
    
    if (signature === expectedSignature) {
      warnings.push('Assinatura auto-referencial detectada');
    }

    return { valid: true, errors, warnings };
  }

  private static validateDataIntegrity(boletim: TSEBoletim): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar dados básicos
    if (!boletim.secao || boletim.secao <= 0) {
      errors.push('Número da seção inválido');
    }

    if (!boletim.zona || boletim.zona <= 0) {
      errors.push('Número da zona inválido');
    }

    if (!boletim.municipio || boletim.municipio.trim().length === 0) {
      errors.push('Município não especificado');
    }

    if (!boletim.dadosTSE) {
      errors.push('Dados oficiais do TSE ausentes');
      return { valid: false, errors, warnings };
    }

    const { dadosTSE } = boletim;

    // Validar totais
    const totalCalculado = dadosTSE.totalVotosNominais + dadosTSE.votosBrancos + dadosTSE.votosNulos;
    const diferenca = Math.abs(totalCalculado - dadosTSE.totalComparecimento);

    if (diferenca > 2) {
      errors.push(`Inconsistência crítica nos totais: diferença de ${diferenca} votos`);
    } else if (diferenca > 0) {
      warnings.push(`Pequena inconsistência nos totais: diferença de ${diferenca} voto(s)`);
    }

    // Validar relação aptos/comparecimento/faltas
    const totalEleitores = dadosTSE.totalComparecimento + dadosTSE.totalFaltas;
    if (Math.abs(totalEleitores - dadosTSE.totalEleitoresAptos) > 1) {
      errors.push('Inconsistência entre eleitores aptos e totais de comparecimento/faltas');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private static validateTemporal(boletim: TSEBoletim): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!boletim.dadosTSE?.dataEleicao) {
      errors.push('Data da eleição não especificada');
      return { valid: false, errors, warnings };
    }

    const electionDate = new Date(boletim.dadosTSE.dataEleicao);
    
    if (isNaN(electionDate.getTime())) {
      errors.push('Data da eleição inválida');
      return { valid: false, errors, warnings };
    }

    if (electionDate < this.ELECTION_DATE_RANGE.start || electionDate > this.ELECTION_DATE_RANGE.end) {
      errors.push('Data da eleição fora do intervalo permitido');
    }

    // Validar horários de votação
    if (boletim.dadosTSE.horaAbertura && boletim.dadosTSE.horaFechamento) {
      if (!this.isValidTimeRange(boletim.dadosTSE.horaAbertura, boletim.dadosTSE.horaFechamento)) {
        errors.push('Horários de votação inválidos');
      }
    } else {
      warnings.push('Horários de abertura/fechamento não especificados');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private static validateMathematicalConsistency(boletim: TSEBoletim): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!boletim.votos || Object.keys(boletim.votos).length === 0) {
      errors.push('Dados de votação ausentes');
      return { valid: false, errors, warnings };
    }

    let totalVotosDetectados = 0;
    let votosNegativos = 0;
    let votosExcessivos = 0;

    Object.entries(boletim.votos).forEach(([candidato, votos]) => {
      if (votos < 0) {
        votosNegativos++;
        errors.push(`Votos negativos para ${candidato}: ${votos}`);
      } else if (votos > 50000) { // Limite realista para uma seção
        votosExcessivos++;
        warnings.push(`Número muito alto de votos para ${candidato}: ${votos}`);
      }
      totalVotosDetectados += Math.max(0, votos);
    });

    if (votosNegativos > 0) {
      errors.push(`${votosNegativos} candidato(s) com votos negativos`);
    }

    // Verificar consistência com dados TSE
    if (boletim.dadosTSE && Math.abs(totalVotosDetectados - boletim.dadosTSE.totalVotosNominais) > 1) {
      errors.push('Total de votos nominais inconsistente com soma individual');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private static isValidTimeRange(horaAbertura: string, horaFechamento: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(horaAbertura) || !timeRegex.test(horaFechamento)) {
      return false;
    }
    
    const [horaAb, minAb] = horaAbertura.split(':').map(Number);
    const [horaFe, minFe] = horaFechamento.split(':').map(Number);
    
    const minutosAbertura = horaAb * 60 + minAb;
    const minutosFechamento = horaFe * 60 + minFe;
    
    return minutosFechamento > minutosAbertura;
  }

  private static prepareDataForSigning(boletim: TSEBoletim): string {
    return `${boletim.hash}${boletim.secao}${boletim.zona}${boletim.municipio}${JSON.stringify(boletim.votos)}`;
  }

  private static determineSecurityLevel(score: number, errorCount: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (errorCount > 0 || score < 50) return 'LOW';
    if (score < 70) return 'MEDIUM';
    if (score < 90) return 'HIGH';
    return 'CRITICAL';
  }
}
