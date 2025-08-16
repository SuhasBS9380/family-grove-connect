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
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border shadow-lg">
      <div className="flex items-center justify-around px-4 py-2">
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
                "flex flex-col items-center space-y-1 h-auto py-2 px-3 hover:bg-accent transition-all duration-200",
                isActive && "text-primary",
                isHome && "relative"
              )}
            >
              {isHome && (
                <div className={cn(
                  "absolute -top-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200",
                  isActive 
                    ? "bg-gradient-primary shadow-button" 
                    : "bg-gradient-secondary shadow-card"
                )}>
                  <Icon className={cn(
                    "w-6 h-6 transition-colors duration-200",
                    isActive ? "text-primary-foreground" : "text-primary"
                  )} />
                </div>
              )}
              {!isHome && (
                <Icon className={cn(
                  "w-5 h-5 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
              )}
              {!isHome && (
                <span className={cn(
                  "text-xs transition-colors duration-200",
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
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