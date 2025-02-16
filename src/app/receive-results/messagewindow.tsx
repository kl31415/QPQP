'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/authContext";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: string;
  recipient: string;
  timestamp: Date;
  type: 'text' | 'trade';
  tradeOffer?: {
    itemId: string;
    itemName: string;
  };
}

interface MessageWindowProps {
  recipientId: string;
  isOpen: boolean;
  onClose: () => void;
  recipientName?: string;
}

const MessageWindow = ({ recipientId, isOpen, onClose, recipientName = 'User' }: MessageWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userOffers, setUserOffers] = useState<Array<{ id: string; product: string }>>([]);
  const [selectedOffer, setSelectedOffer] = useState<string>('');
  const [showTradeOffer, setShowTradeOffer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch messages and user offers on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:4002/messages?userId=${user?.id}&recipientId=${recipientId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    // In the fetchUserOffers function, update the fetch URL and handle data structure
    const fetchUserOffers = async () => {
      try {
        const response = await fetch(
          `http://localhost:4002/user-items?userId=${user?.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setUserOffers(data); // Remove .items from data.items
        }
      } catch (error) {
        console.error('Failed to fetch user offers:', error);
      }
    };

    if (isOpen && user?.id) {
      fetchMessages();
      fetchUserOffers();
    }
  }, [isOpen, user?.id, recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please login again",
      });
      return;
    }
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: user?.id || '',
      recipient: recipientId,
      timestamp: new Date(),
      type: 'text' as const
    };

    try {
      const response = await fetch('http://localhost:4002/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
  
      const result = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, result]);
        setNewMessage('');
      } else {
        console.error('Server error:', result);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    }
  };

  const handleSendTradeOffer = async () => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please login again",
      });
      return;
    }
    if (!selectedOffer) return;

    const selectedItem = userOffers.find(offer => offer.id === selectedOffer);
    if (!selectedItem) return;

    const tradeMessage = {
      id: Date.now().toString(),
      text: `Would you like to trade for my ${selectedItem.product}?`,
      sender: user?.id || '',
      recipient: recipientId,
      timestamp: new Date(),
      type: 'trade' as const,
      tradeOffer: {
        itemId: selectedItem.id,
        itemName: selectedItem.product,
        // Add these if your backend requires more details
        senderId: user.id,
        recipientId: recipientId,
      }
    };

    try {
      const response = await fetch('http://localhost:4002/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeMessage)
      });

      if (response.ok) {
        setMessages(prev => [...prev, tradeMessage]);
        setShowTradeOffer(false);
        setSelectedOffer('');
      }
    } catch (error) {
      console.error('Failed to send trade offer:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send trade offer. Please try again.",
      });
    }
  };

  // Add this useEffect for real-time updates
  useEffect(() => {
    const pollMessages = async () => {
      if (!user?.id || !recipientId) return;
      
      try {
        const response = await fetch(
          `http://localhost:4002/messages?userId=${user.id}&recipientId=${recipientId}`
        );
        if (response.ok) setMessages(await response.json());
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    const interval = setInterval(pollMessages, 5000);
    return () => clearInterval(interval);
  }, [user?.id, recipientId]);

  // Update handleAcceptTrade function
  const handleAcceptTrade = async (tradeOffer: Message) => {
    try {
      const response = await fetch('http://localhost:4002/accept-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderOfferId: tradeOffer.tradeOffer?.itemId,
          recipientUserId: user?.id,
          senderUserId: tradeOffer.sender
        })
      });
  
      if (response.ok) {
        toast({
          title: "Trade Accepted",
          description: "The trade has been successfully completed!",
        });
        
        // Add trade completion message
        const tradeCompleteMessage: Message = {
          id: Date.now().toString(),
          text: `Trade completed successfully! ${tradeOffer.tradeOffer?.itemName} has been exchanged.`,
          sender: 'system',
          recipient: recipientId,
          timestamp: new Date(),
          type: 'text' // This is now properly typed as 'text' | 'trade'
        };
        
        setMessages(prev => [...prev, tradeCompleteMessage]);
  
        // Refresh offers
        const offersRes = await fetch(`http://localhost:4002/user-offers?userId=${user?.id}`);
        if (offersRes.ok) setUserOffers(await offersRes.json());
      }
    } catch (error) {
      console.error('Failed to accept trade:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete trade. Please try again.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 flex flex-col bg-white dark:bg-gray-900 shadow-xl rounded-lg overflow-hidden">
      <div className="p-3 bg-primary text-primary-foreground flex justify-between items-center">
        <h3 className="font-semibold">Chat with {recipientName}</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === user?.id
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'bg-muted'
              }`}
            >
              {message.type === 'trade' ? (
                <div className="space-y-2">
                  <p className="text-sm">{message.text}</p>
                  <div className="bg-secondary p-2 rounded">
                    <p className="text-xs">Offered: {message.tradeOffer?.itemName}</p>
                  </div>
                  {message.sender !== user?.id && (
                    <Button 
                      onClick={() => handleAcceptTrade(message)}
                      size="sm"
                      className="w-full mt-2"
                    >
                      Accept Trade
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm">{message.text}</p>
              )}
              <span className="text-xs opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showTradeOffer ? (
        <div className="p-4 border-t space-y-2">
          <Select value={selectedOffer} onValueChange={setSelectedOffer}>
            <SelectTrigger>
              <SelectValue placeholder="Select an item to trade" />
            </SelectTrigger>
            <SelectContent>
              {userOffers.map((offer) => (
                <SelectItem key={offer.id} value={offer.id}>
                  {offer.product}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowTradeOffer(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendTradeOffer}
              className="flex-1"
              disabled={!selectedOffer}
            >
              Send Offer
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" size="sm">
              Send
            </Button>
          </div>
          <Button
            type="button"
            onClick={() => setShowTradeOffer(true)}
            variant="outline"
            size="sm"
            className="mt-2 w-full"
          >
            Propose Trade
          </Button>
        </form>
      )}
    </Card>
  );
};

export default MessageWindow;