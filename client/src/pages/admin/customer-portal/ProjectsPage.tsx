import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, MoreHorizontal, FileText, Image, UserPlus, PlusCircle, CalendarRange, Edit, Trash, ChevronDown } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";

// Types
interface CustomerUser {
  id: number;
  email: string;
  name: string;
  phone?: string;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface Project {
  id: number;
  customerId: number;
  contactId?: number;
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

// Form types
interface ProjectFormData {
  title: string;
  customerId?: number;
  contactId?: number;
  description?: string;
  status: string;
  startDate?: string;
  completionDate?: string;
  flooringType?: string;
  squareFootage?: string;
  location?: string;
}

interface ProgressUpdateFormData {
  note: string;
  status: string;
  date: string;
  images?: string[];
}

interface DocumentFormData {
  name: string;
  url: string;
  type: string;
  uploadDate?: string;
}

export default function CustomerProjectsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddingProgressUpdate, setIsAddingProgressUpdate] = useState(false);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  
  // Initial form state
  const initialProjectFormData: ProjectFormData = {
    title: "",
    status: "pending",
    description: "",
    customerId: undefined // Will be set when creating a project
  };
  
  const initialProgressUpdateFormData: ProgressUpdateFormData = {
    note: "",
    status: "in_progress",
    date: new Date().toISOString().split('T')[0],
    images: []
  };
  
  const initialDocumentFormData: DocumentFormData = {
    name: "",
    url: "",
    type: "contract"
  };
  
  // Form state
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>(initialProjectFormData);
  const [progressUpdateFormData, setProgressUpdateFormData] = useState<ProgressUpdateFormData>(initialProgressUpdateFormData);
  const [documentFormData, setDocumentFormData] = useState<DocumentFormData>(initialDocumentFormData);
  
