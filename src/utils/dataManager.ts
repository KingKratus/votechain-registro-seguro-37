
import { TSEBoletim, ProcessingStats } from '@/types/tse';
import { validateTSEBoletim } from './tseValidator';

class DataManager {
  private cache: Map<string, TSEBoletim> = new Map();
  private duplicateHashes: Set<string> = new Set();
  private duplicateSections: Set<string> = new Set();

  addBoletim(boletim: TSEBoletim): { success: boolean; message: string; data?: TSEBoletim } {
    // Validar o boletim primeiro
    const validation = validateTSEBoletim(boletim);
    
    if (!validation.isValid) {
      return {
        success: false,
        message: `Boletim inválido: ${validation.errors.join(', ')}`
      };
    }

    // Verificar duplicatas por hash
    if (this.duplicateHashes.has(boletim.hash)) {
      return {
        success: false,
        message: 'Boletim já processado (hash duplicado)'
      };
    }

    // Verificar duplicatas por seção/zona
    const sectionKey = `${boletim.secao}-${boletim.zona}-${boletim.municipio}`;
    if (this.duplicateSections.has(sectionKey)) {
      return {
        success: false,
        message: `Seção ${boletim.secao}, Zona ${boletim.zona} já processada`
      };
    }

    // Adicionar dados de validação ao boletim
    const processedBoletim: TSEBoletim = {
      ...boletim,
      validationScore: validation.score,
      processedAt: new Date().toISOString(),
      status: validation.score >= 80 ? 'pending' : 'invalid'
    };

    // Armazenar no cache
    this.cache.set(boletim.hash, processedBoletim);
    this.duplicateHashes.add(boletim.hash);
    this.duplicateSections.add(sectionKey);

    return {
      success: true,
      message: `Boletim processado com sucesso (Score: ${validation.score})`,
      data: processedBoletim
    };
  }

  updateBoletimStatus(hash: string, status: TSEBoletim['status']): boolean {
    const boletim = this.cache.get(hash);
    if (!boletim) return false;

    boletim.status = status;
    this.cache.set(hash, boletim);
    return true;
  }

  getBoletim(hash: string): TSEBoletim | undefined {
    return this.cache.get(hash);
  }

  getAllBoletins(): TSEBoletim[] {
    return Array.from(this.cache.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getStats(): ProcessingStats {
    const boletins = this.getAllBoletins();
    const validCount = boletins.filter(b => b.status !== 'invalid').length;
    const invalidCount = boletins.filter(b => b.status === 'invalid').length;
    const pendingCount = boletins.filter(b => b.status === 'pending').length;
    const confirmedCount = boletins.filter(b => b.status === 'confirmed').length;
    
    const averageScore = boletins.reduce((sum, b) => sum + (b.validationScore || 0), 0) / boletins.length || 0;

    return {
      totalProcessed: boletins.length,
      validCount,
      invalidCount,
      pendingCount,
      confirmedCount,
      averageValidationScore: Math.round(averageScore)
    };
  }

  exportData(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      stats: this.getStats(),
      boletins: this.getAllBoletins()
    };
    return JSON.stringify(data, null, 2);
  }

  clearCache(): void {
    this.cache.clear();
    this.duplicateHashes.clear();
    this.duplicateSections.clear();
  }
}

export const dataManager = new DataManager();
