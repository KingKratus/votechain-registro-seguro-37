
import localforage from 'localforage';
import { TSEBoletim } from '@/types/tse';

// Configurar LocalForage para persistência local
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'TSEBlockchain',
  version: 1.0,
  storeName: 'boletins',
  description: 'Armazenamento local de boletins TSE'
});

export class StorageService {
  private static readonly BOLETINS_KEY = 'tse_boletins';
  private static readonly SETTINGS_KEY = 'app_settings';
  private static readonly STATS_KEY = 'app_stats';

  // Boletins
  static async saveBoletim(boletim: TSEBoletim): Promise<void> {
    try {
      const boletins = await this.getAllBoletins();
      const updatedBoletins = [...boletins, boletim];
      await localforage.setItem(this.BOLETINS_KEY, updatedBoletins);
    } catch (error) {
      console.error('Erro ao salvar boletim:', error);
      throw error;
    }
  }

  static async getAllBoletins(): Promise<TSEBoletim[]> {
    try {
      const boletins = await localforage.getItem<TSEBoletim[]>(this.BOLETINS_KEY);
      return boletins || [];
    } catch (error) {
      console.error('Erro ao buscar boletins:', error);
      return [];
    }
  }

  static async getBoletimByHash(hash: string): Promise<TSEBoletim | null> {
    try {
      const boletins = await this.getAllBoletins();
      return boletins.find(b => b.hash === hash) || null;
    } catch (error) {
      console.error('Erro ao buscar boletim:', error);
      return null;
    }
  }

  static async updateBoletim(hash: string, updates: Partial<TSEBoletim>): Promise<void> {
    try {
      const boletins = await this.getAllBoletins();
      const index = boletins.findIndex(b => b.hash === hash);
      
      if (index !== -1) {
        boletins[index] = { ...boletins[index], ...updates };
        await localforage.setItem(this.BOLETINS_KEY, boletins);
      }
    } catch (error) {
      console.error('Erro ao atualizar boletim:', error);
      throw error;
    }
  }

  static async deleteBoletim(hash: string): Promise<void> {
    try {
      const boletins = await this.getAllBoletins();
      const filteredBoletins = boletins.filter(b => b.hash !== hash);
      await localforage.setItem(this.BOLETINS_KEY, filteredBoletins);
    } catch (error) {
      console.error('Erro ao deletar boletim:', error);
      throw error;
    }
  }

  // Configurações
  static async saveSettings(settings: Record<string, any>): Promise<void> {
    try {
      await localforage.setItem(this.SETTINGS_KEY, settings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    }
  }

  static async getSettings(): Promise<Record<string, any>> {
    try {
      const settings = await localforage.getItem<Record<string, any>>(this.SETTINGS_KEY);
      return settings || {};
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return {};
    }
  }

  // Estatísticas
  static async updateStats(stats: Record<string, any>): Promise<void> {
    try {
      await localforage.setItem(this.STATS_KEY, {
        ...stats,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      throw error;
    }
  }

  static async getStats(): Promise<Record<string, any>> {
    try {
      const stats = await localforage.getItem<Record<string, any>>(this.STATS_KEY);
      return stats || {};
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {};
    }
  }

  // Limpeza
  static async clearAllData(): Promise<void> {
    try {
      await localforage.clear();
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  }

  // Backup/Restore
  static async exportData(): Promise<string> {
    try {
      const boletins = await this.getAllBoletins();
      const settings = await this.getSettings();
      const stats = await this.getStats();
      
      const exportData = {
        boletins,
        settings,
        stats,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  }

  static async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.boletins) {
        await localforage.setItem(this.BOLETINS_KEY, data.boletins);
      }
      
      if (data.settings) {
        await localforage.setItem(this.SETTINGS_KEY, data.settings);
      }
      
      if (data.stats) {
        await localforage.setItem(this.STATS_KEY, data.stats);
      }
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      throw error;
    }
  }
}
