import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, MessageCircle, Users, Camera, Calendar, User, Settings, LogOut, Send, Heart, MessageSquare, Plus } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import Profile from "@/components/Profile";
import { useToast } from "@/hooks/use-toast";
import { authService, User as UserType } from "@/services/authService";
import { postsService, Post } from "@/services/postsService";
import { messagesService, Message } from "@/services/messagesService";
import { eventsService, Event } from "@/services/eventsService";
import EventsManager from "@/components/EventsManager";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState<UserType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [newPost, setNewPost] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const token = localStorage.getItem("authToken");
    
    if (!isLoggedIn || !token) {
      navigate("/");
      return;
    }
    
    loadUserData();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      setError(null);
      const profileResponse = await authService.getProfile();
      if (profileResponse.success) {
        setUser(profileResponse.user);
      }

      // Load posts for home tab
      const postsResponse = await postsService.getPosts();
      if (postsResponse.success) {
        setPosts(postsResponse.posts);
      }

      // Load messages for chat tab
      const messagesResponse = await messagesService.getMessages();
      if (messagesResponse.success) {
        setMessages(messagesResponse.messages);
      } else {
        setError('Failed to load messages');
      }

      // Load events
      const eventsResponse = await eventsService.getEvents();
      if (eventsResponse.success) {
        setEvents(eventsResponse.events);
      }

    } catch (error) {
      console.error("Error loading user data:", error);
      setError('Failed to load user data');
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      const response = await postsService.createPost({
        content: { text: newPost },
        privacy: "family"
      });

      if (response.success) {
        setPosts([response.post, ...posts]);
        setNewPost("");
        toast({
          title: "Success",
          description: "Post created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await messagesService.sendMessage({
        content: { text: newMessage },
        messageType: "text"
      });

      if (response.success) {
        setMessages([...messages, response.data]);
        setNewMessage("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await postsService.likePost(postId);
      // Refresh posts to show updated likes
      const postsResponse = await postsService.getPosts();
      if (postsResponse.success) {
        setPosts(postsResponse.posts);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const handleUserUpdate = (updatedUser: UserType) => {
    setUser(updatedUser);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center">
            <p className="text-destructive mb-4">{error} Please check your connection or try again.</p>
            <Button onClick={loadUserData}>Retry</Button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Family Feed</h2>
            </div>
            
            {posts.length === 0 ? (
              <Card className="p-8 text-center shadow-card bg-gradient-card border-border/20">
                <div className="w-16 h-16 bg-gradient-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Home className="w-8 h-8 text-primary-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">No posts yet. Create the first post!</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post._id} className="p-6 shadow-card bg-gradient-card border-border/20 hover:shadow-glow transition-all duration-300">
                    <div className="flex items-start space-x-4 mb-4">
                      <Avatar className="w-12 h-12 border-2 border-primary/20">
                        <AvatarImage src={post.user.profilePicture} />
                        <AvatarFallback className="bg-gradient-secondary text-primary-foreground font-semibold">
                          {post.user.firstName[0]}{post.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold text-foreground">
                          {post.user.firstName} {post.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {post.content.text && (
                      <p className="text-foreground mb-4 text-lg leading-relaxed">{post.content.text}</p>
                    )}
                    <div className="flex items-center space-x-6 pt-3 border-t border-border/20">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikePost(post._id)}
                        className="flex items-center space-x-2 hover:bg-primary/10 hover:text-primary rounded-xl"
                      >
                        <Heart className="w-5 h-5" />
                        <span className="font-medium">{post.likes.length}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-accent/10 hover:text-accent rounded-xl">
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-medium">{post.comments.length}</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case "create-post":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Create Post</h2>
              <Button variant="outline" onClick={() => setActiveTab("home")}>
                Back to Feed
              </Button>
            </div>
            <Card className="p-4 shadow-card">
              <div className="space-y-4">
                <Textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  className="min-h-32"
                />
                <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                  Create Post
                </Button>
              </div>
            </Card>
          </div>
        );

      case "chat":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Family Chat</h2>
            <Card className="p-4 shadow-card">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((message) => (
                    <div key={message._id} className="flex items-start space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={message.sender.profilePicture} />
                        <AvatarFallback className="text-xs">
                          {message.sender.firstName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">
                          {message.sender.firstName} {message.sender.lastName}
                        </p>
                        <p className="text-sm">{message.content.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex space-x-2 mt-4 pt-4 border-t">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        );

      case "tree":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Family Tree</h2>
            <Card className="p-4 shadow-card">
              <p className="text-muted-foreground">Family tree feature coming soon...</p>
            </Card>
          </div>
        );

      case "memories":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Memories</h2>
            <Card className="p-4 shadow-card">
              <p className="text-muted-foreground">Memories feature coming soon...</p>
            </Card>
          </div>
        );

      case "events":
        if (!user) {
          return (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading user data...</p>
              </div>
            </div>
          );
        }
        return <EventsManager user={user} />;

      case "profile":
        return (
          <Profile 
            user={user} 
            onUserUpdate={handleUserUpdate}
          />
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Beautiful Blue Gradient Header */}
      <header className="bg-gradient-primary text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%227%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="relative px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl">🏠</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Avva Mane</h1>
                <p className="text-white/80 text-sm">Stay connected with loved ones</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="w-12 h-12 border-2 border-white/30 shadow-lg cursor-pointer hover:border-white/50 transition-all duration-200">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback className="bg-white/20 text-white font-bold backdrop-blur-sm">
                      {user.firstName[0]}{user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border/20 shadow-card">
                  <DropdownMenuItem onClick={() => setActiveTab("profile")} className="p-3 hover:bg-secondary/20">
                    <User className="w-5 h-5 mr-3" />
                    <span className="font-medium">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 hover:bg-secondary/20">
                    <Settings className="w-5 h-5 mr-3" />
                    <span className="font-medium">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/30" />
                  <DropdownMenuItem onClick={handleLogout} className="p-3 text-destructive hover:bg-destructive/20 focus:text-destructive">
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 pb-24">
        {renderContent()}
      </div>

      {/* Floating Action Button */}
      {activeTab === "home" && (
        <div className="fixed bottom-20 left-4 z-50">
          <Button 
            onClick={() => setActiveTab("create-post")}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-white"
          >
            <Plus className="w-6 h-6 text-white" />
          </Button>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Dashboard;