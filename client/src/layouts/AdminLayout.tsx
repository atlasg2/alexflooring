import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  LayoutDashboard, 
  LogOut,
  AlertCircle,
  BookOpen,
  Mail,
  Send,
  Activity,
  Star,
  Settings,
  Database
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [, navigate] = useLocation();
  const [isOnLoginPage] = useRoute('/admin/login');
  
  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user');
        if (!response.ok && !isOnLoginPage) {
          navigate('/admin/login');
        }
      } catch (error) {
        if (!isOnLoginPage) {
          navigate('/admin/login');
        }
      }
    };
    
    checkAuth();
  }, [navigate, isOnLoginPage]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/logout');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate('/admin/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive"
      });
    }
  };
  
  // State for collapsible sections
  const [crmOpen, setCrmOpen] = useState(false);
  const [communicationsOpen, setCommunicationsOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Get unread message count
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/admin/chat/unread-count');
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    
    fetchUnreadCount();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // If on login page, just render the children without the admin layout
  if (isOnLoginPage) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-md p-4 flex flex-col overflow-y-auto">
        <div className="p-2 flex items-center justify-center mb-6">
          <h1 className="text-xl font-semibold text-primary">APS Admin</h1>
        </div>
        
        <nav className="space-y-1 flex-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate('/admin/dashboard')}
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Dashboard
          </Button>
          
          {/* CRM Section */}
          <Collapsible open={crmOpen} onOpenChange={setCrmOpen} className="border rounded-md">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <div className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  <span>Contact Management</span>
                </div>
                <span className="text-xs">{crmOpen ? '▼' : '▶'}</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/admin/crm/contacts')}
              >
                <Users className="mr-2 h-4 w-4" />
                All Contacts
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/admin/crm/leads')}
              >
                <Activity className="mr-2 h-4 w-4" />
                Lead Management
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/admin/form-submissions')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Form Submissions
              </Button>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Communications Section */}
          <Collapsible open={communicationsOpen} onOpenChange={setCommunicationsOpen} className="border rounded-md">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <div className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  <span>Communications</span>
                </div>
                <span className="text-xs">{communicationsOpen ? '▼' : '▶'}</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start relative"
                onClick={() => navigate('/admin/messages')}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat Messages
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/admin/email-templates')}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Templates
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/admin/sms-templates')}
              >
                <Send className="mr-2 h-4 w-4" />
                SMS Templates
              </Button>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Reviews Section */}
          <Collapsible open={reviewsOpen} onOpenChange={setReviewsOpen} className="border rounded-md">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <div className="flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  <span>Reviews</span>
                </div>
                <span className="text-xs">{reviewsOpen ? '▼' : '▶'}</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/admin/reviews')}
              >
                <Star className="mr-2 h-4 w-4" />
                All Reviews
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/admin/review-requests')}
              >
                <Send className="mr-2 h-4 w-4" />
                Review Requests
              </Button>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Schedule */}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate('/admin/calendar')}
          >
            <Calendar className="mr-2 h-5 w-5" />
            Schedule
          </Button>
          
          {/* Settings Section */}
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen} className="border rounded-md">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <div className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  <span>Settings</span>
                </div>
                <span className="text-xs">{settingsOpen ? '▼' : '▶'}</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/admin/automation')}
              >
                <Activity className="mr-2 h-4 w-4" />
                Automation
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/admin/account')}
              >
                <Users className="mr-2 h-4 w-4" />
                Account
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </nav>
        
        <Separator className="my-4" />
        
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="py-4 px-6">
            <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          </div>
        </header>
        
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;