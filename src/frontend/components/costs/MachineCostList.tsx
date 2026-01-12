import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Truck, ChevronRight, TrendingUp, Clock } from 'lucide-react';
import { MachineCostSummary, CostThresholds } from '@/hooks/useCostManagement';
import { cn } from '@/lib/utils';

interface MachineCostListProps {
  summaries: MachineCostSummary[];
  thresholds: CostThresholds;
  onSelectMachine: (machineId: string) => void;
}

export const MachineCostList = ({ 
  summaries, 
  thresholds,
  onSelectMachine 
}: MachineCostListProps) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Custos por Máquina
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {summaries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma máquina encontrada</p>
          </div>
        ) : (
          summaries.map((summary) => {
            const budgetUsage = (summary.totalCost / thresholds.totalLimit) * 100;
            
            return (
              <div
                key={summary.machineId}
                className={cn(
                  'p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50',
                  summary.isOverBudget && 'border-destructive/50 bg-destructive/5'
                )}
                onClick={() => onSelectMachine(summary.machineId)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      summary.isOverBudget ? 'bg-destructive/10' : 'bg-muted'
                    )}>
                      <Truck className={cn(
                        'h-5 w-5',
                        summary.isOverBudget && 'text-destructive'
                      )} />
                    </div>
                    <div>
                      <h4 className="font-medium">{summary.machineName}</h4>
                      <p className="text-sm text-muted-foreground">{summary.model}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {summary.isOverBudget && (
                      <Badge variant="destructive" className="text-xs">
                        Acima
                      </Badge>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Custo Total</p>
                    <p className={cn(
                      'text-lg font-bold',
                      summary.isOverBudget && 'text-destructive'
                    )}>
                      {formatCurrency(summary.totalCost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Custo/Hora</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <p className={cn(
                        'text-lg font-bold',
                        summary.costPerHour > thresholds.costPerHourLimit && 'text-destructive'
                      )}>
                        {formatCurrency(summary.costPerHour)}/h
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Uso do orçamento</span>
                    <span className={cn(
                      'font-medium',
                      budgetUsage > 100 ? 'text-destructive' : 
                      budgetUsage > 80 ? 'text-amber-500' : 'text-emerald-500'
                    )}>
                      {budgetUsage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(budgetUsage, 100)}
                    className={cn(
                      'h-2',
                      budgetUsage > 100 && '[&>div]:bg-destructive',
                      budgetUsage > 80 && budgetUsage <= 100 && '[&>div]:bg-amber-500'
                    )}
                  />
                </div>
                
                {/* Cost breakdown mini */}
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground">Combustível</p>
                    <p className="text-sm font-medium text-amber-500">
                      {formatCurrency(summary.fuelCost)}
                    </p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground">Manutenção</p>
                    <p className="text-sm font-medium text-blue-500">
                      {formatCurrency(summary.maintenanceCost)}
                    </p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground">Peças</p>
                    <p className="text-sm font-medium text-purple-500">
                      {formatCurrency(summary.partsCost)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
