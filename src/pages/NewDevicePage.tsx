import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Truck, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTenant } from '@/contexts/TenantContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SuccessAnimation } from '@/components/ui/success-animation';

const steps = [
  { id: 1, title: 'Informações Básicas', description: 'Nome e modelo do veículo' },
  { id: 2, title: 'Configuração', description: 'Status e unidade' },
  { id: 3, title: 'Confirmação', description: 'Revise os dados' },
];

export default function NewDevicePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedUnitId, units } = useTenant();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    status: 'active',
    unit_id: selectedUnitId || '',
  });

  const createMachine = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('machines').insert({
        name: data.name,
        model: data.model,
        status: data.status,
        unit_id: data.unit_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines-devices'] });
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/devices');
      }, 2000);
    },
    onError: (error) => {
      toast.error('Não foi possível cadastrar o veículo', {
        description: 'Verifique os dados e tente novamente.',
      });
      console.error(error);
    },
  });

  const progress = (currentStep / steps.length) * 100;

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0 && formData.model.trim().length > 0;
      case 2:
        return formData.status && formData.unit_id;
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
      createMachine.mutate(formData);
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
      <MainLayout title="Veículo Cadastrado" showBreadcrumbs={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <SuccessAnimation 
            variant="celebration" 
            size="lg" 
            title="Veículo cadastrado!" 
            subtitle="Redirecionando para a lista..." 
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Novo Veículo" subtitle={steps[currentStep - 1].description}>
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
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription>{steps[currentStep - 1].description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentStep === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Veículo *</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Trator John Deere 7200J"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Modelo *</Label>
                      <Input
                        id="model"
                        placeholder="Ex: 7200J"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="maintenance">Em Manutenção</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unidade *</Label>
                      <Select
                        value={formData.unit_id}
                        onValueChange={(value) => setFormData({ ...formData, unit_id: value })}
                      >
                        <SelectTrigger id="unit">
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Revise os dados do veículo:</h4>
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-xs text-muted-foreground">Nome</p>
                        <p className="font-medium">{formData.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Modelo</p>
                        <p className="font-medium">{formData.model}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="font-medium capitalize">
                          {formData.status === 'active' ? 'Ativo' : formData.status === 'maintenance' ? 'Em Manutenção' : 'Inativo'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Unidade</p>
                        <p className="font-medium">
                          {units.find((u) => u.id === formData.unit_id)?.name || '-'}
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
            disabled={!isStepValid() || createMachine.isPending}
            className="gap-2"
          >
            {createMachine.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cadastrando...
              </>
            ) : currentStep === 3 ? (
              <>
                <Check className="w-4 h-4" />
                Cadastrar Veículo
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
