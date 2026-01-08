import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LogOut, 
  User, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const menuItems = [
  { icon: Bell, label: 'Notificações', href: '/settings/notifications' },
  { icon: Shield, label: 'Segurança', href: '/settings/security' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
  { icon: HelpCircle, label: 'Ajuda', href: '/help' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success('Até logo!');
    navigate('/auth');
  };

  const initials = user?.user_metadata?.name
    ? user.user_metadata.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <MainLayout title="Perfil">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* User Card */}
        <div className="card-elevated p-6 flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {user?.user_metadata?.name || 'Usuário'}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {user?.email}
            </p>
            <p className="text-xs text-primary mt-1">Operador</p>
          </div>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <div className="card-elevated divide-y divide-border">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => toast.info('Em breve', { description: 'Esta funcionalidade estará disponível em breve.' })}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-foreground">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full gap-2 text-status-critical border-status-critical/30 hover:bg-status-critical/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </Button>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground">
          TireWatch Pro v1.0.0
        </p>
      </div>
    </MainLayout>
  );
}
