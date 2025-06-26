
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Download, 
  Upload, 
  Trash2, 
  Save,
  Bell,
  Shield,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StorageService } from '@/services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    blockchainSync: true,
    soundEnabled: false,
    theme: 'light'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const savedSettings = await StorageService.getSettings();
      setSettings({ ...settings, ...savedSettings });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      await StorageService.saveSettings(settings);
      toast({
        title: "Configurações Salvas",
        description: "Suas configurações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      setIsLoading(true);
      const dataJson = await StorageService.exportData();
      const blob = new Blob([dataJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tse-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup Realizado",
        description: "Seus dados foram exportados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no Backup",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const text = await file.text();
      await StorageService.importData(text);
      
      toast({
        title: "Dados Importados",
        description: "Os dados foram importados com sucesso.",
      });
      
      // Recarregar a página para refletir os dados importados
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erro na Importação",
        description: "Não foi possível importar os dados. Verifique o arquivo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!window.confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setIsLoading(true);
      await StorageService.clearAllData();
      
      toast({
        title: "Dados Apagados",
        description: "Todos os dados foram removidos do dispositivo.",
      });
      
      // Recarregar a página
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erro ao Apagar",
        description: "Não foi possível apagar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Configurações do Sistema</span>
            </CardTitle>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Configurações Gerais */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Notificações</span>
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span>Ativar notificações do sistema</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span>Sons de notificação</span>
                </label>
              </div>
            </div>

            {/* Configurações de Dados */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Armazenamento</span>
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span>Salvamento automático</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.blockchainSync}
                    onChange={(e) => setSettings({ ...settings, blockchainSync: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span>Sincronização automática com blockchain</span>
                </label>
              </div>
            </div>

            {/* Backup e Restauração */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Backup e Segurança</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={exportData}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                  variant="outline"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Dados</span>
                </Button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading}
                  />
                  <Button
                    disabled={isLoading}
                    className="w-full flex items-center space-x-2"
                    variant="outline"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Importar Dados</span>
                  </Button>
                </div>
                
                <Button
                  onClick={clearAllData}
                  disabled={isLoading}
                  variant="destructive"
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpar Tudo</span>
                </Button>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={saveSettings}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsModal;
