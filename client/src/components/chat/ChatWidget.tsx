import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';
import { MessageSquare, ArrowRight, Send, X, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

const ChatWidget = () => {
  // State for chat widget functionality
  const [isOpen, setIsOpen] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Toggle the chat widget open/closed state
  const toggleChat = () => {
    setIsOpen(!isOpen);
    
    // Focus the message input when chat is opened
    if (!isOpen) {
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 300);
    }
  };
  
  // Submit the initial contact information
  const submitInitialInfo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast({
        title: "Please complete all fields",
        description: "We need your name and email to assist you better.",
        variant: "destructive"
      });
      return;
    }
    
    setIsInitial(false);
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };
  
  // Send a chat message to the backend
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setIsSending(true);
    
    try {
      await apiRequest('POST', '/api/chat', {
        name,
        email,
        message
      });
      
      toast({
        title: "Message sent!",
        description: "We'll respond to your inquiry soon.",
      });
      
      setMessage('');
      
      // Close the chat after a short delay
      setTimeout(() => {
        setIsOpen(false);
        // Reset to initial state after chat closes
        setTimeout(() => {
          setIsInitial(true);
        }, 500);
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <>
      {/* Chat button fixed at bottom right */}
      <Button 
        onClick={toggleChat}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full z-50 shadow-lg p-0"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </Button>
      
      {/* Chat widget */}
      <div 
        className={cn(
          "fixed bottom-24 right-6 w-[350px] z-50 transition-all duration-300 ease-in-out transform",
          isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
        )}
      >
        <Card className="shadow-xl border-t-4 border-t-secondary">
          <CardHeader className="bg-primary text-white rounded-t-lg pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>Chat with APS Flooring</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6">
            {isInitial ? (
              // Initial form to collect user information
              <form onSubmit={submitInitialInfo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            ) : (
              // Message form after user information is collected
              <form onSubmit={sendMessage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea
                    ref={messageInputRef}
                    id="message"
                    placeholder="How can we help you today?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center text-xs text-muted-foreground pt-2 pb-4">
            <p>We typically respond within 1-2 business hours</p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ChatWidget;