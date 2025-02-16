'use client';

import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword } from "@/lib/firebaseConfig";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user) {
        const token = await user.getIdToken(); // Firebase token
        const userInfo = {
          id: user.uid,
          email: user.email || "",
          name: user.displayName || "User",
        };

        login(token, userInfo);
        router.push("/");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";
      
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string };
        
        if (firebaseError.code === 'auth/invalid-credential') {
          errorMessage = "Invalid email or password.";
        } else if (firebaseError.code === 'auth/user-not-found') {
          errorMessage = "User not found. Please sign up.";
        } else if (firebaseError.code === 'auth/wrong-password') {
          errorMessage = "Incorrect password.";
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      
      if (user) {
        const token = await user.getIdToken();
        const userInfo = {
          id: user.uid,
          email: user.email || "",
          name: user.displayName || "User",
        };
        login(token, userInfo);
        router.push("/");
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 space-y-4 bg-white rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center">Login</h2>
        <div className="space-y-2">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <button 
          type="button"
          onClick={handleGoogleLogin}
          className="w-full p-3 bg-red-500 text-white text-lg rounded-md hover:bg-red-600 transition-colors"
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
