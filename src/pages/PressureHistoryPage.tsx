import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UnderlineTabSystem,
  BigMetricDisplay,
  OperationHistoryChart,
} from "@/components/inatel";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PressureHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("today");

  // Generate date tabs
  const dateTabs = useMemo(() => {
    const tabs = [{ id: "today", label: "Hoje" }];
    for (let i = 1; i <= 6; i++) {
      const date = subDays(new Date(), i);
      tabs.push({
        id: format(date, "yyyy-MM-dd"),
        label: format(date, "dd/MM"),
      });
    }
    return tabs;
  }, []);

  // Mock current pressure
  const currentPressure = 28;
  const recommendedPressure = 32;

  // Mock operation data for the chart
  const operationData = useMemo(() => {
    const data = [];
    for (let hour = 6; hour <= 22; hour++) {
      // Simulate different operation levels throughout the day
      let value = 0;
      if (hour >= 7 && hour <= 11) value = 80 + Math.random() * 20; // Morning work
      else if (hour >= 12 && hour <= 13) value = 10 + Math.random() * 10; // Lunch break
      else if (hour >= 14 && hour <= 18) value = 70 + Math.random() * 25; // Afternoon work
      else value = Math.random() * 15; // Idle

      data.push({
        time: `${String(hour).padStart(2, "0")}:00`,
        value: Math.round(value),
        operation:
          value > 60 ? "working" : value > 20 ? "transport" : "idle",
      });
    }
    return data;
  }, [activeTab]);

  const getPressureStatus = () => {
    const diff = currentPressure - recommendedPressure;
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
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">
              Histórico de Pressão
            </h1>
            <p className="text-sm text-muted-foreground">
              Pneu {id} - Traseiro Esquerdo
            </p>
          </div>
          <Button variant="outline" size="icon">
            <Calendar className="w-5 h-5" />
          </Button>
        </div>

        {/* Date Tabs */}
        <UnderlineTabSystem
          tabs={dateTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4 space-y-4">
        {/* Current Pressure Display */}
        <Card className="bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-6 flex items-center justify-center">
            <BigMetricDisplay
              value={currentPressure}
              unit="PSI"
              status={getPressureStatus()}
              className="text-center"
            />
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Mínima</p>
              <p className="text-lg font-bold text-status-warning">24 PSI</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Média</p>
              <p className="text-lg font-bold text-foreground">28 PSI</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Máxima</p>
              <p className="text-lg font-bold text-status-ok">31 PSI</p>
            </CardContent>
          </Card>
        </div>

        {/* Operation History Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {activeTab === "today"
                ? "Operações de Hoje"
                : `Operações de ${format(
                    activeTab === "today" ? new Date() : new Date(activeTab),
                    "dd/MM/yyyy"
                  )}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OperationHistoryChart
              data={operationData}
              currentTime={activeTab === "today" ? format(new Date(), "HH:mm") : undefined}
            />
          </CardContent>
        </Card>

        {/* Timeline Events */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Eventos do Dia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <TimelineEvent
              time="07:15"
              event="Início de operação"
              type="start"
            />
            <TimelineEvent
              time="09:30"
              event="Pressão caiu para 26 PSI"
              type="warning"
            />
            <TimelineEvent
              time="09:45"
              event="Calibragem realizada"
              type="action"
            />
            <TimelineEvent
              time="12:00"
              event="Pausa para almoço"
              type="pause"
            />
            <TimelineEvent
              time="13:30"
              event="Retorno de operação"
              type="start"
            />
            <TimelineEvent
              time="18:00"
              event="Fim de operação"
              type="end"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

interface TimelineEventProps {
  time: string;
  event: string;
  type: "start" | "end" | "warning" | "action" | "pause";
}

function TimelineEvent({ time, event, type }: TimelineEventProps) {
  const getTypeStyles = () => {
    switch (type) {
      case "start":
        return "bg-status-ok/20 border-status-ok";
      case "end":
        return "bg-muted border-muted-foreground";
      case "warning":
        return "bg-status-warning/20 border-status-warning";
      case "action":
        return "bg-primary/20 border-primary";
      case "pause":
        return "bg-muted border-border";
      default:
        return "bg-muted border-border";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-mono text-muted-foreground w-12">
        {time}
      </span>
      <div className={`w-3 h-3 rounded-full border-2 ${getTypeStyles()}`} />
      <span className="text-sm text-foreground">{event}</span>
    </div>
  );
}
