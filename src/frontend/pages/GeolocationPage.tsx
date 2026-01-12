import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, RefreshCw, MapPin, AlertTriangle } from 'lucide-react';
import { useGeolocation, useGeoThresholds, GeoLocationData } from '@/hooks/useGeolocation';
import {
  GeoPerformanceMap,
  TerrainInfoCard,
  GeoAlertCard,
  GeoLocationDetailSheet,
  GeoSettingsModal,
  GeoSummaryCard,
} from '@/components/geolocation';

export default function GeolocationPage() {
  const [selectedMachineId, setSelectedMachineId] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<GeoLocationData | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { thresholds } = useGeoThresholds();
  const {
    geoData,
    machines,
    alerts,
    stats,
    isLoading,
    getPerformanceStatus,
    getTerrainImpact,
    getClimateImpact,
    checkAlerts,
  } = useGeolocation(selectedMachineId === 'all' ? undefined : selectedMachineId);

  const handleLocationSelect = (location: GeoLocationData) => {
    setSelectedLocation(location);
    setDetailSheetOpen(true);
  };

  if (isLoading) {
    return (
      <MainLayout title="Análise por Geolocalização">
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Análise por Geolocalização">
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 pb-20 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Análise por Geolocalização
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitore o desempenho dos pneus por localização, terreno e clima
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedMachineId} onValueChange={setSelectedMachineId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas as máquinas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as máquinas</SelectItem>
                {machines.map((machine) => (
                  <SelectItem key={machine.id} value={machine.id}>
                    {machine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={() => checkAlerts()}>
              <RefreshCw className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <GeoSummaryCard stats={stats} alertCount={alerts.length} />

        {/* Map */}
        <div className="h-[400px] lg:h-[500px]">
          <GeoPerformanceMap
            locations={geoData}
            getPerformanceStatus={getPerformanceStatus}
            onLocationSelect={handleLocationSelect}
            selectedLocationId={selectedLocation?.id}
          />
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Alertas Ativos ({alerts.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {alerts.slice(0, 6).map((alert) => (
                <GeoAlertCard
                  key={alert.id}
                  alert={alert}
                  onViewDetails={() => {
                    const loc = geoData.find(d => d.tireId === alert.tireId);
                    if (loc) handleLocationSelect(loc);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Locations Grid */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Localizações ({geoData.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {geoData.map((location) => (
              <TerrainInfoCard
                key={location.id}
                location={location}
                terrainImpact={getTerrainImpact(location.terrainType)}
                climateImpact={getClimateImpact(location.climate)}
                onViewDetails={() => handleLocationSelect(location)}
              />
            ))}
          </div>
        </div>

        {/* Detail Sheet */}
        <GeoLocationDetailSheet
          location={selectedLocation}
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
          getPerformanceStatus={getPerformanceStatus}
          terrainImpact={selectedLocation ? getTerrainImpact(selectedLocation.terrainType) : 1}
          climateImpact={selectedLocation ? getClimateImpact(selectedLocation.climate) : 1}
        />

        {/* Settings Modal */}
        <GeoSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </MainLayout>
  );
}
