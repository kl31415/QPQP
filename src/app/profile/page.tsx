'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Clock, Package, User, ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link'; // Import Link for navigation

// Mock data - replace with actual API calls
const mockRequests = [
  { id: 1, title: 'iPhone repair', date: '2024-03-15', status: 'Completed', category: 'Electronics' },
  { id: 2, title: 'Vintage chair', date: '2024-03-14', status: 'Pending', category: 'Furniture' },
];

const mockOffers = [
  { id: 1, title: 'MacBook Pro 2020', date: '2024-03-16', status: 'Active', category: 'Electronics' },
  { id: 2, title: 'Designer dress', date: '2024-03-13', status: 'Completed', category: 'Clothing' },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [requests, setRequests] = useState(mockRequests);
  const [offers, setOffers] = useState(mockOffers);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  // Stats calculations
  const stats = {
    totalRequests: requests.length,
    totalOffers: offers.length,
    successRate: Math.round((requests.filter(r => r.status === 'Completed').length / requests.length) * 100) || 0,
    activeOffers: offers.filter(o => o.status === 'Active').length,
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Logo Link */}
        <Link href="/" passHref>
          <div className="absolute top-8 left-8 cursor-pointer">
            <Image
              src="/favicon.ico" // Path to your logo in the public folder
              alt="Logo"
              width={60} // Adjust the size as needed
              height={60}
              className="rounded-full" // Optional: Add styling if needed
            />
          </div>
        </Link>

        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -mt-4"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Profile Header */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="w-32 h-32">
              <AvatarImage src={avatarPreview || "/default-avatar.png"} />
              <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="avatarUpload"
            />
            <label
              htmlFor="avatarUpload"
              className="absolute bottom-0 right-0 bg-background p-2 rounded-full cursor-pointer border hover:bg-accent transition-colors"
            >
              <User className="w-5 h-5" />
            </label>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold">{user?.name || 'User'}</h1>
            <p className="text-muted-foreground mt-2">{user?.email}</p>
            <p className="flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4" />
              Member since March 2024
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <ShoppingCart className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalRequests}</div>
                <div className="text-sm text-muted-foreground">Total Requests</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalOffers}</div>
                <div className="text-sm text-muted-foreground">Total Offers</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <History className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.successRate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.activeOffers}</div>
                <div className="text-sm text-muted-foreground">Active Offers</div>
              </div>
            </div>
          </Card>
        </div>

        {/* History Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Requests History */}
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Request History
              </h2>
              <ScrollArea className="h-96">
                {requests.map((request) => (
                  <div key={request.id} className="p-4 hover:bg-accent transition-colors border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{request.title}</div>
                        <div className="text-sm text-muted-foreground">{request.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{request.date}</div>
                        <span className={`text-sm ${
                          request.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </Card>

          {/* Offers History */}
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Package className="w-6 h-6" />
                Offer History
              </h2>
              <ScrollArea className="h-96">
                {offers.map((offer) => (
                  <div key={offer.id} className="p-4 hover:bg-accent transition-colors border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{offer.title}</div>
                        <div className="text-sm text-muted-foreground">{offer.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{offer.date}</div>
                        <span className={`text-sm ${
                          offer.status === 'Active' ? 'text-blue-500' : 'text-green-500'
                        }`}>
                          {offer.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
