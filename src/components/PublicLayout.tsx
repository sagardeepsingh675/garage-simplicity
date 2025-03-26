
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from '@/components/ui/navigation-menu';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/">
              <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">GarageHub</span>
            </Link>
          </div>
          
          <NavigationMenu>
            <NavigationMenuList className="hidden md:flex gap-6">
              <NavigationMenuItem>
                <Link to="/" className="text-foreground font-medium">Home</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/information" className="text-foreground font-medium">About Us</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/contact" className="text-foreground font-medium">Contact</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/customer-portal" className="text-foreground font-medium">Customer Portal</Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/customer-portal">Customer Portal</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-background border-t mt-auto py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="md:w-1/3">
              <h3 className="font-bold text-xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">GarageHub</h3>
              <p className="text-muted-foreground">
                Professional automotive services with transparent pricing and superior customer service.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
                <li><Link to="/information" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
                <li><Link to="/customer-portal" className="text-muted-foreground hover:text-foreground">Customer Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <address className="not-italic text-muted-foreground">
                <p>123 Garage Street</p>
                <p>Automotive City, AC 12345</p>
                <p className="mt-2">info@garagehub.com</p>
                <p>+1 (555) 123-4567</p>
              </address>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} GarageHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
