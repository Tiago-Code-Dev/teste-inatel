import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ReferenceLine, BarChart, Bar, LineChart, Line, ComposedChart
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadHistoryPoint, LoadThresholds, TireLoadData, MachineLoadData } from '@/hooks/useLoadAnalysis';

interface LoadImpactChartProps {
  data: LoadHistoryPoint[];
  thresholds: LoadThresholds;
  title?: string;
}

export function LoadImpactChart({ data, thresholds, title = 'Evolução da Carga' }: LoadImpactChartProps) {
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
        <Tabs defaultValue="load" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="load">Carga</TabsTrigger>
            <TabsTrigger value="wear">Desgaste</TabsTrigger>
            <TabsTrigger value="efficiency">Eficiência</TabsTrigger>
          </TabsList>
          
          <TabsContent value="load">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="loadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 150]} className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-medium">{d.fullTime}</p>
                            <p className="text-sm">Carga: <span className="font-medium">{d.loadPercent.toFixed(1)}%</span></p>
                            <p className="text-xs text-muted-foreground">{d.loadKg.toFixed(0)}kg</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine 
                    y={thresholds.warningPercent} 
                    stroke="hsl(var(--status-warning))" 
                    strokeDasharray="5 5"
                    label={{ value: 'Alerta', position: 'right', fill: 'hsl(var(--status-warning))', fontSize: 10 }}
                  />
                  <ReferenceLine 
                    y={thresholds.criticalPercent} 
                    stroke="hsl(var(--status-critical))" 
                    strokeDasharray="5 5"
                    label={{ value: 'Crítico', position: 'right', fill: 'hsl(var(--status-critical))', fontSize: 10 }}
                  />
                  <Area type="monotone" dataKey="loadPercent" stroke="hsl(var(--primary))" fill="url(#loadGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="wear">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} />
                  <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} tickFormatter={(v) => `+${v}%`} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-medium">{payload[0].payload.fullTime}</p>
                            <p className="text-sm">Impacto: <span className="font-medium text-status-warning">+{Number(payload[0].value).toFixed(1)}%</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="wearImpact" fill="hsl(var(--status-warning))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="efficiency">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} />
                  <YAxis domain={[50, 100]} className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-medium">{payload[0].payload.fullTime}</p>
                            <p className="text-sm">Eficiência: <span className="font-medium text-status-normal">{Number(payload[0].value).toFixed(1)}%</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="efficiency" stroke="hsl(var(--status-normal))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface FleetLoadChartProps {
  machines: MachineLoadData[];
  thresholds: LoadThresholds;
}

export function FleetLoadChart({ machines, thresholds }: FleetLoadChartProps) {
  const chartData = machines.slice(0, 8).map(m => ({
    name: m.name.length > 12 ? m.name.slice(0, 12) + '...' : m.name,
    loadPercent: m.loadPercent,
    efficiency: m.efficiency,
    status: m.status,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Carga por Máquina</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis type="number" domain={[0, 150]} className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} width={80} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-xs">Carga: <span className="font-medium">{d.loadPercent.toFixed(1)}%</span></p>
                        <p className="text-xs">Eficiência: <span className="font-medium">{d.efficiency.toFixed(1)}%</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine x={thresholds.warningPercent} stroke="hsl(var(--status-warning))" strokeDasharray="5 5" />
              <ReferenceLine x={thresholds.criticalPercent} stroke="hsl(var(--status-critical))" strokeDasharray="5 5" />
              <Bar dataKey="loadPercent" radius={[0, 4, 4, 0]} fill="hsl(var(--primary))" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
