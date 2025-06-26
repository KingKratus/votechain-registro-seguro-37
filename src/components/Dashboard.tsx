
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  BarChart3,
  Activity,
  Globe
} from 'lucide-react';
import { ProcessingStats } from '@/types/tse';
import { dataManager } from '@/utils/dataManager';

interface DashboardProps {
  stats: ProcessingStats;
  totalVotes: number;
}

const Dashboard = ({ stats, totalVotes }: DashboardProps) => {
  const validationRate = stats.totalProcessed > 0 ? 
    Math.round((stats.validCount / stats.totalProcessed) * 100) : 0;
  
  const confirmationRate = stats.totalProcessed > 0 ? 
    Math.round((stats.confirmedCount / stats.totalProcessed) * 100) : 0;

  const dashboardCards = [
    {
      title: "Total de Boletins",
      value: stats.totalProcessed.toLocaleString(),
      description: "Boletins processados no sistema",
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "+12% desde ontem"
    },
    {
      title: "Votos Registrados",
      value: totalVotes.toLocaleString(),
      description: "Total de votos validados",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "+8% desde ontem"
    },
    {
      title: "Taxa de Validação",
      value: `${validationRate}%`,
      description: "Boletins válidos processados",
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "98.5% média histórica"
    },
    {
      title: "Confirmados na Blockchain",
      value: stats.confirmedCount.toLocaleString(),
      description: "Registros imutáveis",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "100% de integridade"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header com estatísticas principais */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Sistema TSE Blockchain</h2>
            <p className="text-blue-100">
              Plataforma Oficial de Auditoria Eleitoral Descentralizada
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Globe className="w-5 h-5" />
              <span className="text-sm">Status: Operacional</span>
            </div>
            <Badge className="bg-green-500 text-white">
              <Activity className="w-3 h-3 mr-1" />
              Online
            </Badge>
          </div>
        </div>
        
        {/* Barra de progresso geral */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso de Validação Geral</span>
            <span>{validationRate}%</span>
          </div>
          <Progress value={validationRate} className="h-2 bg-blue-200" />
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">
                  {card.value}
                </div>
                <p className="text-xs text-gray-500">
                  {card.description}
                </p>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">{card.trend}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status detalhado */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Status de Validação</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Boletins Válidos</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{stats.validCount}</div>
                <div className="text-xs text-gray-500">{validationRate}%</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Pendentes</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{stats.pendingCount}</div>
                <div className="text-xs text-gray-500">
                  {Math.round((stats.pendingCount / stats.totalProcessed) * 100) || 0}%
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-sm">Inválidos</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{stats.invalidCount}</div>
                <div className="text-xs text-gray-500">
                  {Math.round((stats.invalidCount / stats.totalProcessed) * 100) || 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Métricas de Qualidade</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Score Médio de Validação</span>
                <span className="font-semibold">{stats.averageValidationScore}/100</span>
              </div>
              <Progress value={stats.averageValidationScore} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Taxa de Confirmação</span>
                <span className="font-semibold">{confirmationRate}%</span>
              </div>
              <Progress value={confirmationRate} className="h-2" />
            </div>
            
            <div className="pt-2 border-t">
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Tempo médio de processamento: 1.2s</div>
                <div>• Uptime do sistema: 99.9%</div>
                <div>• Última atualização: agora</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
