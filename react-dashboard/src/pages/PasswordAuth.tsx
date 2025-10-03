import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import axios from "axios";

interface PasswordAuthProps {
  children: React.ReactNode;
}

const PasswordAuth = ({ children }: PasswordAuthProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Check if token is expired by decoding it
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error("Invalid token format");
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp < currentTime) {
          // Token is expired
          console.log("Token expired, clearing localStorage");
          localStorage.removeItem("authToken");
          delete axios.defaults.headers.common["Authorization"];
          setIsAuthenticated(false);
        } else {
          // Token is valid
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Error validating token:", err);
        localStorage.removeItem("authToken");
        delete axios.defaults.headers.common["Authorization"];
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    validateToken();
  }, []);

  // Set up axios interceptor to handle 401 responses globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log("Received 401, logging out");
          localStorage.removeItem("authToken");
          delete axios.defaults.headers.common["Authorization"];
          setIsAuthenticated(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_ENDPOINT}/login`,
        { password }
      );
      const { token } = response.data;
      
      localStorage.setItem("authToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
      setPassword("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authentication failed. Please try again.");
      setPassword("");
    }
  };

  // Show loading state while validating token
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 shadow-2xl max-w-md w-full">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">Access Dashboard</h2>
          </div>
          <p className="text-muted-foreground mb-6 text-center">
            Enter the password to access the Cyber Threat Intelligence Dashboard
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-secondary/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter password"
                autoFocus
              />
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PasswordAuth;