import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Car, Clipboard, Package, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { getVehicles } from '@/services/vehicleService';
import { getCustomers } from '@/services/customerService';
import { getJobCards } from '@/services/jobCardService';
import { getStaff } from '@/services/staffService';
import { getInventoryItems } from '@/services/inventoryService';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  iconColor?: string;
}

const StatCard = ({ title, value, description, icon: Icon, trend, trendValue, iconColor = 'bg-primary/10 text-primary' }: StatCardProps) => {
  return (
    <Card className="overflow-hidden transition-smooth card-hover">
      <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && trendValue && (
          <div className="flex items-center mt-4 text-xs">
            <span className={`flex items-center ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
              {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              {trendValue}
            </span>
            <span className="text-muted-foreground ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function Dashboard() {
  // Fetch data from Supabase
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles
  });

  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers
  });

  const { data: jobCards = [], isLoading: isLoadingJobCards } = useQuery({
    queryKey: ['jobCards'],
    queryFn: getJobCards
  });

  const { data: staffMembers = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ['staff'],
    queryFn: getStaff
  });

  const { data: inventoryItems = [], isLoading: isLoadingInventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventoryItems
  });

  // Calculate statistics
  const totalVehicles = vehicles.length;
  const totalCustomers = customers.length;
  const openJobCards = jobCards.filter(card => card.status !== 'completed' && card.status !== 'cancelled').length;
  const totalInventoryItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter(item => item.quantity <= item.min_quantity).length;
  const inventoryValue = inventoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Get recent activities
  const recentActivities = [
    ...jobCards.slice(0, 3).map(card => ({
      time: new Date(card.created_at || '').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      desc: `New job card created for ${card.customers?.name || 'customer'}`,
      type: 'job'
    })),
    ...vehicles.slice(0, 2).map(vehicle => ({
      time: new Date(vehicle.created_at || '').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      desc: `New vehicle registered - ${vehicle.license_plate}`,
      type: 'vehicle'
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  // Calculate staff workload
  const staffWorkload = staffMembers.map(staff => {
    const assignedJobs = jobCards.filter(card => card.assigned_staff === staff.id);
    const workload = (assignedJobs.length / 5) * 100; // Assuming 5 jobs is 100% workload
    return {
      name: staff.name,
      role: staff.role,
      load: Math.min(workload, 100)
    };
  });

  const isLoading = isLoadingVehicles || isLoadingCustomers || isLoadingJobCards || isLoadingStaff || isLoadingInventory;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="p-6 pb-2">
                <div className="h-4 w-24 bg-muted rounded" />
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="h-8 w-16 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your Garage Management Dashboard</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Vehicles" 
          value={totalVehicles} 
          description="Active vehicle records" 
          icon={Car} 
          trend="up" 
          trendValue="12%"
        />
        <StatCard 
          title="Customers" 
          value={totalCustomers} 
          description="Registered customers" 
          icon={Users} 
          trend="up" 
          trendValue="8%"
          iconColor="bg-info/10 text-info"
        />
        <StatCard 
          title="Job Cards" 
          value={openJobCards} 
          description="Open job cards" 
          icon={Clipboard} 
          trend="down" 
          trendValue="3%"
          iconColor="bg-warning/10 text-warning"
        />
        <StatCard 
          title="Inventory" 
          value={totalInventoryItems} 
          description="Parts in stock" 
          icon={Package} 
          iconColor="bg-success/10 text-success"
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-2 transition-smooth card-hover">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your garage's latest activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`mt-1 h-2 w-2 rounded-full ${
                    activity.type === 'job' ? 'bg-primary' : 
                    activity.type === 'vehicle' ? 'bg-success' :
                    activity.type === 'customer' ? 'bg-info' : 'bg-warning'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.desc}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-2 transition-smooth card-hover">
          <CardHeader>
            <CardTitle>Workload</CardTitle>
            <CardDescription>Staff assignment status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {staffWorkload.map((staff, i) => (
              <div key={i} className="space-y-2 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium leading-none">{staff.name}</p>
                    <p className="text-xs text-muted-foreground">{staff.role}</p>
                  </div>
                  <p className="text-sm font-medium">{Math.round(staff.load)}%</p>
                </div>
                <Progress
                  value={staff.load} 
                  className={`h-2 ${
                    staff.load > 70 ? 'bg-destructive/20' : 
                    staff.load > 50 ? 'bg-warning/20' : 'bg-success/20'
                  }`}
                  indicatorClassName={
                    staff.load > 70 ? 'bg-destructive' : 
                    staff.load > 50 ? 'bg-warning' : 'bg-success'
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
