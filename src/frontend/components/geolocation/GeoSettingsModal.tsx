import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Mountain, Cloud, Activity, RotateCcw, Key, Trash2 } from 'lucide-react';
import { GeoThresholds, useGeoThresholds, useMapboxToken } from '@/hooks/useGeolocation';

interface GeoSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GeoSettingsModal({ open, onOpenChange }: GeoSettingsModalProps) {
  const { thresholds, updateThresholds, resetThresholds } = useGeoThresholds();
  const { token, saveToken, clearToken, hasToken } = useMapboxToken();
  const [localThresholds, setLocalThresholds] = useState<GeoThresholds>(thresholds);
  const [tokenInput, setTokenInput] = useState('');

  const handleSave = () => {
    updateThresholds(localThresholds);
    onOpenChange(false);
  };

  const handleReset = () => {
    resetThresholds();
    setLocalThresholds({
      terrainWearMultiplier: {
        asphalt: 1.0,
        dirt: 1.5,
        gravel: 1.8,
        mud: 2.0,
        sand: 1.7,
        mixed: 1.4,
      },
      climateImpact: {
        sunny: 1.0,
        cloudy: 1.0,
        rainy: 1.3,
        foggy: 1.1,
        snow: 1.5,
        storm: 1.8,
      },
      criticalPerformanceScore: 40,
      warningPerformanceScore: 60,
      criticalWearLevel: 80,
      warningWearLevel: 60,
    });
  };

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      saveToken(tokenInput.trim());
      setTokenInput('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações de Geolocalização
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="terrain" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="terrain" className="text-xs">
              <Mountain className="w-3 h-3 mr-1" />
              Terreno
            </TabsTrigger>
            <TabsTrigger value="climate" className="text-xs">
              <Cloud className="w-3 h-3 mr-1" />
              Clima
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="map" className="text-xs">
              <Key className="w-3 h-3 mr-1" />
              Mapa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terrain" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Configure o multiplicador de desgaste para cada tipo de terreno.
            </p>
            
            {Object.entries(localThresholds.terrainWearMultiplier).map(([terrain, value]) => (
              <div key={terrain} className="flex items-center justify-between gap-4">
                <Label className="capitalize flex-1">{terrain === 'asphalt' ? 'Asfalto' : terrain === 'dirt' ? 'Terra' : terrain === 'gravel' ? 'Cascalho' : terrain === 'mud' ? 'Lama' : terrain === 'sand' ? 'Areia' : 'Misto'}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">×</span>
                  <Input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={value}
                    onChange={(e) => setLocalThresholds({
                      ...localThresholds,
                      terrainWearMultiplier: {
                        ...localThresholds.terrainWearMultiplier,
                        [terrain]: parseFloat(e.target.value) || 1.0,
                      },
                    })}
                    className="w-20"
                  />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="climate" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Configure o impacto de cada condição climática no desgaste.
            </p>
            
            {Object.entries(localThresholds.climateImpact).map(([climate, value]) => (
              <div key={climate} className="flex items-center justify-between gap-4">
                <Label className="capitalize flex-1">{climate === 'sunny' ? 'Ensolarado' : climate === 'cloudy' ? 'Nublado' : climate === 'rainy' ? 'Chuvoso' : climate === 'foggy' ? 'Neblina' : climate === 'snow' ? 'Neve' : 'Tempestade'}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">×</span>
                  <Input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={value}
                    onChange={(e) => setLocalThresholds({
                      ...localThresholds,
                      climateImpact: {
                        ...localThresholds.climateImpact,
                        [climate]: parseFloat(e.target.value) || 1.0,
                      },
                    })}
                    className="w-20"
                  />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Configure os limites para alertas de desempenho e desgaste.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Performance Crítica (≤)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={localThresholds.criticalPerformanceScore}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    criticalPerformanceScore: parseInt(e.target.value) || 40,
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Performance Alerta (≤)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={localThresholds.warningPerformanceScore}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    warningPerformanceScore: parseInt(e.target.value) || 60,
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Desgaste Crítico (≥)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={localThresholds.criticalWearLevel}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    criticalWearLevel: parseInt(e.target.value) || 80,
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Desgaste Alerta (≥)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={localThresholds.warningWearLevel}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    warningWearLevel: parseInt(e.target.value) || 60,
                  })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Configure seu token do Mapbox para visualizar o mapa.
            </p>

            {hasToken ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-sm text-green-700 font-medium">✓ Token configurado</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    O mapa está funcionando corretamente.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={clearToken}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover Token
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Token Público do Mapbox</Label>
                  <Input
                    type="password"
                    placeholder="pk.eyJ1Ijoi..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleSaveToken}
                  disabled={!tokenInput.trim()}
                  className="w-full"
                >
                  Salvar Token
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
