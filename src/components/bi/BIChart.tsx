import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend,
  ComposedChart
} from 'recharts';
import { BIChartData, MachinePerformance } from '@/hooks/useBusinessIntelligence';

interface BIChartProps {
  data: BIChartData[];
  title?: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--status-warning))', 'hsl(var(--status-critical))', 'hsl(var(--chart-4))'];

export function BIChart({ data, title = 'Análise Operacional' }: BIChartProps) {
  const costBreakdown = [
    { name: 'Combustível', value: data.reduce((sum, d) => sum + d.fuelCost, 0) },
    { name: 'Manutenção', value: data.reduce((sum, d) => sum + d.maintenanceCost, 0) },
    { name: 'Peças', value: data.reduce((sum, d) => sum + d.partsCost, 0) },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cost" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="cost">Custos</TabsTrigger>
            <TabsTrigger value="efficiency">Eficiência</TabsTrigger>
            <TabsTrigger value="hours">Horas</TabsTrigger>
            <TabsTrigger value="breakdown">Divisão</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cost">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <defs>
                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} />
                  <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-medium mb-2">{d.label}</p>
                            <p className="text-xs">Combustível: <span className="font-medium">R$ {d.fuelCost.toFixed(2)}</span></p>
                            <p className="text-xs">Manutenção: <span className="font-medium">R$ {d.maintenanceCost.toFixed(2)}</span></p>
                            <p className="text-xs">Peças: <span className="font-medium">R$ {d.partsCost.toFixed(2)}</span></p>
                            <p className="text-xs mt-1 pt-1 border-t border-border font-semibold">Total: R$ {d.totalCost.toFixed(2)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="fuelCost" stackId="cost" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="maintenanceCost" stackId="cost" fill="hsl(var(--status-warning))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="partsCost" stackId="cost" fill="hsl(var(--status-critical))" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="totalCost" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="efficiency">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--status-normal))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--status-normal))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-medium">{payload[0].payload.label}</p>
                            <p className="text-sm">Eficiência: <span className="font-medium text-status-normal">{Number(payload[0].value).toFixed(1)}%</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="efficiency" stroke="hsl(var(--status-normal))" fill="url(#efficiencyGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="hours">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} />
                  <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}h`} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-medium mb-1">{d.label}</p>
                            <p className="text-xs">Operação: <span className="font-medium text-status-normal">{d.operatingHours.toFixed(1)}h</span></p>
                            <p className="text-xs">Inatividade: <span className="font-medium text-status-critical">{d.downtime.toFixed(1)}h</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="operatingHours" fill="hsl(var(--status-normal))" radius={[4, 4, 0, 0]} name="Operação" />
                  <Bar dataKey="downtime" fill="hsl(var(--status-critical))" radius={[4, 4, 0, 0]} name="Inatividade" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="breakdown">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface MachinePerformanceChartProps {
  data: MachinePerformance[];
}

export function MachinePerformanceChart({ data }: MachinePerformanceChartProps) {
  const chartData = data.slice(0, 8).map(m => ({
    name: m.name.length > 10 ? m.name.slice(0, 10) + '...' : m.name,
    efficiency: m.efficiency,
    costPerHour: m.costPerHour,
    status: m.status,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Desempenho por Máquina</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} width={80} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-xs">Eficiência: <span className="font-medium">{d.efficiency.toFixed(1)}%</span></p>
                        <p className="text-xs">Custo/Hora: <span className="font-medium">R$ {d.costPerHour.toFixed(2)}</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="efficiency" 
                radius={[0, 4, 4, 0]}
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
