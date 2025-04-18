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
import { format } from "date-fns";
import AdminLayout from "@/layouts/AdminLayout";

// Status badge mapping
const getStatusBadge = (status) => {
  const statusMap = {
    "Estimate Requested": { variant: "outline", label: "Estimate Requested" },
    "Estimate Provided": { variant: "secondary", label: "Estimate Provided" },
    "Contract Signed": { variant: "default", label: "Contract Signed" },
    "Scheduling": { variant: "default", label: "Scheduling" },
    "In Progress": { variant: "warning", label: "In Progress" },
    "Inspection": { variant: "warning", label: "Inspection" },
    "Completed": { variant: "success", label: "Completed" },
    "Follow-up": { variant: "secondary", label: "Follow-up" },
  };

  return statusMap[status] || { variant: "outline", label: status || "Unknown" };
};

export default function CustomerProjectsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    title: "",
    customerId: null,
    contactId: null,
    description: "",
    status: "Estimate Requested",
    startDate: "",
    completionDate: "",
    flooringType: "",
    squareFootage: "",
    location: "",
  });
  
  // Additional state for customer portal account creation during project creation
  const [createPortalAccount, setCreatePortalAccount] = useState(true);
  const [portalCredentials, setPortalCredentials] = useState({
    username: "",
    password: "",
    sendEmail: true
  });
  
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [showCreateCustomerForm, setShowCreateCustomerForm] = useState(false);
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  
  const [isAddingProgressUpdate, setIsAddingProgressUpdate] = useState(false);
  const [progressUpdateFormData, setProgressUpdateFormData] = useState({
    status: "",
    note: "",
    date: format(new Date(), "yyyy-MM-dd"),
    images: [],
  });
  
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [documentFormData, setDocumentFormData] = useState({
    name: "",
    url: "",
    type: "Contract",
  });
  
  // Initial states
  const initialProjectFormData = {
    title: "",
    customerId: null,
    contactId: null,
    description: "",
    status: "Estimate Requested",
    startDate: "",
    completionDate: "",
    flooringType: "",
    squareFootage: "",
    location: "",
  };
  
  const initialProgressUpdateFormData = {
    status: "",
    note: "",
    date: format(new Date(), "yyyy-MM-dd"),
    images: [],
  };
  
  const initialDocumentFormData = {
    name: "",
    url: "",
    type: "Contract",
  };
  
  // Queries
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/admin/customer-projects"],
    refetchOnWindowFocus: false,
  });
  
  // Query CRM contacts instead of contact submissions
  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/admin/crm/contacts"],
    refetchOnWindowFocus: false,
  });
  
  const { data: customerUsers, isLoading: customerUsersLoading } = useQuery({
    queryKey: ["/api/admin/customer-users"],
    refetchOnWindowFocus: false,
  });
  
  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/admin/customer-projects", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-projects"] });
      setIsCreatingProject(false);
      setProjectFormData(initialProjectFormData);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });
  
  const addProgressUpdateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await apiRequest(
        "POST", 
        `/api/admin/customer-projects/${id}/progress`, 
        data
      );
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-projects"] });
      setSelectedProject(data);
      setIsAddingProgressUpdate(false);
      setProgressUpdateFormData(initialProgressUpdateFormData);
      toast({
        title: "Success",
        description: "Progress update added successfully",
      });
    },
    onError: (error) => {
      console.error("Error adding progress update:", error);
      toast({
        title: "Error",
        description: "Failed to add progress update",
        variant: "destructive",
      });
    },
  });
  
  const addDocumentMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await apiRequest(
        "POST", 
        `/api/admin/customer-projects/${id}/documents`, 
        data
      );
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-projects"] });
      setSelectedProject(data);
      setIsAddingDocument(false);
      setDocumentFormData(initialDocumentFormData);
      toast({
        title: "Success",
        description: "Document added successfully",
      });
    },
    onError: (error) => {
      console.error("Error adding document:", error);
      toast({
        title: "Error",
        description: "Failed to add document",
        variant: "destructive",
      });
    },
  });
  
  const createCustomerAccountMutation = useMutation({
    mutationFn: async ({ contactId, project }) => {
      const res = await apiRequest(
        "POST", 
        "/api/admin/customer-users/create-from-contact", 
        { 
          contactId,
          projectId: project.id
        }
      );
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-users"] });
      toast({
        title: "Success",
        description: `Customer account created for ${data.name}`,
      });
    },
    onError: (error) => {
      console.error("Error creating customer account:", error);
      toast({
        title: "Error",
        description: "Failed to create customer account",
        variant: "destructive",
      });
    },
  });
  
  // Handlers
  const handleCreateProject = async () => {
    try {
      // Validate
      if (!projectFormData.title) {
        toast({
          title: "Validation Error",
          description: "Project title is required",
          variant: "destructive",
        });
        return;
      }
      
      // Submit
      const data = { ...projectFormData };
      
      // Remove empty values
      Object.keys(data).forEach(key => {
        if (data[key] === "" || data[key] === null) {
          delete data[key];
        }
      });
      
      createProjectMutation.mutate(data);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };
  
  const handleAddProgressUpdate = () => {
    if (!progressUpdateFormData.status || !progressUpdateFormData.note) {
      toast({
        title: "Validation Error",
        description: "Status and note are required",
        variant: "destructive",
      });
      return;
    }
    
    addProgressUpdateMutation.mutate({
      id: selectedProject.id,
      data: progressUpdateFormData
    });
  };
  
  const handleAddDocument = () => {
    if (!documentFormData.name || !documentFormData.url || !documentFormData.type) {
      toast({
        title: "Validation Error",
        description: "Name, URL, and type are required",
        variant: "destructive",
      });
      return;
    }
    
    addDocumentMutation.mutate({
      id: selectedProject.id,
      data: documentFormData
    });
  };
  
  // Helper to generate customer accounts
  const handleGenerateAccount = (project) => {
    if (!project.contactId) {
      toast({
        title: "Error",
        description: "This project doesn't have a contact assigned",
        variant: "destructive",
      });
      return;
    }
    
    createCustomerAccountMutation.mutate({
      contactId: project.contactId,
      project
    });
  };
  
  // Helper to find contact by ID
  const getContactName = (contactId) => {
    if (!contacts) return "Loading...";
    const contact = contacts.find(c => c.id === contactId);
    return contact ? contact.name : "Unknown";
  };
  
  // Function to generate a random password
  const generateRandomPassword = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  
  // Helper to update location when contact changes and generate portal credentials
  const updateLocationFromContact = (contactId) => {
    if (!contactId || !contacts) return;
    
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      // Update location if available
      const newLocation = contact.address || "";
      
      setProjectFormData({
        ...projectFormData,
        contactId,
        location: newLocation
      });
      
      // Generate portal credentials based on contact info
      if (contact.email) {
        const emailPrefix = contact.email.split('@')[0];
        const generatedPassword = generateRandomPassword();
        
        setPortalCredentials({
          ...portalCredentials,
          username: emailPrefix,
          password: generatedPassword
        });
      }
    } else {
      setProjectFormData({
        ...projectFormData,
        contactId
      });
    }
  };

  return (
    <AdminLayout title="Customer Projects">
      {/* Project List */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Projects</h2>
          <Button onClick={() => setIsCreatingProject(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
        
        {projectsLoading ? (
          <div className="flex justify-center my-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Flooring Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>
                      {project.contactId ? getContactName(project.contactId) : "None"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(project.status).variant}>
                        {getStatusBadge(project.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell>{project.location || "Not specified"}</TableCell>
                    <TableCell>{project.flooringType || "Not specified"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedProject(project)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProject(project);
                                setActiveTab("progress");
                                setIsAddingProgressUpdate(true);
                              }}
                            >
                              Add Progress Update
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProject(project);
                                setActiveTab("documents");
                                setIsAddingDocument(true);
                              }}
                            >
                              Add Document
                            </DropdownMenuItem>
                            {project.contactId && !project.customerId && (
                              <DropdownMenuItem
                                onClick={() => handleGenerateAccount(project)}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Create Customer Account
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">No projects found</p>
              <Button onClick={() => setIsCreatingProject(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create First Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Create Project Dialog */}
      <Dialog open={isCreatingProject} onOpenChange={setIsCreatingProject}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project with customer and project details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={projectFormData.title}
                  onChange={(e) => setProjectFormData({
                    ...projectFormData,
                    title: e.target.value
                  })}
                  placeholder="Kitchen Flooring Project"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={projectFormData.status}
                  onValueChange={(value) => setProjectFormData({
                    ...projectFormData,
                    status: value
                  })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Estimate Requested">Estimate Requested</SelectItem>
                    <SelectItem value="Estimate Provided">Estimate Provided</SelectItem>
                    <SelectItem value="Contract Signed">Contract Signed</SelectItem>
                    <SelectItem value="Scheduling">Scheduling</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Inspection">Inspection</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="contact">Contact</Label>
              </div>
              <Select
                value={projectFormData.contactId?.toString() || ""}
                onValueChange={(value) => updateLocationFromContact(parseInt(value))}
              >
                <SelectTrigger id="contact">
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts?.map((contact) => (
                    <SelectItem
                      key={contact.id}
                      value={contact.id.toString()}
                    >
                      {contact.name} {contact.email ? `(${contact.email})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the contact associated with this project.
              </p>
            </div>
            
            {/* Customer section removed as requested */}
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={projectFormData.description}
                onChange={(e) => setProjectFormData({
                  ...projectFormData,
                  description: e.target.value
                })}
                placeholder="Project details and scope of work"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flooringType">Flooring Type</Label>
                <Input
                  id="flooringType"
                  value={projectFormData.flooringType}
                  onChange={(e) => setProjectFormData({
                    ...projectFormData,
                    flooringType: e.target.value
                  })}
                  placeholder="e.g. Hardwood, Tile, Vinyl, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="squareFootage">Square Footage</Label>
                <Input
                  id="squareFootage"
                  value={projectFormData.squareFootage}
                  onChange={(e) => setProjectFormData({
                    ...projectFormData,
                    squareFootage: e.target.value
                  })}
                  placeholder="e.g. 500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={projectFormData.location}
                onChange={(e) => setProjectFormData({
                  ...projectFormData,
                  location: e.target.value
                })}
                placeholder="Project location or address"
              />
              <p className="text-xs text-muted-foreground">
                This will be auto-filled when you select a contact with an address.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={projectFormData.startDate}
                  onChange={(e) => setProjectFormData({
                    ...projectFormData,
                    startDate: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completionDate">Expected Completion</Label>
                <Input
                  id="completionDate"
                  type="date"
                  value={projectFormData.completionDate}
                  onChange={(e) => setProjectFormData({
                    ...projectFormData,
                    completionDate: e.target.value
                  })}
                />
              </div>
            </div>
            
            {/* Customer Portal Account Section */}
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Customer Portal Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Set up portal access for this customer
                  </p>
                </div>
                <Switch
                  checked={createPortalAccount}
                  onCheckedChange={setCreatePortalAccount}
                  id="create-portal-account"
                />
              </div>
              
              {createPortalAccount && projectFormData.contactId && (
                <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="portal-username">Username</Label>
                      <Input
                        id="portal-username"
                        value={portalCredentials.username}
                        onChange={(e) => setPortalCredentials({
                          ...portalCredentials,
                          username: e.target.value
                        })}
                        placeholder="Customer username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="portal-password">Password</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="portal-password"
                          value={portalCredentials.password}
                          onChange={(e) => setPortalCredentials({
                            ...portalCredentials,
                            password: e.target.value
                          })}
                          placeholder="Customer password"
                          type="text"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => setPortalCredentials({
                            ...portalCredentials,
                            password: generateRandomPassword()
                          })}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="send-credentials" 
                      checked={portalCredentials.sendEmail}
                      onCheckedChange={(checked) => setPortalCredentials({
                        ...portalCredentials,
                        sendEmail: checked === true
                      })}
                    />
                    <label
                      htmlFor="send-credentials"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Send login credentials via email
                    </label>
                  </div>
                  
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Account Creation</AlertTitle>
                    <AlertDescription>
                      The customer will receive access to view project status, documents, and updates.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreatingProject(false);
                setProjectFormData(initialProjectFormData);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={createProjectMutation.isPending}
            >
              {createProjectMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Project Detail Dialog */}
      <Dialog
        open={!!selectedProject}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProject.title}</DialogTitle>
                <DialogDescription>
                  {selectedProject.contactId ? (
                    <span>Contact: {getContactName(selectedProject.contactId)}</span>
                  ) : (
                    "No contact assigned"
                  )}
                  <Badge variant={getStatusBadge(selectedProject.status).variant} className="ml-2">
                    {getStatusBadge(selectedProject.status).label}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="progress">Progress Updates</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedProject.description || "No description provided"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Location</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedProject.location || "No location specified"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <h4 className="font-medium mb-2">Flooring Type</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedProject.flooringType || "Not specified"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Square Footage</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedProject.squareFootage || "Not specified"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Timeline</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedProject.startDate ? (
                          <>
                            Start: {format(new Date(selectedProject.startDate), "MMM d, yyyy")}
                            {selectedProject.completionDate && (
                              <>
                                <br />
                                Expected Completion: {format(new Date(selectedProject.completionDate), "MMM d, yyyy")}
                              </>
                            )}
                          </>
                        ) : (
                          "Timeline not set"
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {selectedProject.contactId && !selectedProject.customerId && (
                    <div className="mt-6 p-4 bg-muted rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Customer Portal Access</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            This project doesn't have a customer account yet.
                            Create one to enable customer portal access.
                          </p>
                        </div>
                        <Button onClick={() => handleGenerateAccount(selectedProject)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Customer Account
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="progress" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Progress Updates</h3>
                    <Button onClick={() => setIsAddingProgressUpdate(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Update
                    </Button>
                  </div>
                  
                  {selectedProject.progressUpdates?.length > 0 ? (
                    <div className="space-y-4">
                      {selectedProject.progressUpdates.map((update, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <Badge variant={getStatusBadge(update.status).variant}>
                                  {getStatusBadge(update.status).label}
                                </Badge>
                                <CardTitle className="text-sm mt-2">
                                  {update.date ? (
                                    format(new Date(update.date), "MMMM d, yyyy")
                                  ) : (
                                    "Date not specified"
                                  )}
                                </CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{update.note}</p>
                            
                            {update.images && update.images.length > 0 && (
                              <div className="grid grid-cols-3 gap-2 mt-4">
                                {update.images.map((image, imgIndex) => (
                                  <img
                                    key={imgIndex}
                                    src={image}
                                    alt={`Progress update ${index + 1} image ${imgIndex + 1}`}
                                    className="rounded-md object-cover w-full h-24"
                                  />
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No progress updates yet</p>
                    </div>
                  )}
                  
                  {/* Add Progress Update Form */}
                  {isAddingProgressUpdate && (
                    <div className="mt-6 border rounded-md p-4">
                      <h3 className="font-medium mb-4">Add Progress Update</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="update-status">Status</Label>
                          <Select
                            value={progressUpdateFormData.status}
                            onValueChange={(value) => setProgressUpdateFormData({
                              ...progressUpdateFormData,
                              status: value
                            })}
                          >
                            <SelectTrigger id="update-status">
                              <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Estimate Requested">Estimate Requested</SelectItem>
                              <SelectItem value="Estimate Provided">Estimate Provided</SelectItem>
                              <SelectItem value="Contract Signed">Contract Signed</SelectItem>
                              <SelectItem value="Scheduling">Scheduling</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Inspection">Inspection</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Follow-up">Follow-up</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="update-date">Date</Label>
                          <Input
                            id="update-date"
                            type="date"
                            value={progressUpdateFormData.date}
                            onChange={(e) => setProgressUpdateFormData({
                              ...progressUpdateFormData,
                              date: e.target.value
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="update-note">Note</Label>
                          <Textarea
                            id="update-note"
                            value={progressUpdateFormData.note}
                            onChange={(e) => setProgressUpdateFormData({
                              ...progressUpdateFormData,
                              note: e.target.value
                            })}
                            placeholder="Describe the progress or status update"
                            className="min-h-[100px]"
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-2">
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
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Project Documents</h3>
                    <Button onClick={() => setIsAddingDocument(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Document
                    </Button>
                  </div>
                  
                  {selectedProject.documents?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedProject.documents.map((doc, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <Badge variant="outline">{doc.type}</Badge>
                                <CardTitle className="text-sm mt-2">
                                  {doc.name}
                                </CardTitle>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                              >
                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              Uploaded on {doc.uploadDate ? (
                                format(new Date(doc.uploadDate), "MMMM d, yyyy")
                              ) : (
                                "Unknown date"
                              )}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No documents yet</p>
                    </div>
                  )}
                  
                  {/* Add Document Form */}
                  {isAddingDocument && (
                    <div className="mt-6 border rounded-md p-4">
                      <h3 className="font-medium mb-4">Add Document</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="doc-name">Document Name</Label>
                          <Input
                            id="doc-name"
                            value={documentFormData.name}
                            onChange={(e) => setDocumentFormData({
                              ...documentFormData,
                              name: e.target.value
                            })}
                            placeholder="e.g. Contract Agreement"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="doc-type">Document Type</Label>
                          <Select
                            value={documentFormData.type}
                            onValueChange={(value) => setDocumentFormData({
                              ...documentFormData,
                              type: value
                            })}
                          >
                            <SelectTrigger id="doc-type">
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Estimate">Estimate</SelectItem>
                              <SelectItem value="Invoice">Invoice</SelectItem>
                              <SelectItem value="Photo">Photo</SelectItem>
                              <SelectItem value="Receipt">Receipt</SelectItem>
                              <SelectItem value="Warranty">Warranty</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="doc-url">Document URL</Label>
                          <Input
                            id="doc-url"
                            value={documentFormData.url}
                            onChange={(e) => setDocumentFormData({
                              ...documentFormData,
                              url: e.target.value
                            })}
                            placeholder="https://example.com/docs/contract.pdf"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter the URL where the document is hosted. This will be accessible to the customer.
                          </p>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
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
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
