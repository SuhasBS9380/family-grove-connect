import { Button } from "@/components/ui/button";
import { Home, MessageCircle, Users, Camera, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const navItems = [
    { id: "chat", icon: MessageCircle, label: "Chat" },
    { id: "tree", icon: Users, label: "Family" },
    { id: "home", icon: Home, label: "Home" },
    { id: "memories", icon: Camera, label: "Memories" },
    { id: "events", icon: Calendar, label: "Events" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-card/80 backdrop-blur-xl border-t border-border/20 shadow-card">
      <div className="flex items-center justify-around px-4 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isHome = item.id === "home";
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center space-y-2 h-auto py-3 px-4 hover:bg-secondary/20 transition-all duration-300 rounded-xl",
                isActive && "text-primary",
                isHome && "relative"
              )}
            >
              {isHome && (
                <div className={cn(
                  "absolute -top-6 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 border-4 border-background",
                  isActive 
                    ? "bg-gradient-secondary shadow-glow scale-110" 
                    : "bg-gradient-card shadow-card hover:scale-105"
                )}>
                  <Icon className={cn(
                    "w-7 h-7 transition-all duration-300",
                    isActive ? "text-primary-foreground" : "text-primary"
                  )} />
                </div>
              )}
              {!isHome && (
                <Icon className={cn(
                  "w-6 h-6 transition-all duration-300",
                  isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                )} />
              )}
              {!isHome && (
                <span className={cn(
                  "text-xs transition-all duration-300 font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;