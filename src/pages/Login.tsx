import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login(mobile, password);
      
      if (response.success) {
        toast({
          title: "Login Successful!",
          description: response.message,
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-card border border-border/20 bg-gradient-card backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-secondary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-glow">
            <span className="text-3xl text-primary-foreground font-bold">👨‍👩‍👧‍👦</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground text-lg">Sign in to your family app</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="mobile" className="text-foreground font-semibold text-sm">
              Mobile Number
            </Label>
            <Input
              id="mobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter your mobile number"
              className="h-14 bg-input border-border/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-foreground font-semibold text-sm">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-14 bg-input border-border/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-gradient-secondary hover:shadow-glow text-primary-foreground font-bold text-lg shadow-button transition-all duration-300 hover:scale-105 rounded-xl border-0"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account? 
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1 text-primary hover:text-primary/80 font-semibold"
              onClick={() => navigate("/register")}
            >
              Register here
            </Button>
          </p>
        </div>

        <div className="mt-6 text-center p-4 bg-secondary/20 rounded-xl border border-border/20">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">Test Credentials:</span><br />
            Mobile: 9380102924 | Password: 123456
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;