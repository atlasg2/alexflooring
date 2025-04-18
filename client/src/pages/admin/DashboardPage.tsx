import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { 
  MessageSquare, 
  UserCheck, 
  Calendar, 
  AlertCircle, 
  Clock, 
  CheckSquare 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Mock data for dashboard stats and charts
const mockRecentContacts = [
  { name: "John Smith", email: "john@example.com", date: "2023-04-15", service: "Hardwood Flooring" },
  { name: "Maria Garcia", email: "maria@example.com", date: "2023-04-13", service: "Tile Installation" },
  { name: "Robert Johnson", email: "robert@example.com", date: "2023-04-10", service: "Carpet Cleaning" },
];

const mockUnreadMessages = [
  { name: "Emily Wilson", message: "Do you offer luxury vinyl plank flooring?", date: "2023-04-15" },
  { name: "Michael Brown", message: "Looking for a quote on bathroom tile...", date: "2023-04-14" },
];

const mockUpcomingAppointments = [
  { client: "Sarah Davis", service: "Consultation", date: "2023-04-18", time: "10:00 AM" },
  { client: "James Thompson", service: "Measurement", date: "2023-04-19", time: "2:30 PM" },
];

// Chart data
const monthlyContactsData = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 19 },
  { month: 'Mar', count: 15 },
  { month: 'Apr', count: 24 },
  { month: 'May', count: 18 },
  { month: 'Jun', count: 27 },
];

// Dashboard metrics statistic cards
interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, description, icon, color }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className={`p-2 rounded-full ${color}`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState({
    unreadMessages: 2,
    newContacts: 5,
    upcomingAppointments: 3,
    pendingRequests: 7
  });
  
  // In a real app, fetch these from the API
  useEffect(() => {
    // This would be replaced with actual API calls
    // For example:
    // const fetchStats = async () => {
    //   try {
    //     const messageCount = await fetchUnreadCount();
    //     const contactCount = await fetchNewContactCount();
    //     // etc...
    //     setStats({...});
    //   } catch (error) {
    //     toast({
    //       title: "Error loading dashboard data",
    //       description: "Please try refreshing the page",
    //       variant: "destructive"
    //     });
    //   }
    // };
    // 
    // fetchStats();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Unread Messages"
            value={stats.unreadMessages}
            description="From chat widget"
            icon={<MessageSquare className="h-5 w-5 text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="New Contacts"
            value={stats.newContacts}
            description="Last 7 days"
            icon={<UserCheck className="h-5 w-5 text-white" />}
            color="bg-green-500"
          />
          <StatCard
            title="Upcoming Appointments"
            value={stats.upcomingAppointments}
            description="Next 7 days"
            icon={<Calendar className="h-5 w-5 text-white" />}
            color="bg-purple-500"
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            description="Awaiting response"
            icon={<AlertCircle className="h-5 w-5 text-white" />}
            color="bg-amber-500"
          />
        </div>
        
        {/* Monthly activity chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Monthly Contacts</CardTitle>
            <CardDescription>
              Number of contact form submissions per month
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyContactsData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent activity tabs */}
        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contacts">Recent Contacts</TabsTrigger>
            <TabsTrigger value="messages">Unread Messages</TabsTrigger>
            <TabsTrigger value="appointments">Upcoming Appointments</TabsTrigger>
          </TabsList>
          
          {/* Recent Contacts Tab */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Recent Contact Submissions</CardTitle>
                <CardDescription>
                  Recent contact form submissions from the website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentContacts.map((contact, index) => (
                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{contact.name}</h4>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                          <p className="text-sm mt-1">Service: {contact.service}</p>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" /> {contact.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <button 
                    className="text-sm text-primary hover:underline"
                    onClick={() => navigate('/admin/contacts')}
                  >
                    View All Contacts
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Unread Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Unread Chat Messages</CardTitle>
                <CardDescription>
                  Messages from the chat widget that need a response
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUnreadMessages.map((message, index) => (
                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{message.name}</h4>
                          <p className="text-sm">{message.message}</p>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" /> {message.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <button 
                    className="text-sm text-primary hover:underline"
                    onClick={() => navigate('/admin/messages')}
                  >
                    View All Messages
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Upcoming Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>
                  Scheduled appointments for the next 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUpcomingAppointments.map((appointment, index) => (
                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{appointment.client}</h4>
                          <p className="text-sm">{appointment.service}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{appointment.date}</p>
                          <p className="text-xs text-muted-foreground">{appointment.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <button 
                    className="text-sm text-primary hover:underline"
                    onClick={() => navigate('/admin/calendar')}
                  >
                    View Full Schedule
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;