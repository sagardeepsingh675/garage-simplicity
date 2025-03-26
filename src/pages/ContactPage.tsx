
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from '@/components/ui/navigation-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneCall, Mail, MapPin, Clock } from 'lucide-react';
import { toast } from '@/lib/toast';

const ContactPage = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Your message has been sent. We'll get back to you soon!");
    // Reset form here if needed
  };

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

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
            <p className="text-muted-foreground text-lg mb-12 text-center max-w-2xl mx-auto">
              Have questions or ready to schedule service? Reach out to our team through any of the methods below.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              <Card>
                <CardHeader className="pb-2">
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-3">
                    <PhoneCall className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Call Us</CardTitle>
                  <CardDescription>We're available during business hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">+1 (555) 123-4567</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-3">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Email Us</CardTitle>
                  <CardDescription>We'll respond within 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">info@garagehub.com</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Visit Us</CardTitle>
                  <CardDescription>Come see our service center</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>123 Garage Street</p>
                  <p>Automotive City, AC 12345</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input id="name" placeholder="John Doe" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="john@example.com" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="(555) 123-4567" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <textarea 
                        id="message" 
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                        placeholder="Please describe how we can help you..." 
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">Send Message</Button>
                </form>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-6">Business Hours</h2>
                <Card>
                  <CardHeader>
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-primary mr-2" />
                      <CardTitle>When We're Open</CardTitle>
                    </div>
                    <CardDescription>Our standard service hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
                        { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
                        { day: 'Sunday', hours: 'Closed' },
                      ].map((schedule, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="font-medium">{schedule.day}</span>
                          <span className="text-muted-foreground">{schedule.hours}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-2">Emergency Services</h4>
                      <p className="text-muted-foreground text-sm">
                        24/7 roadside assistance available for emergencies. Call our emergency hotline: +1 (555) 999-8888
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-6">Our Location</h2>
                  <div className="bg-muted h-80 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground">Map Placeholder</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        123 Garage Street, Automotive City, AC 12345
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

export default ContactPage;
