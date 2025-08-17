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
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/20 shadow-lg backdrop-blur-xl bg-opacity-95 z-50">
      <div className="flex items-center justify-around py-3 px-4">
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
                "flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-110 hover:bg-primary/10",
                isActive && "text-primary bg-primary/10 shadow-glow animate-scale-in",
                !isActive && "text-muted-foreground hover:text-foreground",
                isHome && `h-14 w-14 rounded-full shadow-button ${
                  isActive 
                    ? "bg-gradient-primary text-white scale-110 shadow-glow" 
                    : "bg-primary text-white hover:bg-primary/90"
                }`,
                !isHome && "h-12"
              )}
            >
              <Icon 
                className={cn(
                  isHome ? "w-6 h-6" : "w-5 h-5",
                  "transition-transform duration-200",
                  isActive && !isHome && "animate-pulse"
                )} 
              />
              {!isHome && (
                <span className={cn(
                  "text-xs font-medium transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-70"
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