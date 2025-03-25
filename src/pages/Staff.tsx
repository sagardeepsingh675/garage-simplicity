
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MoreHorizontal, Phone, Mail, Calendar, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  joinDate: string;
  workload: number;
  skills: string[];
  status: 'active' | 'on-leave' | 'unavailable';
}

const mockStaff: StaffMember[] = [
  { id: '1', name: 'Amit Kumar', role: 'Senior Technician', phone: '+91 98765 43210', email: 'amit@garage.in', joinDate: '2018-05-15', workload: 82, skills: ['Engine', 'Transmission', 'Electrical'], status: 'active' },
  { id: '2', name: 'Suresh Patel', role: 'Technician', phone: '+91 87654 32109', email: 'suresh@garage.in', joinDate: '2020-08-22', workload: 45, skills: ['Brakes', 'Suspension', 'AC'], status: 'active' },
  { id: '3', name: 'Dinesh Singh', role: 'Junior Technician', phone: '+91 76543 21098', email: 'dinesh@garage.in', joinDate: '2021-03-10', workload: 68, skills: ['Oil Change', 'Tire Service', 'Basic Maintenance'], status: 'active' },
  { id: '4', name: 'Ravi Sharma', role: 'Technician', phone: '+91 65432 10987', email: 'ravi@garage.in', joinDate: '2019-11-05', workload: 30, skills: ['Diagnostics', 'Electrical', 'Battery'], status: 'on-leave' },
  { id: '5', name: 'Nikhil Verma', role: 'Service Advisor', phone: '+91 54321 09876', email: 'nikhil@garage.in', joinDate: '2020-02-18', workload: 60, skills: ['Customer Service', 'Job Estimation', 'Inspection'], status: 'active' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-success/10 text-success';
    case 'on-leave':
      return 'bg-warning/10 text-warning';
    case 'unavailable':
      return 'bg-destructive/10 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getWorkloadColor = (workload: number) => {
  if (workload > 70) return 'bg-destructive/20';
  if (workload > 50) return 'bg-warning/20';
  return 'bg-success/20';
};

const getWorkloadIndicator = (workload: number) => {
  if (workload > 70) return 'bg-destructive';
  if (workload > 50) return 'bg-warning';
  return 'bg-success';
};

const Staff = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [staff] = useState<StaffMember[]>(mockStaff);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  
  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Staff</h2>
            <p className="text-muted-foreground">Manage your garage staff and technicians</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddStaffOpen(true)}>
            <Plus className="h-4 w-4" /> Add Staff
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search staff by name, role..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Card className="overflow-hidden border border-border/50 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">Skills</TableHead>
                  <TableHead>Workload</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No staff found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map(member => (
                    <TableRow key={member.id} className="hover:bg-muted/30 transition-smooth">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden sm:flex h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Briefcase className="h-3 w-3" /> {member.role}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" /> {member.phone}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" /> {member.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {member.skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 max-w-[150px]">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Workload</span>
                            <span>{member.workload}%</span>
                          </div>
                          <Progress
                            value={member.workload}
                            className={`h-2 ${getWorkloadColor(member.workload)}`}
                            indicatorClassName={getWorkloadIndicator(member.workload)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge className={`${getStatusColor(member.status)}`}>
                          {member.status === 'active' ? 'Active' : 
                           member.status === 'on-leave' ? 'On Leave' : 'Unavailable'}
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
                            <DropdownMenuItem>Edit staff</DropdownMenuItem>
                            <DropdownMenuItem>Assigned jobs</DropdownMenuItem>
                            <DropdownMenuItem>Update status</DropdownMenuItem>
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
      
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Staff</DialogTitle>
            <DialogDescription>
              Enter staff details to create a new record.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select>
                <SelectTrigger id="role" className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="senior-technician">Senior Technician</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="junior-technician">Junior Technician</SelectItem>
                  <SelectItem value="service-advisor">Service Advisor</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input id="phone" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" type="email" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="join-date" className="text-right">
                Join Date
              </Label>
              <Input id="join-date" type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="skills" className="text-right">
                Skills
              </Label>
              <Input id="skills" placeholder="Engine, Brakes, Electrical, etc." className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStaffOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setIsAddStaffOpen(false)}>
              Save Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Staff;
