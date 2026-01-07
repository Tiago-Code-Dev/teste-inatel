import { Check, Building2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTenant } from '@/contexts/TenantContext';
import { cn } from '@/lib/utils';

export function UnitSelector() {
  const { units, selectedUnitId, selectUnit, isLoading } = useTenant();

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Building2 className="h-4 w-4" />
        <span className="hidden sm:inline">Carregando...</span>
      </Button>
    );
  }

  if (units.length === 0) {
    return null;
  }

  const selectedUnit = units.find(u => u.id === selectedUnitId);
  const displayName = selectedUnit?.name || 'Todas as Unidades';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 max-w-[200px]">
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate hidden sm:inline">{displayName}</span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => selectUnit(null)}
          className={cn(
            'flex items-center justify-between',
            !selectedUnitId && 'bg-accent'
          )}
        >
          <span>Todas as Unidades</span>
          {!selectedUnitId && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {units.map((unit) => (
          <DropdownMenuItem
            key={unit.id}
            onClick={() => selectUnit(unit.id)}
            className={cn(
              'flex items-center justify-between',
              selectedUnitId === unit.id && 'bg-accent'
            )}
          >
            <div className="flex flex-col">
              <span>{unit.name}</span>
              {unit.description && (
                <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {unit.description}
                </span>
              )}
            </div>
            {selectedUnitId === unit.id && <Check className="h-4 w-4 shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
