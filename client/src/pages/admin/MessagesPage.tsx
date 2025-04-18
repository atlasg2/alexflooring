import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2, Search, Mail, CheckCircle, Circle, Clock, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';

// Type for chat messages
interface ChatMessage {
  id: number;
  name: string | null;
  email: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const MessagesPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/chat');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        toast({
          title: "Error fetching messages",
          description: "Please try again or check your connection",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error fetching messages",
        description: "Please try again or check your connection",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMessages();
  }, []);
  
  // Mark a message as read
  const markAsRead = async (id: number) => {
    try {
      await apiRequest('PUT', `/api/admin/chat/${id}/read`, {});
      
      // Update local state
      setMessages(messages.map(message => 
        message.id === id ? { ...message, isRead: true } : message
      ));
      
      toast({
        title: "Message marked as read",
      });
    } catch (error) {
      toast({
        title: "Error updating message",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  // Filter messages based on search query and read status
  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      (message.name && message.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (message.email && message.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'unread' && !message.isRead) || 
      (statusFilter === 'read' && message.isRead);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="Chat Messages">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Chat Messages</CardTitle>
          <CardDescription>
            Messages from the website chat widget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="flex justify-center items-center p-12">
              <p className="text-muted-foreground">No messages found</p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card key={message.id} className={`${!message.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg font-medium">
                      {message.name || 'Anonymous User'}
                      {!message.isRead && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100" variant="outline">
                          New
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDate(message.createdAt)}
                  </div>
                </div>
                {message.email && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-1" />
                    {message.email}
                  </div>
                )}
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <p className="whitespace-pre-line">{message.message}</p>
              </CardContent>
              <Separator />
              <CardContent className="pt-4 pb-4 flex justify-between items-center">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {message.isRead ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Read</span>
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4 text-blue-600" />
                      <span>Unread</span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {!message.isRead && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => markAsRead(message.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                  {message.email && (
                    <Button
                      size="sm"
                      onClick={() => window.location.href = `mailto:${message.email}`}
                    >
                      Reply via Email
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default MessagesPage;