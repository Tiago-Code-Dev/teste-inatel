import { 
  Machine, 
  Tire, 
  Alert, 
  TelemetryReading, 
  OccurrenceReport, 
  TimelineEvent,
  DashboardStats,
  User
} from '@/types';

// Current user (mock)
export const currentUser: User = {
  id: 'user-1',
  name: 'Carlos Silva',
  email: 'carlos.silva@empresa.com',
  role: 'manager',
  unitIds: ['unit-1', 'unit-2'],
};

// Dashboard Stats
export const dashboardStats: DashboardStats = {
  totalMachines: 24,
  machinesOperational: 18,
  machinesWarning: 3,
  machinesCritical: 2,
  machinesOffline: 1,
  activeAlerts: 7,
  openOccurrences: 4,
};

// Machines
export const machines: Machine[] = [
  {
    id: 'machine-1',
    name: 'Trator John Deere 8R 410',
    model: '8R 410',
    unitId: 'unit-1',
    status: 'critical',
    lastTelemetryAt: new Date(Date.now() - 15000),
  },
  {
    id: 'machine-2',
    name: 'Colheitadeira S790',
    model: 'S790',
    unitId: 'unit-1',
    status: 'warning',
    lastTelemetryAt: new Date(Date.now() - 8000),
  },
  {
    id: 'machine-3',
    name: 'Pulverizador M4040',
    model: 'M4040',
    unitId: 'unit-1',
    status: 'operational',
    lastTelemetryAt: new Date(Date.now() - 5000),
  },
  {
    id: 'machine-4',
    name: 'Trator 6M 185',
    model: '6M 185',
    unitId: 'unit-2',
    status: 'operational',
    lastTelemetryAt: new Date(Date.now() - 12000),
  },
  {
    id: 'machine-5',
    name: 'Carregadeira 544L',
    model: '544L',
    unitId: 'unit-2',
    status: 'offline',
    lastTelemetryAt: new Date(Date.now() - 600000),
  },
  {
    id: 'machine-6',
    name: 'Retroescavadeira 310L',
    model: '310L',
    unitId: 'unit-1',
    status: 'operational',
    lastTelemetryAt: new Date(Date.now() - 7000),
  },
];

// Tires
export const tires: Tire[] = [
  {
    id: 'tire-1',
    serial: 'MICH-2024-001234',
    machineId: 'machine-1',
    position: 'Dianteiro Esquerdo',
    lifecycleStatus: 'in_use',
    installedAt: new Date('2024-06-15'),
    currentPressure: 18.5,
    recommendedPressure: 28,
  },
  {
    id: 'tire-2',
    serial: 'MICH-2024-001235',
    machineId: 'machine-1',
    position: 'Dianteiro Direito',
    lifecycleStatus: 'in_use',
    installedAt: new Date('2024-06-15'),
    currentPressure: 27.8,
    recommendedPressure: 28,
  },
  {
    id: 'tire-3',
    serial: 'FIRE-2024-005678',
    machineId: 'machine-2',
    position: 'Traseiro Esquerdo',
    lifecycleStatus: 'in_use',
    installedAt: new Date('2024-03-20'),
    currentPressure: 32,
    recommendedPressure: 35,
  },
];

// Alerts
export const alerts: Alert[] = [
  {
    id: 'alert-1',
    machineId: 'machine-1',
    machineName: 'Trator John Deere 8R 410',
    tireId: 'tire-1',
    tireSerial: 'MICH-2024-001234',
    type: 'pressure_low',
    severity: 'critical',
    status: 'open',
    message: 'Pressão crítica detectada',
    reason: 'Pressão 34% abaixo do recomendado (18.5 PSI vs 28 PSI). Possível furo ou vazamento.',
    openedAt: new Date(Date.now() - 1800000),
    updatedAt: new Date(Date.now() - 1800000),
  },
  {
    id: 'alert-2',
    machineId: 'machine-2',
    machineName: 'Colheitadeira S790',
    tireId: 'tire-3',
    tireSerial: 'FIRE-2024-005678',
    type: 'pressure_low',
    severity: 'medium',
    status: 'acknowledged',
    message: 'Pressão abaixo do ideal',
    reason: 'Pressão 8.5% abaixo do recomendado (32 PSI vs 35 PSI). Verificar calibração.',
    openedAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 1200000),
    acknowledgedBy: 'João Pereira',
  },
  {
    id: 'alert-3',
    machineId: 'machine-1',
    machineName: 'Trator John Deere 8R 410',
    type: 'speed_exceeded',
    severity: 'high',
    status: 'open',
    message: 'Velocidade excessiva detectada',
    reason: 'Velocidade de 52 km/h excede o limite configurado de 40 km/h para operação em campo.',
    openedAt: new Date(Date.now() - 900000),
    updatedAt: new Date(Date.now() - 900000),
  },
  {
    id: 'alert-4',
    machineId: 'machine-5',
    machineName: 'Carregadeira 544L',
    type: 'no_signal',
    severity: 'low',
    status: 'open',
    message: 'Sem sinal há 10+ minutos',
    reason: 'Última telemetria recebida há 10 minutos. Possível área sem cobertura ou equipamento desligado.',
    openedAt: new Date(Date.now() - 600000),
    updatedAt: new Date(Date.now() - 600000),
  },
];

