import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Temporary login validation (replace with Supabase later)
    const validCredentials = [
      { mobile: "9380102924", password: "123456" },
      { mobile: "9380102923", password: "123456" }
    ];

    const isValid = validCredentials.some(
      cred => cred.mobile === mobile && cred.password === password
    );

    setTimeout(() => {
      if (isValid) {
        toast({
          title: "Login Successful!",
          description: "Welcome to your family app",
        });
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userMobile", mobile);
        navigate("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid mobile number or password",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
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
            Test credentials: 9380102924 / 123456
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;