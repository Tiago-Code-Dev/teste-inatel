import { useState, useCallback, useMemo } from 'react';
import { 
  OperationTask, 
  Employee, 
  ActivityLogEntry, 
  TaskStatus, 
  TaskSettings,
  OperationFilters
} from '@/types/operations';
import { differenceInMinutes, addHours, subMinutes } from 'date-fns';

// Mock employees data
const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'João Silva',
    role: 'Técnico Senior',
    status: 'available',
    activeTasks: 0,
    skills: ['manutenção preventiva', 'troca de pneus', 'telemetria']
  },
  {
    id: 'emp-2',
    name: 'Maria Santos',
    role: 'Operadora',
    status: 'busy',
    currentTaskId: 'task-1',
    activeTasks: 1,
    skills: ['monitoramento', 'inspeção']
  },
  {
    id: 'emp-3',
    name: 'Carlos Oliveira',
    role: 'Técnico',
    status: 'available',
    activeTasks: 0,
    skills: ['manutenção corretiva', 'diagnóstico']
  },
  {
    id: 'emp-4',
    name: 'Ana Costa',
    role: 'Supervisora',
    status: 'paused',
    activeTasks: 2,
    skills: ['gestão', 'inspeção', 'manutenção preventiva']
  },
  {
    id: 'emp-5',
    name: 'Pedro Lima',
    role: 'Técnico Junior',
    status: 'offline',
    activeTasks: 0,
    skills: ['inspeção', 'monitoramento']
  }
];

// Mock tasks data
const now = new Date();
const mockTasks: OperationTask[] = [
  {
    id: 'task-1',
    name: 'Manutenção Preventiva - Máquina #001',
    description: 'Realizar manutenção preventiva conforme checklist padrão',
    type: 'preventive_maintenance',
    machineId: 'machine-1',
    machineName: 'Trator CAT 950H',
    assignedTo: 'emp-2',
    assignedToName: 'Maria Santos',
    status: 'in_progress',
    priority: 'high',
    estimatedDuration: 120,
    slaDueAt: addHours(now, 2),
    createdAt: subMinutes(now, 90),
    startedAt: subMinutes(now, 45),
    progress: 65
  },
  {
    id: 'task-2',
    name: 'Troca de Pneu - Posição DE',
    description: 'Substituir pneu desgastado na posição dianteira esquerda',
    type: 'tire_change',
    machineId: 'machine-2',
    machineName: 'Carregadeira 966H',
    tireId: 'tire-2',
    tireSerial: 'PN-2024-002',
    status: 'pending',
    priority: 'critical',
    estimatedDuration: 60,
    slaDueAt: addHours(now, 1),
    createdAt: subMinutes(now, 30),
    progress: 0
  },
  {
    id: 'task-3',
    name: 'Inspeção de Telemetria',
    description: 'Verificar sensores de telemetria e calibrar se necessário',
    type: 'telemetry_monitoring',
    machineId: 'machine-3',
    machineName: 'Escavadeira 320D',
    assignedTo: 'emp-4',
    assignedToName: 'Ana Costa',
    status: 'paused',
    priority: 'medium',
    estimatedDuration: 45,
    slaDueAt: addHours(now, 4),
    createdAt: subMinutes(now, 180),
    startedAt: subMinutes(now, 120),
    progress: 40,
    notes: 'Aguardando peça de reposição'
  },
  {
    id: 'task-4',
    name: 'Manutenção Corretiva - Sistema Hidráulico',
    description: 'Reparar vazamento no sistema hidráulico',
    type: 'corrective_maintenance',
    machineId: 'machine-1',
    machineName: 'Trator CAT 950H',
    status: 'pending',
    priority: 'high',
    estimatedDuration: 180,
    slaDueAt: subMinutes(now, 30), // Expired SLA
    createdAt: subMinutes(now, 240),
    progress: 0
  },
  {
    id: 'task-5',
    name: 'Inspeção Visual - Frota Completa',
    description: 'Realizar inspeção visual de rotina em todas as máquinas',
    type: 'inspection',
    machineId: 'machine-4',
    machineName: 'Motoniveladora 140K',
    assignedTo: 'emp-4',
    assignedToName: 'Ana Costa',
    status: 'completed',
    priority: 'low',
    estimatedDuration: 90,
    actualDuration: 85,
    slaDueAt: subMinutes(now, 60),
    createdAt: subMinutes(now, 300),
    startedAt: subMinutes(now, 200),
    completedAt: subMinutes(now, 60),
    progress: 100
  }
];

const mockActivityLog: ActivityLogEntry[] = [
  {
    id: 'log-1',
    employeeId: 'emp-2',
    employeeName: 'Maria Santos',
    taskId: 'task-1',
    taskName: 'Manutenção Preventiva - Máquina #001',
    action: 'started',
    description: 'Iniciou a manutenção preventiva',
    timestamp: subMinutes(now, 45)
  },
  {
    id: 'log-2',
    employeeId: 'emp-4',
    employeeName: 'Ana Costa',
    taskId: 'task-3',
    taskName: 'Inspeção de Telemetria',
    action: 'paused',
    description: 'Pausou aguardando peça de reposição',
    timestamp: subMinutes(now, 60)
  },
  {
    id: 'log-3',
    taskId: 'task-2',
    taskName: 'Troca de Pneu - Posição DE',
    action: 'created',
    description: 'Tarefa criada a partir de alerta crítico',
    timestamp: subMinutes(now, 30)
  },
  {
    id: 'log-4',
    employeeId: 'emp-4',
    employeeName: 'Ana Costa',
    taskId: 'task-5',
    taskName: 'Inspeção Visual - Frota Completa',
    action: 'completed',
    description: 'Concluiu a inspeção em 85 minutos',
    timestamp: subMinutes(now, 60)
  }
];

