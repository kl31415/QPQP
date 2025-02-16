'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import MessageWindow from "@/app/receive-results/messagewindow";
import Image from "next/image"; // Add this import for Image handling

interface MatchItem {
  id: string;
  product: string;
  category: string;
  distance: number;
  details: string;
  userId: string;
  userName: string;
}

interface PendingMessage {
  senderId: string;
  senderName: string;
  timestamp: Date;
}

export default function ReceiveResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<MatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, logout, user } = useAuth();
  const { toast } = useToast();
  
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const itemsPerPage = 4;

  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const getCurrentPageItems = () => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  };

  useEffect(() => {
    const fetchPendingMessages = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`http://localhost:4002/pending-messages?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setPendingMessages(data);
          
          if (data.length > 0) {
            toast({
              title: "New Messages",
              description: `You have ${data.length} new message${data.length > 1 ? 's' : ''}`,
              action: <ToastAction altText="View" onClick={() => {
                setActiveChat(data[0].senderId);
                setActiveChatName(data[0].senderName);
              }}>View</ToastAction>,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch pending messages:', error);
      }
    };

    if (isAuthenticated) {
      fetchPendingMessages();
      const interval = setInterval(fetchPendingMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.id, toast]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Please login again",
        action: <ToastAction altText="Login" onClick={() => router.push('/login')}>Login</ToastAction>,
      });
      logout();
      router.push('/login');
    }
  }, [isAuthenticated, logout, router, toast]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = {
          product: searchParams.get('product') || '',
          category: searchParams.get('category') || '',
          distance: searchParams.get('distance') || '0',
          details: searchParams.get('details') || ''
        };

        const response = await fetch('http://localhost:4002/ranked-submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(errorBody.error || 'Failed to fetch results');
        }

        const data = await response.json();
        setItems(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Load Error",
          description: "Failed to fetch results",
          action: <ToastAction altText="Retry" onClick={fetchData}>Retry</ToastAction>,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams, toast]);

  const handleContactClick = (userId: string, userName: string) => {
    setActiveChat(userId);
    setActiveChatName(userName);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-8">
      {/* Logo */}
      <div className="absolute top-8 left-8 cursor-pointer" onClick={() => router.push('/')}>
        <Image
          src="/favicon.ico" // Path to your logo in the public folder
          alt="Logo"
          width={60} // Adjust the size as needed
          height={60}
          className="rounded-full" // Optional: Add styling if needed
        />
      </div>

      <h1 className="text-4xl font-bold mb-6">Results</h1>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <p className="text-lg">Loading...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">
          <p>{error}</p>
          <Button 
            onClick={() => router.push('/')} 
            className="mt-4"
            variant="outline"
          >
            Return Home
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center p-4">
          <p className="mb-4">No matches found</p>
          <Button 
            onClick={() => router.push('/')} 
            className="mt-2"
            variant="outline"
          >
            New Search
          </Button>
        </div>
      ) : (
        <>
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getCurrentPageItems().map((item) => (
                <Card key={item.id} className="p-6">
                  <h2 className="text-2xl font-semibold mb-3">{item.product}</h2>
                  <div className="space-y-2">
                    <p><strong>Category:</strong> {item.category}</p>
                    <p><strong>Distance:</strong> {item.distance} miles</p>
                    <p><strong>Details:</strong> {item.details}</p>
                    <Button 
                      onClick={() => handleContactClick(item.userId, item.userName)}
                      className="mt-4"
                    >
                      Contact
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-4">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="flex items-center">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
          
          <Button 
            onClick={() => router.push('/')} 
            className="mt-6"
            variant="outline"
          >
            Back
          </Button>

          <MessageWindow
            recipientId={activeChat || ''}
            recipientName={activeChatName}
            isOpen={!!activeChat}
            onClose={() => {
              setActiveChat(null);
              setActiveChatName('');
            }}
          />
        </>
      )}
    </div>
  );
}
