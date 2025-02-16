'use client';

import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      if (username === "test" && password === "password") {
        const token = "dummy-jwt-token";
        const userInfo = { 
          id: "123", 
          email: "test@example.com", 
          name: username 
        };
        login(token, userInfo);
        router.push("/");
      } else if (username === "test2" && password === "password2") {
        const token = "dummy-jwt-token2";
        const userInfo = { 
          id: "456", 
          email: "test2@example.com", 
          name: username 
        };
        login(token, userInfo);
        router.push("/");
      } else if (username === "test3" && password === "password3") {
        const token = "dummy-jwt-token3";
        const userInfo = { 
          id: "789", 
          email: "test3@example.com", 
          name: username 
        };
        login(token, userInfo);
        router.push("/");
      } else {
        alert("Invalid credentials!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 space-y-4 bg-white rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center">Login</h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button 
          type="submit" 
          className="w-full p-3 bg-blue-500 text-white text-lg rounded-md hover:bg-blue-600 transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  );
}