
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Vote, Shield, MapPin, Clock } from 'lucide-react';

interface StatsOverviewProps {
  totalVotes: number;
  totalSections: number;
  verifiedCount: number;
  pendingCount: number;
}

const StatsOverview = ({ totalVotes, totalSections, verifiedCount, pendingCount }: StatsOverviewProps) => {
  const chartData = [
    { name: 'Verificados', value: verifiedCount },
    { name: 'Pendentes', value: pendingCount },
  ];

  const stats = [
    {
      title: 'Total de Votos',
      value: totalVotes.toLocaleString('pt-BR'),
      icon: Vote,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Seções Registradas',
      value: totalSections.toString(),
      icon: MapPin,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Verificados',
      value: verifiedCount.toString(),
      icon: Shield,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Pendentes',
      value: pendingCount.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status dos Registros</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;
