
import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarGroup, SidebarGroupContent, SidebarHeader } from '@/components/ui/sidebar';
import { Car, Users, Clipboard, User, Package, IndianRupee, LayoutDashboard, Settings, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: Car, label: 'Vehicles', path: '/vehicles' },
    { icon: User, label: 'Staff', path: '/staff' },
    { icon: Clipboard, label: 'Job Cards', path: '/job-cards' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: IndianRupee, label: 'Billing', path: '/billing' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-border/40 bg-slate-900">
          <SidebarHeader className="py-4 px-2 border-b border-slate-800">
            <div className="flex items-center justify-center py-2">
              <div className="flex flex-col items-center">
                <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">GarageHub</span>
                <Badge variant="outline" className="mt-1 border-slate-700 text-slate-300">
                  <ShieldAlert className="h-3 w-3 mr-1" />
                  Admin Portal
                </Badge>
              </div>
            </div>
          </SidebarHeader>
          <div className="py-4 px-2">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild className={cn(
                          isActive(item.path) 
                            ? "bg-slate-800 text-blue-400" 
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        )}>
                          <Link to={item.path} className="flex items-center gap-3">
                            <item.icon size={18} className={cn(
                              isActive(item.path) 
                                ? "text-blue-400" 
                                : "text-slate-400 group-hover:text-slate-200"
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
          <div className="mt-auto p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 text-slate-400 px-3 py-2">
              <User size={18} />
              <div className="text-sm overflow-hidden">
                <p className="truncate">{user?.email || 'Admin User'}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            </div>
          </div>
        </Sidebar>

        <div className="flex flex-col flex-1 w-full bg-slate-50">
          <Navbar className="bg-white border-b border-slate-200" />
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
