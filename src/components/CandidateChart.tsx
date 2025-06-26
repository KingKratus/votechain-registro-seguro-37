
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TSEBoletim } from '@/types/tse';

interface CandidateChartProps {
  boletins: TSEBoletim[];
}

const CandidateChart = ({ boletins }: CandidateChartProps) => {
  // Processar dados dos candidatos
  const processarDadosCandidatos = () => {
    const candidatosMap = new Map<string, { nome: string, votos: number, numero: string }>();
    
    boletins.forEach(boletim => {
      Object.entries(boletim.votos).forEach(([candidato, votos]) => {
        if (candidato.startsWith('candidato_')) {
          const numero = candidato.replace('candidato_', '');
          const nome = obterNomeCandidato(numero);
          
          if (candidatosMap.has(numero)) {
            candidatosMap.get(numero)!.votos += votos;
          } else {
            candidatosMap.set(numero, { nome, votos, numero });
          }
        }
      });
    });
    
    return Array.from(candidatosMap.values())
      .sort((a, b) => b.votos - a.votos)
      .slice(0, 10); // Top 10 candidatos
  };

  const obterNomeCandidato = (numero: string): string => {
    // Mapeamento básico de números para nomes (em produção, usar API do TSE)
    const candidatos: Record<string, string> = {
      '12': 'João Silva (PDT)',
      '13': 'Maria Santos (PT)',
      '15': 'Carlos Oliveira (MDB)',
      '17': 'Ana Costa (PSB)',
      '18': 'Pedro Lima (REDE)',
      '20': 'Luiza Ferreira (PSC)',
      '22': 'José Almeida (PL)',
      '25': 'Fernanda Rocha (DEM)',
      '27': 'Roberto Dias (DC)',
      '28': 'Carla Mendes (PRTB)',
      '30': 'Marco Antônio (NOVO)',
      '33': 'Sandra Torres (PMN)',
      '35': 'Felipe Castro (PMB)',
      '40': 'Débora Lopes (PSB)',
      '43': 'Ricardo Nunes (PV)',
      '45': 'Patrícia Ramos (PSDB)',
      '50': 'Antônio Barbosa (PSOL)',
      '55': 'Márcia Gomes (PSD)',
      '65': 'Gabriel Santos (PC do B)',
      '70': 'Isabel Martins (AVANTE)'
    };
    
    return candidatos[numero] || `Candidato ${numero}`;
  };

  const dadosCandidatos = processarDadosCandidatos();
  const totalVotos = dadosCandidatos.reduce((sum, c) => sum + c.votos, 0);

  // Cores para o gráfico
  const cores = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
  ];

  // Dados para gráfico de pizza
  const dadosPizza = dadosCandidatos.map((candidato, index) => ({
    ...candidato,
    percentage: ((candidato.votos / totalVotos) * 100).toFixed(1),
    fill: cores[index % cores.length]
  }));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gráfico de Barras */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Votação por Candidato - Gráfico de Barras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosCandidatos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="numero" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [value, 'Votos']}
                  labelFormatter={(label) => `Candidato ${label}`}
                />
                <Bar 
                  dataKey="votos" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Distribuição de Votos - Gráfico de Pizza
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosPizza}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ numero, percentage }) => `${numero} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="votos"
                >
                  {dadosPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Votos']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Resultados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Ranking de Candidatos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Posição</th>
                  <th className="text-left p-3 font-semibold">Número</th>
                  <th className="text-left p-3 font-semibold">Nome</th>
                  <th className="text-right p-3 font-semibold">Votos</th>
                  <th className="text-right p-3 font-semibold">%</th>
                </tr>
              </thead>
              <tbody>
                {dadosCandidatos.map((candidato, index) => (
                  <tr key={candidato.numero} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">#{index + 1}</td>
                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                        {candidato.numero}
                      </span>
                    </td>
                    <td className="p-3">{candidato.nome}</td>
                    <td className="p-3 text-right font-medium">
                      {candidato.votos.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      {((candidato.votos / totalVotos) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm font-medium">
              <span>Total de Votos Válidos:</span>
              <span>{totalVotos.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateChart;
