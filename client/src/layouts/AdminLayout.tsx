import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutGrid, 
  Users, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Settings, 
  Bell, 
  Menu, 
  X,
  LogOut,
  Folder,
  User,
  Mail
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string; // Optional page title
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get unread message count for notification badge
  const { data: unreadCount } = useQuery({
    queryKey: ["/api/admin/chat/unread-count"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/chat/unread-count");
      if (!res.ok) return { count: "0" };
      const data = await res.json();
      return data;
    },
    initialData: { count: "0" }
  });
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      navigate("/admin/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    }
  };
  
  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  const sidebarLinks = [
    { 
      title: "Dashboard", 
      icon: <LayoutGrid className="h-5 w-5 mr-3" />, 
      href: "/admin/dashboard",
      active: location === "/admin" || location === "/admin/dashboard"
    },
    { 
      title: "Contacts", 
      icon: <Users className="h-5 w-5 mr-3" />, 
      href: "/admin/crm/contacts",
      active: location.includes("/admin/crm/contacts") || location.includes("/admin/crm/leads")
    },
    { 
      title: "Messages", 
      icon: <MessageSquare className="h-5 w-5 mr-3" />, 
      href: "/admin/messages",
      active: location.includes("/admin/messages"),
      badge: unreadCount && parseInt(unreadCount.count) > 0 ? parseInt(unreadCount.count) : null
    },
    { 
      title: "Calendar", 
      icon: <Calendar className="h-5 w-5 mr-3" />, 
      href: "/admin/calendar",
      active: location.includes("/admin/calendar")
    },
    { 
      title: "Form Submissions", 
      icon: <FileText className="h-5 w-5 mr-3" />, 
      href: "/admin/form-submissions",
      active: location.includes("/admin/form-submissions")
    },
    {
      title: "Templates",
      icon: <Mail className="h-5 w-5 mr-3" />,
      href: "/admin/email-templates",
      active: location.includes("/admin/email-templates") || location.includes("/admin/sms-templates")
    },
    {
      title: "Customer Portal",
      icon: <Folder className="h-5 w-5 mr-3" />,
      href: "/admin/customer-portal/projects",
      active: location.includes("/admin/customer-portal"),
      submenu: [
        {
          title: "Projects",
          href: "/admin/customer-portal/projects",
          active: location.includes("/admin/customer-portal/projects")
        },
        {
          title: "Users",
          href: "/admin/customer-portal/users",
          active: location.includes("/admin/customer-portal/users")
        }
      ]
    },
    { 
      title: "Settings", 
      icon: <Settings className="h-5 w-5 mr-3" />, 
      href: "/admin/automation",
      active: location === "/admin/automation" || location === "/admin/account"
    }
  ];
  
  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/admin" className="flex items-center">
                  <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                  <span className="ml-2 text-xl font-bold text-gray-900">Admin</span>
                </Link>
              </div>
            </div>
            
            <div className="hidden md:flex md:items-center md:space-x-4">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatar.png" alt="Admin" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">Admin</p>
                      <p className="text-sm text-muted-foreground">admin@example.com</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/account" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="hidden md:block">
                <Button variant="ghost" size="icon" className="ml-4" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
            </div>
            
            <div className="flex md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="inline-flex items-center justify-center rounded-md p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="space-y-1 px-2 pb-3 pt-2">
            {sidebarLinks.map((link) => (
              <div key={link.href}>
                <Link 
                  href={link.href}
                  className={`${
                    link.active 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } block rounded-md px-3 py-2 text-base font-medium`}
                >
                  <div className="flex items-center">
                    {link.icon}
                    {link.title}
                    {link.badge && (
                      <span className="ml-auto inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        {link.badge}
                      </span>
                    )}
                  </div>
                </Link>
                
                {link.submenu && link.active && (
                  <div className="ml-8 space-y-1 mt-1">
                    {link.submenu.map(sublink => (
                      <Link
                        key={sublink.href}
                        href={sublink.href}
                        className={`${
                          sublink.active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } block rounded-md px-3 py-2 text-sm`}
                      >
                        {sublink.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <div 
              className="text-red-600 block rounded-md px-3 py-2 text-base font-medium cursor-pointer"
              onClick={handleLogout}
            >
              <div className="flex items-center">
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5 pb-4 overflow-y-auto">
              <div className="flex-grow flex flex-col">
                <nav className="flex-1 space-y-1 px-2">
                  {sidebarLinks.map((link) => (
                    <div key={link.href}>
                      <Link
                        href={link.href}
                        className={`${
                          link.active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                      >
                        {link.icon}
                        {link.title}
                        {link.badge && (
                          <span className="ml-auto inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                      
                      {link.submenu && link.active && (
                        <div className="ml-8 space-y-1 mt-1">
                          {link.submenu.map(sublink => (
                            <Link
                              key={sublink.href}
                              href={sublink.href}
                              className={`${
                                sublink.active
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                            >
                              {sublink.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            {title && (
              <div className="py-6 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}