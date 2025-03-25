
import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarGroup, SidebarGroupContent } from '@/components/ui/sidebar';
import { Car, Users, Clipboard, User, Package, HomeIcon, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: Car, label: 'Vehicles', path: '/vehicles' },
    { icon: User, label: 'Staff', path: '/staff' },
    { icon: Clipboard, label: 'Job Cards', path: '/job-cards' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-border/40">
          <div className="py-4 px-2">
            <div className="flex items-center justify-center py-2 mb-6">
              <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">GarageHub</span>
            </div>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild className={cn(
                          isActive(item.path) ? "bg-accent/10 text-primary" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                        )}>
                          <Link to={item.path} className="flex items-center gap-3">
                            <item.icon size={18} className={cn(
                              isActive(item.path) ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                            )} />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </div>
        </Sidebar>

        <div className="flex flex-col flex-1 w-full">
          <Navbar />
          <main className="flex-1 p-4 md:p-6 overflow-auto animate-fade-in">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
