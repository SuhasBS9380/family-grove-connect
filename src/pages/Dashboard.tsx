import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, MessageCircle, Users, Camera, Calendar, User, Settings, LogOut } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [userMobile, setUserMobile] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const mobile = localStorage.getItem("userMobile");
    
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    
    if (mobile) {
      setUserMobile(mobile);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userMobile");
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Family Feed</h2>
            <Card className="p-4 shadow-card">
              <p className="text-muted-foreground">Share your daily moments with family...</p>
            </Card>
          </div>
        );
      case "chat":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Group Chat</h2>
            <Card className="p-4 shadow-card">
              <p className="text-muted-foreground">Family conversations coming soon...</p>
            </Card>
          </div>
        );
      case "tree":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Family Tree</h2>
            <Card className="p-4 shadow-card">
              <p className="text-muted-foreground">Explore your family connections...</p>
            </Card>
          </div>
        );
      case "memories":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Memories</h2>
            <Card className="p-4 shadow-card">
              <p className="text-muted-foreground">Cherished family moments...</p>
            </Card>
          </div>
        );
      case "events":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Events</h2>
            <Card className="p-4 shadow-card">
              <p className="text-muted-foreground">Upcoming family events...</p>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <div className="bg-gradient-primary p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 border-2 border-primary-foreground">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary-light text-primary-dark font-semibold">
                {userMobile.slice(-2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-primary-foreground font-semibold">Hi there! 👋</p>
              <p className="text-primary-foreground/80 text-sm">Welcome to your family</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-light/20">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 pb-20">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Dashboard;