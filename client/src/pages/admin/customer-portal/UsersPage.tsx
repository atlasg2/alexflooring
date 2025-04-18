import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, MoreHorizontal, UserPlus, Key, Eye, Lock, Calendar, Trash2 } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";

// Types
interface CustomerUser {
  id: number;
  email: string;
  name: string;
  phone?: string;
  contactId?: number;
  lastLogin?: string;
  createdAt?: string;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface CreateUserFormData {
  contactId?: number;
  email: string;
  name: string;
  phone?: string;
  password?: string;
  generatePassword: boolean;
}

interface ResetPasswordFormData {
  userId: number;
  newPassword?: string;
  generatePassword: boolean;
}

export default function CustomerUsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CustomerUser | null>(null);
  
  // Initial form state
  const initialCreateUserFormData: CreateUserFormData = {
    email: "",
    name: "",
    phone: "",
    generatePassword: true
  };
  
  const initialResetPasswordFormData: ResetPasswordFormData = {
    userId: 0,
    newPassword: "",
    generatePassword: true
  };
  
  // Form state
  const [createUserFormData, setCreateUserFormData] = useState<CreateUserFormData>(initialCreateUserFormData);
  const [resetPasswordFormData, setResetPasswordFormData] = useState<ResetPasswordFormData>(initialResetPasswordFormData);
  
  // Fetch customer users
  const { data: customerUsers, isLoading: isLoadingUsers } = useQuery<CustomerUser[]>({
    queryKey: ["/api/admin/customer-users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/customer-users");
      if (!res.ok) throw new Error("Failed to fetch customer users");
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
  
  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      const payload = {
        ...data,
        password: data.generatePassword ? undefined : data.password
      };
      
      const res = await apiRequest("POST", "/api/admin/customer-users", payload);
      if (!res.ok) throw new Error("Failed to create user");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Customer portal user created",
        description: data.message || "User has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-users"] });
      setIsCreatingUser(false);
      setCreateUserFormData(initialCreateUserFormData);
    },
    onError: (error) => {
      toast({
        title: "Failed to create user",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      const payload = {
        ...data,
        newPassword: data.generatePassword ? undefined : data.newPassword
      };
      
      const res = await apiRequest("POST", `/api/admin/customer-users/${data.userId}/reset-password`, payload);
      if (!res.ok) throw new Error("Failed to reset password");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Password reset",
        description: data.message || "Password has been reset successfully.",
      });
      setIsResettingPassword(false);
      setResetPasswordFormData(initialResetPasswordFormData);
    },
    onError: (error) => {
      toast({
        title: "Failed to reset password",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/customer-users/${userId}`);
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-users"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete user",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Handle create user
  const handleCreateUser = () => {
    createUserMutation.mutate(createUserFormData);
  };
  
  // Handle reset password
  const handleResetPassword = () => {
    resetPasswordMutation.mutate(resetPasswordFormData);
  };
  
  // Handle delete user
  const handleDeleteUser = (userId: number) => {
    if (confirm("Are you sure you want to delete this user? This will remove their access to the customer portal.")) {
      deleteUserMutation.mutate(userId);
    }
  };
  
  // Handle pre-filling from contact
  const handleSelectContact = (contactId: number) => {
    const selectedContact = contacts?.find(c => c.id === contactId);
    if (selectedContact) {
      setCreateUserFormData({
        ...createUserFormData,
        contactId,
        name: selectedContact.name,
        email: selectedContact.email,
        phone: selectedContact.phone
      });
    }
  };
  
  return (
    <AdminLayout title="Customer Portal Users">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Portal Users</h1>
            <p className="text-gray-600 mt-1">
              Manage users who have access to the customer portal
            </p>
          </div>
          
          <Button onClick={() => setIsCreatingUser(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            New User
          </Button>
        </div>
        
        {isLoadingUsers ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !customerUsers || customerUsers.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <h3 className="text-lg font-medium">No customer portal users</h3>
                <p className="text-gray-500 mt-1">
                  Create a new user to give customers access to the portal
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsCreatingUser(true)}
                >
                  Create User
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "—"}</TableCell>
                      <TableCell>
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleString()
                          : "Never"
                        }
                      </TableCell>
                      <TableCell>
                        {user.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"
                        }
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
                                setSelectedUser(user);
                                setResetPasswordFormData({
                                  ...initialResetPasswordFormData,
                                  userId: user.id
                                });
                                setIsResettingPassword(true);
                              }}
                            >
                              <Key className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
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
      
      {/* Create User Dialog */}
      <Dialog open={isCreatingUser} onOpenChange={(open) => {
        if (!open) {
          setIsCreatingUser(false);
          setCreateUserFormData(initialCreateUserFormData);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Customer Portal User</DialogTitle>
            <DialogDescription>
              Create a new user who can access the customer portal
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contact">Existing Contact (Optional)</Label>
              <select
                id="contact"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={createUserFormData.contactId?.toString() || ""}
                onChange={(e) => handleSelectContact(parseInt(e.target.value))}
              >
                <option value="">Select a contact or manually enter details</option>
                {contacts?.map((contact) => (
                  <option key={contact.id} value={contact.id.toString()}>
                    {contact.name} ({contact.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Selecting a contact will pre-fill the form below
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={createUserFormData.name}
                onChange={(e) => setCreateUserFormData({...createUserFormData, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={createUserFormData.email}
                onChange={(e) => setCreateUserFormData({...createUserFormData, email: e.target.value})}
                placeholder="john@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                value={createUserFormData.phone || ""}
                onChange={(e) => setCreateUserFormData({...createUserFormData, phone: e.target.value})}
                placeholder="(123) 456-7890"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="generatePassword"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={createUserFormData.generatePassword}
                  onChange={(e) => setCreateUserFormData({
                    ...createUserFormData, 
                    generatePassword: e.target.checked
                  })}
                />
                <Label htmlFor="generatePassword" className="text-sm font-medium">
                  Generate random password
                </Label>
              </div>
              <p className="text-xs text-gray-500">
                Customer will receive a welcome email with login instructions
              </p>
            </div>
            
            {!createUserFormData.generatePassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={createUserFormData.password || ""}
                  onChange={(e) => setCreateUserFormData({...createUserFormData, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreatingUser(false);
                setCreateUserFormData(initialCreateUserFormData);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reset Password Dialog */}
      <Dialog open={isResettingPassword} onOpenChange={(open) => {
        if (!open) {
          setIsResettingPassword(false);
          setResetPasswordFormData(initialResetPasswordFormData);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset the password for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="resetGeneratePassword"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={resetPasswordFormData.generatePassword}
                  onChange={(e) => setResetPasswordFormData({
                    ...resetPasswordFormData, 
                    generatePassword: e.target.checked
                  })}
                />
                <Label htmlFor="resetGeneratePassword" className="text-sm font-medium">
                  Generate random password
                </Label>
              </div>
              <p className="text-xs text-gray-500">
                Customer will receive an email with the new password
              </p>
            </div>
            
            {!resetPasswordFormData.generatePassword && (
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={resetPasswordFormData.newPassword || ""}
                  onChange={(e) => setResetPasswordFormData({...resetPasswordFormData, newPassword: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsResettingPassword(false);
                setResetPasswordFormData(initialResetPasswordFormData);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}