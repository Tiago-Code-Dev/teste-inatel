import { Fragment } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { X, LayoutDashboard, Truck, AlertTriangle, FileText, CircleDot, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Máquinas', href: '/machines', icon: Truck },
  { name: 'Alertas', href: '/alerts', icon: AlertTriangle, badge: 7 },
  { name: 'Ocorrências', href: '/occurrences', icon: FileText, badge: 4 },
  { name: 'Pneus', href: '/tires', icon: CircleDot },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const location = useLocation();

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex">
          <TransitionChild
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar px-6 pb-4 border-r border-sidebar-border">
                <div className="flex h-16 shrink-0 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
                      <CircleDot className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-sidebar-foreground">TireWatch</h1>
                      <p className="text-xs text-muted-foreground">Pro</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-sidebar-accent"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5 text-sidebar-foreground" />
                  </button>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-1">
                    {navigation.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            onClick={onClose}
                            className={cn(
                              'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent'
                            )}
                          >
                            <item.icon className={cn(
                              'w-5 h-5',
                              isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                            )} />
                            <span className="flex-1">{item.name}</span>
                            {item.badge && (
                              <Badge 
                                className={cn(
                                  'min-w-[1.5rem] h-5',
                                  isActive 
                                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                                    : 'bg-status-critical text-white'
                                )}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
