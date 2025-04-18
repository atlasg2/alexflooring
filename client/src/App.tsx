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

// Auth pages
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Admin pages - Core
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import ContactsPage from "@/pages/admin/ContactsPage";
import MessagesPage from "@/pages/admin/MessagesPage";
import CalendarPage from "@/pages/admin/CalendarPage";

// Admin pages - Sales Workflow
import EstimatesPage from "@/pages/admin/EstimatesPage";
import ContractsPage from "@/pages/admin/ContractsPage";
import InvoicesPage from "@/pages/admin/InvoicesPage";

// Admin pages - CRM
import CRMContactsPage from "@/pages/admin/crm/ContactsPage";

// Admin pages - Communications
import EmailTemplatesPage from "@/pages/admin/EmailTemplatesPage";
import SmsTemplatesPage from "@/pages/admin/SmsTemplatesPage";

// Admin pages - Settings
import AutomationPage from "@/pages/admin/AutomationPage";

// Admin pages - Customer Portal
import CustomerProjectsPage from "@/pages/admin/customer-portal/ProjectsPage";
import CustomerUsersPage from "@/pages/admin/customer-portal/UsersPage";

// Customer Portal
import CustomerAuth from "@/pages/customer/CustomerAuth";
import CustomerDashboard from "@/pages/customer/CustomerDashboard";
import CustomerEstimates from "@/pages/customer/CustomerEstimates";
import CustomerContracts from "@/pages/customer/CustomerContracts";
import CustomerInvoices from "@/pages/customer/CustomerInvoices";
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
      
      {/* Auth Routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Customer Portal Routes */}
      <Route path="/customer/auth" component={CustomerAuth} />
      <ProtectedCustomerRoute path="/customer/dashboard" component={CustomerDashboard} />
      <ProtectedCustomerRoute path="/customer/estimates" component={CustomerEstimates} />
      <ProtectedCustomerRoute path="/customer/contracts" component={CustomerContracts} />
      <ProtectedCustomerRoute path="/customer/invoices" component={CustomerInvoices} />
      
      {/* Admin Routes - Core */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <ProtectedRoute path="/admin" component={DashboardPage} /> {/* Default route for /admin redirects to dashboard */}
      <ProtectedRoute path="/admin/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/admin/contacts" component={ContactsPage} />
      <ProtectedRoute path="/admin/messages" component={MessagesPage} />
      <ProtectedRoute path="/admin/calendar" component={CalendarPage} />
      <ProtectedRoute path="/admin/calendar/new" component={CalendarPage} />
      
      {/* Admin Routes - CRM */}
      <ProtectedRoute path="/admin/crm/contacts" component={CRMContactsPage} />
      <ProtectedRoute path="/admin/crm/leads" component={CRMContactsPage} />
      <ProtectedRoute path="/admin/form-submissions" component={ContactsPage} />
      
      {/* Admin Routes - Communications */}
      <ProtectedRoute path="/admin/email-templates" component={EmailTemplatesPage} />
      <ProtectedRoute path="/admin/sms-templates" component={SmsTemplatesPage} />
      
      {/* Admin Routes - Settings */}
      <ProtectedRoute path="/admin/automation" component={AutomationPage} />
      <ProtectedRoute path="/admin/account" component={ContactsPage} />
      
      {/* Admin Routes - Sales Workflow */}
      <ProtectedRoute path="/admin/estimates" component={EstimatesPage} />
      <ProtectedRoute path="/admin/contracts" component={ContractsPage} />
      <ProtectedRoute path="/admin/invoices" component={InvoicesPage} />
      
      {/* Admin Routes - Customer Portal */}
      <ProtectedRoute path="/admin/customer-portal/projects" component={CustomerProjectsPage} />
      <ProtectedRoute path="/admin/customer-portal/users" component={CustomerUsersPage} />
      
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
        <AuthProvider>
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
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
