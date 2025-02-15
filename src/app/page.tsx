'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { motion, useAnimation } from "framer-motion";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [category, setCategory] = useState("");
  const [product, setProduct] = useState("");
  const [distance, setDistance] = useState("");
  const [details, setDetails] = useState("");
  const { isAuthenticated, user, token } = useAuth();
  const controls = useAnimation();

  const text = "I want to...";

  useEffect(() => {
    const typingInterval = setInterval(() => {
      setTextIndex((prev) => {
        if (prev < text.length) {
          return prev + 1;
        } else {
          clearInterval(typingInterval);
          controls.start({ opacity: 1 });
          return prev;
        }
      });
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Validate form
    if (!product || !distance || !category || !details) {
      alert("Please fill in all fields");
      return;
    }

    const offerData = {
      userId: user.id,
      product,
      distance: parseInt(distance),
      category,
      details,
      timestamp: new Date().toISOString()
    };

    console.log('Sending offer data:', offerData);
    console.log('Auth token:', token);

    try {
      console.log('Making fetch request to:', "http://localhost:4000/submissions");
      const response = await fetch("http://localhost:4000/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(offerData)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const textResponse = await response.text(); // Handle possible non-JSON response
        throw new Error(`Server responded with ${response.status}: ${textResponse}`);
      }

      const result = await response.json();
      console.log('Response data:', result);

      alert("Offer submitted successfully!");
      setShowOfferForm(false);
      
      // Reset form
      setProduct("");
      setDistance("");
      setCategory("");
      setDetails("");
    } catch (error: unknown) { 
      console.error("Detailed error:", error);
    
      let errorMessage = "Failed to submit offer";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error; 
      } else if (typeof error === "object" && error !== null && "message" in error) {
        errorMessage = String(error.message);
      }
    
      alert(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <motion.h1
        className="text-4xl md:text-6xl font-semibold mb-8 md:mb-12"
        key={textIndex}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {text.slice(0, textIndex)}
      </motion.h1>

      <motion.div
        className="flex space-x-8"
        initial={{ opacity: 0 }}
        animate={controls}
        transition={{ delay: 2, duration: 1 }}
      >
        <Button
          onClick={() => isAuthenticated ? setShowOfferForm(true) : router.push('/login')}
          className="px-16 py-8 text-3xl"
        >
          Offer
        </Button>
        <Button
          onClick={() => router.push('/receive')}
          className="px-16 py-8 text-3xl"
        >
          Receive
        </Button>
      </motion.div>

      {showOfferForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="p-8 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-lg relative">
            <h2 className="text-3xl font-semibold mb-8">Offer Something</h2>
            
            <Input
              placeholder="Product or Service"
              className="mb-6 text-xl"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
            />
            
            <Input
              type="number"
              placeholder="Distance willing to travel (miles)"
              className="mb-6 text-xl"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              required
              min="0"
            />
            
            <div className="mb-6">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 text-xl border rounded-md"
                required
              >
                <option value="">--Select a Category--</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
              </select>
            </div>

            <Textarea
              placeholder="Additional details"
              className="mb-6 text-xl"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
            />

            <div className="flex justify-end space-x-4">
              <Button 
                onClick={() => setShowOfferForm(false)} 
                variant="outline" 
                className="px-6 py-2 text-xl"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="px-6 py-2 text-xl"
              >
                Submit
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
