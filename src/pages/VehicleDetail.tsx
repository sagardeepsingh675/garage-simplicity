
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VehicleCanvas } from '@/components/VehicleCanvas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, ChevronLeft, CircleCheck, Clock, Edit, User, Wrench, FileText, Info, Car, Plus, ArrowRight } from 'lucide-react';

interface VehicleData {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  type: 'sedan' | 'suv' | 'hatchback' | 'truck';
  owner: string;
  lastService: string;
  status: 'active' | 'servicing' | 'completed';
  color: string;
  fuelType: string;
  vin: string;
  purchaseDate: string;
  serviceHistory: {
    id: string;
    date: string;
    type: string;
    description: string;
    cost: number;
    technician: string;
  }[];
}

// Mock data for a specific vehicle
const vehicleData: VehicleData = {
  id: '1',
  registrationNumber: 'MH02AB1234',
  make: 'Honda',
  model: 'City',
  year: 2020,
  type: 'sedan',
  owner: 'Rajesh Kumar',
  lastService: '2023-07-15',
  status: 'active',
  color: 'Silver',
  fuelType: 'Petrol',
  vin: 'MRHGM6650NT000123',
  purchaseDate: '2020-05-10',
  serviceHistory: [
    {
      id: 's1',
      date: '2023-07-15',
      type: 'Regular Maintenance',
      description: 'Oil change, filter replacement, general inspection',
      cost: 3500,
      technician: 'Amit Kumar'
    },
    {
      id: 's2',
      date: '2023-01-20',
      type: 'Brake Service',
      description: 'Front brake pad replacement, brake fluid flush',
      cost: 5200,
      technician: 'Suresh Patel'
    },
    {
      id: 's3',
      date: '2022-08-05',
      type: 'AC Service',
      description: 'AC gas refill, condenser cleaning',
      cost: 2800,
      technician: 'Amit Kumar'
    }
  ]
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-success/10 text-success';
    case 'servicing':
      return 'bg-warning/10 text-warning';
    case 'completed':
      return 'bg-info/10 text-info';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle] = useState<VehicleData>(vehicleData); // In a real app, fetch using the ID
  const [activeTab, setActiveTab] = useState('overview');
  const [isJobCardDialogOpen, setIsJobCardDialogOpen] = useState(false);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
          <div>
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Link to="/vehicles" className="hover:text-foreground transition-smooth inline-flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Vehicles</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{vehicle.registrationNumber}</h1>
              <Badge className={`${getStatusColor(vehicle.status)}`}>
                {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Edit className="h-4 w-4" /> Edit
            </Button>
            <Button size="sm" className="gap-1" onClick={() => setIsJobCardDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Create Job Card
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="condition">Condition</TabsTrigger>
            <TabsTrigger value="history">Service History</TabsTrigger>
            <TabsTrigger value="jobs">Job Cards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Vehicle Information</CardTitle>
                    <Car className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Make</p>
                      <p className="font-medium">{vehicle.make}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Model</p>
                      <p className="font-medium">{vehicle.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-medium">{vehicle.year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{vehicle.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Color</p>
                      <p className="font-medium">{vehicle.color}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel Type</p>
                      <p className="font-medium">{vehicle.fuelType}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">VIN</p>
                    <p className="font-medium">{vehicle.vin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Date</p>
                    <p className="font-medium">{new Date(vehicle.purchaseDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Owner Information</CardTitle>
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{vehicle.owner}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">+91 98765 43210</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">rajesh@example.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">123 Main Street, Andheri West, Mumbai, Maharashtra 400053</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Service Information</CardTitle>
                    <Wrench className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Service</p>
                    <p className="font-medium">{new Date(vehicle.lastService).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Service Due</p>
                    <p className="font-medium">25 Oct, 2023</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Services</p>
                    <p className="font-medium">{vehicle.serviceHistory.length}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Recent Service</p>
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="font-medium">{vehicle.serviceHistory[0].type}</p>
                      <p className="text-sm text-muted-foreground">{vehicle.serviceHistory[0].description}</p>
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(vehicle.serviceHistory[0].date).toLocaleDateString('en-IN')}
                        </span>
                        <span className="font-medium">₹{vehicle.serviceHistory[0].cost.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="condition" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Condition</CardTitle>
                <CardDescription>
                  View or update the marked condition of this vehicle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VehicleCanvas vehicleType={vehicle.type} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Service History</CardTitle>
                    <CardDescription>
                      All maintenance and service records for this vehicle
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> Add Record
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicle.serviceHistory.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          {new Date(service.date).toLocaleDateString('en-IN')}
                        </TableCell>
                        <TableCell className="font-medium">{service.type}</TableCell>
                        <TableCell className="hidden md:table-cell max-w-xs truncate">
                          {service.description}
                        </TableCell>
                        <TableCell>{service.technician}</TableCell>
                        <TableCell className="text-right">
                          ₹{service.cost.toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="jobs" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Job Cards</CardTitle>
                    <CardDescription>
                      Service job cards for this vehicle
                    </CardDescription>
                  </div>
                  <Button size="sm" className="gap-1" onClick={() => setIsJobCardDialogOpen(true)}>
                    <Plus className="h-4 w-4" /> Create Job Card
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Sample job cards */}
                <div className="grid gap-4">
                  <Card className="border border-border/40">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Job Card #JC230915
                          </h3>
                          <p className="text-sm text-muted-foreground">Regular Maintenance</p>
                        </div>
                        <Badge className="bg-warning/10 text-warning">In Progress</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-sm">
                          <p className="text-muted-foreground">Created on</p>
                          <p>15 Sep, 2023</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Estimated Completion</p>
                          <p>17 Sep, 2023</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Assigned to</p>
                          <p>Amit Kumar</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Estimated Cost</p>
                          <p>₹4,500</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Updated 2 hours ago</span>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1">
                          View Details <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-border/40">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Job Card #JC230715
                          </h3>
                          <p className="text-sm text-muted-foreground">Oil Change & Filter Replacement</p>
                        </div>
                        <Badge className="bg-success/10 text-success">Completed</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-sm">
                          <p className="text-muted-foreground">Created on</p>
                          <p>15 Jul, 2023</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Completed on</p>
                          <p>15 Jul, 2023</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Technician</p>
                          <p>Amit Kumar</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Total Cost</p>
                          <p>₹3,500</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-success">
                          <CircleCheck className="h-3 w-3" />
                          <span>Completed & Delivered</span>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1">
                          View Details <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isJobCardDialogOpen} onOpenChange={setIsJobCardDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Job Card</DialogTitle>
            <DialogDescription>
              Create a service job card for this vehicle
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-type">Service Type</Label>
                <Select>
                  <SelectTrigger id="service-type">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular Maintenance</SelectItem>
                    <SelectItem value="repair">Repair Work</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="custom">Custom Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="technician">Assign To</Label>
                <Select>
                  <SelectTrigger id="technician">
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amit">Amit Kumar</SelectItem>
                    <SelectItem value="suresh">Suresh Patel</SelectItem>
                    <SelectItem value="dinesh">Dinesh Singh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Service Description</Label>
              <Input id="description" placeholder="Describe the services to be performed" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimated-cost">Estimated Cost (₹)</Label>
                <Input id="estimated-cost" type="number" placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="estimated-time">Estimated Completion</Label>
                <Input id="estimated-time" type="date" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Input id="notes" placeholder="Any additional information or special instructions" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJobCardDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setIsJobCardDialogOpen(false)}>
              Create Job Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default VehicleDetail;
