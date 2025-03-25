import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MoreHorizontal, Phone, Mail, Calendar, Briefcase, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/lib/toast';
import { getStaff, createStaff, updateStaff, deleteStaff, Staff as StaffType } from '@/services/staffService';

type SkillOption = {
  id: string;
  name: string;
};

// Available skills
const skillOptions: SkillOption[] = [
  { id: 'engine', name: 'Engine' },
  { id: 'transmission', name: 'Transmission' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'brakes', name: 'Brakes' },
  { id: 'suspension', name: 'Suspension' },
  { id: 'ac', name: 'AC' },
  { id: 'diagnostics', name: 'Diagnostics' },
  { id: 'oil-change', name: 'Oil Change' },
  { id: 'tire-service', name: 'Tire Service' },
  { id: 'basic-maintenance', name: 'Basic Maintenance' },
  { id: 'battery', name: 'Battery' },
  { id: 'customer-service', name: 'Customer Service' },
  { id: 'job-estimation', name: 'Job Estimation' },
  { id: 'inspection', name: 'Inspection' },
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
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffType | null>(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    specialty: '',
    active: true,
    skills: [] as string[],
    workload: 0
  });
  
  const queryClient = useQueryClient();
  
  // Fetch staff
  const { data: staffMembers = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const data = await getStaff();
      console.log('Staff query success:', data);
      return data;
    }
  });
  
  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: (data) => {
      console.log('Staff creation mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      resetForm();
      setIsAddStaffOpen(false);
      toast.success('Staff member added successfully');
    },
    onError: (error) => {
      console.error('Staff creation mutation error:', error);
      toast.error('Failed to add staff member');
    }
  });
  
  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StaffType> }) => updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setIsEditStaffOpen(false);
      setSelectedStaff(null);
      toast.success('Staff member updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update staff member');
      console.error(error);
    }
  });
  
  // Delete staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete staff member');
      console.error(error);
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.role) {
      toast.error('Name and role are required');
      return;
    }
    
    // Convert skills array to specialty string and clean up the data
    const staffData = {
      name: newStaff.name.trim(),
      role: newStaff.role.trim(),
      email: newStaff.email?.trim() || null,
      phone: newStaff.phone?.trim() || null,
      specialty: newStaff.skills.length > 0 ? newStaff.skills.join(',') : null,
      active: newStaff.active
    };
    
    console.log('Submitting staff data:', staffData);
    createStaffMutation.mutate(staffData);
  };
  
  const handleEdit = (staffMember: StaffType) => {
    setSelectedStaff(staffMember);
    setIsEditStaffOpen(true);
  };
  
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    
    updateStaffMutation.mutate({ id: selectedStaff.id, data: selectedStaff });
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      deleteStaffMutation.mutate(id);
    }
  };
  
  const resetForm = () => {
    setNewStaff({
      name: '',
      email: '',
      phone: '',
      role: '',
      specialty: '',
      active: true,
      skills: [],
      workload: 0
    });
  };
  
  const toggleSkill = (skill: string) => {
    const currentSkills = newStaff.skills || [];
    if (currentSkills.includes(skill)) {
      setNewStaff({
        ...newStaff,
        skills: currentSkills.filter(s => s !== skill)
      });
    } else {
      setNewStaff({
        ...newStaff,
        skills: [...currentSkills, skill]
      });
    }
  };
  
  const toggleSelectedSkill = (skill: string) => {
    if (!selectedStaff) return;
    
    const currentSkills = selectedStaff.specialty?.split(',') || [];
    if (currentSkills.includes(skill)) {
      setSelectedStaff({
        ...selectedStaff,
        specialty: currentSkills.filter(s => s !== skill).join(',')
      });
    } else {
      setSelectedStaff({
        ...selectedStaff,
        specialty: [...currentSkills, skill].join(',')
      });
    }
  };
  
  const filteredStaff = staffMembers.filter((member: StaffType) => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Workload</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Loading staff members...
                    </TableCell>
                  </TableRow>
                ) : filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No staff found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member: StaffType) => (
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
                          {member.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" /> {member.phone}
                          </span>
                          )}
                          {member.email && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" /> {member.email}
                          </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {member.specialty && member.specialty.split(',').map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(member.active ? 'active' : 'unavailable')}>
                          {member.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {typeof member.workload === 'number' && (
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
                        )}
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
                            <DropdownMenuItem onClick={() => handleEdit(member)}>Edit staff</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(member.id)}>Delete staff</DropdownMenuItem>
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
      
      {/* Add Staff Dialog */}
      <Dialog open={isAddStaffOpen} onOpenChange={(open) => {
        setIsAddStaffOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Staff</DialogTitle>
            <DialogDescription>
              Enter staff details to create a new record.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
                <Input 
                  id="name" 
                  className="col-span-3" 
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
                <Select 
                  value={newStaff.role}
                  onValueChange={(value) => setNewStaff({...newStaff, role: value})}
                >
                <SelectTrigger id="role" className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Senior Technician">Senior Technician</SelectItem>
                    <SelectItem value="Technician">Technician</SelectItem>
                    <SelectItem value="Junior Technician">Junior Technician</SelectItem>
                    <SelectItem value="Service Advisor">Service Advisor</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
                <Input 
                  id="phone" 
                  className="col-span-3" 
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
                <Input 
                  id="email" 
                  type="email" 
                  className="col-span-3" 
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Status
              </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Checkbox 
                    id="active" 
                    checked={newStaff.active}
                    onCheckedChange={(checked) => setNewStaff({...newStaff, active: checked as boolean})}
                  />
                  <label htmlFor="active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Active
                  </label>
                </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="workload" className="text-right">
                  Workload %
                </Label>
                <Input 
                  id="workload" 
                  type="number" 
                  min="0"
                  max="100"
                  className="col-span-3" 
                  value={newStaff.workload || 0}
                  onChange={(e) => setNewStaff({...newStaff, workload: Number(e.target.value)})}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-right pt-2">
                Skills
              </Label>
                <div className="col-span-3 grid grid-cols-2 gap-2">
                  {skillOptions.map((skill) => (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`skill-${skill.id}`} 
                        checked={newStaff.skills.includes(skill.name)}
                        onCheckedChange={() => toggleSkill(skill.name)}
                      />
                      <label htmlFor={`skill-${skill.id}`} className="text-sm font-medium leading-none">
                        {skill.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAddStaffOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createStaffMutation.isPending}>
                {createStaffMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Staff Dialog */}
      <Dialog open={isEditStaffOpen} onOpenChange={(open) => {
        setIsEditStaffOpen(open);
        if (!open) setSelectedStaff(null);
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update staff details.
            </DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <form onSubmit={handleUpdateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input 
                    id="edit-name" 
                    className="col-span-3" 
                    value={selectedStaff.name}
                    onChange={(e) => setSelectedStaff({...selectedStaff, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role" className="text-right">
                    Role
                  </Label>
                  <Select 
                    value={selectedStaff.role}
                    onValueChange={(value) => setSelectedStaff({...selectedStaff, role: value})}
                  >
                    <SelectTrigger id="edit-role" className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Senior Technician">Senior Technician</SelectItem>
                      <SelectItem value="Technician">Technician</SelectItem>
                      <SelectItem value="Junior Technician">Junior Technician</SelectItem>
                      <SelectItem value="Service Advisor">Service Advisor</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">
                    Phone
                  </Label>
                  <Input 
                    id="edit-phone" 
                    className="col-span-3" 
                    value={selectedStaff.phone || ''}
                    onChange={(e) => setSelectedStaff({...selectedStaff, phone: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">
                    Email
                  </Label>
                  <Input 
                    id="edit-email" 
                    type="email" 
                    className="col-span-3" 
                    value={selectedStaff.email || ''}
                    onChange={(e) => setSelectedStaff({...selectedStaff, email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    Status
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Checkbox 
                      id="edit-active" 
                      checked={selectedStaff.active}
                      onCheckedChange={(checked) => setSelectedStaff({...selectedStaff, active: checked as boolean})}
                    />
                    <label htmlFor="edit-active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Active
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-workload" className="text-right">
                    Workload %
                  </Label>
                  <Input 
                    id="edit-workload" 
                    type="number" 
                    min="0"
                    max="100"
                    className="col-span-3" 
                    value={selectedStaff.workload || 0}
                    onChange={(e) => setSelectedStaff({...selectedStaff, workload: Number(e.target.value)})}
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <Label className="text-right pt-2">
                    Skills
                  </Label>
                  <div className="col-span-3 grid grid-cols-2 gap-2">
                    {skillOptions.map((skill) => (
                      <div key={`edit-${skill.id}`} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`edit-skill-${skill.id}`} 
                          checked={selectedStaff.specialty?.includes(skill.name)}
                          onCheckedChange={() => toggleSelectedSkill(skill.name)}
                        />
                        <label htmlFor={`edit-skill-${skill.id}`} className="text-sm font-medium leading-none">
                          {skill.name}
                        </label>
                      </div>
                    ))}
                  </div>
            </div>
          </div>
          <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsEditStaffOpen(false)}>
              Cancel
            </Button>
                <Button type="submit" disabled={updateStaffMutation.isPending}>
                  {updateStaffMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Staff;
