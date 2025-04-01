import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from '@/components/ui/navigation-menu';
import { Car, Info, PhoneCall, UserCircle, Calendar, Wrench, CheckCircle, Settings, MessageCircle } from 'lucide-react';
import AnimatedGarage from '@/components/AnimatedGarage';
import AnimatedCounter from '@/components/AnimatedCounter';
import TestimonialCard from '@/components/TestimonialCard';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <header className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-2xl flex items-center gap-2">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Car className="h-6 w-6 text-primary" />
              </motion.div>
              <motion.span 
                className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                GarageHub
              </motion.span>
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
            <Button asChild variant="outline" className="hidden sm:flex">
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
            <motion.div 
              className="flex-1 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Professional Auto 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"> Repair & Maintenance</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Your trusted partner for all your vehicle service needs. Expert mechanics, transparent pricing, and superior customer service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="group">
                  <Link to="/contact" className="flex items-center">
                    Book a Service
                    <motion.div
                      className="ml-2"
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      →
                    </motion.div>
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/information">Learn More</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div 
              className="flex-1 rounded-lg overflow-hidden shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <AnimatedGarage />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Trusted by Thousands
            </motion.h2>
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              We've been helping car owners keep their vehicles in top condition for years.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedCounter value={5000} text="Happy Customers" icon={<UserCircle />} />
            <AnimatedCounter value={15000} text="Vehicles Serviced" icon={<Car />} />
            <AnimatedCounter value={8} text="Service Centers" icon={<Wrench />} />
            <AnimatedCounter value={24} text="Years Experience" icon={<Calendar />} />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Our Services
            </motion.h2>
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              We offer a comprehensive range of automotive services to keep your vehicle running at its best.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Diagnostics & Repairs', 
                description: 'Expert vehicle diagnostics and repair services for all makes and models.', 
                icon: Car,
                delay: 0.1 
              },
              { 
                title: 'Routine Maintenance', 
                description: 'Regular service to keep your vehicle in optimal condition.', 
                icon: Settings,
                delay: 0.2
              },
              { 
                title: 'Customer Support', 
                description: '24/7 customer support and real-time vehicle status tracking.', 
                icon: PhoneCall,
                delay: 0.3
              },
            ].map((service, index) => (
              <motion.div 
                key={index} 
                className="bg-card rounded-lg p-6 shadow-sm border flex flex-col h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: service.delay }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                }}
              >
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground flex-1">{service.description}</p>
                <Button variant="link" className="mt-4 p-0 w-fit" asChild>
                  <Link to="/information" className="flex items-center gap-1">Learn more <span>→</span></Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              What Our Customers Say
            </motion.h2>
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              Don't just take our word for it. See what our customers have to say about their experiences.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard 
              name="Sarah Johnson"
              role="Toyota Owner"
              content="The team at GarageHub is fantastic! They quickly diagnosed the issue with my car and had it fixed the same day. Excellent service!"
              rating={5}
              delay={0.1}
            />
            <TestimonialCard 
              name="Michael Chen"
              role="BMW Driver"
              content="I appreciate the transparency in pricing and the quality of work. They explained everything they were going to do before starting."
              rating={5}
              delay={0.2}
            />
            <TestimonialCard 
              name="Jessica Williams"
              role="Honda Owner"
              content="The customer portal is amazing. I could track the progress of my car repair in real-time and communicate directly with the mechanics."
              rating={4}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of satisfied customers who trust us with their vehicles.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild className="group">
                <Link to="/contact" className="flex items-center">
                  Contact Us Now
                  <motion.div
                    className="ml-2"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    →
                  </motion.div>
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/customer-portal">Visit Customer Portal</Link>
              </Button>
            </div>
          </motion.div>
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
