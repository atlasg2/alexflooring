import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  MessageSquare, 
  UserCheck, 
  Calendar, 
  AlertCircle, 
  Clock, 
  CheckSquare,
  BarChart2,
  TrendingUp,
  Activity,
  Home,
  ExternalLink,
  Mail,
  Tag,
  Code,
  FileText,
  MessageSquareText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock data for dashboard stats and charts
const mockRecentContacts = [
  { name: "John Smith", email: "john@example.com", date: "2023-04-15", service: "Hardwood Flooring" },
  { name: "Maria Garcia", email: "maria@example.com", date: "2023-04-13", service: "Tile Installation" },
  { name: "Robert Johnson", email: "robert@example.com", date: "2023-04-10", service: "Carpet Cleaning" },
];

const mockUnreadMessages = [
  { 
    name: "Emily Wilson", 
    email: "emily.wilson@example.com",
    phone: "(205) 555-7890",
    message: "Do you offer luxury vinyl plank flooring? I'm looking to update my living room and kitchen.", 
    date: "2023-04-15" 
  },
  { 
    name: "Michael Brown", 
    email: "mbrown@example.com",
    phone: "(504) 555-3421",
    message: "Looking for a quote on bathroom tile installation. The space is about 120 square feet.", 
    date: "2023-04-14" 
  },
  { 
    name: "Jessica Martinez", 
    email: "jmartinez@example.com",
    phone: "(225) 555-9876",
    message: "Hi, I'm interested in hardwood flooring for my home. Can someone call me to discuss options?", 
    date: "2023-04-12" 
  },
];

const mockUpcomingAppointments = [
  { client: "Sarah Davis", service: "Consultation", date: "2023-04-18", time: "10:00 AM" },
  { client: "James Thompson", service: "Measurement", date: "2023-04-19", time: "2:30 PM" },
];

// Template highlights for dashboard
const featuredTemplates = {
  email: [
    {
      name: "Appointment Confirmation",
      subject: "Your APS Flooring Appointment Confirmation",
      description: "Sends details about scheduled appointments",
      category: "appointment"
    },
    {
      name: "Google Review Request",
      subject: "We Would Love Your Feedback on APS Flooring Service",
      description: "Asks customers for Google reviews after project completion",
      category: "review"
    },
    {
      name: "Seasonal Promotion",
      subject: "Special Spring Flooring Sale - Save 15% on Selected Products",
      description: "Promotes seasonal discounts and special offers",
      category: "promotion"
    },
    {
      name: "Project Start Notification",
      subject: "Your APS Flooring Project Begins Soon",
      description: "Informs customers about their upcoming project start date",
      category: "project"
    },
    {
      name: "Customer Referral Thank You",
      subject: "Thank You for Your Referral to APS Flooring",
      description: "Shows appreciation for customer referrals with rewards",
      category: "referral"
    },
    {
      name: "Quote Follow-Up",
      subject: "Your APS Flooring Quote",
      description: "Provides project quote details and next steps",
      category: "quote"
    }
  ],
  sms: [
    {
      name: "Appointment Reminder",
      content: "Reminder: Your APS Flooring appointment is tomorrow at {{time}}. Call (504) 402-3895 if you need to reschedule.",
      category: "appointment"
    },
    {
      name: "Project Completion",
      content: "Great news! Your APS Flooring project is complete. We hope you love your new floors!",
      category: "project"
    },
    {
      name: "Quote Follow-up",
      content: "Your APS Flooring quote for {{project}} is ready! Total: {{amount}}. Questions or ready to book? Call us!",
      category: "quote"
    },
    {
      name: "Day-of Reminder",
      content: "Your APS Flooring appointment is today at {{appointment_time}}. Our team is looking forward to meeting you!",
      category: "appointment"
    },
    {
      name: "New Lead Response",
      content: "Thanks for your interest in APS Flooring! We've received your inquiry and will contact you shortly. Questions? Call (504) 402-3895.",
      category: "lead"
    },
    {
      name: "Seasonal Promotion",
      content: "APS Flooring SPRING SALE: 15% off hardwood & LVP until {{promotion_end_date}}. Use code SPRING2023. Call (504) 402-3895 to book!",
      category: "promotion"
    }
  ]
};

// Chart data
const monthlyContactsData = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 19 },
  { month: 'Mar', count: 15 },
  { month: 'Apr', count: 24 },
  { month: 'May', count: 18 },
  { month: 'Jun', count: 27 },
];

