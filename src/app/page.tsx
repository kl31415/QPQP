'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { motion, useAnimation } from "framer-motion";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showReceiveForm, setShowReceiveForm] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [category, setCategory] = useState("");
  const [product, setProduct] = useState("");
  const [distance, setDistance] = useState("");
  const [details, setDetails] = useState("");
  const [otherCategoryDescription, setOtherCategoryDescription] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { isAuthenticated, user, token, logout } = useAuth();
  const controls = useAnimation();
  const { toast } = useToast();
  const [userName, setUserName] = useState("");

  const text = "I want to...";

  // Typing animation
  useEffect(() => {
    const typingInterval = setInterval(() => {
      setTextIndex((prev) => {
        if (prev < text.length) return prev + 1;
        clearInterval(typingInterval);
        controls.start({ opacity: 1 });
        return prev;
      });
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  // Force login on refresh
  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      router.push('/login');
    }
  }, [isAuthenticated, logout, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.user-dropdown')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Update userName state when user changes
  useEffect(() => {
    if (user?.name) {
      setUserName(user.name);
    }
  }, [user]);

  const handleFormSubmission = async (isReceive: boolean) => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please login to continue",
        action: <ToastAction altText="Login" onClick={() => router.push('/login')}>Login</ToastAction>,
      });
      return;
    }

    // Validate required fields
    const missingFields = [];
    if (!userName.trim()) missingFields.push("User name");
    if (!product.trim()) missingFields.push("Product name");
    if (!category.trim()) missingFields.push("Category");
    if (!details.trim()) missingFields.push("Details");

    // Handle Other category
    const finalCategory = category === "Other" && otherCategoryDescription 
      ? otherCategoryDescription // Already includes "other: " prefix
      : category;

    if (!finalCategory) {
      toast({
        variant: "destructive",
        title: "Category Required",
        description: "Please select or specify a category",
      });
      return;
    }

    if (missingFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
      });
      return;
    }

    try {
      if (isReceive) {
        const params = new URLSearchParams({
          product: product.trim(),
          category: finalCategory,
          distance: distance.trim() || '0',
          details: details.trim(),
        });
        router.push(`/receive-results?${params}`);
      } else {
        const response = await fetch('http://localhost:4002/submit-offer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: user?.id,
            userName: userName.trim(),
            product: product.trim(),
            category: finalCategory,
            distance: parseInt(distance) || 0,
            details: details.trim(),
          })
        });

        if (!response.ok) throw new Error('Submission failed');

        setProduct('');
        setCategory('');
        setDistance('');
        setDetails('');
        setOtherCategoryDescription('');
        setShowOfferForm(false);

        toast({
          title: "Success!",
          description: "Your offer has been submitted!",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Please try again later :(",
        action: <ToastAction altText="Retry" onClick={() => handleFormSubmission(isReceive)}>Retry</ToastAction>,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      {/* Wavy Background */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-400 via-blue-500 to-teal-400 opacity-75">
        <div className="w-full h-full bg-[url('/waves.svg')] bg-cover bg-center opacity-50"></div>
      </div>

      {/* Logo in the top-left corner */}
      <div className="absolute top-8 left-8 cursor-pointer z-10" onClick={() => router.push('/')}>
        <Image
          src="/favicon.ico" // Path to your logo in the public folder
          alt="Logo"
          width={60} // Adjust the size as needed
          height={60}
          className="rounded-full" // Optional: Add styling if needed
        />
      </div>

      {/* User Status Button */}
      <div className="absolute top-8 right-8 user-dropdown z-10">
        {isAuthenticated ? (
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-4 py-2"
            >
              👤 {user?.name || "Profile"}
            </Button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/profile')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Profile
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => router.push('/login')}
            className="px-4 py-2"
          >
            Login
          </Button>
        )}
      </div>

      <motion.h1
        className="text-4xl md:text-6xl font-semibold mb-8 md:mb-12 z-10"
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {text.slice(0, textIndex)}
      </motion.h1>

      <motion.div
        className="flex space-x-8 z-10"
        initial={{ opacity: 0 }}
        animate={controls}
        transition={{ delay: 2, duration: 1 }}
      >
        <Button
          onClick={() => {
            if (!isAuthenticated) router.push('/login');
            else {
              setShowOfferForm(true);
              setShowReceiveForm(false);
            }
          }}
          className="px-16 py-8 text-3xl"
        >
          GIVE FREE STUFF
        </Button>
        <Button
          onClick={() => {
            if (!isAuthenticated) router.push('/login');
            else {
              setShowReceiveForm(true);
              setShowOfferForm(false);
            }
          }}
          className="px-16 py-8 text-3xl"
        >
          GET FREE STUFF
        </Button>
      </motion.div>

      {(showReceiveForm || showOfferForm) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-20">
          <Card className="p-8 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-lg relative">
            <h2 className="text-3xl font-semibold mb-8">
              {showOfferForm ? 'My Offer' : 'My Request'}
            </h2>

            <Input
              placeholder="What good or service is it?"
              className="mb-6 text-xl"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
            />

            <Input
              type="number"
              placeholder="How far are you willing to travel? (mi)"
              className="mb-6 text-xl"
              value={distance}
              onChange={(e) => setDistance(Math.max(0, parseInt(e.target.value) || 0).toString())}
              min="0"
              required
            />

            <div className="mb-6">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value !== "Other") {
                    setOtherCategoryDescription(""); // Clear when switching away from Other
                  }
                }}
                className="w-full p-3 text-xl border rounded-md"
                required
              >
                <option value="">Select Category</option>
                <option value="Books">Books</option>
                <option value="Clothing">Clothing</option>
                <option value="Collectibles">Collectibles</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Food">Food</option>
                <option value="Other">Other</option>
              </select>
              
              {category === "Other" && (
                <Input
                  placeholder="Please specify your category (more coming soon!)"
                  className="mt-4 text-xl"
                  value={otherCategoryDescription.replace(/^other: /i, '')} // Remove prefix for display
                  onChange={(e) => {
                    const userInput = e.target.value;
                    // Add "other: " prefix if not already present
                    const formattedInput = userInput.toLowerCase().startsWith('other: ') 
                      ? userInput 
                      : `other: ${userInput}`;
                    setOtherCategoryDescription(formattedInput);
                  }}
                  required
                />
              )}
            </div>

            <Textarea
              placeholder="Questions? Comments? Concerns? A light-hearted joke, perhaps?"
              className="mb-6 text-xl"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
            />

            <div className="flex justify-end space-x-4">
              <Button 
                onClick={() => {
                  setShowOfferForm(false);
                  setShowReceiveForm(false);
                  setOtherCategoryDescription('');
                }} 
                variant="outline" 
                className="px-6 py-2 text-xl"
              >
                CANCEL
              </Button>
              <Button 
                onClick={() => handleFormSubmission(showReceiveForm)} 
                className="px-6 py-2 text-xl"
              >
                SUBMIT
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}