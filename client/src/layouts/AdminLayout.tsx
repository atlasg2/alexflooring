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
  Database,
  Menu,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [, navigate] = useLocation();
  const [isOnLoginPage] = useRoute('/admin/login');
  
  // Get mobile detection
  const isMobileDetected = useIsMobile();
  
  // State for mobile navigation
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(isMobileDetected);
  
  // State for collapsible sections - some open by default on desktop
  const [crmOpen, setCrmOpen] = useState(!isMobileDetected);
  const [communicationsOpen, setCommunicationsOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Get unread message count
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Update mobile state when detection changes
  useEffect(() => {
    setIsMobile(isMobileDetected);
  }, [isMobileDetected]);
  
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
  
  // Fetch unread message count
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
  
  // If on login page, just render the children without the admin layout
  if (isOnLoginPage) {
    return <>{children}</>;
  }
  
  // Handle navigation item click (close mobile menu on navigation)
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileNavOpen(false);
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Mobile header */}
      {isMobile && (
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="py-3 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="p-1"
              >
                {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <h1 className="text-lg font-semibold text-primary">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-1 text-xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Website
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigation('/admin/messages')}
                  className="flex items-center gap-1 text-xs relative"
                >
                  <MessageSquare className="h-3 w-3" />
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                </Button>
              )}
            </div>
          </div>
        </header>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`${
          isMobile 
            ? `fixed inset-y-0 left-0 z-20 transform ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out w-[85%] max-w-[300px] bg-white shadow-xl`
            : 'w-72 bg-white shadow-md'
        } p-4 flex flex-col overflow-y-auto`}
      >
        {!isMobile && (
          <div className="p-2 flex items-center justify-center mb-6">
            <h1 className="text-xl font-semibold text-primary">APS Admin</h1>
          </div>
        )}
        
        <nav className="space-y-1 flex-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleNavigation('/admin/dashboard')}
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
                onClick={() => handleNavigation('/admin/crm/contacts')}
              >
                <Users className="mr-2 h-4 w-4" />
                All Contacts
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleNavigation('/admin/crm/leads')}
              >
                <Activity className="mr-2 h-4 w-4" />
                Lead Management
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleNavigation('/admin/form-submissions')}
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
                onClick={() => handleNavigation('/admin/messages')}
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
                onClick={() => handleNavigation('/admin/email-templates')}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Templates
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleNavigation('/admin/sms-templates')}
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
                onClick={() => handleNavigation('/admin/reviews')}
              >
                <Star className="mr-2 h-4 w-4" />
                All Reviews
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleNavigation('/admin/review-requests')}
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
            onClick={() => handleNavigation('/admin/calendar')}
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
                onClick={() => handleNavigation('/admin/automation')}
              >
                <Activity className="mr-2 h-4 w-4" />
                Automation
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleNavigation('/admin/account')}
              >
                <Users className="mr-2 h-4 w-4" />
                Account
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </nav>
        
        <Separator className="my-4" />
        
        <Button 
          variant="default" 
          className="w-full justify-start mb-3 bg-primary hover:bg-primary/90"
          onClick={() => window.location.href = '/'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          View Website
        </Button>
        
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
      <main className="flex-1 overflow-auto pt-0 md:pt-0">
        {/* Desktop header */}
        {!isMobile && (
          <header className="bg-white shadow-sm">
            <div className="py-4 px-6">
              <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            </div>
          </header>
        )}
        
        {/* Mobile overlay */}
        {isMobile && mobileNavOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10" 
            onClick={() => setMobileNavOpen(false)}
          />
        )}
        
        <div className={`${isMobile ? 'p-2 pb-20' : 'p-6'}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;