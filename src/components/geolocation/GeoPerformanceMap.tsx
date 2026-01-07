import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Map, ExternalLink, Key, AlertTriangle } from 'lucide-react';
import { GeoLocationData, useMapboxToken, getTerrainIcon, getClimateIcon, PerformanceStatus } from '@/hooks/useGeolocation';

interface GeoPerformanceMapProps {
  locations: GeoLocationData[];
  getPerformanceStatus: (score: number) => PerformanceStatus;
  onLocationSelect?: (location: GeoLocationData) => void;
  selectedLocationId?: string;
}

const getStatusColor = (status: PerformanceStatus): string => {
  switch (status) {
    case 'critical': return '#ef4444';
    case 'warning': return '#f59e0b';
    case 'optimal': return '#22c55e';
  }
};

export function GeoPerformanceMap({
  locations,
  getPerformanceStatus,
  onLocationSelect,
  selectedLocationId,
}: GeoPerformanceMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { token, saveToken, hasToken } = useMapboxToken();
  const [tokenInput, setTokenInput] = useState('');
  const [mapError, setMapError] = useState<string | null>(null);

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      saveToken(tokenInput.trim());
      setTokenInput('');
      setMapError(null);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !hasToken) return;

    try {
      mapboxgl.accessToken = token;

      // Calculate center from locations
      const center = locations.length > 0
        ? [
            locations.reduce((acc, l) => acc + l.longitude, 0) / locations.length,
            locations.reduce((acc, l) => acc + l.latitude, 0) / locations.length,
          ] as [number, number]
        : [-45.45, -22.42] as [number, number]; // Default to Itajubá, MG

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center,
        zoom: 13,
        pitch: 30,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );

      map.current.addControl(
        new mapboxgl.FullscreenControl(),
        'top-right'
      );

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Erro ao carregar o mapa. Verifique seu token Mapbox.');
      });

      // Add markers after map loads
      map.current.on('load', () => {
        addMarkers();
      });

    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError('Falha ao inicializar o mapa.');
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [hasToken, token]);

  const addMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    locations.forEach((location) => {
      const status = getPerformanceStatus(location.performanceScore);
      const color = getStatusColor(status);

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'geo-marker';
      el.style.cssText = `
        width: 36px;
        height: 36px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      `;
      el.innerHTML = `<span style="color: white; font-size: 12px; font-weight: bold;">${location.performanceScore}</span>`;

      if (selectedLocationId === location.id) {
        el.style.transform = 'scale(1.3)';
        el.style.zIndex = '10';
      }

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = selectedLocationId === location.id ? 'scale(1.3)' : 'scale(1)';
      });

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="padding: 8px; min-width: 180px;">
          <h4 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">${location.machineName}</h4>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
            Pneu: ${location.tireSerial}
          </div>
          <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <span>${getTerrainIcon(location.terrainType)} ${location.terrainType}</span>
            <span>${getClimateIcon(location.climate)} ${location.climate}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
            <div>Performance: <strong>${location.performanceScore}%</strong></div>
            <div>Desgaste: <strong>${location.wearLevel}%</strong></div>
            <div>Pressão: <strong>${location.pressure.toFixed(0)} psi</strong></div>
            <div>Temp: <strong>${location.temperature.toFixed(0)}°C</strong></div>
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onLocationSelect?.(location);
      });

      markersRef.current.push(marker);
    });
  };

  // Update markers when locations change
  useEffect(() => {
    if (map.current && hasToken) {
      addMarkers();
    }
  }, [locations, selectedLocationId, getPerformanceStatus]);

  if (!hasToken) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Configurar Mapa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Para visualizar o mapa de geolocalização, você precisa configurar seu token público do Mapbox.
                </p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>Acesse <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">mapbox.com <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Crie uma conta ou faça login</li>
                  <li>Vá até a seção "Tokens" no dashboard</li>
                  <li>Copie seu token público (Default public token)</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Token Público do Mapbox</Label>
            <div className="flex gap-2">
              <Input
                id="mapbox-token"
                type="password"
                placeholder="pk.eyJ1Ijoi..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSaveToken} disabled={!tokenInput.trim()}>
                Salvar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mapError) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full gap-4 py-12">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <p className="text-muted-foreground text-center">{mapError}</p>
          <Button variant="outline" onClick={() => {
            setMapError(null);
            localStorage.removeItem('mapbox-public-token');
            window.location.reload();
          }}>
            Reconfigurar Token
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="w-5 h-5" />
            Mapa de Desempenho
          </CardTitle>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1" />
              Ótimo
            </Badge>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
              <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1" />
              Alerta
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-1" />
              Crítico
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-60px)]">
        <div ref={mapContainer} className="w-full h-full min-h-[300px]" />
      </CardContent>
    </Card>
  );
}
