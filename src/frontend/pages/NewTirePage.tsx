import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CircleDot, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SuccessAnimation } from '@/components/ui/success-animation';
import { useTenant } from '@/contexts/TenantContext';

const steps = [
  { id: 1, title: 'Identificação', description: 'Serial e pressão recomendada' },
  { id: 2, title: 'Instalação', description: 'Veículo e posição' },
  { id: 3, title: 'Confirmação', description: 'Revise os dados' },
];

const positions = [
  { value: '1', label: 'Dianteiro Esquerdo' },
  { value: '2', label: 'Dianteiro Direito' },
  { value: '3', label: 'Traseiro Esquerdo' },
  { value: '4', label: 'Traseiro Direito' },
];

export default function NewTirePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedUnitId } = useTenant();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    serial: '',
    recommended_pressure: '',
    machine_id: '',
    position: '',
  });

  const { data: machines = [] } = useQuery({
    queryKey: ['machines-for-tire', selectedUnitId],
    queryFn: async () => {
      let query = supabase.from('machines').select('id, name, model');
      if (selectedUnitId) query = query.eq('unit_id', selectedUnitId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createTire = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('tires').insert({
        serial: data.serial,
        recommended_pressure: parseFloat(data.recommended_pressure),
        machine_id: data.machine_id || null,
        position: data.position || null,
        lifecycle_status: 'new',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tires-devices'] });
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/devices');
      }, 2000);
    },
    onError: (error) => {
      toast.error('Não foi possível cadastrar o pneu', {
        description: 'Verifique os dados e tente novamente.',
      });
      console.error(error);
    },
  });

  const progress = (currentStep / steps.length) * 100;

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.serial.trim().length > 0 && parseFloat(formData.recommended_pressure) > 0;
      case 2:
        return true; // Veículo e posição são opcionais
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      createTire.mutate(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/devices');
    }
  };

  if (showSuccess) {
    return (
      <MainLayout title="Pneu Cadastrado" showBreadcrumbs={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <SuccessAnimation 
            variant="celebration" 
            size="lg" 
            title="Pneu cadastrado!" 
            subtitle="Redirecionando para a lista..." 
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Novo Pneu" subtitle={steps[currentStep - 1].description}>
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 text-sm ${
                  step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.id === currentStep
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="motion-reduce:transition-none"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CircleDot className="w-5 h-5 text-primary" />
                  </div>
                  {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription>{steps[currentStep - 1].description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentStep === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="serial">Número de Série *</Label>
                      <Input
                        id="serial"
                        placeholder="Ex: PNEU-2024-001"
                        value={formData.serial}
                        onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pressure">Pressão Recomendada (PSI) *</Label>
                      <Input
                        id="pressure"
                        type="number"
                        placeholder="Ex: 35"
                        value={formData.recommended_pressure}
                        onChange={(e) => setFormData({ ...formData, recommended_pressure: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="machine">Veículo (opcional)</Label>
                      <Select
                        value={formData.machine_id}
                        onValueChange={(value) => setFormData({ ...formData, machine_id: value })}
                      >
                        <SelectTrigger id="machine">
                          <SelectValue placeholder="Selecione um veículo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhum (estoque)</SelectItem>
                          {machines.map((machine) => (
                            <SelectItem key={machine.id} value={machine.id}>
                              {machine.name} - {machine.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.machine_id && (
                      <div className="space-y-2">
                        <Label htmlFor="position">Posição</Label>
                        <Select
                          value={formData.position}
                          onValueChange={(value) => setFormData({ ...formData, position: value })}
                        >
                          <SelectTrigger id="position">
                            <SelectValue placeholder="Selecione a posição" />
                          </SelectTrigger>
                          <SelectContent>
                            {positions.map((pos) => (
                              <SelectItem key={pos.value} value={pos.value}>
                                {pos.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {!formData.machine_id && (
                      <p className="text-sm text-muted-foreground">
                        O pneu será cadastrado em estoque. Você poderá instalá-lo em um veículo posteriormente.
                      </p>
                    )}
                  </>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Revise os dados do pneu:</h4>
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-xs text-muted-foreground">Serial</p>
                        <p className="font-medium">{formData.serial}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pressão Recomendada</p>
                        <p className="font-medium">{formData.recommended_pressure} PSI</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Veículo</p>
                        <p className="font-medium">
                          {formData.machine_id
                            ? machines.find((m) => m.id === formData.machine_id)?.name
                            : 'Em estoque'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Posição</p>
                        <p className="font-medium">
                          {formData.position
                            ? positions.find((p) => p.value === formData.position)?.label
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 1 ? 'Cancelar' : 'Voltar'}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isStepValid() || createTire.isPending}
            className="gap-2"
          >
            {createTire.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cadastrando...
              </>
            ) : currentStep === 3 ? (
              <>
                <Check className="w-4 h-4" />
                Cadastrar Pneu
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
