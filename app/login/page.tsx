"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Login page — POST /auth/login → get JWT → redirect to /chat
export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // toggle login/register

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isRegistering) {
        await register(username, password);
      } else {
        await login(username, password);
      }
      // AuthContext handles redirect to /chat
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid username or password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">

        {/* Header */}
        <h1 className="text-2xl font-bold text-white mb-2">
          {isRegistering ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-gray-400 mb-6">
          {isRegistering ? "Register to use the AI Agent" : "Login to chat with the AI Agent"}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="alice"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-400 text-sm bg-red-900/30 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {isLoading ? "Please wait..." : isRegistering ? "Register" : "Login"}
          </button>
        </form>

        {/* Toggle login/register */}
        <p className="text-center text-gray-400 mt-4 text-sm">
          {isRegistering ? "Already have an account? " : "No account? "}
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
            className="text-blue-400 hover:underline"
          >
            {isRegistering ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
