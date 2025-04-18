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

// Simple Auth - Our new system
import SimpleAuthPage from "@/pages/simple-auth-page";
import { SimpleAuthProvider } from "@/hooks/use-simple-auth";
import SimpleProtectedRoute from "@/components/simple-protected-route";

// Don't import these components anymore as we're using SimpleAuth instead
// import AuthPage from "@/pages/auth-page";
// import { AuthProvider } from "@/hooks/use-auth";
// import { ProtectedRoute } from "@/lib/protected-route";

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
      
      {/* Simple Auth Routes */}
      <Route path="/admin/login" component={SimpleAuthPage} />
      <SimpleProtectedRoute path="/admin" component={DashboardPage} adminOnly={true} />
      <SimpleProtectedRoute path="/admin/dashboard" component={DashboardPage} adminOnly={true} />
      <SimpleProtectedRoute path="/admin/contacts" component={ContactsPage} adminOnly={true} />
      <SimpleProtectedRoute path="/admin/messages" component={MessagesPage} adminOnly={true} />
      <SimpleProtectedRoute path="/admin/calendar" component={CalendarPage} adminOnly={true} />
      <SimpleProtectedRoute path="/admin/calendar/new" component={CalendarPage} adminOnly={true} />
      
      {/* Simple Admin Routes - CRM */}
      <SimpleProtectedRoute path="/admin/crm/contacts" component={CRMContactsPage} adminOnly={true} />
      <SimpleProtectedRoute path="/admin/crm/leads" component={CRMContactsPage} adminOnly={true} />
      <SimpleProtectedRoute path="/admin/form-submissions" component={ContactsPage} adminOnly={true} />
      
      {/* Simple Admin Routes - Communications */}
      <SimpleProtectedRoute path="/admin/email-templates" component={EmailTemplatesPage} adminOnly={true} />
      <SimpleProtectedRoute path="/admin/sms-templates" component={SmsTemplatesPage} adminOnly={true} />
      
      {/* Simple Admin Routes - Settings */}
      <SimpleProtectedRoute path="/admin/automation" component={AutomationPage} adminOnly={true} />
      <SimpleProtectedRoute path="/admin/account" component={ContactsPage} adminOnly={true} />
      
      {/* Simple Admin Routes - Sales Workflow */}
      <SimpleProtectedRoute path="/admin/estimates" component={EstimatesPage} adminOnly={true} />
      <SimpleProtectedRoute path="/admin/contracts" component={ContractsPage} adminOnly={true} />
      <SimpleProtectedRoute path="/admin/invoices" component={InvoicesPage} adminOnly={true} />
      
      {/* Simple Admin Routes - Customer Portal */}
      <SimpleProtectedRoute path="/admin/customer-portal/projects" component={CustomerProjectsPage} adminOnly={true} />
      <SimpleProtectedRoute path="/admin/customer-portal/users" component={CustomerUsersPage} adminOnly={true} />
      
      {/* Customer Portal Routes - Keep existing for now */}
      <Route path="/customer/auth" component={CustomerAuth} />
      <ProtectedCustomerRoute path="/customer/dashboard" component={CustomerDashboard} />
      <ProtectedCustomerRoute path="/customer/estimates" component={CustomerEstimates} />
      <ProtectedCustomerRoute path="/customer/contracts" component={CustomerContracts} />
      <ProtectedCustomerRoute path="/customer/invoices" component={CustomerInvoices} />
      
      {/* Legacy Auth - Use SimpleAuthPage for now */}
      <Route path="/auth" component={SimpleAuthPage} />
      
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
        <SimpleAuthProvider>
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
        </SimpleAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
