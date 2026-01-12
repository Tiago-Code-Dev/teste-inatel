import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResolveAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (note: string) => Promise<void>;
  alertMessage?: string;
  loading?: boolean;
}

export function ResolveAlertModal({
  open,
  onOpenChange,
  onConfirm,
  alertMessage,
  loading = false,
}: ResolveAlertModalProps) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!note.trim()) {
      setError('É necessário adicionar uma nota de resolução');
      return;
    }
    
    if (note.trim().length < 10) {
      setError('A nota deve ter pelo menos 10 caracteres');
      return;
    }

    setError('');
    await onConfirm(note.trim());
    setNote('');
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setNote('');
      setError('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-status-ok" />
            Resolver Alerta
          </DialogTitle>
          <DialogDescription>
            Adicione uma nota explicando como o alerta foi resolvido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {alertMessage && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="text-muted-foreground text-xs mb-1">Alerta:</p>
              <p className="text-foreground">{alertMessage}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="resolution-note" className="text-sm font-medium">
              Nota de Resolução <span className="text-status-critical">*</span>
            </Label>
            <Textarea
              id="resolution-note"
              placeholder="Descreva a ação tomada para resolver este alerta..."
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (error) setError('');
              }}
              className={`min-h-[100px] resize-none ${error ? 'border-status-critical' : ''}`}
              disabled={loading}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-status-critical flex items-center gap-1"
              >
                <AlertTriangle className="w-3 h-3" />
                {error}
              </motion.p>
            )}
            <p className="text-xs text-muted-foreground">
              {note.length}/10 caracteres mínimos
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !note.trim()}
            className="flex-1 sm:flex-none gap-1.5 bg-status-ok hover:bg-status-ok/90"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Confirmar Resolução
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
