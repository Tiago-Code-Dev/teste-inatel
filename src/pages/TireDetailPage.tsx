import { useState } from "react";
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

export default function TireDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");

  const tabs = [
    { id: "info", label: "Informações" },
    { id: "history", label: "Histórico" },
    { id: "alerts", label: "Alertas" },
  ];

  // Mock tire data
  const tireData = {
    id,
    model: "Firestone 18.4R38",
    position: 3,
    positionLabel: "Traseiro Esquerdo",
    currentPressure: 28,
    recommendedPressure: 32,
    status: "warning" as const,
    lifeHours: 1234,
    kmTraveled: 8567,
    installedAt: new Date("2024-06-15"),
    lastUpdate: new Date(),
  };

  // Mock pressure history
  const pressureHistory = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    pressure: 28 + Math.random() * 6 - 3,
  }));

  // Mock tire grid (showing current tire highlighted)
  const allTires = [
    { position: 1, status: "ok" as const, pressure: 32 },
    { position: 2, status: "ok" as const, pressure: 31 },
    { position: 3, status: "warning" as const, pressure: 28 },
    { position: 4, status: "critical" as const, pressure: 18 },
  ];

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

  const getPressureStatus = () => {
    const diff = tireData.currentPressure - tireData.recommendedPressure;
    if (Math.abs(diff) <= 2) return "ok";
    if (Math.abs(diff) <= 5) return "warning";
    return "critical";
  };

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
                <CardTitle className="text-base">Posição no Veículo</CardTitle>
              </CardHeader>
              <CardContent>
                <TirePositionGrid
                  tires={allTires}
                  selectedPosition={tireData.position}
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
  );
}
