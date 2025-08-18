import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  Users, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Timer,
  Edit,
  Trash2,
  Heart,
  PartyPopper,
  Gift,
  Cake,
  Sparkles,
  Building2,
  Coffee
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { eventsService, Event, CreateEventRequest } from "@/services/eventsService";
import { User } from "@/services/authService";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EventsManagerProps {
  user: User;
}

const eventTypeIcons = {
  birthday: Cake,
  anniversary: Heart,
  reunion: Users,
  celebration: PartyPopper,
  meeting: Building2,
  other: Sparkles
};

const eventTypeColors = {
  birthday: "from-pink-500 to-rose-500",
  anniversary: "from-red-500 to-pink-500", 
  reunion: "from-blue-500 to-indigo-500",
  celebration: "from-purple-500 to-violet-500",
  meeting: "from-gray-500 to-slate-500",
  other: "from-orange-500 to-amber-500"
};

const EventsManager = ({ user }: EventsManagerProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  // Create event form state
  const [createForm, setCreateForm] = useState<CreateEventRequest>({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    location: { address: "" },
    eventType: "other",
    images: []
  });
  const [selectedDate, setSelectedDate] = useState<Date>();

  useEffect(() => {
    loadEvents();
    // Auto-refresh every minute for countdown updates
    const interval = setInterval(loadEvents, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    try {
      const response = await eventsService.getEvents(false); // Get all events
      if (response.success) {
        setEvents(response.events);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!createForm.title || !selectedDate || !createForm.eventTime) {
      toast({
        title: "Error", 
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const eventData = {
        ...createForm,
        eventDate: selectedDate.toISOString().split('T')[0]
      };

      const response = await eventsService.createEvent(eventData);
      if (response.success) {
        setEvents([response.event, ...events]);
        setShowCreateDialog(false);
        resetForm();
        toast({
          title: "Success",
          description: "Event created successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const handleRSVP = async (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    try {
      const response = await eventsService.rsvpEvent(eventId, status);
      if (response.success) {
        loadEvents(); // Refresh to show updated RSVP
        toast({
          title: "RSVP Updated",
          description: `You are ${status.replace('_', ' ')} to this event`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await eventsService.deleteEvent(eventId);
      if (response.success) {
        setEvents(events.filter(event => event._id !== eventId));
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setCreateForm({
      title: "",
      description: "",
      eventDate: "",
      eventTime: "",
      location: { address: "" },
      eventType: "other",
      images: []
    });
    setSelectedDate(undefined);
    setEditingEvent(null);
  };

  const calculateTimeRemaining = (eventDate: string, eventTime: string) => {
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    const now = new Date();
    const diff = eventDateTime.getTime() - now.getTime();

    if (diff <= 0) return "Event ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isEventActive = (eventDate: string, eventTime: string) => {
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    return eventDateTime > new Date();
  };

  const getUserRSVP = (event: Event) => {
    return event.attendees.find(attendee => attendee.user.id === user.id)?.status || 'pending';
  };

  const getAttendeesCounts = (event: Event) => {
    const going = event.attendees.filter(a => a.status === 'going').length;
    const maybe = event.attendees.filter(a => a.status === 'maybe').length;
    const notGoing = event.attendees.filter(a => a.status === 'not_going').length;
    return { going, maybe, notGoing };
  };

  const canEditEvent = (event: Event) => {
    return event.createdBy.id === user.id;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Family Events</h2>
          <p className="text-muted-foreground">Create and manage family gatherings</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                  placeholder="Birthday party, Anniversary..."
                />
              </div>

              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={createForm.eventType} onValueChange={(value: any) => setCreateForm({...createForm, eventType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">🎂 Birthday</SelectItem>
                    <SelectItem value="anniversary">💕 Anniversary</SelectItem>
                    <SelectItem value="reunion">👥 Family Reunion</SelectItem>
                    <SelectItem value="celebration">🎉 Celebration</SelectItem>
                    <SelectItem value="meeting">🏢 Meeting</SelectItem>
                    <SelectItem value="other">✨ Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Event Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="time">Event Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={createForm.eventTime}
                  onChange={(e) => setCreateForm({...createForm, eventTime: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={createForm.location?.address || ""}
                  onChange={(e) => setCreateForm({
                    ...createForm, 
                    location: { address: e.target.value }
                  })}
                  placeholder="Venue address..."
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  placeholder="Event details..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleCreateEvent} className="flex-1">
                  Create Event
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <Card className="p-12 text-center shadow-card bg-gradient-card border-border/20">
          <div className="w-20 h-20 bg-gradient-secondary rounded-full mx-auto mb-6 flex items-center justify-center">
            <CalendarIcon className="w-10 h-10 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">No Events Yet</h3>
          <p className="text-muted-foreground mb-6">Create your first family event and bring everyone together!</p>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            Create First Event
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => {
            const IconComponent = eventTypeIcons[event.eventType as keyof typeof eventTypeIcons];
            const timeRemaining = calculateTimeRemaining(event.eventDate, event.eventTime);
            const isActive = isEventActive(event.eventDate, event.eventTime);
            const userRSVP = getUserRSVP(event);
            const counts = getAttendeesCounts(event);
            const canEdit = canEditEvent(event);

            return (
              <Card key={event._id} className={cn(
                "p-6 shadow-card border-border/20 hover:shadow-glow transition-all duration-300",
                !isActive && "opacity-75 bg-muted/20"
              )}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md",
                      `bg-gradient-to-r ${eventTypeColors[event.eventType as keyof typeof eventTypeColors]}`
                    )}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">{event.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{format(new Date(event.eventDate), "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{event.eventTime}</span>
                        </div>
                        {isActive && (
                          <div className="flex items-center space-x-1 text-primary font-medium">
                            <Timer className="w-4 h-4" />
                            <span>{timeRemaining}</span>
                          </div>
                        )}
                      </div>
                      {event.location?.address && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location.address}</span>
                        </div>
                      )}
                      {event.description && (
                        <p className="text-foreground text-sm mb-3">{event.description}</p>
                      )}
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>Hosted by {event.createdBy.firstName} {event.createdBy.lastName}</span>
                      </div>
                    </div>
                  </div>
                  
                  {canEdit && isActive && (
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* RSVP Section */}
                {isActive && (
                  <div className="border-t border-border/20 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-foreground">Your Response</h4>
                      <Badge variant={userRSVP === 'going' ? 'default' : userRSVP === 'maybe' ? 'secondary' : userRSVP === 'not_going' ? 'destructive' : 'outline'}>
                        {userRSVP === 'going' ? 'Going' : userRSVP === 'maybe' ? 'Maybe' : userRSVP === 'not_going' ? 'Not Going' : 'Pending'}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2 mb-4">
                      <Button
                        variant={userRSVP === 'going' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleRSVP(event._id, 'going')}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Going
                      </Button>
                      <Button
                        variant={userRSVP === 'maybe' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleRSVP(event._id, 'maybe')}
                        className="flex-1"
                      >
                        <HelpCircle className="w-4 h-4 mr-1" />
                        Maybe
                      </Button>
                      <Button
                        variant={userRSVP === 'not_going' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleRSVP(event._id, 'not_going')}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Can't Go
                      </Button>
                    </div>

                    {/* Attendee Summary */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex space-x-4">
                        <span className="text-green-600 font-medium">{counts.going} Going</span>
                        <span className="text-yellow-600 font-medium">{counts.maybe} Maybe</span>
                        <span className="text-red-600 font-medium">{counts.notGoing} Can't Go</span>
                      </div>
                      
                      {/* Show attending members */}
                      {event.attendees.filter(a => a.status === 'going').length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-muted-foreground">Going:</span>
                          <div className="flex -space-x-1">
                            {event.attendees
                              .filter(a => a.status === 'going')
                              .slice(0, 3)
                              .map((attendee) => (
                                <Avatar key={attendee.user.id} className="w-6 h-6 border-2 border-background">
                                  <AvatarImage src={attendee.user.profilePicture} />
                                  <AvatarFallback className="text-xs">
                                    {attendee.user.firstName[0]}{attendee.user.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            {event.attendees.filter(a => a.status === 'going').length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                                +{event.attendees.filter(a => a.status === 'going').length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!isActive && (
                  <div className="border-t border-border/20 pt-4">
                    <Badge variant="secondary" className="bg-muted">
                      Event Ended
                    </Badge>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsManager;