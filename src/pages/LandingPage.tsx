
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { Car, Info, PhoneCall, UserCircle } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">GarageHub</span>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Professional Auto Repair &amp; Maintenance
              </h1>
              <p className="text-xl text-muted-foreground">
                Your trusted partner for all your vehicle service needs. Expert mechanics, transparent pricing, and superior customer service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg">
                  <Link to="/contact">Book a Service</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/information">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 rounded-lg overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7" 
                alt="Garage service" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We offer a comprehensive range of automotive services to keep your vehicle running at its best.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Diagnostics & Repairs', 
                description: 'Expert vehicle diagnostics and repair services for all makes and models.', 
                icon: Car 
              },
              { 
                title: 'Routine Maintenance', 
                description: 'Regular service to keep your vehicle in optimal condition.', 
                icon: Info 
              },
              { 
                title: 'Customer Support', 
                description: '24/7 customer support and real-time vehicle status tracking.', 
                icon: PhoneCall 
              },
            ].map((service, index) => (
              <div key={index} className="bg-card rounded-lg p-6 shadow-sm border flex flex-col">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground flex-1">{service.description}</p>
                <Button variant="link" className="mt-4 p-0" asChild>
                  <Link to="/information">Learn more</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of satisfied customers who trust us with their vehicles.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/contact">Contact Us Now</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/customer-portal">Visit Customer Portal</Link>
            </Button>
          </div>
        </div>
      </section>

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
};

export default LandingPage;
