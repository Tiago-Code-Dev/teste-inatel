import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Share2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPIData, BIChartData, MachinePerformance } from '@/hooks/useBusinessIntelligence';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BIReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpis: KPIData[];
  chartData: BIChartData[];
  machinePerformance: MachinePerformance[];
  onExport: (format: 'csv' | 'pdf') => void;
  periodDays: number;
}

export function BIReportSheet({
  open,
  onOpenChange,
  kpis,
  chartData,
  machinePerformance,
  onExport,
  periodDays,
}: BIReportSheetProps) {
  const totalCost = chartData.reduce((sum, d) => sum + d.totalCost, 0);
  const totalHours = chartData.reduce((sum, d) => sum + d.operatingHours, 0);
  const totalDowntime = chartData.reduce((sum, d) => sum + d.downtime, 0);
  const avgEfficiency = chartData.reduce((sum, d) => sum + d.efficiency, 0) / chartData.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Relatório Operacional
            </SheetTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Período: últimos {periodDays} dias • Gerado em {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </p>
        </SheetHeader>

        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Resumo Executivo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Custo Total</p>
                  <p className="text-xl font-bold text-foreground">
                    R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Horas de Operação</p>
                  <p className="text-xl font-bold text-foreground">
                    {totalHours.toFixed(0)}h
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tempo de Inatividade</p>
                  <p className="text-xl font-bold text-status-critical">
                    {totalDowntime.toFixed(0)}h
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Eficiência Média</p>
                  <p className={cn(
                    'text-xl font-bold',
                    avgEfficiency >= 80 ? 'text-status-normal' : avgEfficiency >= 60 ? 'text-status-warning' : 'text-status-critical'
                  )}>
                    {avgEfficiency.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPIs Table */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Indicadores de Desempenho</h3>
              <div className="space-y-3">
                {kpis.map((kpi) => {
                  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
                  return (
                    <div key={kpi.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">{kpi.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {kpi.unit === 'R$' || kpi.unit === 'R$/h' 
                            ? `${kpi.unit} ${kpi.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : `${kpi.value.toFixed(kpi.unit === '%' ? 1 : 0)}${kpi.unit}`}
                        </span>
                        <TrendIcon className={cn(
                          'w-3 h-3',
                          kpi.trend === 'up' && (kpi.category === 'cost' || kpi.category === 'alerts') ? 'text-status-critical' : 'text-status-normal',
                          kpi.trend === 'down' && (kpi.category === 'cost' || kpi.category === 'alerts') ? 'text-status-normal' : 'text-status-critical',
                          kpi.trend === 'stable' && 'text-muted-foreground'
                        )} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Machine Performance */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Desempenho por Máquina</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Máquina</TableHead>
                      <TableHead className="text-xs text-right">Eficiência</TableHead>
                      <TableHead className="text-xs text-right">Custo/h</TableHead>
                      <TableHead className="text-xs text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {machinePerformance.slice(0, 5).map((machine) => (
                      <TableRow key={machine.id}>
                        <TableCell className="text-xs font-medium">{machine.name}</TableCell>
                        <TableCell className="text-xs text-right">{machine.efficiency.toFixed(1)}%</TableCell>
                        <TableCell className="text-xs text-right">R$ {machine.costPerHour.toFixed(2)}</TableCell>
                        <TableCell className="text-xs text-right">
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-xs',
                            machine.status === 'excellent' && 'bg-status-normal/20 text-status-normal',
                            machine.status === 'good' && 'bg-primary/20 text-primary',
                            machine.status === 'average' && 'bg-status-warning/20 text-status-warning',
                            machine.status === 'poor' && 'bg-status-critical/20 text-status-critical'
                          )}>
                            {machine.status === 'excellent' && 'Excelente'}
                            {machine.status === 'good' && 'Bom'}
                            {machine.status === 'average' && 'Regular'}
                            {machine.status === 'poor' && 'Ruim'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Daily Breakdown */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Detalhamento Diário</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Data</TableHead>
                      <TableHead className="text-xs text-right">Operação</TableHead>
                      <TableHead className="text-xs text-right">Custo</TableHead>
                      <TableHead className="text-xs text-right">Eficiência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartData.map((day, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs font-medium">{day.label}</TableCell>
                        <TableCell className="text-xs text-right">{day.operatingHours.toFixed(1)}h</TableCell>
                        <TableCell className="text-xs text-right">R$ {day.totalCost.toFixed(2)}</TableCell>
                        <TableCell className="text-xs text-right">{day.efficiency.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Export Actions */}
          <div className="flex gap-2 pb-4">
            <Button 
              className="flex-1" 
              onClick={() => onExport('csv')}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onExport('pdf')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