  // Fetch projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/admin/customer-projects"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/customer-projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    }
  });
  
  // Fetch customer users
  const { data: customerUsers, isLoading: isLoadingCustomers } = useQuery<CustomerUser[]>({
    queryKey: ["/api/admin/customer-users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/customer-users");
      if (!res.ok) throw new Error("Failed to fetch customers");
      return res.json();
    }
  });
  
  // Fetch contacts
  const { data: contacts, isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: ["/api/admin/crm/contacts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/crm/contacts");
      if (!res.ok) throw new Error("Failed to fetch contacts");
      return res.json();
    }
  });
  
  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const res = await apiRequest("POST", "/api/admin/customer-projects", data);
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Project created",
        description: "The project has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-projects"] });
      setIsCreatingProject(false);
      setProjectFormData(initialProjectFormData);
    },
    onError: (error) => {
      toast({
        title: "Failed to create project",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProjectFormData> }) => {
      const res = await apiRequest("PUT", `/api/admin/customer-projects/${id}`, data);
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Project updated",
        description: "The project has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-projects"] });
      setSelectedProject(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update project",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Add progress update mutation
  const addProgressUpdateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProgressUpdateFormData }) => {
      const res = await apiRequest("POST", `/api/admin/customer-projects/${id}/progress`, data);
      if (!res.ok) throw new Error("Failed to add progress update");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Progress update added",
        description: "The progress update has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-projects"] });
      setIsAddingProgressUpdate(false);
      setProgressUpdateFormData(initialProgressUpdateFormData);
    },
    onError: (error) => {
      toast({
        title: "Failed to add progress update",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Add document mutation
  const addDocumentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DocumentFormData }) => {
      const res = await apiRequest("POST", `/api/admin/customer-projects/${id}/documents`, data);
      if (!res.ok) throw new Error("Failed to add document");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Document added",
        description: "The document has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-projects"] });
      setIsAddingDocument(false);
      setDocumentFormData(initialDocumentFormData);
    },
    onError: (error) => {
      toast({
        title: "Failed to add document",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Generate customer portal account mutation
  const generateAccountMutation = useMutation({
    mutationFn: async ({ contactId, project }: { contactId: number; project: Project }) => {
      const res = await apiRequest("POST", "/api/admin/generate-customer-account", { 
        contactId,
        projectId: project.id
      });
      if (!res.ok) throw new Error("Failed to generate account");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Customer account created",
        description: `Account created with email: ${data.email}. Temporary password has been set.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-users"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create customer account",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Handle create project
  const handleCreateProject = () => {
    // Validate required fields
    if (!projectFormData.title) {
      toast({
        title: "Validation error",
        description: "Project title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!projectFormData.customerId) {
      toast({
        title: "Validation error",
        description: "You must select a customer",
        variant: "destructive",
      });
      return;
    }
    
    createProjectMutation.mutate(projectFormData);
  };
  
  // Handle update project
  const handleUpdateProject = () => {
    if (!selectedProject) return;
    
    updateProjectMutation.mutate({
      id: selectedProject.id,
      data: projectFormData
    });
  };
  
  // Handle add progress update
  const handleAddProgressUpdate = () => {
    if (!selectedProject) return;
    
    addProgressUpdateMutation.mutate({
      id: selectedProject.id,
      data: progressUpdateFormData
    });
  };
  
  // Handle add document
  const handleAddDocument = () => {
    if (!selectedProject) return;
    
    addDocumentMutation.mutate({
      id: selectedProject.id,
      data: {
        ...documentFormData,
        uploadDate: new Date().toISOString()
      }
    });
  };
  
  // Handle generate customer account
  const handleGenerateAccount = (project: Project) => {
    if (!project.contactId) {
      toast({
        title: "Cannot create account",
        description: "This project needs to be linked to a contact first.",
        variant: "destructive",
      });
      return;
    }
    
    generateAccountMutation.mutate({
      contactId: project.contactId,
      project
    });
  };
  
  // Filter projects based on selected tab
  const filteredProjects = projects?.filter(project => {
    if (selectedTab === "all") return true;
    return project.status === selectedTab;
  });
  
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "on_hold":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  
  const formatStatus = (status: string): string => {
    return status
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  return (
    <AdminLayout title="Customer Projects">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage projects for customer portal users
            </p>
          </div>
          
          <Button onClick={() => setIsCreatingProject(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
        
        <Tabs 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="on_hold">On Hold</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoadingProjects ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProjects?.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <h3 className="text-lg font-medium">No projects found</h3>
                <p className="text-gray-500 mt-1">
                  Create a new project to get started
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsCreatingProject(true)}
                >
                  Create Project
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Flooring Type</TableHead>
                    <TableHead>Portal Access</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects?.map((project) => {
                    const customer = customerUsers?.find(u => u.id === project.customerId);
                    const contact = contacts?.find(c => c.id === project.contactId);
                    const hasPortalAccess = !!customer;
                    
                    return (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell>
                          {customer ? (
                            <div className="flex flex-col">
                              <span>{customer.name}</span>
                              <span className="text-xs text-gray-500">{customer.email}</span>
                            </div>
                          ) : contact ? (
                            <div className="flex flex-col">
                              <span>{contact.name}</span>
                              <span className="text-xs text-gray-500">{contact.email}</span>
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 h-auto justify-start text-xs mt-1"
                                onClick={() => handleGenerateAccount(project)}
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Generate portal access
                              </Button>
                            </div>
                          ) : (
                            "Not assigned"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeStyle(project.status)}>
                            {formatStatus(project.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set"}
                        </TableCell>
                        <TableCell>{project.flooringType || "Not specified"}</TableCell>
                        <TableCell>
                          {hasPortalAccess ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">
                              Not Created
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedProject(project);
                                  setProjectFormData({
                                    title: project.title,
                                    description: project.description || "",
                                    status: project.status,
                                    startDate: project.startDate,
                                    completionDate: project.completionDate,
                                    flooringType: project.flooringType,
                                    squareFootage: project.squareFootage,
                                    location: project.location,
                                    contactId: project.contactId,
                                    customerId: project.customerId,
                                  });
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Project
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedProject(project);
                                  setIsAddingProgressUpdate(true);
                                }}
                              >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Progress Update
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedProject(project);
                                  setIsAddingDocument(true);
                                }}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Add Document
                              </DropdownMenuItem>
                              {!hasPortalAccess && project.contactId && (
                                <DropdownMenuItem onClick={() => handleGenerateAccount(project)}>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Generate Portal Access
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Create/Edit Project Dialog */}
      <Dialog open={isCreatingProject || selectedProject !== null} onOpenChange={(open) => {
        if (!open) {
          setIsCreatingProject(false);
          setSelectedProject(null);
          setProjectFormData(initialProjectFormData);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreatingProject ? "Create New Project" : "Edit Project"}
            </DialogTitle>
            <DialogDescription>
              {isCreatingProject 
                ? "Create a new project for a customer" 
                : "Update the project details"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={projectFormData.title}
                  onChange={(e) => setProjectFormData({...projectFormData, title: e.target.value})}
                  placeholder="Kitchen Floor Renovation"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={projectFormData.status}
                  onValueChange={(value) => setProjectFormData({...projectFormData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="customer">Customer <span className="text-red-500">*</span></Label>
                <Button type="button" variant="link" className="text-xs h-5 p-0" onClick={() => {
                  // Create a customer user from the selected contact
                  if (projectFormData.contactId) {
                    const selectedContact = contacts?.find(c => c.id === projectFormData.contactId);
                    if (selectedContact && selectedContact.email) {
                      // Create customer from contact
                      const createCustomerFromContact = async () => {
                        try {
                          const res = await apiRequest("POST", "/api/admin/customer-users", {
                            name: selectedContact.name,
                            email: selectedContact.email,
                            password: Math.random().toString(36).slice(-8), // Random password
                            phone: selectedContact.phone || "",
                          });
                          if (!res.ok) throw new Error("Failed to create customer");
                          const newCustomer = await res.json();
                          // Refresh customer users list
                          queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-users"] });
                          // Set the created customer as selected
                          setProjectFormData({...projectFormData, customerId: newCustomer.id});
                          toast({
                            title: "Customer account created",
                            description: "A customer account was created from the selected contact."
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to create customer account. Please try again.",
                            variant: "destructive"
                          });
                        }
                      };
                      createCustomerFromContact();
                    } else {
                      toast({
                        title: "Cannot create customer",
                        description: "Selected contact must have an email address.",
                        variant: "destructive"
                      });
                    }
                  } else {
                    toast({
                      title: "Select a contact first",
                      description: "Please select an associated contact first",
                      variant: "destructive"
                    });
                  }
                }}>
                  Create from contact
                </Button>
              </div>
              <Select
                value={projectFormData.customerId?.toString() || ""}
                onValueChange={(value) => setProjectFormData({...projectFormData, customerId: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customerUsers?.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The customer who will have access to this project
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={projectFormData.description || ""}
                onChange={(e) => setProjectFormData({...projectFormData, description: e.target.value})}
                placeholder="Describe the project scope and details"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={projectFormData.startDate || ""}
                  onChange={(e) => setProjectFormData({...projectFormData, startDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="completionDate">Estimated Completion</Label>
                <Input
                  id="completionDate"
                  type="date"
                  value={projectFormData.completionDate || ""}
                  onChange={(e) => setProjectFormData({...projectFormData, completionDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flooringType">Flooring Type</Label>
                <Select
                  value={projectFormData.flooringType || ""}
                  onValueChange={(value) => setProjectFormData({...projectFormData, flooringType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select flooring type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardwood">Hardwood</SelectItem>
                    <SelectItem value="laminate">Laminate</SelectItem>
                    <SelectItem value="vinyl">Vinyl</SelectItem>
                    <SelectItem value="tile">Tile</SelectItem>
                    <SelectItem value="carpet">Carpet</SelectItem>
                    <SelectItem value="stone">Stone</SelectItem>
                    <SelectItem value="concrete">Concrete</SelectItem>
                    <SelectItem value="engineered_wood">Engineered Wood</SelectItem>
                    <SelectItem value="bamboo">Bamboo</SelectItem>
                    <SelectItem value="cork">Cork</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="squareFootage">Square Footage</Label>
                <Input
                  id="squareFootage"
                  value={projectFormData.squareFootage || ""}
                  onChange={(e) => setProjectFormData({...projectFormData, squareFootage: e.target.value})}
                  placeholder="500 sq ft"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={projectFormData.location || ""}
                onChange={(e) => setProjectFormData({...projectFormData, location: e.target.value})}
                placeholder="123 Main St, New Orleans, LA"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="contact">Associated Contact</Label>
                <div className="flex items-center text-xs text-muted-foreground">
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Select first, then create customer
                </div>
              </div>
              <Select
                value={projectFormData.contactId?.toString() || ""}
                onValueChange={(value) => setProjectFormData({
                  ...projectFormData, 
                  contactId: value === "none" ? undefined : parseInt(value)
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {contacts?.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id.toString()}>
                      {contact.name} ({contact.email || "No email"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select a contact from your CRM, then click "Create from contact" above
              </p>
            </div>
            

          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreatingProject(false);
                setSelectedProject(null);
                setProjectFormData(initialProjectFormData);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={isCreatingProject ? handleCreateProject : handleUpdateProject}
              disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
            >
              {(createProjectMutation.isPending || updateProjectMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isCreatingProject ? "Create Project" : "Update Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Progress Update Dialog */}
      <Dialog open={isAddingProgressUpdate} onOpenChange={(open) => {
        if (!open) {
          setIsAddingProgressUpdate(false);
          setProgressUpdateFormData(initialProgressUpdateFormData);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Progress Update</DialogTitle>
            <DialogDescription>
              Add a new progress update for {selectedProject?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="updateStatus">Status</Label>
              <Select
                value={progressUpdateFormData.status}
                onValueChange={(value) => setProgressUpdateFormData({...progressUpdateFormData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="updateDate">Date</Label>
              <Input
                id="updateDate"
                type="date"
                value={progressUpdateFormData.date}
                onChange={(e) => setProgressUpdateFormData({...progressUpdateFormData, date: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="updateNote">Update Notes</Label>
              <Textarea
                id="updateNote"
                value={progressUpdateFormData.note}
                onChange={(e) => setProgressUpdateFormData({...progressUpdateFormData, note: e.target.value})}
                placeholder="Describe the progress made"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="updateImages">Image URLs (one per line)</Label>
              <Textarea
                id="updateImages"
                value={progressUpdateFormData.images?.join('\n') || ""}
                onChange={(e) => setProgressUpdateFormData({
                  ...progressUpdateFormData, 
                  images: e.target.value.split('\n').filter(url => url.trim() !== "")
                })}
                placeholder="https://example.com/image1.jpg"
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Enter one image URL per line. These will be shown to the customer.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingProgressUpdate(false);
                setProgressUpdateFormData(initialProgressUpdateFormData);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddProgressUpdate}
              disabled={addProgressUpdateMutation.isPending}
            >
              {addProgressUpdateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Document Dialog */}
      <Dialog open={isAddingDocument} onOpenChange={(open) => {
        if (!open) {
          setIsAddingDocument(false);
          setDocumentFormData(initialDocumentFormData);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
            <DialogDescription>
              Add a new document for {selectedProject?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="documentName">Document Name</Label>
              <Input
                id="documentName"
                value={documentFormData.name}
                onChange={(e) => setDocumentFormData({...documentFormData, name: e.target.value})}
                placeholder="Contract Agreement"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select
                value={documentFormData.type}
                onValueChange={(value) => setDocumentFormData({...documentFormData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="estimate">Estimate</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentUrl">Document URL</Label>
              <Input
                id="documentUrl"
                value={documentFormData.url}
                onChange={(e) => setDocumentFormData({...documentFormData, url: e.target.value})}
                placeholder="https://example.com/document.pdf"
              />
              <p className="text-xs text-gray-500">
                Enter the URL where the document is hosted. This will be accessible to the customer.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingDocument(false);
                setDocumentFormData(initialDocumentFormData);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDocument}
              disabled={addDocumentMutation.isPending}
            >
              {addDocumentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}