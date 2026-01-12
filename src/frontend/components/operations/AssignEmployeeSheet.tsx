import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users } from 'lucide-react';
import { Employee, OperationTask } from '@/types/operations';
import { EmployeeCard } from './EmployeeCard';

interface AssignEmployeeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: OperationTask | null;
  employees: Employee[];
  onAssign: (taskId: string, employeeId: string) => void;
}

export function AssignEmployeeSheet({ 
  open, 
  onOpenChange, 
  task, 
  employees, 
  onAssign 
}: AssignEmployeeSheetProps) {
  const [search, setSearch] = useState('');

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.role.toLowerCase().includes(search.toLowerCase()) ||
    emp.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()))
  );

  const availableFirst = [...filteredEmployees].sort((a, b) => {
    if (a.status === 'available' && b.status !== 'available') return -1;
    if (a.status !== 'available' && b.status === 'available') return 1;
    return 0;
  });

  const handleAssign = (employeeId: string) => {
    if (task) {
      onAssign(task.id, employeeId);
      onOpenChange(false);
      setSearch('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Atribuir Funcionário
          </SheetTitle>
          {task && (
            <SheetDescription>
              {task.name}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="py-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, cargo ou habilidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Employee list */}
          <ScrollArea className="h-[calc(85vh-200px)]">
            <div className="space-y-3 pr-4">
              {availableFirst.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">Nenhum funcionário encontrado</p>
                </div>
              ) : (
                availableFirst.map(employee => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    showAssignButton
                    onAssign={() => handleAssign(employee.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