const defaultSettings: TaskSettings = {
  defaultSlaHours: 4,
  warningThresholdMinutes: 30,
  autoAssign: false
};

const SETTINGS_KEY = 'tirewatch-operation-settings';

export function useOperations() {
  const [tasks, setTasks] = useState<OperationTask[]>(mockTasks);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(mockActivityLog);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<OperationFilters>({
    status: [],
    priority: [],
    type: [],
    assignedTo: [],
    slaStatus: []
  });

  const [settings, setSettings] = useState<TaskSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const saveSettings = useCallback((newSettings: TaskSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  }, []);

  const getSlaStatus = useCallback((task: OperationTask): 'ok' | 'warning' | 'expired' => {
    if (task.status === 'completed' || task.status === 'cancelled') return 'ok';
    
    const now = new Date();
    const minutesRemaining = differenceInMinutes(task.slaDueAt, now);
    
    if (minutesRemaining < 0) return 'expired';
    if (minutesRemaining <= settings.warningThresholdMinutes) return 'warning';
    return 'ok';
  }, [settings.warningThresholdMinutes]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.status.length > 0 && !filters.status.includes(task.status)) return false;
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false;
      if (filters.type.length > 0 && !filters.type.includes(task.type)) return false;
      if (filters.assignedTo.length > 0) {
        if (filters.assignedTo.includes('unassigned') && !task.assignedTo) return true;
        if (task.assignedTo && !filters.assignedTo.includes(task.assignedTo)) return false;
      }
      if (filters.slaStatus.length > 0) {
        const status = getSlaStatus(task);
        if (!filters.slaStatus.includes(status)) return false;
      }
      return true;
    });
  }, [tasks, filters, getSlaStatus]);

  const taskStats = useMemo(() => {
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const paused = tasks.filter(t => t.status === 'paused').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const unassigned = tasks.filter(t => !t.assignedTo && t.status !== 'completed' && t.status !== 'cancelled').length;
    const slaExpired = tasks.filter(t => getSlaStatus(t) === 'expired').length;
    const slaWarning = tasks.filter(t => getSlaStatus(t) === 'warning').length;

    return {
      pending,
      inProgress,
      paused,
      completed,
      unassigned,
      slaExpired,
      slaWarning,
      total: tasks.length
    };
  }, [tasks, getSlaStatus]);

  const availableEmployees = useMemo(() => 
    employees.filter(e => e.status === 'available'),
  [employees]);

  const addActivityEntry = useCallback((entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: ActivityLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      timestamp: new Date()
    };
    setActivityLog(prev => [newEntry, ...prev]);
  }, []);

  const assignTask = useCallback((taskId: string, employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          assignedTo: employeeId,
          assignedToName: employee.name,
          status: 'pending' as TaskStatus
        };
      }
      return task;
    }));

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      addActivityEntry({
        employeeId,
        employeeName: employee.name,
        taskId,
        taskName: task.name,
        action: 'assigned',
        description: `Tarefa atribuída para ${employee.name}`
      });
    }
  }, [employees, tasks, addActivityEntry]);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus, notes?: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updates: Partial<OperationTask> = { status };
        
        if (status === 'in_progress' && !task.startedAt) {
          updates.startedAt = new Date();
        }
        if (status === 'completed') {
          updates.completedAt = new Date();
          updates.progress = 100;
          if (task.startedAt) {
            updates.actualDuration = differenceInMinutes(new Date(), task.startedAt);
          }
        }
        if (notes) {
          updates.notes = notes;
        }

        return { ...task, ...updates };
      }
      return task;
    }));

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const actionMap: Record<TaskStatus, ActivityLogEntry['action']> = {
        pending: 'created',
        in_progress: 'started',
        paused: 'paused',
        completed: 'completed',
        cancelled: 'cancelled'
      };

      addActivityEntry({
        employeeId: task.assignedTo,
        employeeName: task.assignedToName,
        taskId,
        taskName: task.name,
        action: status === 'in_progress' && task.status === 'paused' ? 'resumed' : actionMap[status],
        description: notes || `Status alterado para ${status}`
      });
    }
  }, [tasks, addActivityEntry]);

  const updateTaskProgress = useCallback((taskId: string, progress: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, progress: Math.min(100, Math.max(0, progress)) } : task
    ));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      status: [],
      priority: [],
      type: [],
      assignedTo: [],
      slaStatus: []
    });
  }, []);

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    employees,
    availableEmployees,
    activityLog,
    taskStats,
    filters,
    settings,
    isLoading,
    setFilters,
    clearFilters,
    saveSettings,
    assignTask,
    updateTaskStatus,
    updateTaskProgress,
    getSlaStatus
  };
}
