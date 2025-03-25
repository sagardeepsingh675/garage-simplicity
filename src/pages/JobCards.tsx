
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MoreHorizontal, FileText, Calendar, Car, User, CreditCard, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface JobCard {
  id: string;
  vehicleReg: string;
  vehicleDetails: string;
  customer: string;
  assignedTo: string;
  serviceType: string;
  createdDate: string;
  estimatedCompletion: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  estimatedCost: number;
}

const mockJobCards: JobCard[] = [
  { id: 'JC230925', vehicleReg: 'MH02AB1234', vehicleDetails: 'Honda City 2020', customer: 'Rajesh Kumar', assignedTo: 'Amit Kumar', serviceType: 'Regular Maintenance', createdDate: '2023-09-25', estimatedCompletion: '2023-09-27', status: 'in-progress', estimatedCost: 4500 },
  { id: 'JC230924', vehicleReg: 'DL01CD5678', vehicleDetails: 'Hyundai Creta 2021', customer: 'Priya Singh', assignedTo: 'Suresh Patel', serviceType: 'Brake Service', createdDate: '2023-09-24', estimatedCompletion: '2023-09-26', status: 'pending', estimatedCost: 5200 },
  { id: 'JC230923', vehicleReg: 'GJ05EF9012', vehicleDetails: 'Maruti Swift 2019', customer: 'Amit Patel', assignedTo: 'Dinesh Singh', serviceType: 'AC Repair', createdDate: '2023-09-23', estimatedCompletion: '2023-09-25', status: 'in-progress', estimatedCost: 3800 },
  { id: 'JC230922', vehicleReg: 'RJ06GH3456', vehicleDetails: 'Tata Nexon 2022', customer: 'Sunita Sharma', assignedTo: 'Amit Kumar', serviceType: 'Oil Change', createdDate: '2023-09-22', estimatedCompletion: '2023-09-22', status: 'completed', estimatedCost: 2500 },
  { id: 'JC230921', vehicleReg: 'KA03IJ7890', vehicleDetails: 'Toyota Innova 2020', customer: 'Vikram Mehta', assignedTo: 'Ravi Sharma', serviceType: 'Wheel Alignment', createdDate: '2023-09-21', estimatedCompletion: '2023-09-21', status: 'completed', estimatedCost: 1800 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-muted text-muted-foreground';
    case 'in-progress':
      return 'bg-warning/10 text-warning';
    case 'completed':
      return 'bg-success/10 text-success';
    case 'cancelled':
      return 'bg-destructive/10 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const JobCards = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobCards] = useState<JobCard[]>(mockJobCards);
  const [isAddJobCardOpen, setIsAddJobCardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredJobCards = jobCards.filter(card => 
    (activeTab === 'all' || card.status === activeTab.replace('-', '-')) &&
    (card.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     card.vehicleReg.toLowerCase().includes(searchTerm.toLowerCase()) ||
     card.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
     card.serviceType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Job Cards</h2>
            <p className="text-muted-foreground">Manage service job cards</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddJobCardOpen(true)}>
            <Plus className="h-4 w-4" /> Create Job Card
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search job cards..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <Card className="overflow-hidden border border-border/50 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="hidden md:table-cell">Customer</TableHead>
                  <TableHead className="hidden lg:table-cell">Service</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobCards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No job cards found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobCards.map(card => (
                    <TableRow key={card.id} className="hover:bg-muted/30 transition-smooth">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-primary" />
                          <span>{card.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1">
                            <Car className="h-3 w-3 text-muted-foreground" />
                            {card.vehicleReg}
                          </span>
                          <span className="text-sm text-muted-foreground">{card.vehicleDetails}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{card.customer}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {card.serviceType}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-col text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(card.createdDate).toLocaleDateString('en-IN')}
                          </span>
                          <span className="text-muted-foreground">
                            Due: {new Date(card.estimatedCompletion).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(card.status)}`}>
                          {card.status === 'in-progress' ? 'In Progress' : 
                           card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            <DropdownMenuItem>Edit job card</DropdownMenuItem>
                            <DropdownMenuItem>Update status</DropdownMenuItem>
                            <DropdownMenuItem>Print job card</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isAddJobCardOpen} onOpenChange={setIsAddJobCardOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Job Card</DialogTitle>
            <DialogDescription>
              Create a service job card for a vehicle
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select>
                  <SelectTrigger id="vehicle">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">MH02AB1234 - Honda City</SelectItem>
                    <SelectItem value="2">DL01CD5678 - Hyundai Creta</SelectItem>
                    <SelectItem value="3">GJ05EF9012 - Maruti Swift</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select>
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Rajesh Kumar</SelectItem>
                    <SelectItem value="2">Priya Singh</SelectItem>
                    <SelectItem value="3">Amit Patel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
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
            
            <div className="space-y-2">
              <Label htmlFor="description">Service Description</Label>
              <Input id="description" placeholder="Describe the services to be performed" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated-cost">Estimated Cost (₹)</Label>
                <Input id="estimated-cost" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated-completion">Estimated Completion</Label>
                <Input id="estimated-completion" type="date" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Input id="notes" placeholder="Any additional information or special instructions" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddJobCardOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setIsAddJobCardOpen(false)}>
              Create Job Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default JobCards;
