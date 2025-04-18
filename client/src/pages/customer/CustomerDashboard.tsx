import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Image, Calendar, Clock, LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Type definitions
interface Project {
  id: number;
  title: string;
  description?: string;
  status: string;
  startDate?: string;
  completionDate?: string;
  flooringType?: string;
  squareFootage?: string;
  location?: string;
  progressUpdates?: Array<{
    date: string;
    status: string;
    note: string;
    images?: string[];
  }>;
  documents?: Array<{
    name: string;
    url: string;
    type: string;
    uploadDate: string;
  }>;
}

export default function CustomerDashboard() {
  const { user, logout } = useCustomerAuth();
  const [, setLocation] = useLocation();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/customer/auth");
    }
  }, [user, setLocation]);
  
  // Fetch customer projects
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/customer/projects"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/customer/projects");
      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }
      return res.json();
    },
    enabled: !!user, // Only run if user is logged in
  });
  
  const handleLogout = async () => {
    await logout();
    setLocation("/customer/auth");
  };
  
  if (!user) {
    return null; // Don't render if not logged in
  }
  
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">Customer Portal</h1>
              <p className="text-muted-foreground">Welcome back, {user.name}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !projects || projects.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>No Projects Found</CardTitle>
              <CardDescription>
                You don't have any projects yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you're expecting to see your flooring project here, please contact our 
                team and we'll get it set up for you.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <a href="/">Return to Home Page</a>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Project card component
function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{project.title}</CardTitle>
            <CardDescription>
              {project.flooringType && (
                <span className="mr-2">{project.flooringType}</span>
              )}
              {project.squareFootage && (
                <span>{project.squareFootage} sq ft</span>
              )}
            </CardDescription>
          </div>
          <StatusBadge status={project.status} />
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress" className="mt-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Project Timeline</h3>
              {project.progressUpdates && project.progressUpdates.length > 0 ? (
                <div className="space-y-4 mt-4">
                  {project.progressUpdates.map((update, index) => (
                    <div key={index} className="relative pl-6 pb-6 border-l border-border">
                      <div className="absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-primary"></div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-medium">{new Date(update.date).toLocaleDateString()}</span>
                        <StatusBadge status={update.status} size="sm" />
                      </div>
                      <p className="text-muted-foreground">{update.note}</p>
                      {update.images && update.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {update.images.map((img, imgIndex) => (
                            <a 
                              href={img} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              key={imgIndex}
                              className="relative aspect-video block overflow-hidden rounded-md border"
                            >
                              <img 
                                src={img} 
                                alt={`Update ${index + 1} image ${imgIndex + 1}`} 
                                className="object-cover w-full h-full hover:scale-105 transition-transform"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No progress updates available yet.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="mt-6 space-y-6">
            <div className="space-y-4">
              {project.description && (
                <div>
                  <h3 className="text-lg font-medium">Project Description</h3>
                  <p className="mt-1 text-muted-foreground">{project.description}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium">Project Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Start Date</p>
                      <p className="text-muted-foreground">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not scheduled yet'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Estimated Completion</p>
                      <p className="text-muted-foreground">
                        {project.completionDate ? new Date(project.completionDate).toLocaleDateString() : 'To be determined'}
                      </p>
                    </div>
                  </div>
                  
                  {project.flooringType && (
                    <div className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
                      <div>
                        <p className="text-sm font-medium">Flooring Type</p>
                        <p className="text-muted-foreground">{project.flooringType}</p>
                      </div>
                    </div>
                  )}
                  
                  {project.location && (
                    <div className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-muted-foreground">{project.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Current Status</h3>
                <div className="mt-2 flex items-center">
                  <StatusBadge status={project.status} />
                  <span className="ml-2 text-muted-foreground">
                    {getStatusDescription(project.status)}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Project Documents</h3>
              {project.documents && project.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="mr-4">
                        {getDocumentIcon(doc.type)}
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize mt-1">
                          {doc.type}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No documents available yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper components and functions
function StatusBadge({ status, size = "default" }: { status: string, size?: "default" | "sm" }) {
  const getStatusProps = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { variant: "outline" as const, className: "border-amber-500 text-amber-500" };
      case "in_progress":
        return { variant: "outline" as const, className: "border-blue-500 text-blue-500" };
      case "completed":
        return { variant: "outline" as const, className: "border-green-500 text-green-500" };
      case "on_hold":
        return { variant: "outline" as const, className: "border-orange-500 text-orange-500" };
      case "cancelled":
        return { variant: "outline" as const, className: "border-red-500 text-red-500" };
      default:
        return { variant: "outline" as const, className: "border-gray-500 text-gray-500" };
    }
  };
  
  const { variant, className } = getStatusProps(status);
  
  return (
    <Badge variant={variant} className={`${className} ${size === "sm" ? "text-xs py-0" : ""}`}>
      {formatStatus(status)}
    </Badge>
  );
}

function formatStatus(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStatusDescription(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "Your project is in the planning phase";
    case "in_progress":
      return "Work is currently being done on your project";
    case "completed":
      return "Your project has been completed";
    case "on_hold":
      return "Your project is temporarily paused";
    case "cancelled":
      return "Your project has been cancelled";
    default:
      return "Status information not available";
  }
}

function getDocumentIcon(type: string) {
  switch (type.toLowerCase()) {
    case "invoice":
    case "estimate":
    case "contract":
    case "quote":
      return <FileText className="h-6 w-6 text-primary" />;
    case "image":
    case "photo":
      return <Image className="h-6 w-6 text-primary" />;
    default:
      return <FileText className="h-6 w-6 text-primary" />;
  }
}