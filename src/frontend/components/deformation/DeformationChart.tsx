import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DeformationHistoryPoint, DeformationThresholds, TireDeformationData } from '@/hooks/useTireDeformation';

interface DeformationChartProps {
  data: DeformationHistoryPoint[];
  thresholds: DeformationThresholds;
  title?: string;
}

export function DeformationChart({ data, thresholds, title = 'Evolução da Deformação' }: DeformationChartProps) {
  const chartData = data.map(point => ({
    ...point,
    time: format(new Date(point.timestamp), 'HH:mm', { locale: ptBR }),
    fullTime: format(new Date(point.timestamp), "dd/MM HH:mm", { locale: ptBR }),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deformation" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="deformation">Deformação</TabsTrigger>
            <TabsTrigger value="pressure">Pressão</TabsTrigger>
            <TabsTrigger value="temperature">Temperatura</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deformation">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="deformationGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--status-warning))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--status-warning))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="time" 
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    domain={[0, 15]} 
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-medium">{payload[0].payload.fullTime}</p>
                            <p className="text-sm text-muted-foreground">
                              Deformação: <span className="text-foreground font-medium">{Number(payload[0].value).toFixed(1)}%</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine 
                    y={thresholds.warningLevel} 
                    stroke="hsl(var(--status-warning))" 
                    strokeDasharray="5 5"
                    label={{ value: 'Alerta', position: 'right', fill: 'hsl(var(--status-warning))', fontSize: 10 }}
                  />
                  <ReferenceLine 
                    y={thresholds.criticalLevel} 
                    stroke="hsl(var(--status-critical))" 
                    strokeDasharray="5 5"
                    label={{ value: 'Crítico', position: 'right', fill: 'hsl(var(--status-critical))', fontSize: 10 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="deformation" 
                    stroke="hsl(var(--status-warning))" 
                    fill="url(#deformationGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="pressure">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="time" 
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    domain={[25, 45]} 
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `${value} psi`}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-medium">{payload[0].payload.fullTime}</p>
                            <p className="text-sm text-muted-foreground">
                              Pressão: <span className="text-foreground font-medium">{Number(payload[0].value).toFixed(1)} psi</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pressure" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="temperature">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="time" 
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    domain={[0, 60]} 
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `${value}°C`}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-medium">{payload[0].payload.fullTime}</p>
                            <p className="text-sm text-muted-foreground">
                              Temperatura: <span className="text-foreground font-medium">{Number(payload[0].value).toFixed(0)}°C</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine 
                    y={40} 
                    stroke="hsl(var(--status-warning))" 
                    strokeDasharray="5 5"
                  />
                  <Bar 
                    dataKey="temperature" 
                    fill="hsl(var(--chart-3))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface FleetDeformationChartProps {
  data: TireDeformationData[];
  thresholds: DeformationThresholds;
}

export function FleetDeformationChart({ data, thresholds }: FleetDeformationChartProps) {
  const chartData = data.slice(0, 10).map(tire => ({
    name: tire.tireSerial.slice(-6),
    deformation: tire.currentDeformation,
    status: tire.status,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Deformação por Pneu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis 
                type="number" 
                domain={[0, 15]}
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                type="category" 
                dataKey="name"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 10 }}
                width={60}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium">Pneu {payload[0].payload.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Deformação: <span className="text-foreground font-medium">{Number(payload[0].value).toFixed(1)}%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine 
                x={thresholds.warningLevel} 
                stroke="hsl(var(--status-warning))" 
                strokeDasharray="5 5"
              />
              <ReferenceLine 
                x={thresholds.criticalLevel} 
                stroke="hsl(var(--status-critical))" 
                strokeDasharray="5 5"
              />
              <Bar 
                dataKey="deformation" 
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
