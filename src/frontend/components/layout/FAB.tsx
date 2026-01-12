import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABProps {
  href?: string;
  onClick?: () => void;
  className?: string;
}

export const FAB = forwardRef<HTMLButtonElement | HTMLAnchorElement, FABProps>(
  ({ href, onClick, className }, ref) => {
    const baseClasses = cn(
      'fixed bottom-20 right-4 z-50 lg:bottom-6',
      'flex items-center justify-center',
      'w-14 h-14 rounded-full',
      'bg-primary text-primary-foreground',
      'shadow-lg shadow-primary/30',
      'hover:shadow-xl hover:shadow-primary/40',
      'active:scale-95',
      'transition-all duration-200',
      className
    );

    if (href) {
      return (
        <Link 
          to={href} 
          className={baseClasses}
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          <Plus className="w-6 h-6" />
        </Link>
      );
    }

    return (
      <button 
        onClick={onClick} 
        type="button" 
        className={baseClasses}
        ref={ref as React.Ref<HTMLButtonElement>}
      >
        <Plus className="w-6 h-6" />
      </button>
    );
  }
);

FAB.displayName = 'FAB';
