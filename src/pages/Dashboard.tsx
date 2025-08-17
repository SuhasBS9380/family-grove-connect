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
import { useToast } from "@/hooks/use-toast";
import { authService, User as UserType } from "@/services/authService";
import { postsService, Post } from "@/services/postsService";
import { messagesService, Message } from "@/services/messagesService";
import { eventsService, Event } from "@/services/eventsService";

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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Family Feed</h2>
              <Button size="sm" onClick={() => setActiveTab("create-post")}>
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>
            
            {posts.length === 0 ? (
              <Card className="p-8 text-center shadow-card">
                <p className="text-muted-foreground">No posts yet. Create the first post!</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post._id} className="p-4 shadow-card">
                    <div className="flex items-start space-x-3 mb-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={post.user.profilePicture} />
                        <AvatarFallback>
                          {post.user.firstName[0]}{post.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {post.user.firstName} {post.user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {post.content.text && (
                      <p className="text-foreground mb-3">{post.content.text}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikePost(post._id)}
                        className="flex items-center space-x-1"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{post.likes.length}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments.length}</span>
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
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Events</h2>
            {events.length === 0 ? (
              <Card className="p-8 text-center shadow-card">
                <p className="text-muted-foreground">No upcoming events</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event._id} className="p-4 shadow-card">
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}
                    </p>
                    {event.description && (
                      <p className="text-sm mt-2">{event.description}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <div className="bg-gradient-primary p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 border-2 border-primary-foreground">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback className="bg-primary-light text-primary-dark font-semibold">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-primary-foreground font-semibold">
                Hi {user.firstName}! 👋
              </p>
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