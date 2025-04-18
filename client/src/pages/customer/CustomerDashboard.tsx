import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent,
  DialogTrigger
} from "@/components/ui/dialog";
import { Loader2, FileText, Image, Calendar, Clock, Eye, Download, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import CustomerLayout from "@/layouts/CustomerLayout";

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
  // Fetch customer projects
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/customer/projects"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/customer/projects");
      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }
      return res.json();
    }
  });
  
  return (
    <CustomerLayout>
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
    </CustomerLayout>
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
            <div className="space-y-6">
              {/* Project Stage Indicator */}
              <div>
                <h3 className="text-lg font-medium mb-3">Project Progress</h3>
                <div className="rounded-lg border p-4 bg-muted/20">
                  <ProgressStageIndicator status={project.status} />
                  <p className="text-sm text-muted-foreground mt-2">
                    {getStatusDescription(project.status)}
                  </p>
                </div>
              </div>
              
              {/* Timeline */}
              <div>
                <h3 className="text-lg font-medium">Timeline</h3>
                {project.progressUpdates && project.progressUpdates.length > 0 ? (
                  <div className="space-y-4 mt-4">
                    {project.progressUpdates.map((update, index) => (
                      <div key={index} className="relative pl-6 pb-6 border-l border-border">
                        <div className={`absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full ${getStatusColor(update.status)}`}></div>
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
                  <p className="text-muted-foreground mt-2">No progress updates available yet.</p>
                )}
              </div>
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
                <>
                  <div className="grid grid-cols-1 gap-4">
                    {project.documents.map((doc, index) => (
                      <DocumentCard key={index} document={doc} />
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                      Document Tips
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Documents may take a moment to load depending on your internet connection. 
                      If you encounter any issues accessing these files, please contact our office.
                    </p>
                  </div>
                </>
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

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-amber-500";
    case "in_progress":
      return "bg-blue-500";
    case "completed":
      return "bg-green-500";
    case "on_hold":
      return "bg-orange-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

function ProgressStageIndicator({ status }: { status: string }) {
  // Define the project stages
  const stages = [
    { id: "pending", label: "Planning" },
    { id: "in_progress", label: "In Progress" },
    { id: "completed", label: "Completed" }
  ];
  
  // Determine active stage
  let activeIndex = stages.findIndex(stage => stage.id === status.toLowerCase());
  if (activeIndex === -1) {
    // Handle special cases
    switch (status.toLowerCase()) {
      case "on_hold":
        activeIndex = 1; // Show in progress but with special color
        break;
      case "cancelled":
        activeIndex = 0; // Show at beginning but with special color
        break;
      default:
        activeIndex = 0;
    }
  }
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-1">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex flex-col items-center">
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              index <= activeIndex 
                ? getStatusColor(index === activeIndex ? status : 'completed')
                : 'bg-muted border-border'
            }`}>
              <span className={`text-xs font-bold ${
                index <= activeIndex ? 'text-white' : 'text-muted-foreground'
              }`}>
                {index + 1}
              </span>
            </div>
            <span className={`text-xs mt-1 ${
              index <= activeIndex ? 'font-medium' : 'text-muted-foreground'
            }`}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>
      
      <div className="w-full bg-muted rounded-full h-2.5 relative">
        <div 
          className={`h-2.5 rounded-full ${getStatusColor(status)}`}
          style={{ 
            width: status.toLowerCase() === 'completed' 
              ? '100%' 
              : status.toLowerCase() === 'in_progress' || status.toLowerCase() === 'on_hold'
                ? '50%' 
                : '15%'
          }}
        ></div>
      </div>
    </div>
  );
}

// Document Card Component with preview functionality
interface DocumentProps {
  name: string;
  url: string;
  type: string;
  uploadDate: string;
}

function DocumentCard({ document }: { document: DocumentProps }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isPdf = document.url.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(document.url);
  
  return (
    <>
      <div className="relative flex flex-col sm:flex-row items-start p-4 rounded-lg border bg-card hover:bg-accent/20 transition-colors">
        <div className="flex-shrink-0 mr-4 mb-3 sm:mb-0">
          {getDocumentIcon(document.type)}
        </div>
        
        <div className="flex-grow">
          <h4 className="font-medium">{document.name}</h4>
          <p className="text-xs text-muted-foreground">
            Added on {new Date(document.uploadDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground capitalize mt-1">
            {document.type}
          </p>
          
          <div className="flex mt-3 space-x-2">
            {(isPdf || isImage) && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center" 
                onClick={() => setIsPreviewOpen(true)}
              >
                <Eye className="mr-1 h-3 w-3" />
                Preview
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              asChild
            >
              <a 
                href={document.url} 
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-1 h-3 w-3" />
                Download
              </a>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center"
              asChild
            >
              <a 
                href={document.url} 
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                Open
              </a>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Document Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] p-0">
          <div className="p-4 border-b">
            <h3 className="font-medium">{document.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{document.type}</p>
          </div>
          <div className="relative w-full overflow-auto p-1" style={{ height: '70vh' }}>
            {isPdf ? (
              <iframe 
                src={`${document.url}#toolbar=0&navpanes=0`} 
                className="w-full h-full border-0" 
                title={document.name}
              />
            ) : isImage ? (
              <img 
                src={document.url} 
                alt={document.name} 
                className="max-w-full max-h-full object-contain mx-auto"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <FileText className="h-16 w-16 text-muted" />
                <p className="mt-4 text-center text-muted-foreground">
                  Preview not available for this file type.<br />
                  Please download or open the file to view it.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  asChild
                >
                  <a 
                    href={document.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open file
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getDocumentIcon(type: string) {
  switch (type.toLowerCase()) {
    case "invoice":
    case "estimate":
    case "contract":
    case "quote":
      return <FileText className="h-10 w-10 text-primary" />;
    case "image":
    case "photo":
      return <Image className="h-10 w-10 text-primary" />;
    default:
      return <FileText className="h-10 w-10 text-primary" />;
  }
}

