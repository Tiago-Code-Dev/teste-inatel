// Legacy components
export { MachineStatusCard } from './MachineStatusCard';
export { AlertTriageCard } from './AlertTriageCard';
export { OccurrenceCard } from './OccurrenceCard';
export { AlertFilters } from './AlertFilters';
export { ExportReportModal } from './ExportReportModal';
export { QuickStat, QuickStatsGrid } from './QuickStats';
export { AlertDetailSheet } from './AlertDetailSheet';
export { MaintenanceCard } from './MaintenanceCard';
export { UserAssignmentModal } from './UserAssignmentModal';

// New refactored components (Phase 1)
export { DashboardSkeleton, MetricCardSkeleton, MachineCardSkeleton, AlertCardSkeleton } from './DashboardSkeleton';
export { DashboardErrorBoundary, DashboardError, DashboardEmptyState } from './DashboardErrorBoundary';
export { MetricCard } from './MetricCard';
export { StatusSummaryCard, StatusSummaryGrid } from './StatusSummaryCard';
export { MachineCard } from './MachineCard';
export { AlertCard } from './AlertCard';

// Phase 2: Visual Storytelling
export { FleetHealthGauge } from './FleetHealthGauge';
export { TelemetrySparkline, LiveSparkline, ConnectionIndicator } from './TelemetrySparkline';
export { AlertTicker } from './AlertTicker';
export { GlassMachineCard } from './GlassMachineCard';
export { HeroSection, GlassCard, GlassPanel } from './GlassComponents';

// Phase 3: Microinteractions
export { DashboardShimmer, ShimmerSkeleton, MachineCardShimmer, AlertCardShimmer, HeroShimmer } from './ShimmerSkeleton';
export { SwipeableCard, useHapticFeedback } from './SwipeableCard';
export { StaggeredList, StaggeredItem, StaggeredCards } from './StaggeredList';
export { HapticButton, HapticFAB, HapticCard } from './HapticButton';
export { PullToRefreshIndicator } from './PullToRefreshIndicator';

// Phase 4: Intelligence Layer
export { AIInsightsWidget, PredictionsCard, AnomaliesCard, RecommendationsCard } from './AIInsightsWidgets';
export { IntelligenceLayer } from './IntelligenceLayer';
