import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Truck, Gauge, Clock, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UnderlineTabSystem,
  TirePositionGrid,
  StatusIndicatorBar,
  BigMetricDisplay,
  WorkMetricsCard,
} from "@/components/inatel";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("geral");
  const [selectedTirePosition, setSelectedTirePosition] = useState<number | undefined>();

  const { data: machine } = useQuery({
    queryKey: ['machine-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('machines').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Generate tabs dynamically based on tire count
  const tabs = useMemo(() => {
    const baseTabs = [{ id: "geral", label: "Geral" }];
    // Assuming 4 tires for now
    for (let i = 1; i <= 4; i++) {
      baseTabs.push({ id: `pneu${i}`, label: `Pneu ${i}` });
    }
    return baseTabs;
  }, []);

  // Mock tire data - in real app this would come from API
  const tireData = [
    { position: 1, status: "ok" as const, pressure: 32, label: "Dianteiro E" },
    { position: 2, status: "ok" as const, pressure: 31, label: "Dianteiro D" },
    { position: 3, status: "warning" as const, pressure: 28, label: "Traseiro E" },
    { position: 4, status: "critical" as const, pressure: 18, label: "Traseiro D" },
  ];

  // Mock metrics
  const mockMetrics = {
    speed: 12,
    hoursWorked: 231,
    kmTraveled: 128,
    engate: "Plantadeira",
    avanco: 45,
    patinagem: 22,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-status-ok/15 text-status-ok border border-status-ok/30">
            Em uso
          </span>
        );
      case "maintenance":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-status-warning/15 text-status-warning border border-status-warning/30">
            Manutenção
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
            Parado
          </span>
        );
    }
  };

  if (!machine) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-muted-foreground">Veículo não encontrado</p>
        <Button variant="link" onClick={() => navigate("/devices")}>
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground truncate">
                {machine.name}
              </h1>
              {getStatusBadge(machine.status)}
            </div>
            <p className="text-sm text-muted-foreground">{machine.model}</p>
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
        {activeTab === "geral" ? (
          <>
            {/* Tire Grid */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Visão Geral dos Pneus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TirePositionGrid
                  tires={tireData}
                  selectedPosition={selectedTirePosition}
                  onSelectPosition={(pos) => {
                    setSelectedTirePosition(pos);
                    setActiveTab(`pneu${pos}`);
                  }}
                  showVehicle
                />
              </CardContent>
            </Card>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <BigMetricDisplay
                    value={mockMetrics.speed}
                    unit="km/h"
                    label="Velocidade"
                    status="ok"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Engate</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {mockMetrics.engate}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Work Metrics */}
            <WorkMetricsCard
              hoursWorked={mockMetrics.hoursWorked}
              kmTraveled={mockMetrics.kmTraveled}
            />

            {/* Performance Indicators */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Indicadores de Desempenho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <StatusIndicatorBar
                  value={mockMetrics.avanco}
                  label="Avanço"
                />
                <StatusIndicatorBar
                  value={mockMetrics.patinagem}
                  label="Patinagem"
                />
              </CardContent>
            </Card>
          </>
        ) : (
          /* Tire Detail Tab */
          <TireTabContent
            tireNumber={parseInt(activeTab.replace("pneu", ""))}
            tireData={tireData.find(
              (t) => t.position === parseInt(activeTab.replace("pneu", ""))
            )}
            onViewHistory={() => navigate(`/tires/${activeTab.replace("pneu", "")}`)}
          />
        )}
      </main>
    </div>
  );
}

interface TireTabContentProps {
  tireNumber: number;
  tireData?: {
    position: number;
    status: "ok" | "warning" | "critical" | "offline";
    pressure: number;
    label: string;
  };
  onViewHistory: () => void;
}

function TireTabContent({ tireNumber, tireData, onViewHistory }: TireTabContentProps) {
  if (!tireData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Dados do pneu não disponíveis</p>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ok":
        return { label: "Normal", class: "text-status-ok" };
      case "warning":
        return { label: "Atenção", class: "text-status-warning" };
      case "critical":
        return { label: "Crítico", class: "text-status-critical" };
      default:
        return { label: "Offline", class: "text-muted-foreground" };
    }
  };

  const statusInfo = getStatusLabel(tireData.status);

  return (
    <div className="space-y-4">
      {/* Tire Status Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">
                Pneu {tireNumber} - {tireData.label}
              </h3>
              <p className={`text-sm font-medium ${statusInfo.class}`}>
                {statusInfo.label}
              </p>
            </div>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                tireData.status === "ok"
                  ? "bg-status-ok text-primary-foreground"
                  : tireData.status === "warning"
                  ? "bg-status-warning text-primary-foreground"
                  : tireData.status === "critical"
                  ? "bg-status-critical text-primary-foreground animate-pulse"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tireNumber}
            </div>
          </div>

          {/* Pressure Display */}
          <BigMetricDisplay
            value={tireData.pressure}
            unit="PSI"
            label="Pressão Atual"
            status={tireData.status === "offline" ? "neutral" : tireData.status}
          />
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Vida útil</p>
              <p className="text-lg font-bold">1.234 h</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Gauge className="w-8 h-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Recomendado</p>
              <p className="text-lg font-bold">32 PSI</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View History Button */}
      <Button className="w-full" onClick={onViewHistory}>
        Ver Histórico Completo
      </Button>
    </div>
  );
}
