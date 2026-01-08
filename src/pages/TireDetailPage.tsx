import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Clock, Gauge, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UnderlineTabSystem,
  TirePositionGrid,
  BigMetricDisplay,
  WorkMetricsCard,
  Pressure24hChart,
} from "@/components/inatel";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTelemetry } from "@/hooks/useRealtimeTelemetry";
import { MainLayout } from "@/components/layout/MainLayout";

export default function TireDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");

  const tabs = [
    { id: "info", label: "Informações" },
    { id: "history", label: "Histórico" },
    { id: "alerts", label: "Alertas" },
  ];

  // Fetch tire data from database
  const { data: tire, isLoading: tireLoading } = useQuery({
    queryKey: ['tire-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tires')
        .select('*, machines(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch all tires for the same machine
  const { data: machineTires } = useQuery({
    queryKey: ['machine-tires-for-tire', tire?.machine_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tires')
        .select('*')
        .eq('machine_id', tire!.machine_id);
      if (error) throw error;
      return data;
    },
    enabled: !!tire?.machine_id,
  });

  // Real-time telemetry for the machine this tire belongs to
  const { telemetryData, latestReading, isLoading: telemetryLoading } = useRealtimeTelemetry(tire?.machine_id);

  // Helper to determine tire status based on pressure
  const getTireStatus = (pressure: number | null, recommended: number): "ok" | "warning" | "critical" | "offline" => {
    if (pressure === null) return "offline";
    const diff = Math.abs(pressure - recommended);
    if (diff <= 2) return "ok";
    if (diff <= 5) return "warning";
    return "critical";
  };

  // Position labels mapping
  const positionLabels: Record<string, string> = {
    "front_left": "Dianteiro Esquerdo",
    "front_right": "Dianteiro Direito",
    "rear_left": "Traseiro Esquerdo",
    "rear_right": "Traseiro Direito",
  };

  // Derived tire data with real values
  const tireData = useMemo(() => {
    if (!tire) return null;
    
    const currentPressure = tire.current_pressure ?? latestReading?.pressure ?? 0;
    const status = getTireStatus(currentPressure, tire.recommended_pressure);
    
    return {
      id: tire.id,
      model: tire.serial || "Pneu",
      position: machineTires?.findIndex(t => t.id === tire.id) ?? 0 + 1,
      positionLabel: positionLabels[tire.position || ''] || tire.position || "Não definido",
      currentPressure,
      recommendedPressure: tire.recommended_pressure,
      status,
      lifeHours: 1234, // TODO: Calculate from telemetry history
      kmTraveled: 8567, // TODO: Calculate from telemetry history
      installedAt: tire.installed_at ? new Date(tire.installed_at) : new Date(tire.created_at),
      lastUpdate: tire.updated_at ? new Date(tire.updated_at) : new Date(),
    };
  }, [tire, machineTires, latestReading]);

  // Generate pressure history from real telemetry data
  const pressureHistory = useMemo(() => {
    if (!telemetryData || telemetryData.length === 0) {
      // Generate mock data if no real data available
      return Array.from({ length: 24 }, (_, i) => ({
        time: `${String(i).padStart(2, "0")}:00`,
        pressure: (tireData?.currentPressure || 28) + Math.random() * 6 - 3,
      }));
    }

    // Group telemetry by hour and get average pressure
    const hourlyData: Record<string, number[]> = {};
    telemetryData.forEach(reading => {
      const hour = format(new Date(reading.timestamp), "HH:00");
      if (!hourlyData[hour]) hourlyData[hour] = [];
      hourlyData[hour].push(reading.pressure);
    });

    return Object.entries(hourlyData).map(([time, pressures]) => ({
      time,
      pressure: pressures.reduce((a, b) => a + b, 0) / pressures.length,
    })).sort((a, b) => a.time.localeCompare(b.time));
  }, [telemetryData, tireData?.currentPressure]);

  // Map all tires to grid format
  const allTires = useMemo(() => {
    if (!machineTires || machineTires.length === 0) {
      return [
        { position: 1, status: "offline" as const, pressure: 0 },
        { position: 2, status: "offline" as const, pressure: 0 },
        { position: 3, status: "offline" as const, pressure: 0 },
        { position: 4, status: "offline" as const, pressure: 0 },
      ];
    }

    return machineTires.map((t, index) => ({
      position: index + 1,
      status: getTireStatus(t.current_pressure, t.recommended_pressure),
      pressure: t.current_pressure || 0,
    }));
  }, [machineTires]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-status-ok/15 text-status-ok border border-status-ok/30">
            Normal
          </span>
        );
      case "warning":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-status-warning/15 text-status-warning border border-status-warning/30">
            Atenção
          </span>
        );
      case "critical":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-status-critical/15 text-status-critical border border-status-critical/30">
            Crítico
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
            Offline
          </span>
        );
    }
  };

  const getPressureStatus = (): "ok" | "warning" | "critical" | "neutral" => {
    if (!tireData) return "neutral";
    const diff = tireData.currentPressure - tireData.recommendedPressure;
    if (Math.abs(diff) <= 2) return "ok";
    if (Math.abs(diff) <= 5) return "warning";
    return "critical";
  };

  // Loading state
  if (tireLoading) {
    return (
      <MainLayout title="Carregando...">
        <div className="flex flex-col items-center justify-center h-[60vh] p-4">
          <p className="text-muted-foreground">Carregando dados do pneu...</p>
        </div>
      </MainLayout>
    );
  }

  // Not found state
  if (!tire || !tireData) {
    return (
      <MainLayout title="Pneu não encontrado">
        <div className="flex flex-col items-center justify-center h-[60vh] p-4">
          <p className="text-muted-foreground">Pneu não encontrado</p>
          <Button variant="link" onClick={() => navigate("/devices")}>
            Voltar para lista
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={tireData.model} subtitle={`Posição: ${tireData.positionLabel}`}>
      <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground truncate">
                {tireData.model}
              </h1>
              {getStatusBadge(tireData.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              Posição: {tireData.positionLabel}
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <UnderlineTabSystem
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4 space-y-4">
        {activeTab === "info" && (
          <>
            {/* Tire Position Grid */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Posição no Veículo
                  {tire.machines && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({tire.machines.name})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TirePositionGrid
                  tires={allTires}
                  selectedPosition={tireData.position}
                  showVehicle
                />
              </CardContent>
            </Card>

            {/* Pressure Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  Pressão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <BigMetricDisplay
                    value={tireData.currentPressure}
                    unit="PSI"
                    label="Atual"
                    status={getPressureStatus()}
                  />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Recomendado</p>
                    <p className="text-2xl font-bold text-foreground">
                      {tireData.recommendedPressure}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        PSI
                      </span>
                    </p>
                  </div>
                </div>

                {/* 24h Chart */}
                <Pressure24hChart
                  data={pressureHistory}
                  currentPressure={tireData.currentPressure}
                  recommendedPressure={tireData.recommendedPressure}
                />
              </CardContent>
            </Card>

            {/* Work Metrics */}
            <WorkMetricsCard
              hoursWorked={tireData.lifeHours}
              kmTraveled={tireData.kmTraveled}
            />

            {/* Installation Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Instalado em</p>
                    <p className="font-medium text-foreground">
                      {format(tireData.installedAt, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Last Update */}
            <p className="text-xs text-center text-muted-foreground">
              Última atualização:{" "}
              {format(tireData.lastUpdate, "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Histórico de Pressão</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => navigate(`/pressure-history/${id}`)}
                >
                  Ver Histórico Detalhado
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-4">
            {/* Mock alerts */}
            <Card className="border-l-4 border-l-status-warning">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-status-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Pressão abaixo do recomendado
                    </p>
                    <p className="text-sm text-muted-foreground">
                      28 PSI (recomendado: 32 PSI)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hoje às 14:32
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      </div>
    </MainLayout>
  );
}
