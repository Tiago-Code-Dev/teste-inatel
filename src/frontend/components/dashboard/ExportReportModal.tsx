import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ExportFormat = 'csv' | 'pdf';
type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

interface ExportReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: ExportFormat) => Promise<string | void>;
  title?: string;
  description?: string;
}

export function ExportReportModal({
  open,
  onOpenChange,
  onExport,
  title = 'Exportar Relatório',
  description = 'Escolha o formato para exportar os dados de alertas, ocorrências e manutenções.',
}: ExportReportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!selectedFormat) return;

    setStatus('exporting');
    setError(null);

    try {
      const result = await onExport(selectedFormat);
      setDownloadUrl(typeof result === 'string' ? result : null);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar relatório');
      setStatus('error');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setSelectedFormat(null);
      setStatus('idle');
      setDownloadUrl(null);
      setError(null);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="format-selection"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              {/* Format Options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={cn(
                    'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
                    'hover:border-primary/50 hover:bg-primary/5',
                    selectedFormat === 'csv' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border'
                  )}
                  onClick={() => setSelectedFormat('csv')}
                >
                  <FileSpreadsheet className={cn(
                    'w-10 h-10',
                    selectedFormat === 'csv' ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <div className="text-center">
                    <p className="font-medium text-foreground">CSV</p>
                    <p className="text-xs text-muted-foreground">Planilha de dados</p>
                  </div>
                </button>

                <button
                  type="button"
                  className={cn(
                    'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
                    'hover:border-primary/50 hover:bg-primary/5',
                    selectedFormat === 'pdf' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border'
                  )}
                  onClick={() => setSelectedFormat('pdf')}
                >
                  <FileText className={cn(
                    'w-10 h-10',
                    selectedFormat === 'pdf' ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <div className="text-center">
                    <p className="font-medium text-foreground">PDF</p>
                    <p className="text-xs text-muted-foreground">Documento formatado</p>
                  </div>
                </button>
              </div>

              {/* Export Button */}
              <Button
                className="w-full gap-2"
                size="lg"
                disabled={!selectedFormat}
                onClick={handleExport}
              >
                <Download className="w-4 h-4" />
                Exportar {selectedFormat?.toUpperCase() || ''}
              </Button>
            </motion.div>
          )}

          {status === 'exporting' && (
            <motion.div
              key="exporting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">Gerando relatório...</p>
                <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p>
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-status-ok/15">
                <CheckCircle2 className="w-8 h-8 text-status-ok" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">Relatório gerado com sucesso!</p>
                <p className="text-sm text-muted-foreground">O download iniciará automaticamente</p>
              </div>
              {downloadUrl ? (
                <Button asChild className="gap-2">
                  <a href={downloadUrl} download>
                    <Download className="w-4 h-4" />
                    Baixar novamente
                  </a>
                </Button>
              ) : (
                <Button onClick={handleClose}>
                  Fechar
                </Button>
              )}
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-status-critical/15">
                <AlertCircle className="w-8 h-8 text-status-critical" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">Erro ao exportar</p>
                <p className="text-sm text-muted-foreground">{error || 'Tente novamente'}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button onClick={() => setStatus('idle')}>
                  Tentar novamente
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
