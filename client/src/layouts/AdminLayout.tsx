import { ReactNode, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  LayoutDashboard, 
  LogOut,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
  
  // If on login page, just render the children without the admin layout
  if (isOnLoginPage) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
        <div className="p-2 flex items-center justify-center mb-6">
          <h1 className="text-xl font-semibold text-primary">APS Admin</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate('/admin/dashboard')}
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Dashboard
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate('/admin/contacts')}
          >
            <Users className="mr-2 h-5 w-5" />
            Contacts
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate('/admin/messages')}
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Messages
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate('/admin/calendar')}
          >
            <Calendar className="mr-2 h-5 w-5" />
            Schedule
          </Button>
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