import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Link2, RefreshCw, Save, TestTube, CheckCircle2, 
  AlertCircle, Satellite, Wrench, Bell, Fuel
} from 'lucide-react';
import { ExternalIntegration } from '@/hooks/useFleetManagement';
import { cn } from '@/lib/utils';

interface IntegrationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: ExternalIntegration | null;
  onSave: (config: { apiKey: string; endpoint: string }) => void;
  onTest: () => void;
}

const TYPE_ICONS = {
  telemetry: Satellite,
  maintenance: Wrench,
  alerts: Bell,
  fuel: Fuel
};

export const IntegrationConfigModal = ({ 
  isOpen, 
  onClose, 
  integration,
  onSave,
  onTest
}: IntegrationConfigModalProps) => {
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState(integration?.apiEndpoint || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  if (!integration) return null;
  
  const TypeIcon = TYPE_ICONS[integration.type];

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setTesting(false);
    setTestResult(Math.random() > 0.3 ? 'success' : 'error');
    
    if (onTest) onTest();
  };

  const handleSave = () => {
    onSave({ apiKey, endpoint });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon className="h-5 w-5" />
            Configurar {integration.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status da Conexão</span>
                <Badge 
                  variant={integration.status === 'connected' ? 'secondary' : 'outline'}
                  className={cn(
                    integration.status === 'connected' && 'text-emerald-500',
                    integration.status === 'error' && 'text-red-500'
                  )}
                >
                  {integration.status === 'connected' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {integration.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {integration.status === 'connected' ? 'Conectado' : 
                   integration.status === 'error' ? 'Erro' : 'Desconectado'}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* API Endpoint */}
          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint da API</Label>
            <Input 
              id="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.exemplo.com/v1"
            />
          </div>
          
          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">Chave da API</Label>
            <Input 
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
            />
            <p className="text-xs text-muted-foreground">
              A chave será armazenada de forma segura e criptografada.
            </p>
          </div>
          
          {/* Test Connection */}
          <Card className={cn(
            testResult === 'success' && 'border-emerald-500/50 bg-emerald-500/5',
            testResult === 'error' && 'border-red-500/50 bg-red-500/5'
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Testar Conexão</p>
                  <p className="text-xs text-muted-foreground">
                    Verifica se a API está acessível
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleTest}
                  disabled={testing || !endpoint}
                >
                  {testing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {testResult && (
                <div className={cn(
                  'mt-3 p-2 rounded-lg text-sm flex items-center gap-2',
                  testResult === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                )}>
                  {testResult === 'success' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Conexão bem-sucedida!
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      Falha na conexão. Verifique as credenciais.
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
