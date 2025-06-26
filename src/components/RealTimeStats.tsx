
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Database, 
  Clock,
  MapPin,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { ProcessingStats } from '@/types/tse';

interface RealTimeStatsProps {
  stats: ProcessingStats;
  totalVotes: number;
}

const RealTimeStats = ({ stats, totalVotes }: RealTimeStatsProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 1000);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `há ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    return `há ${diffHours}h`;
  };

  const realTimeMetrics = [
    {
      label: 'Processamento/min',
      value: '3.2',
      change: '+0.8',
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      label: 'Taxa de Sucesso',
      value: '98.7%',
      change: '+0.2%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Usuários Ativos',
      value: '247',
      change: '+12',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      label: 'Armazenamento',
      value: '2.1GB',
      change: '+150MB',
      icon: Database,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Estatísticas em Tempo Real
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              Última atualização: {getTimeAgo(lastUpdate)}
            </span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Métricas em tempo real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {realTimeMetrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gray-50`}>
                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                </div>
                <Badge variant="outline" className="text-xs">
                  {metric.change}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </div>
                <div className="text-xs text-gray-500">
                  {metric.label}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de atividade */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Atividade nas Últimas 24h</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simulação de gráfico de barras */}
            <div className="flex items-end justify-between h-32 space-x-1">
              {Array.from({ length: 24 }, (_, i) => {
                const height = Math.random() * 80 + 20;
                const isActive = i >= 20; // Últimas 4 horas mais ativas
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full rounded-t ${isActive ? 'bg-blue-500' : 'bg-gray-300'} transition-all duration-300`}
                      style={{ height: `${height}%` }}
                      title={`${23-i}h atrás: ${Math.floor(height/10)} processamentos`}
                    />
                    {i % 4 === 0 && (
                      <span className="text-xs text-gray-500 mt-1">
                        {23-i}h
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Legendas */}
            <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Alta atividade</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded"></div>
                  <span>Atividade normal</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Pico: 14:00 (42 processamentos)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição geográfica */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Distribuição por Região</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { region: 'Sudeste', count: 156, percentage: 45 },
              { region: 'Sul', count: 89, percentage: 25 },
              { region: 'Nordeste', count: 67, percentage: 20 },
              { region: 'Centro-Oeste', count: 23, percentage: 7 },
              { region: 'Norte', count: 12, percentage: 3 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{item.region}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.count}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 flex-1 max-w-32">
                  <Progress value={item.percentage} className="h-2" />
                  <span className="text-xs text-gray-500 w-8">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeStats;
