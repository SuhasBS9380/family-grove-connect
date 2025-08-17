import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { authService, RegisterRequest } from "@/services/authService";

const Register = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    mobile: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: undefined,
    createFamily: false, // Default to false, will be determined by family code presence
    familyCode: ""
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: keyof RegisterRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Simplified logic: always create or join the single private family
    formData.createFamily = !formData.familyCode;

    setIsLoading(true);

    try {
      const response = await authService.register(formData);
      
      if (response.success) {
        toast({
          title: "Registration Successful!",
          description: response.message,
        });
        navigate("/login");
      } else {
        toast({
          title: "Registration Failed",
          description: response.message || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 shadow-card border-0 bg-card/95 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl text-primary-foreground font-bold">👨‍👩‍👧‍👦</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Join Your Family</h1>
          <p className="text-muted-foreground">Create your account to connect with family</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground font-medium">
                First Name *
              </Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="First name"
                className="h-10 bg-background border-border focus:ring-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground font-medium">
                Last Name *
              </Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Last name"
                className="h-10 bg-background border-border focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-foreground font-medium">
              Mobile Number *
            </Label>
            <Input
              id="mobile"
              type="tel"
              value={formData.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              placeholder="10-digit mobile number"
              className="h-10 bg-background border-border focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              Email (Optional)
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="your.email@example.com"
              className="h-10 bg-background border-border focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-foreground font-medium">
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                className="h-10 bg-background border-border focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-foreground font-medium">
                Gender
              </Label>
              <Select onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger className="h-10 bg-background border-border">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Min 6 characters"
                className="h-10 bg-background border-border focus:ring-primary"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                Confirm Password *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="h-10 bg-background border-border focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="familyCode" className="text-foreground font-medium">
                Family Code (Optional)
              </Label>
              <Input
                id="familyCode"
                type="text"
                value={formData.familyCode}
                onChange={(e) => handleInputChange("familyCode", e.target.value)}
                placeholder="Enter family code to join existing family"
                className="h-10 bg-background border-border focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to create a new family, or enter a code to join an existing one.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-primary hover:bg-gradient-secondary text-primary-foreground font-semibold shadow-button transition-all duration-300 hover:shadow-lg"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account? 
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1"
              onClick={() => navigate("/login")}
            >
              Sign in here
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
