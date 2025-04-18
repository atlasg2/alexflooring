import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import ServicePage from "@/pages/ServicePage";
import Projects from "@/pages/Projects";
import LocationPage from "@/pages/LocationPage";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";

// Admin pages - Core
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import ContactsPage from "@/pages/admin/ContactsPage";
import MessagesPage from "@/pages/admin/MessagesPage";
import CalendarPage from "@/pages/admin/CalendarPage";

// Admin pages - CRM
import CRMContactsPage from "@/pages/admin/crm/ContactsPage";

// Admin pages - Communications
import EmailTemplatesPage from "@/pages/admin/EmailTemplatesPage";
import SmsTemplatesPage from "@/pages/admin/SmsTemplatesPage";

// Admin pages - Settings
import AutomationPage from "@/pages/admin/AutomationPage";

// Customer Portal
import CustomerAuth from "@/pages/customer/CustomerAuth";
import CustomerDashboard from "@/pages/customer/CustomerDashboard";
import { CustomerAuthProvider } from "@/hooks/use-customer-auth";
import { ProtectedCustomerRoute } from "@/components/customer/ProtectedCustomerRoute";

// Chat widget
import ChatWidget from "@/components/chat/ChatWidget";

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  const isCustomerRoute = location.startsWith('/customer');
  
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/services/:slug" component={ServicePage} />
      <Route path="/projects" component={Projects} />
      <Route path="/baton-rouge" component={() => <LocationPage city="baton-rouge" />} />
      <Route path="/new-orleans" component={() => <LocationPage city="new-orleans" />} />
      <Route path="/contact" component={Contact} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      
      {/* Customer Portal Routes */}
      <Route path="/customer/auth" component={CustomerAuth} />
      <ProtectedCustomerRoute path="/customer/dashboard" component={CustomerDashboard} />
      
      {/* Admin Routes - Core */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin" component={DashboardPage} /> {/* Default route for /admin redirects to dashboard */}
      <Route path="/admin/dashboard" component={DashboardPage} />
      <Route path="/admin/contacts" component={ContactsPage} />
      <Route path="/admin/messages" component={MessagesPage} />
      <Route path="/admin/calendar" component={CalendarPage} />
      <Route path="/admin/calendar/new" component={CalendarPage} />
      
      {/* Admin Routes - CRM */}
      <Route path="/admin/crm/contacts" component={CRMContactsPage} />
      <Route path="/admin/crm/leads" component={CRMContactsPage} />
      <Route path="/admin/form-submissions" component={ContactsPage} />
      
      {/* Admin Routes - Communications */}
      <Route path="/admin/email-templates" component={EmailTemplatesPage} />
      <Route path="/admin/sms-templates" component={SmsTemplatesPage} />
      
      {/* Admin Routes - Settings */}
      <Route path="/admin/automation" component={AutomationPage} />
      <Route path="/admin/account" component={ContactsPage} />
      
      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  const isCustomerRoute = location.startsWith('/customer');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CustomerAuthProvider>
          {isAdminRoute ? (
            // Admin routes don't use MainLayout
            <Router />
          ) : isCustomerRoute ? (
            // Customer routes don't use MainLayout
            <Router />
          ) : (
            // Public routes use MainLayout
            <MainLayout>
              <Router />
            </MainLayout>
          )}
          
          {/* Only show chat widget on public routes that are not customer routes */}
          {!isAdminRoute && !isCustomerRoute && <ChatWidget />}
          
          <Toaster />
        </CustomerAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
