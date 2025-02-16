'use client';
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "@/lib/firebaseConfig";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsPasswordValid(password.length >= 6);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (!isLogin && !isPasswordValid) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      
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
    } catch (error: unknown) {
      console.error("Auth error:", error);
      let errorMessage = "Authentication failed. Please try again.";
      
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string };
        switch (firebaseError.code) {
          case 'auth/invalid-credential':
            errorMessage = "Invalid email or password.";
            break;
          case 'auth/user-not-found':
            errorMessage = "No account found with this email. Please sign up.";
            setIsLogin(false);
            break;
          case 'auth/wrong-password':
            errorMessage = "Incorrect password.";
            break;
          case 'auth/email-already-in-use':
            errorMessage = "An account already exists with this email. Please login.";
            setIsLogin(true);
            break;
          case 'auth/weak-password':
            errorMessage = "Password should be at least 6 characters.";
            break;
          case 'auth/invalid-email':
            errorMessage = "Please enter a valid email address.";
            break;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    
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
      setError("Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          {isLogin ? "Login" : "Sign Up"}
        </h2>
        
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="email@example.com"
            required
            className="w-full p-3 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            required
            className={`w-full p-3 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 
              ${!isLogin && (isPasswordValid ? 'text-green-600' : 'text-red-600')}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {!isLogin && (
            <p className={`text-xs ${isPasswordValid ? 'text-green-600' : 'text-gray-500'}`}>
              Password must be at least 6 characters long
              {isPasswordValid && ' ✓'}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || (!isLogin && !isPasswordValid)}
          className={`w-full p-3 text-white text-lg rounded-md transition-colors ${
            isLoading || (!isLogin && !isPasswordValid)
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
          className="w-full text-sm text-blue-600 hover:text-blue-800"
        >
          {isLogin 
            ? "Don't have an account? Sign up" 
            : "Already have an account? Login"}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white">OR</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className={`w-full p-3 text-white text-lg rounded-md transition-colors ${
            isLoading
              ? 'bg-red-400 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}