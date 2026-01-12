// TireWatch Pro - Core Types

export type UserRole = 'admin' | 'manager' | 'technician' | 'operator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  unitIds: string[];
}

export type MachineStatus = 'operational' | 'warning' | 'critical' | 'offline';

export interface Machine {
  id: string;
  name: string;
  model: string;
  unitId: string;
  status: MachineStatus;
  lastTelemetryAt: Date;
  imageUrl?: string;
}

export type TireLifecycleStatus = 'new' | 'in_use' | 'maintenance' | 'retired';

export interface Tire {
  id: string;
  serial: string;
  machineId: string;
  position: string;
  lifecycleStatus: TireLifecycleStatus;
  installedAt: Date;
  currentPressure?: number;
  recommendedPressure: number;
}

export interface TelemetryReading {
  id: string;
  machineId: string;
  tireId?: string;
  timestamp: Date;
  pressure: number;
  speed: number;
  seq: number;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved';
export type AlertType = 'pressure_low' | 'pressure_high' | 'speed_exceeded' | 'no_signal' | 'anomaly';

export interface Alert {
  id: string;
  machineId: string;
  machineName: string;
  tireId?: string;
  tireSerial?: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  reason: string;
  openedAt: Date;
  updatedAt: Date;
  acknowledgedBy?: string;
}

export type OccurrenceStatus = 'pending_upload' | 'uploading' | 'open' | 'in_progress' | 'resolved' | 'closed';

export interface OccurrenceReport {
  id: string;
  alertId?: string;
  machineId: string;
  machineName: string;
  tireId?: string;
  createdBy: string;
  createdAt: Date;
  status: OccurrenceStatus;
  description: string;
  attachments: MediaAttachment[];
}

export type MediaType = 'image' | 'audio' | 'video';
export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';

export interface MediaAttachment {
  id: string;
  reportId: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  size: number;
  duration?: number;
  createdAt: Date;
  uploadStatus: UploadStatus;
}

export interface TimelineEvent {
  id: string;
  type: 'alert' | 'occurrence' | 'maintenance' | 'installation' | 'removal';
  title: string;
  description: string;
  timestamp: Date;
  severity?: AlertSeverity;
}

export interface DashboardStats {
  totalMachines: number;
  machinesOperational: number;
  machinesWarning: number;
  machinesCritical: number;
  machinesOffline: number;
  activeAlerts: number;
  openOccurrences: number;
}
