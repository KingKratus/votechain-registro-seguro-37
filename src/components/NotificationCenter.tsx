
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock,
  ExternalLink
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simular notificações do sistema
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Boletim Confirmado',
        message: 'Boletim da Seção 0147 foi confirmado na blockchain com sucesso.',
        timestamp: new Date(Date.now() - 5 * 60000), // 5 min atrás
        read: false,
        action: {
          label: 'Ver Detalhes',
          onClick: () => console.log('Ver detalhes do boletim')
        }
      },
      {
        id: '2',
        type: 'warning',
        title: 'Validação Pendente',
        message: 'Score de validação baixo detectado em 3 boletins. Revisão recomendada.',
        timestamp: new Date(Date.now() - 15 * 60000), // 15 min atrás
        read: false,
        action: {
          label: 'Revisar',
          onClick: () => console.log('Revisar boletins')
        }
      },
      {
        id: '3',
        type: 'info',
        title: 'Atualização do Sistema',
        message: 'Nova versão 2.1.0 disponível com melhorias de segurança.',
        timestamp: new Date(Date.now() - 30 * 60000), // 30 min atrás
        read: true
      },
      {
        id: '4',
        type: 'error',
        title: 'Erro de Conexão',
        message: 'Falha temporária na conexão com a rede blockchain. Sistema recuperado.',
        timestamp: new Date(Date.now() - 60 * 60000), // 1h atrás
        read: true
      }
    ];

    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return AlertTriangle;
      case 'info':
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'info':
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `há ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `há ${diffDays} dias`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notificações</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <Alert
                key={notification.id}
                className={`relative ${
                  !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                } ${getNotificationColor(notification.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium">
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-1">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeNotification(notification.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <AlertDescription className="text-xs mb-2">
                      {notification.message}
                    </AlertDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(notification.timestamp)}</span>
                      </div>
                      {notification.action && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6"
                          onClick={() => {
                            notification.action!.onClick();
                            markAsRead(notification.id);
                          }}
                        >
                          {notification.action.label}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Alert>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
