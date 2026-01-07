import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Settings, CircleDot, AlertTriangle, Zap, 
  RefreshCw, CheckCircle
} from 'lucide-react';
import { useTireCalibration } from '@/hooks/useTireCalibration';
import {
  TireCalibrationCard,
  CalibrationChart,
  CalibrationAlertCard,
  TireCalibrationDetailSheet,
  CalibrationStatsCard,
  CalibrationSettingsModal
} from '@/components/calibration';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const TireCalibrationPage = () => {
  const {
    calibrationData,
    alerts,
    stats,
    pressureTrendData,
    thresholds,
    updateThresholds,
    getTireCalibration,
    calibrateTire,
    calibrateAll,
    isLoading
  } = useTireCalibration();

  const [showSettings, setShowSettings] = useState(false);
  const [selectedTireId, setSelectedTireId] = useState<string | null>(null);
  const [calibratingTires, setCalibratingTires] = useState<Set<string>>(new Set());
  const [isCalibrationAll, setIsCalibratingAll] = useState(false);

  const selectedTire = selectedTireId ? getTireCalibration(selectedTireId) : null;

  const handleCalibrateTire = async (tireId: string, targetPressure?: number) => {
    setCalibratingTires(prev => new Set(prev).add(tireId));
    
    try {
      await calibrateTire(tireId, targetPressure);
      toast.success('Pneu calibrado com sucesso!');
    } catch (error) {
      toast.error('Erro ao calibrar pneu');
    } finally {
      setCalibratingTires(prev => {
        const next = new Set(prev);
        next.delete(tireId);
        return next;
      });
    }
  };

  const handleCalibrateAll = async () => {
    setIsCalibratingAll(true);
    
    try {
      await calibrateAll();
      toast.success('Todos os pneus foram calibrados!');
    } catch (error) {
      toast.error('Erro ao calibrar pneus');
    } finally {
      setIsCalibratingAll(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Calibração Automática">
        <div className="space-y-4 p-4">
          <Skeleton className="h-40" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  const tiresNeedingCalibration = calibrationData.filter(t => t.status !== 'optimal').length;

  return (
    <MainLayout title="Calibração Automática">
      <div className="space-y-4 p-4 pb-24 md:pb-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <CircleDot className="h-3 w-3" />
              {stats.totalTires} pneus
            </Badge>
            {stats.activeAlerts > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {stats.activeAlerts} alertas
              </Badge>
            )}
            {stats.optimal === stats.totalTires && (
              <Badge variant="secondary" className="gap-1 text-emerald-500">
                <CheckCircle className="h-3 w-3" />
                Todos calibrados
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            {tiresNeedingCalibration > 0 && (
              <Button 
                size="sm"
                onClick={handleCalibrateAll}
                disabled={isCalibrationAll}
              >
                {isCalibrationAll ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-1" />
                )}
                Calibrar Todos ({tiresNeedingCalibration})
              </Button>
            )}
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="tires">
              Pneus
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                {calibrationData.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="alerts">
              Alertas
              {alerts.length > 0 && (
                <Badge variant="destructive" className="ml-1.5 h-5 w-5 p-0 text-xs">
                  {alerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Stats */}
            <CalibrationStatsCard stats={stats} />
            
            {/* Pressure Chart */}
            <CalibrationChart 
              data={pressureTrendData} 
              title="Tendência de Pressão (Média)" 
            />
            
            {/* Critical Tires */}
            {calibrationData.filter(t => t.status === 'critical').length > 0 && (
              <Card className="border-red-500/30">
                <CardContent className="p-4">
                  <h3 className="font-medium text-red-500 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Pneus Críticos
                  </h3>
                  <div className="space-y-2">
                    {calibrationData
                      .filter(t => t.status === 'critical')
                      .slice(0, 3)
                      .map(tire => (
                        <div 
                          key={tire.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-red-500/10"
                        >
                          <div>
                            <span className="font-medium text-sm">{tire.serial}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {tire.currentPressure} psi
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => handleCalibrateTire(tire.tireId)}
                            disabled={calibratingTires.has(tire.tireId)}
                          >
                            {calibratingTires.has(tire.tireId) ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Zap className="h-3 w-3 mr-1" />
                                Calibrar
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tires" className="space-y-3">
            {calibrationData.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CircleDot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium text-lg">Nenhum pneu encontrado</h3>
                  <p className="text-muted-foreground mt-1">
                    Adicione pneus às máquinas para monitorar a calibração.
                  </p>
                </CardContent>
              </Card>
            ) : (
              calibrationData.map(tire => (
                <TireCalibrationCard
                  key={tire.id}
                  tire={tire}
                  onPress={() => setSelectedTireId(tire.tireId)}
                  onCalibrate={() => handleCalibrateTire(tire.tireId)}
                  isCalibrating={calibratingTires.has(tire.tireId)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-3">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
                  <h3 className="font-medium text-lg">Tudo calibrado!</h3>
                  <p className="text-muted-foreground mt-1">
                    Todos os pneus estão dentro dos parâmetros ideais.
                  </p>
                </CardContent>
              </Card>
            ) : (
              alerts.map(alert => (
                <CalibrationAlertCard
                  key={alert.id}
                  alert={alert}
                  onViewTire={() => setSelectedTireId(alert.tireId)}
                  onAutoFix={() => handleCalibrateTire(alert.tireId)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Settings Modal */}
      <CalibrationSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        thresholds={thresholds}
        onSave={(newThresholds) => {
          updateThresholds(newThresholds);
          toast.success('Configurações salvas');
        }}
      />

      {/* Detail Sheet */}
      <TireCalibrationDetailSheet
        isOpen={!!selectedTireId}
        onClose={() => setSelectedTireId(null)}
        tire={selectedTire || null}
        onCalibrate={handleCalibrateTire}
        isCalibrating={selectedTireId ? calibratingTires.has(selectedTireId) : false}
      />
    </MainLayout>
  );
};

export default TireCalibrationPage;
