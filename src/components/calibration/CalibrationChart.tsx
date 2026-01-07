import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';

interface CalibrationChartProps {
  data: { time: string; pressure: number; temperature: number; lowerLimit: number; upperLimit: number }[];
  title?: string;
}

export const CalibrationChart = ({ data, title = "Histórico de Pressão" }: CalibrationChartProps) => {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
          Sem dados de calibração
        </CardContent>
      </Card>
    );
  }

  const lowerLimit = data[0]?.lowerLimit || 25;
  const upperLimit = data[0]?.upperLimit || 40;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={[lowerLimit - 5, upperLimit + 5]}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number, name: string) => [
                  `${value} ${name === 'pressure' ? 'psi' : '°C'}`,
                  name === 'pressure' ? 'Pressão' : 'Temperatura'
                ]}
              />
              
              {/* Reference lines for limits */}
              <ReferenceLine 
                y={lowerLimit} 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                label={{ 
                  value: 'Mín', 
                  position: 'left', 
                  fontSize: 10, 
                  fill: '#ef4444' 
                }} 
              />
              <ReferenceLine 
                y={upperLimit} 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                label={{ 
                  value: 'Máx', 
                  position: 'left', 
                  fontSize: 10, 
                  fill: '#ef4444' 
                }} 
              />
              
              <Area
                type="monotone"
                dataKey="pressure"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#pressureGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-blue-500 rounded" />
            <span className="text-muted-foreground">Pressão</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-red-500 rounded border-dashed" style={{ borderStyle: 'dashed' }} />
            <span className="text-muted-foreground">Limites</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
