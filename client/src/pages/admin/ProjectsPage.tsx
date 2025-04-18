import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/layouts/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Folder, FileText, ListFilter, Search } from "lucide-react";

// Function to format date as MM/DD/YYYY
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US");
};

// Status badge color mapping
const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  completed: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  on_hold: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  cancelled: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

// Project creation form type
type ProjectFormData = {
  title: string;
  description: string;
  status: string;
  flooringType: string;
  squareFootage: string;
  location: string;
  contactId?: number | null;
  startDate?: string;
};

export default function ProjectsPage() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [newProject, setNewProject] = useState<ProjectFormData>({
    title: "",
    description: "",
    status: "pending",
    flooringType: "",
    squareFootage: "",
    location: "",
    startDate: new Date().toISOString().split("T")[0], // Today's date as default
  });

  // Fetch all projects
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["/api/admin/projects"],
    retry: 1,
  });

  // Fetch all contacts for the contact selection dropdown
  const { data: contacts } = useQuery({
    queryKey: ["/api/admin/crm/contacts"],
    retry: 1,
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  // Handle contact selection change
  const handleContactChange = (value: string) => {
    setNewProject(prev => ({ 
      ...prev, 
      contactId: value ? parseInt(value) : null 
    }));
  };

  // Create new project
  const handleCreateProject = async () => {
    try {
      const response = await apiRequest("POST", "/api/admin/projects", newProject);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }
      
      // Successfully created project
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      setShowCreateDialog(false);
      
      // Reset form
      setNewProject({
        title: "",
        description: "",
        status: "pending",
        flooringType: "",
        squareFootage: "",
        location: "",
        startDate: new Date().toISOString().split("T")[0],
      });
      
      toast({
        title: "Project Created",
        description: "The project has been created successfully",
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      });
    }
  };

  // Filter projects based on search term and status filter
  const filteredProjects = projects?.filter((project: any) => {
    // Search term filter
    const matchesSearch = !searchTerm || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.location && project.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const matchesStatus = !statusFilter || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Projects</h1>
          <Card>
            <CardContent className="pt-6">
              <div className="text-red-500">
                Error loading projects. Please try again later.
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
        
        {/* Filter and search controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="w-full sm:w-[200px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <ListFilter className="h-4 w-4 mr-2" />
                  <span>{statusFilter || "Filter by status"}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Projects table */}
        {isLoading ? (
          <Card>
            <CardContent className="flex justify-center items-center p-6">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-slate-200 rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                      <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableCaption>List of all flooring projects</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead className="hidden md:table-cell">Start Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects?.length > 0 ? (
                    filteredProjects.map((project: any) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{project.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {project.description || "No description"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[project.status] || "bg-gray-500/10 text-gray-500"}>
                            {project.status?.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{project.flooringType || "N/A"}</TableCell>
                        <TableCell className="hidden md:table-cell">{project.location || "N/A"}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatDate(project.startDate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/admin/projects/${project.id}`}>
                                <Folder className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/admin/projects/${project.id}/edit`}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {searchTerm || statusFilter ? (
                          <div>
                            <p>No projects found matching your filters</p>
                            <Button 
                              variant="link" 
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("");
                              }}
                            >
                              Clear Filters
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p>No projects found</p>
                            <Button 
                              variant="link" 
                              onClick={() => setShowCreateDialog(true)}
                            >
                              Create your first project
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        
        {/* Create project dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Fill in the project details to create a new flooring project.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title*
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={newProject.title}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newProject.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={newProject.status} 
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="col-span-3">
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
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="flooringType" className="text-right">
                  Flooring Type
                </Label>
                <Input
                  id="flooringType"
                  name="flooringType"
                  value={newProject.flooringType}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="e.g. Hardwood, Laminate, Vinyl"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="squareFootage" className="text-right">
                  Square Footage
                </Label>
                <Input
                  id="squareFootage"
                  name="squareFootage"
                  value={newProject.squareFootage}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="e.g. 1000"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={newProject.location}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Project location or address"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={newProject.startDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact" className="text-right">
                  Contact
                </Label>
                <Select 
                  value={newProject.contactId?.toString() || ""} 
                  onValueChange={handleContactChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a contact (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {contacts?.map((contact: any) => (
                      <SelectItem key={contact.id} value={contact.id.toString()}>
                        {contact.name} {contact.email ? `(${contact.email})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={!newProject.title}>
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}