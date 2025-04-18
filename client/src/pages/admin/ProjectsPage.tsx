import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CustomerProject, InsertCustomerProject, CustomerUser } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, FileText, MoreHorizontal, Edit, Trash, Eye, CheckCircle, Loader2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const statuses = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on-hold" },
  { label: "Cancelled", value: "cancelled" }
];

// Form validation schema for creating/editing projects
const projectSchema = z.object({
  title: z.string().min(2, "Title is required"),
  customerId: z.number().optional(),
  status: z.string().optional(),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.string().optional(),
  location: z.string().optional().nullable(),
  serviceType: z.string().optional(),
  contactId: z.number().optional().nullable(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function ProjectsPage() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<CustomerProject | null>(null);
  const [isAddingProgress, setIsAddingProgress] = useState(false);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Progress update form
  const progressForm = useForm({
    defaultValues: {
      status: "",
      note: "",
      date: new Date().toISOString().split('T')[0],
      images: [],
    },
  });

  // Document upload form
  const documentForm = useForm({
    defaultValues: {
      name: "",
      url: "",
      type: "document",
    },
  });

  // Fetch all projects
  const {
    data: projects = [],
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  // Fetch customer users for the form
  const {
    data: customers = [],
    isLoading: customersLoading,
  } = useQuery({
    queryKey: ["/api/admin/customer-portal/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/customer-portal/users");
      if (!res.ok) throw new Error("Failed to fetch customers");
      return res.json();
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      const res = await apiRequest("POST", "/api/projects", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create project");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Project created",
        description: "The project has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreating(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProjectFormValues> }) => {
      const res = await apiRequest("PUT", `/api/projects/${id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update project");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Project updated",
        description: "The project has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsEditing(false);
      setSelectedProject(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add progress update mutation
  const addProgressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("POST", `/api/projects/${id}/progress`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add progress update");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Progress update added",
        description: "The progress update has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsAddingProgress(false);
      progressForm.reset({
        status: "",
        note: "",
        date: new Date().toISOString().split('T')[0],
        images: [],
      });
      setSelectedProject(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding progress update",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add document mutation
  const addDocumentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("POST", `/api/projects/${id}/documents`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add document");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Document added",
        description: "The document has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsAddingDocument(false);
      documentForm.reset();
      setSelectedProject(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding document",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Project form for creating/editing
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      status: "pending",
      description: "",
      notes: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      budget: "",
      location: "",
      serviceType: "",
      contactId: null,
      customerId: undefined,
    },
  });

  // Set form values when editing a project
  useEffect(() => {
    if (selectedProject && isEditing) {
      const formData = {
        title: selectedProject.title,
        customerId: selectedProject.customerId,
        status: selectedProject.status || "pending",
        description: selectedProject.description || "",
        notes: selectedProject.notes || "",
        startDate: selectedProject.startDate || new Date().toISOString().split('T')[0],
        endDate: selectedProject.endDate || "",
        budget: selectedProject.budget || "",
        location: selectedProject.location || "",
        serviceType: selectedProject.serviceType || "",
        contactId: selectedProject.contactId || null,
      };

      form.reset(formData);
    }
  }, [selectedProject, isEditing, form]);

  // Handle creating a new project
  const onSubmitCreate = (values: ProjectFormValues) => {
    // Ensure all required fields are present
    if (!values.customerId) {
      // Check if we have a fallback customer to use
      if (customers.length > 0) {
        values.customerId = customers[0].id;
      } else {
        toast({
          title: "Error creating project",
          description: "A customer ID is required. Please create a customer first.",
          variant: "destructive",
        });
        return;
      }
    }

    createProjectMutation.mutate(values);
  };

  // Handle updating a project
  const onSubmitUpdate = (values: ProjectFormValues) => {
    if (selectedProject) {
      updateProjectMutation.mutate({
        id: selectedProject.id,
        data: values,
      });
    }
  };

  // Handle adding a progress update
  const onSubmitProgress = (values: any) => {
    if (selectedProject) {
      addProgressMutation.mutate({
        id: selectedProject.id,
        data: values,
      });
    }
  };

  // Handle adding a document
  const onSubmitDocument = (values: any) => {
    if (selectedProject) {
      addDocumentMutation.mutate({
        id: selectedProject.id,
        data: values,
      });
    }
  };

  // Filter projects based on search and status
  const filteredProjects = projects.filter((project: CustomerProject) => {
    // Filter by search term
    const matchesSearch = searchFilter === "" || 
      (project.title && project.title.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (project.description && project.description.toLowerCase().includes(searchFilter.toLowerCase()));

    // Filter by status
    const matchesStatus = statusFilter === null || project.status === statusFilter;

    // Filter by tab
    const matchesTab = activeTab === "all" || 
      (activeTab === "active" && project.status !== "completed" && project.status !== "cancelled") ||
      (activeTab === "completed" && project.status === "completed") ||
      (activeTab === "cancelled" && project.status === "cancelled");

    return matchesSearch && matchesStatus && matchesTab;
  });

  // Find customer name by ID
  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c: CustomerUser) => c.id === customerId);
    return customer ? customer.name : "Unknown";
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "on-hold":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout title="Projects">
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Projects</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button className="ml-4">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new project.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitCreate)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter project title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer</FormLabel>
                          <Select
                            value={field.value?.toString() || ""}
                            onValueChange={(value) => field.onChange(Number(value))}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customersLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading customers...
                                </SelectItem>
                              ) : customers.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  No customers available
                                </SelectItem>
                              ) : (
                                customers.map((customer: CustomerUser) => (
                                  <SelectItem key={customer.id} value={customer.id.toString()}>
                                    {customer.firstName} {customer.lastName}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The customer associated with this project.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            value={field.value || "pending"}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statuses.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter project description"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. $5,000" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Project location"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Hardwood Installation"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter additional notes"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreating(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createProjectMutation.isPending}
                      >
                        {createProjectMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Project
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex justify-between items-center space-x-4">
            <Input
              placeholder="Search projects..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="max-w-sm"
            />

            <Select
              value={statusFilter || "all-statuses"}
              onValueChange={(value) => setStatusFilter(value === "all-statuses" ? null : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {projectsLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading projects...</span>
            </div>
          ) : projectsError ? (
            <div className="flex justify-center items-center h-64 text-red-500">
              Error loading projects. Please try again.
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-muted-foreground mb-4">No projects found</div>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Title</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project: CustomerProject) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell>{getCustomerName(project.customerId)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(project.status || "pending")}>
                            {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>{project.startDate || "Not set"}</TableCell>
                        <TableCell>{project.location || "Not specified"}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedProject(project);
                                setIsEditing(true);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedProject(project);
                                setIsAddingProgress(true);
                                progressForm.reset({
                                  status: project.status || "pending",
                                  note: "",
                                  date: new Date().toISOString().split('T')[0],
                                  images: [],
                                });
                              }}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Add Progress Update
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedProject(project);
                                setIsAddingDocument(true);
                              }}>
                                <FileText className="mr-2 h-4 w-4" />
                                Add Document
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project details.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitUpdate)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select
                      value={field.value?.toString() || "select-customer"}
                      onValueChange={(value) => field.onChange(value === "select-customer" ? undefined : Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="select-customer">Select a customer</SelectItem>
                        {customersLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading customers...
                          </SelectItem>
                        ) : customers.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No customers available
                          </SelectItem>
                        ) : (
                          customers.map((customer: CustomerUser) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.firstName} {customer.lastName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value || "pending"}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter project description"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $5,000" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Project location"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Hardwood Installation"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter additional notes"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedProject(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateProjectMutation.isPending}
                >
                  {updateProjectMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Project
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Progress Update Dialog */}
      <Dialog open={isAddingProgress} onOpenChange={setIsAddingProgress}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Progress Update</DialogTitle>
            <DialogDescription>
              Update the progress of this project.
            </DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={progressForm.handleSubmit((data) => {
              if (selectedProject) {
                onSubmitProgress(data);
              }
            })} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={progressForm.watch("status")}
                onValueChange={(value) => progressForm.setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...progressForm.register("date")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Progress Note</Label>
              <Textarea
                id="note"
                placeholder="Describe the progress made..."
                {...progressForm.register("note")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddingProgress(false);
                  setSelectedProject(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addProgressMutation.isPending}
              >
                {addProgressMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog open={isAddingDocument} onOpenChange={setIsAddingDocument}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
            <DialogDescription>
              Add a document to this project.
            </DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={documentForm.handleSubmit((data) => {
              if (selectedProject) {
                onSubmitDocument(data);
              }
            })} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Document Name</Label>
              <Input
                id="name"
                placeholder="Enter document name"
                {...documentForm.register("name")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Document URL</Label>
              <Input
                id="url"
                placeholder="Enter document URL"
                {...documentForm.register("url")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Document Type</Label>
              <Select
                value={documentForm.watch("type")}
                onValueChange={(value) => documentForm.setValue("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddingDocument(false);
                  setSelectedProject(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addDocumentMutation.isPending}
              >
                {addDocumentMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Document
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Internal component
const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </label>
  );
};