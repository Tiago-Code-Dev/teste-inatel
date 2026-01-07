import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, User, Truck, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UnderlineTabSystem, DeviceCard } from "@/components/inatel";
import { useTenant } from "@/contexts/TenantContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type TabType = "vehicle" | "tire";

export default function DevicesPage() {
  const navigate = useNavigate();
  const { selectedUnitId } = useTenant();
  const [activeTab, setActiveTab] = useState<TabType>("vehicle");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: machines = [], isLoading } = useQuery({
    queryKey: ['machines-devices', selectedUnitId],
    queryFn: async () => {
      let query = supabase.from('machines').select('*');
      if (selectedUnitId) query = query.eq('unit_id', selectedUnitId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-foreground">Dispositivos</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="px-4 pb-3">
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
      </header>

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
          /* Tire List - placeholder */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CircleDot className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Selecione um veículo para ver os pneus
            </p>
          </div>
        )}
      </main>

      {/* FAB Add Button */}
      <div className="fixed bottom-20 right-4 z-20">
        <Button
          size="lg"
          className="rounded-full shadow-lg h-14 px-6 gap-2"
          onClick={() => navigate("/devices/new")}
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">
            {activeTab === "vehicle" ? "Adicionar Veículo" : "Adicionar Pneu"}
          </span>
        </Button>
      </div>
    </div>
  );
}
