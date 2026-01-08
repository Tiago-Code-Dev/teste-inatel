import { ReactNode, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { Breadcrumbs } from './Breadcrumbs';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBreadcrumbs?: boolean;
}

export function MainLayout({ children, title, subtitle, showBreadcrumbs = true }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <div className="lg:pl-64">
        <TopBar 
          title={title} 
          subtitle={subtitle} 
          onMenuClick={() => setMobileMenuOpen(true)} 
        />
        <main id="main-content" className="p-4 lg:p-6">
          {showBreadcrumbs && <Breadcrumbs />}
          {children}
        </main>
      </div>
    </div>
  );
}
