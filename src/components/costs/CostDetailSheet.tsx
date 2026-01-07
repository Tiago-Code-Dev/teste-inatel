import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Truck, Clock, DollarSign, Fuel, Wrench, Package, 
  TrendingUp, TrendingDown, Download, FileText
} from 'lucide-react';
import { MachineCostSummary, CostEntry, CostThresholds } from '@/hooks/useCostManagement';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CostDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MachineCostSummary | null;
  costs: CostEntry[];
  thresholds: CostThresholds;
  categoryLabels: Record<string, string>;
  categoryColors: Record<string, string>;
}

export const CostDetailSheet = ({
  isOpen,
  onClose,
  summary,
  costs,
  thresholds,
  categoryLabels,
  categoryColors
}: CostDetailSheetProps) => {
  if (!summary) return null;
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };
  
  const pieData = [
    { name: 'Combustível', value: summary.fuelCost, color: categoryColors.fuel },
    { name: 'Manutenção', value: summary.maintenanceCost, color: categoryColors.maintenance },
    { name: 'Peças', value: summary.partsCost, color: categoryColors.parts },
    { name: 'Mão de Obra', value: summary.laborCost, color: categoryColors.labor },
    { name: 'Outros', value: summary.otherCost, color: categoryColors.other }
  ].filter(item => item.value > 0);
  
  const costBreakdown = [
    { label: 'Combustível', value: summary.fuelCost, icon: Fuel, color: 'text-amber-500', threshold: thresholds.fuelLimit },
    { label: 'Manutenção', value: summary.maintenanceCost, icon: Wrench, color: 'text-blue-500', threshold: thresholds.maintenanceLimit },
    { label: 'Peças', value: summary.partsCost, icon: Package, color: 'text-purple-500', threshold: thresholds.partsLimit },
    { label: 'Mão de Obra', value: summary.laborCost, icon: DollarSign, color: 'text-emerald-500', threshold: null },
    { label: 'Outros', value: summary.otherCost, icon: DollarSign, color: 'text-gray-500', threshold: null }
  ];

  const handleExportCSV = () => {
    const headers = ['Data', 'Categoria', 'Descrição', 'Valor', 'Horas Operação'];
    const rows = costs.map(cost => [
      format(new Date(cost.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      categoryLabels[cost.category],
      cost.description,
      cost.value.toFixed(2),
      cost.operatingHours?.toString() || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `custos-${summary.machineName}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle>{summary.machineName}</SheetTitle>
              <p className="text-sm text-muted-foreground">{summary.model}</p>
            </div>
            {summary.isOverBudget && (
              <Badge variant="destructive" className="ml-auto">
                Acima do orçamento
              </Badge>
            )}
          </div>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Custo Total</span>
                </div>
                <p className={cn(
                  'text-xl font-bold',
                  summary.isOverBudget && 'text-destructive'
                )}>
                  {formatCurrency(summary.totalCost)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Custo/Hora</span>
                </div>
                <p className={cn(
                  'text-xl font-bold',
                  summary.costPerHour > thresholds.costPerHourLimit && 'text-destructive'
                )}>
                  {formatCurrency(summary.costPerHour)}/h
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Chart */}
          {pieData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Distribuição de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
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
              </CardContent>
            </Card>
          )}
          
          {/* Cost Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Detalhamento por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {costBreakdown.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <item.icon className={cn('h-4 w-4', item.color)} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className={cn(
                      'text-sm font-medium',
                      item.threshold && item.value > item.threshold && 'text-destructive'
                    )}>
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                  {item.threshold && (
                    <Progress 
                      value={Math.min((item.value / item.threshold) * 100, 100)}
                      className={cn(
                        'h-1.5',
                        item.value > item.threshold && '[&>div]:bg-destructive'
                      )}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Operating Hours */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Horas de Operação</span>
                </div>
                <span className="font-medium">{summary.operatingHours}h</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Costs */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Custos Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-48 overflow-y-auto">
              {costs.slice(0, 10).map((cost) => (
                <div 
                  key={cost.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium">{categoryLabels[cost.category]}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(cost.timestamp), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <span className="font-medium">{formatCurrency(cost.value)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleExportCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Relatório PDF
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