// New chart data
const serviceBreakdownData = [
  { name: 'Hardwood', value: 45 },
  { name: 'LVP', value: 25 },
  { name: 'Tile', value: 15 },
  { name: 'Carpet', value: 10 },
  { name: 'Other', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C'];

const performanceData = [
  { month: 'Jan', revenue: 22000, projects: 8 },
  { month: 'Feb', revenue: 27000, projects: 10 },
  { month: 'Mar', revenue: 32000, projects: 12 },
  { month: 'Apr', revenue: 38000, projects: 15 },
  { month: 'May', revenue: 35000, projects: 14 },
  { month: 'Jun', revenue: 42000, projects: 16 },
];

const recentProjectsData = [
  { client: "Sarah Davis", project: "Hardwood Installation", date: "2023-06-15", status: "Completed" },
  { client: "James Thompson", project: "LVP Flooring", date: "2023-06-18", status: "In Progress" },
  { client: "Michael Brown", project: "Tile Installation", date: "2023-06-20", status: "Scheduled" },
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
  const isMobile = useIsMobile();
  const [stats, setStats] = useState({
    unreadMessages: 2,
    newContacts: 5,
    upcomingAppointments: 3,
    pendingRequests: 7
  });
  
  // Redirect to a more mobile-friendly page if on mobile
  useEffect(() => {
    if (isMobile) {
      // Redirect to the messages page which is more useful on mobile
      navigate('/admin/messages');
    }
  }, [isMobile, navigate]);
  
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
    <AdminLayout title="Business Dashboard">
      <div className="grid gap-6">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome to APS Flooring Dashboard</h2>
                <p className="text-white/80">Manage your business, track performance, and respond to customer inquiries.</p>
              </div>
              <div className="flex gap-4 mt-4 md:mt-0">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white text-primary" 
                  onClick={() => navigate('/admin/messages')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" /> Chat Messages
                  {stats.unreadMessages > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                      {stats.unreadMessages}
                    </span>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white text-white hover:bg-white/20"
                  onClick={() => window.open('/', '_blank')}
                >
                  <Home className="h-4 w-4 mr-2" /> View Website
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Chat Messages"
            value={stats.unreadMessages}
            description="Unread messages"
            icon={<MessageSquare className="h-5 w-5 text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Projects"
            value="16"
            description="Ongoing projects"
            icon={<Activity className="h-5 w-5 text-white" />}
            color="bg-green-500"
          />
          <StatCard
            title="Appointments"
            value={stats.upcomingAppointments}
            description="Next 7 days"
            icon={<Calendar className="h-5 w-5 text-white" />}
            color="bg-purple-500"
          />
          <StatCard
            title="Monthly Revenue"
            value="$42,000"
            description="June 2023"
            icon={<TrendingUp className="h-5 w-5 text-white" />}
            color="bg-amber-500"
          />
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Revenue and completed projects over time
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} name="Revenue ($)" />
                    <Line yAxisId="right" type="monotone" dataKey="projects" stroke="#82ca9d" name="Projects" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Service Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Service Breakdown</CardTitle>
              <CardDescription>
                Distribution of services in current projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {serviceBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Templates Highlights Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Marketing Tools</CardTitle>
                <CardDescription>
                  Create and manage your customer communication templates
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin/email-templates')}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Create Email
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin/sms-templates')}
                >
                  <MessageSquareText className="mr-2 h-4 w-4" />
                  Create SMS
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-1">
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="w-full max-w-[400px] mb-4">
                <TabsTrigger value="email" className="flex-1">Email Templates</TabsTrigger>
                <TabsTrigger value="sms" className="flex-1">SMS Templates</TabsTrigger>
              </TabsList>
    
              {/* Email Templates Tab */}
              <TabsContent value="email" className="space-y-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {featuredTemplates.email.slice(0, 3).map((template, index) => (
                    <Card key={index} className="shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle>{template.name}</CardTitle>
                          <Badge variant="outline" className="capitalize">{template.category}</Badge>
                        </div>
                        <CardDescription className="truncate">{template.subject}</CardDescription>
                      </CardHeader>
                      <CardContent className="py-0">
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </CardContent>
                      <CardFooter className="pt-3 pb-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate('/admin/email-templates')}
                        >
                          View Template <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {featuredTemplates.email.slice(3, 6).map((template, index) => (
                    <Card key={index} className="shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle>{template.name}</CardTitle>
                          <Badge variant="outline" className="capitalize">{template.category}</Badge>
                        </div>
                        <CardDescription className="truncate">{template.subject}</CardDescription>
                      </CardHeader>
                      <CardContent className="py-0">
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </CardContent>
                      <CardFooter className="pt-3 pb-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate('/admin/email-templates')}
                        >
                          View Template <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-end mt-4 mb-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/admin/email-templates')}
                  >
                    View All Email Templates <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </TabsContent>
    
              {/* SMS Templates Tab */}
              <TabsContent value="sms" className="space-y-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {featuredTemplates.sms.slice(0, 3).map((template, index) => (
                    <Card key={index} className="shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle>{template.name}</CardTitle>
                          <Badge variant="outline" className="capitalize">{template.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">{template.content}</p>
                      </CardContent>
                      <CardFooter className="pt-3 pb-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate('/admin/sms-templates')}
                        >
                          View Template <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {featuredTemplates.sms.slice(3, 6).map((template, index) => (
                    <Card key={index} className="shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle>{template.name}</CardTitle>
                          <Badge variant="outline" className="capitalize">{template.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">{template.content}</p>
                      </CardContent>
                      <CardFooter className="pt-3 pb-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate('/admin/sms-templates')}
                        >
                          View Template <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-end mt-4 mb-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/admin/sms-templates')}
                  >
                    View All SMS Templates <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Activity Tabs */}
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="messages">Recent Messages</TabsTrigger>
            <TabsTrigger value="projects">Current Projects</TabsTrigger>
            <TabsTrigger value="appointments">Upcoming Appointments</TabsTrigger>
          </TabsList>
          
          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Recent Chat Messages</CardTitle>
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
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/messages')}>
                  View All Messages <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Current Projects</CardTitle>
                <CardDescription>
                  Ongoing and scheduled flooring projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjectsData.map((project, index) => (
                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{project.client}</h4>
                          <p className="text-sm">{project.project}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{project.date}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                  Manage Projects <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Appointments Tab */}
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
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/calendar')}>
                  View Calendar <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;