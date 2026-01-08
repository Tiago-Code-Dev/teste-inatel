import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, User, Truck, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UnderlineTabSystem, DeviceCard } from "@/components/inatel";
import { useTenant } from "@/contexts/TenantContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";

// Helper to get tire status based on pressure
const getTireStatus = (currentPressure: number | null, recommendedPressure: number) => {
  if (currentPressure === null) return "sem_comunicacao" as const;
  const diff = Math.abs(currentPressure - recommendedPressure);
  const percentDiff = (diff / recommendedPressure) * 100;
  if (percentDiff <= 5) return "em_uso" as const;
  if (percentDiff <= 15) return "manutencao" as const;
  return "parado" as const;
};

// Helper to format tire position
const formatTirePosition = (position: string | null) => {
  if (!position) return "Sem posição";
  const positions: Record<string, string> = {
    "1": "Dianteiro Esquerdo",
    "2": "Dianteiro Direito",
    "3": "Traseiro Esquerdo",
    "4": "Traseiro Direito",
  };
  return positions[position] || position;
};

type TabType = "vehicle" | "tire";

export default function DevicesPage() {
  const navigate = useNavigate();
  const { selectedUnitId } = useTenant();
  const [activeTab, setActiveTab] = useState<TabType>("vehicle");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: machines = [], isLoading: isLoadingMachines } = useQuery({
    queryKey: ['machines-devices', selectedUnitId],
    queryFn: async () => {
      let query = supabase.from('machines').select('*');
      if (selectedUnitId) query = query.eq('unit_id', selectedUnitId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: tires = [], isLoading: isLoadingTires } = useQuery({
    queryKey: ['tires-devices', selectedUnitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tires')
        .select('*, machines(name, model)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingMachines || isLoadingTires;

  const tabs = [
    { id: "vehicle", label: "Veículo" },
    { id: "tire", label: "Pneu" },
  ];

  // Map machine status to device status
  const getDeviceStatus = (status: string) => {
    switch (status) {
      case "active":
        return "em_uso" as const;
      case "maintenance":
        return "manutencao" as const;
      case "inactive":
        return "parado" as const;
      default:
        return "sem_comunicacao" as const;
    }
  };

  // Filter machines based on search
  const filteredMachines = machines.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter tires based on search
  const filteredTires = tires.filter(
    (tire) =>
      tire.serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tire.machines?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  return (
    <MainLayout title="Dispositivos" subtitle={`${activeTab === "vehicle" ? filteredMachines.length : filteredTires.length} ${activeTab === "vehicle" ? "veículos" : "pneus"}`}>
      <div className="flex flex-col h-full">
        {/* Search and Tabs */}
        <div className="sticky top-0 z-10 bg-background border-b">
          {/* Search Input */}
          <div className="p-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar dispositivo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <UnderlineTabSystem
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabType)}
          />
        </div>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-muted animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : activeTab === "vehicle" ? (
          /* Vehicle List */
          filteredMachines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Truck className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Nenhum veículo encontrado"
                  : "Nenhum veículo cadastrado"}
              </p>
            </div>
          ) : (
            filteredMachines.map((machine) => (
              <DeviceCard
                key={machine.id}
                title={machine.name}
                subtitle={machine.model}
                status={getDeviceStatus(machine.status)}
                icon={<Truck className="w-5 h-5 text-muted-foreground" />}
                onClick={() => navigate(`/devices/${machine.id}`)}
              />
            ))
          )
        ) : (
          /* Tire List */
          filteredTires.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CircleDot className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Nenhum pneu encontrado"
                  : "Nenhum pneu cadastrado"}
              </p>
            </div>
          ) : (
            filteredTires.map((tire) => (
              <DeviceCard
                key={tire.id}
                title={tire.serial}
                subtitle={tire.machines?.name 
                  ? `${tire.machines.name} - ${formatTirePosition(tire.position)}`
                  : formatTirePosition(tire.position)}
                status={getTireStatus(tire.current_pressure, tire.recommended_pressure)}
                icon={<CircleDot className="w-5 h-5 text-muted-foreground" />}
                onClick={() => navigate(`/tires/${tire.id}`)}
              />
            ))
          )
        )}
      </main>

      {/* Fixed Bottom Add Button */}
      <div className="sticky bottom-0 p-4 bg-background border-t safe-area-bottom">
        <Button
          size="lg"
          className="w-full h-12 gap-2 font-semibold"
          onClick={() => navigate(activeTab === "vehicle" ? "/devices/new" : "/tires/new")}
        >
          <Plus className="w-5 h-5" />
          {activeTab === "vehicle" ? "ADICIONAR VEÍCULO" : "ADICIONAR PNEU"}
        </Button>
      </div>
      </div>
    </MainLayout>
  );
}
