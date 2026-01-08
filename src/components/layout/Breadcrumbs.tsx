import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  'command-center': 'Centro de Operações',
  'team-operations': 'Gestão de Equipe',
  'devices': 'Dispositivos',
  'machines': 'Máquinas',
  'tires': 'Pneus',
  'fleet': 'Frota',
  'telemetry': 'Telemetria',
  'alerts': 'Alertas',
  'occurrences': 'Ocorrências',
  'new': 'Nova',
  'geolocation': 'Geolocalização',
  'bi': 'Business Intelligence',
  'analytics': 'Analytics',
  'costs': 'Custos',
  'wear': 'Desgaste',
  'calibration': 'Calibração',
  'deformation': 'Deformação',
  'load': 'Carga',
  'fluid': 'Fluido & Lastro',
  'operations': 'Operações',
  'settings': 'Configurações',
  'history': 'Histórico',
  'pressure-history': 'Histórico de Pressão',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on homepage
  if (pathSegments.length === 0) {
    return null;
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;
    
    // Check if segment is a UUID (dynamic route)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
    const label = isUUID ? 'Detalhes' : (routeLabels[segment] || segment);

    return { path, label, isLast };
  });

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map(({ path, label, isLast }) => (
          <BreadcrumbItem key={path}>
            <BreadcrumbSeparator>
              <ChevronRight className="w-3.5 h-3.5" />
            </BreadcrumbSeparator>
            {isLast ? (
              <BreadcrumbPage>{label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link to={path}>{label}</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
