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
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-card border-0 bg-card/95 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl text-primary-foreground font-bold">👨‍👩‍👧‍👦</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your family app</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-foreground font-medium">
              Mobile Number
            </Label>
            <Input
              id="mobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter your mobile number"
              className="h-12 bg-background border-border focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-12 bg-background border-border focus:ring-primary"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-primary hover:bg-gradient-secondary text-primary-foreground font-semibold shadow-button transition-all duration-300 hover:shadow-lg"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account? 
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1"
              onClick={() => navigate("/register")}
            >
              Register here
            </Button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Test with any mobile number and password to try the app
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;