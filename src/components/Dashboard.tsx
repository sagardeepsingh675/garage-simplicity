
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Car, Clipboard, Package, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your Garage Management Dashboard</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Vehicles" 
          value="142" 
          description="Active vehicle records" 
          icon={Car} 
          trend="up" 
          trendValue="12%"
        />
        <StatCard 
          title="Customers" 
          value="89" 
          description="Registered customers" 
          icon={Users} 
          trend="up" 
          trendValue="8%"
          iconColor="bg-info/10 text-info"
        />
        <StatCard 
          title="Job Cards" 
          value="24" 
          description="Open job cards" 
          icon={Clipboard} 
          trend="down" 
          trendValue="3%"
          iconColor="bg-warning/10 text-warning"
        />
        <StatCard 
          title="Inventory" 
          value="310" 
          description="Parts in stock" 
          icon={Package} 
          iconColor="bg-success/10 text-success"
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 transition-smooth card-hover">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your garage's latest activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: '09:32 AM', desc: 'New job card created for customer Rajesh Kumar', type: 'job' },
                { time: '08:15 AM', desc: 'Vehicle servicing completed - MH02AB1234', type: 'vehicle' },
                { time: 'Yesterday', desc: 'New customer registered - Priya Singh', type: 'customer' },
                { time: 'Yesterday', desc: 'Inventory updated - 5 new brake pads added', type: 'inventory' },
                { time: '2 days ago', desc: 'Job assigned to Technician Amit', type: 'job' },
              ].map((activity, i) => (
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
        
        <Card className="transition-smooth card-hover">
          <CardHeader>
            <CardTitle>Workload</CardTitle>
            <CardDescription>Staff assignment status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { name: 'Amit Kumar', role: 'Senior Technician', load: 82 },
              { name: 'Suresh Patel', role: 'Technician', load: 45 },
              { name: 'Dinesh Singh', role: 'Junior Technician', load: 68 },
              { name: 'Ravi Sharma', role: 'Technician', load: 30 },
            ].map((staff, i) => (
              <div key={i} className="space-y-2 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium leading-none">{staff.name}</p>
                    <p className="text-xs text-muted-foreground">{staff.role}</p>
                  </div>
                  <p className="text-sm font-medium">{staff.load}%</p>
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
