import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { TimelineEvent } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface ExportButtonProps {
  events: TimelineEvent[];
  tireSerial: string;
  disabled?: boolean;
  className?: string;
}

export function ExportButton({ events, tireSerial, disabled, className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null);

  const handleExportCSV = async () => {
    setIsExporting('csv');
    try {
      // Generate CSV content
      const headers = ['Data', 'Tipo', 'Título', 'Descrição', 'Severidade'];
      const rows = events.map(event => [
        format(new Date(event.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        getEventTypeLabel(event.type),
        event.title,
        event.description.replace(/,/g, ';'),
        event.severity || '-',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historico-pneu-${tireSerial}-${format(new Date(), 'yyyyMMdd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Exportação CSV concluída', {
        description: `${events.length} eventos exportados com sucesso.`
      });
    } catch (error) {
      toast.error('Erro ao exportar', {
        description: 'Não foi possível gerar o arquivo CSV.'
      });
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting('pdf');
    try {
      // Generate HTML content for PDF
      const htmlContent = generatePDFContent(events, tireSerial);
      
      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }

      toast.success('PDF gerado', {
        description: 'Use Ctrl+P ou Cmd+P para salvar como PDF.'
      });
    } catch (error) {
      toast.error('Erro ao exportar', {
        description: 'Não foi possível gerar o PDF.'
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={disabled || events.length === 0 || isExporting !== null}
          className={className}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting !== null}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting !== null}>
          <FileText className="w-4 h-4 mr-2" />
          Exportar PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    alert: 'Alerta',
    occurrence: 'Ocorrência',
    maintenance: 'Manutenção',
    installation: 'Instalação',
    removal: 'Remoção',
    telemetry_critical: 'Telemetria Crítica',
    info: 'Informação',
  };
  return labels[type] || type;
}

function generatePDFContent(events: TimelineEvent[], tireSerial: string): string {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const eventRows = sortedEvents.map(event => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e5e5;">
        ${format(new Date(event.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e5e5;">
        <span style="
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          background: ${getEventColor(event.type)};
          color: ${getEventTextColor(event.type)};
        ">
          ${getEventTypeLabel(event.type)}
        </span>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-weight: 500;">
        ${event.title}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; color: #666;">
        ${event.description}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e5e5;">
        ${event.severity ? getSeverityLabel(event.severity) : '-'}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Histórico do Pneu - ${tireSerial}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          color: #1a1a1a;
        }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: #666; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; }
        th { 
          text-align: left; 
          padding: 12px 8px; 
          background: #f5f5f5; 
          font-weight: 600;
          border-bottom: 2px solid #ddd;
        }
        .legend {
          margin-top: 32px;
          padding: 16px;
          background: #f9f9f9;
          border-radius: 8px;
        }
        .legend-title { font-weight: 600; margin-bottom: 12px; }
        .legend-items { display: flex; gap: 16px; flex-wrap: wrap; }
        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
        .legend-color { width: 12px; height: 12px; border-radius: 50%; }
      </style>
    </head>
    <body>
      <h1>Histórico do Pneu</h1>
      <p class="subtitle">Serial: ${tireSerial} • Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
      
      <table>
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Tipo</th>
            <th>Título</th>
            <th>Descrição</th>
            <th>Severidade</th>
          </tr>
        </thead>
        <tbody>
          ${eventRows}
        </tbody>
      </table>

      <div class="legend">
        <div class="legend-title">Legenda de Cores</div>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-color" style="background: #ef4444;"></div>
            <span>Telemetria Crítica</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #f97316;"></div>
            <span>Alerta</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #3b82f6;"></div>
            <span>Ocorrência</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #22c55e;"></div>
            <span>Manutenção</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #6b7280;"></div>
            <span>Informação</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getEventColor(type: string): string {
  const colors: Record<string, string> = {
    alert: '#fff7ed',
    occurrence: '#eff6ff',
    maintenance: '#f0fdf4',
    installation: '#f0fdf4',
    removal: '#f5f5f5',
    telemetry_critical: '#fef2f2',
    info: '#f5f5f5',
  };
  return colors[type] || '#f5f5f5';
}

function getEventTextColor(type: string): string {
  const colors: Record<string, string> = {
    alert: '#ea580c',
    occurrence: '#2563eb',
    maintenance: '#16a34a',
    installation: '#16a34a',
    removal: '#6b7280',
    telemetry_critical: '#dc2626',
    info: '#6b7280',
  };
  return colors[type] || '#6b7280';
}

function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    critical: '🔴 Crítico',
    high: '🟠 Alto',
    medium: '🟡 Médio',
    low: '🟢 Baixo',
  };
  return labels[severity] || severity;
}
