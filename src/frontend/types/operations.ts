// Phase 6 - Operation Management Types

export type TaskStatus = 'pending' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
export type EmployeeStatus = 'available' | 'busy' | 'paused' | 'offline';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskType = 'preventive_maintenance' | 'corrective_maintenance' | 'telemetry_monitoring' | 'tire_change' | 'inspection' | 'other';

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  status: EmployeeStatus;
  currentTaskId?: string;
  activeTasks: number;
  skills: string[];
  email?: string;
  phone?: string;
}

export interface OperationTask {
  id: string;
  name: string;
  description: string;
  type: TaskType;
  machineId: string;
  machineName: string;
  tireId?: string;
  tireSerial?: string;
  assignedTo?: string;
  assignedToName?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  slaDueAt: Date;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  progress: number; // 0-100
}

export interface ActivityLogEntry {
  id: string;
  employeeId?: string;
  employeeName?: string;
  taskId: string;
  taskName: string;
  action: 'created' | 'assigned' | 'started' | 'paused' | 'resumed' | 'completed' | 'cancelled' | 'note_added';
  description: string;
  timestamp: Date;
}

export interface OperationFilters {
  status: TaskStatus[];
  priority: TaskPriority[];
  type: TaskType[];
  assignedTo: string[];
  slaStatus: ('ok' | 'warning' | 'expired')[];
}

export interface TaskSettings {
  defaultSlaHours: number;
  warningThresholdMinutes: number;
  autoAssign: boolean;
}