// Generate telemetry data for charts
export function generateTelemetryHistory(machineId: string, hours: number = 1): TelemetryReading[] {
  const readings: TelemetryReading[] = [];
  const now = Date.now();
  const interval = 10000; // 10 seconds
  const pointsCount = (hours * 3600 * 1000) / interval;

  for (let i = 0; i < Math.min(pointsCount, 360); i++) {
    const timestamp = new Date(now - (i * interval));
    
    // Simulate some variation
    const basePressure = machineId === 'machine-1' ? 20 : 32;
    const pressureVariation = Math.sin(i / 10) * 2 + (Math.random() - 0.5) * 1;
    
    const baseSpeed = 15;
    const speedVariation = Math.sin(i / 20) * 8 + (Math.random() - 0.5) * 3;

    readings.push({
      id: `reading-${machineId}-${i}`,
      machineId,
      timestamp,
      pressure: Math.max(0, basePressure + pressureVariation),
      speed: Math.max(0, baseSpeed + speedVariation),
      seq: i,
    });
  }

  return readings.reverse();
}

// Occurrences
export const occurrences: OccurrenceReport[] = [
  {
    id: 'occ-1',
    alertId: 'alert-1',
    machineId: 'machine-1',
    machineName: 'Trator John Deere 8R 410',
    tireId: 'tire-1',
    createdBy: 'user-2',
    createdAt: new Date(Date.now() - 1500000),
    status: 'open',
    description: 'Pneu dianteiro esquerdo apresentando perda de pressão rápida. Identificado possível objeto perfurante. Máquina parada aguardando manutenção.',
    attachments: [
      {
        id: 'media-1',
        reportId: 'occ-1',
        type: 'image',
        url: '/placeholder.svg',
        size: 2048000,
        createdAt: new Date(Date.now() - 1500000),
        uploadStatus: 'completed',
      },
    ],
  },
  {
    id: 'occ-2',
    machineId: 'machine-3',
    machineName: 'Pulverizador M4040',
    createdBy: 'user-3',
    createdAt: new Date(Date.now() - 86400000),
    status: 'resolved',
    description: 'Verificação de rotina realizada. Todos os pneus calibrados conforme especificação.',
    attachments: [],
  },
];

// Timeline for tire history
export const tireTimeline: TimelineEvent[] = [
  {
    id: 'event-1',
    type: 'alert',
    title: 'Alerta de pressão crítica',
    description: 'Pressão detectada em 18.5 PSI (recomendado: 28 PSI)',
    timestamp: new Date(Date.now() - 1800000),
    severity: 'critical',
  },
  {
    id: 'event-2',
    type: 'occurrence',
    title: 'Ocorrência registrada',
    description: 'Possível objeto perfurante identificado',
    timestamp: new Date(Date.now() - 1500000),
  },
  {
    id: 'event-3',
    type: 'maintenance',
    title: 'Calibração preventiva',
    description: 'Pressão ajustada de 26 PSI para 28 PSI',
    timestamp: new Date(Date.now() - 604800000),
  },
  {
    id: 'event-4',
    type: 'installation',
    title: 'Instalação do pneu',
    description: 'Pneu novo instalado na posição Dianteiro Esquerdo',
    timestamp: new Date('2024-06-15'),
  },
];
