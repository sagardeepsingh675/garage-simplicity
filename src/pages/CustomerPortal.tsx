
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from '@/components/ui/navigation-menu';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, CheckCircle2, Clock, File, FileText, IndianRupee, Package, Search, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { PublicLayout } from '@/components/PublicLayout';

type VehicleStatus = {
  id: string;
  license_plate: string;
  make: string;
  model: string;
  status: string;
  job_card_id?: string;
  issue_description?: string;
  diagnosis?: string;
  created_at?: string;
};

const CustomerPortal = () => {
  const [email, setEmail] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleStatus[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('vehicles');
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !licensePlate) {
        toast.error('Please enter both email and license plate number');
        return;
      }

      // First, find the customer by email
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('id, name')
        .eq('email', email.trim())
        .single();

      if (customerError || !customers) {
        toast.error('Customer not found. Please check your email address.');
        setIsLoading(false);
        return;
      }

      setCustomerId(customers.id);

      // Then, find the vehicle by license plate and customer ID
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id, license_plate, make, model, customer_id')
        .eq('license_plate', licensePlate.trim())
        .eq('customer_id', customers.id)
        .single();

      if (vehicleError || !vehicleData) {
        toast.error('Vehicle not found. Please check your license plate number.');
        setIsLoading(false);
        return;
      }

      // Now get job cards for this vehicle to determine status
      const { data: jobCards, error: jobCardsError } = await supabase
        .from('job_cards')
        .select('id, status, issue_description, diagnosis, created_at')
        .eq('vehicle_id', vehicleData.id)
        .order('created_at', { ascending: false });

      if (jobCardsError) {
        console.error('Error fetching job cards:', jobCardsError);
      }

      const vehicleStatus: VehicleStatus[] = [{
        id: vehicleData.id,
        license_plate: vehicleData.license_plate,
        make: vehicleData.make,
        model: vehicleData.model,
        status: jobCards && jobCards.length > 0 ? jobCards[0].status : 'No recent service',
        job_card_id: jobCards && jobCards.length > 0 ? jobCards[0].id : undefined,
        issue_description: jobCards && jobCards.length > 0 ? jobCards[0].issue_description : undefined,
        diagnosis: jobCards && jobCards.length > 0 ? jobCards[0].diagnosis : undefined,
        created_at: jobCards && jobCards.length > 0 ? jobCards[0].created_at : undefined,
      }];

      setVehicles(vehicleStatus);
      setIsLoggedIn(true);
      toast.success(`Welcome back, ${customers.name}!`);
    } catch (error) {
      console.error('Error searching for vehicle status:', error);
      toast.error('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription when customer is logged in
  useEffect(() => {
    if (!customerId) return;
    
    // Set up real-time subscription for job cards
    const jobCardsChannel = supabase
      .channel('job-cards-changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'job_cards',
          filter: `customer_id=eq.${customerId}`
        }, 
        (payload) => {
          console.log('Job card update received:', payload);
          // Refresh vehicle data when job cards are updated
          if (vehicles.length > 0) {
            refreshVehicleData(vehicles[0].id);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(jobCardsChannel);
    };
  }, [customerId, vehicles]);

  const refreshVehicleData = async (vehicleId: string) => {
    try {
      // Get updated job cards for this vehicle
      const { data: jobCards, error: jobCardsError } = await supabase
        .from('job_cards')
        .select('id, status, issue_description, diagnosis, created_at')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });

      if (jobCardsError) {
        console.error('Error fetching job cards:', jobCardsError);
        return;
      }

      // Update vehicle state with the latest information
      setVehicles(vehicles.map(vehicle => 
        vehicle.id === vehicleId ? {
          ...vehicle,
          status: jobCards && jobCards.length > 0 ? jobCards[0].status : 'No recent service',
          job_card_id: jobCards && jobCards.length > 0 ? jobCards[0].id : undefined,
          issue_description: jobCards && jobCards.length > 0 ? jobCards[0].issue_description : undefined,
          diagnosis: jobCards && jobCards.length > 0 ? jobCards[0].diagnosis : undefined,
          created_at: jobCards && jobCards.length > 0 ? jobCards[0].created_at : undefined,
        } : vehicle
      ));

      toast.success('Vehicle information updated in real-time');
    } catch (error) {
      console.error('Error refreshing vehicle data:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-info text-info-foreground">Pending</Badge>;
      case 'on_hold':
        return <Badge variant="outline">On Hold</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setVehicles([]);
    setEmail('');
    setLicensePlate('');
    setCustomerId(null);
    toast.success('You have been logged out successfully');
  };

  return (
    <PublicLayout>
      <div className="flex-1 container mx-auto px-4 py-12">
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Customer Vehicle Status</CardTitle>
                <CardDescription>
                  Enter your email and vehicle license plate to check the status of your vehicle service.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="license">License Plate Number</Label>
                    <Input 
                      id="license" 
                      placeholder="ABC123" 
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      required 
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? 'Searching...' : 'Check Status'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold mb-8">Customer Portal</h1>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="vehicles">
                  <Car className="h-4 w-4 mr-2" /> My Vehicles
                </TabsTrigger>
                <TabsTrigger value="services">
                  <Wrench className="h-4 w-4 mr-2" /> Service History
                </TabsTrigger>
                <TabsTrigger value="invoices">
                  <FileText className="h-4 w-4 mr-2" /> Invoices
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="vehicles">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="relative overflow-hidden">
                      {vehicle.status.toLowerCase() === 'in_progress' && (
                        <div className="absolute top-0 right-0 animate-pulse bg-warning/20 w-full h-full pointer-events-none"></div>
                      )}
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{vehicle.make} {vehicle.model}</CardTitle>
                            <CardDescription>{vehicle.license_plate}</CardDescription>
                          </div>
                          <div>
                            {getStatusBadge(vehicle.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {vehicle.job_card_id ? (
                          <>
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium mb-1">Issue Description</h4>
                                <p className="text-sm text-muted-foreground">
                                  {vehicle.issue_description || 'No description provided'}
                                </p>
                              </div>
                              
                              {vehicle.diagnosis && (
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Diagnosis</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {vehicle.diagnosis}
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString() : 'Unknown date'}
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-muted-foreground">No recent service records</p>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                          <Link to="/contact">
                            <Search className="h-4 w-4 mr-2" /> Book Service
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="services">
                <Card>
                  <CardHeader>
                    <CardTitle>Service History</CardTitle>
                    <CardDescription>Your vehicle's service record at our garage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vehicles.length > 0 && vehicles[0].job_card_id ? (
                          <TableRow>
                            <TableCell>
                              {vehicles[0].created_at ? new Date(vehicles[0].created_at).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>{vehicles[0].issue_description || 'General service'}</TableCell>
                            <TableCell>{vehicles[0].make} {vehicles[0].model}</TableCell>
                            <TableCell>{getStatusBadge(vehicles[0].status)}</TableCell>
                          </TableRow>
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                              No service history found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="invoices">
                <Card>
                  <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>Your billing history and payment status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border bg-card text-card-foreground p-6 flex flex-col items-center justify-center space-y-3">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                      <h3 className="text-lg font-medium">No Invoices Found</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-md">
                        There are no invoices associated with this account yet. Invoices will appear here after your service is completed.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="bg-primary/10 p-3 rounded-full w-fit mb-3">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Schedule Service</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground">
                      Book your next maintenance or repair service online.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to="/contact">Book Now</Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <div className="bg-primary/10 p-3 rounded-full w-fit mb-3">
                      <IndianRupee className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Request Quote</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground">
                      Get a detailed estimate for your vehicle service needs.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to="/contact">Get Quote</Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <div className="bg-primary/10 p-3 rounded-full w-fit mb-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Maintenance Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground">
                      Learn how to keep your vehicle in top condition.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to="/information">View Tips</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default CustomerPortal;
