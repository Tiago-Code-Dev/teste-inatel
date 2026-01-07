import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area
} from 'recharts';

interface CostChartProps {
  byCategoryData: { name: string; value: number; color: string }[];
  byMachineData: { name: string; fuel: number; maintenance: number; parts: number; labor: number; other: number; total: number }[];
  trendData: { date: string; fuel: number; maintenance: number; parts: number; labor: number; other: number }[];
}

const formatCurrency = (value: number) => {
  if (value >= 1000) {
    return `R$${(value / 1000).toFixed(1)}k`;
  }
  return `R$${value.toFixed(0)}`;
};

export const CostChart = ({ byCategoryData, byMachineData, trendData }: CostChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Análise de Custos</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="category" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="category">Por Tipo</TabsTrigger>
            <TabsTrigger value="machine">Por Máquina</TabsTrigger>
            <TabsTrigger value="trend">Tendência</TabsTrigger>
          </TabsList>
          
          <TabsContent value="category" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {byCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {byCategoryData.map((item) => (
                <div 
                  key={item.name}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm flex-1">{item.name}</span>
                  <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="machine" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byMachineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    type="number" 
                    tickFormatter={formatCurrency}
                    fontSize={12}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={80}
                    fontSize={11}
                    tickFormatter={(value) => value.length > 10 ? `${value.slice(0, 10)}...` : value}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="fuel" stackId="a" fill="#f59e0b" name="Combustível" />
                  <Bar dataKey="maintenance" stackId="a" fill="#3b82f6" name="Manutenção" />
                  <Bar dataKey="parts" stackId="a" fill="#8b5cf6" name="Peças" />
                  <Bar dataKey="labor" stackId="a" fill="#10b981" name="Mão de Obra" />
                  <Bar dataKey="other" stackId="a" fill="#6b7280" name="Outros" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="trend" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis tickFormatter={formatCurrency} fontSize={11} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="fuel" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Combustível" />
                  <Area type="monotone" dataKey="maintenance" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Manutenção" />
                  <Area type="monotone" dataKey="parts" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Peças" />
                  <Area type="monotone" dataKey="labor" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Mão de Obra" />
                  <Area type="monotone" dataKey="other" stackId="1" stroke="#6b7280" fill="#6b7280" fillOpacity={0.6} name="Outros" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
