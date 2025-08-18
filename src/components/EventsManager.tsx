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
  user: User | null;
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
  // Early return if user is not available
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

      let response;
      if (editingEvent) {
        // Update existing event
        response = await eventsService.updateEvent(editingEvent._id, eventData);
        if (response.success) {
          setEvents(events.map(event => 
            event._id === editingEvent._id ? response.event : event
          ));
          toast({
            title: "Success",
            description: "Event updated successfully!",
          });
        }
      } else {
        // Create new event
        response = await eventsService.createEvent(eventData);
        if (response.success) {
          setEvents([response.event, ...events]);
          toast({
            title: "Success",
            description: "Event created successfully!",
          });
        }
      }

      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: editingEvent ? "Failed to update event" : "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const handleRSVP = async (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    try {
      const response = await eventsService.rsvpEvent(eventId, status);
      if (response.success) {
        toast({
          title: "RSVP Updated",
          description: `You are ${status === 'going' ? 'going' : status === 'maybe' ? 'maybe going' : 'not going'} to this event`,
        });
        
        // Reload events to get updated data from backend
        loadEvents();
      }
    } catch (error) {
      console.error('RSVP error:', error);
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
    try {
      // Handle ISO date format from backend
      let eventDateTime;
      
      // Check if eventDate is already an ISO string (from backend)
      if (eventDate.includes('T') || eventDate.includes('Z')) {
        // It's an ISO string, parse just the date part and add time
        const dateOnly = eventDate.split('T')[0];
        eventDateTime = new Date(`${dateOnly}T${eventTime}`);
      } else if (eventDate.includes('/')) {
        // Format: MM/DD/YYYY or DD/MM/YYYY
        const [month, day, year] = eventDate.split('/');
        eventDateTime = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${eventTime}`);
      } else if (eventDate.includes('-')) {
        // Format: YYYY-MM-DD
        eventDateTime = new Date(`${eventDate}T${eventTime}`);
      } else {
        // Try to parse as is
        eventDateTime = new Date(`${eventDate}T${eventTime}`);
      }
      
      // Validate the date
      if (isNaN(eventDateTime.getTime())) {
        console.error('Invalid date created:', { eventDate, eventTime, eventDateTime });
        return "Invalid date";
      }
      
      const now = new Date();
      const diff = eventDateTime.getTime() - now.getTime();
      
      if (diff <= 0) return "Event ended";
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    } catch (error) {
      console.error('Error calculating time remaining:', error, { eventDate, eventTime });
      return "Time calculation error";
    }
  };

  const isEventActive = (eventDate: string, eventTime: string) => {
    try {
      // Handle different date formats
      let eventDateTime;
      
      if (eventDate.includes('/')) {
        // Format: MM/DD/YYYY or DD/MM/YYYY
        const [month, day, year] = eventDate.split('/');
        eventDateTime = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${eventTime}`);
      } else if (eventDate.includes('-')) {
        // Format: YYYY-MM-DD
        eventDateTime = new Date(`${eventDate}T${eventTime}`);
      } else {
        // Try to parse as is
        eventDateTime = new Date(`${eventDate}T${eventTime}`);
      }
      
      const now = new Date();
      const isActive = eventDateTime > now;
      
      console.log('Event Active Check:', {
        eventDate,
        eventTime,
        eventDateTime: eventDateTime.toISOString(),
        now: now.toISOString(),
        isActive
      });
      
      return isActive;
    } catch (error) {
      console.error('Error parsing event date:', error, { eventDate, eventTime });
      // If there's an error parsing, assume it's active to be safe
      return true;
    }
  };

  const getUserRSVP = (event: Event) => {
    return event.attendees.find(attendee => {
      const attendeeUserId = (attendee.user as any)._id || attendee.user.id;
      return attendeeUserId === user?.id;
    })?.status || 'pending';
  };

  const getAttendeesCounts = (event: Event) => {
    const going = event.attendees.filter(a => a.status === 'going').length;
    const maybe = event.attendees.filter(a => a.status === 'maybe').length;
    const notGoing = event.attendees.filter(a => a.status === 'not_going').length;
    return { going, maybe, notGoing };
  };

  const canEditEvent = (event: Event) => {
    const createdById = (event.createdBy as any)._id || event.createdBy.id;
    const canEdit = createdById === user?.id;
    console.log('Can edit event:', {
      eventCreatedBy: event.createdBy,
      currentUser: user,
      canEdit
    });
    return canEdit;
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
              <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
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
                  {editingEvent ? 'Update Event' : 'Create Event'}
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
                "p-4 shadow-lg border border-blue-200/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden",
                !isActive && "opacity-75 bg-gray-50/50",
                "bg-gradient-to-br from-white to-blue-50/30"
              )}>
                {/* Animated Countdown in Top Right */}
                <div className="absolute top-3 right-3 flex flex-col items-end">
                  {isActive ? (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md animate-pulse">
                      {timeRemaining}
                    </div>
                  ) : (
                    <div className="bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Event Ended
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between mb-4 mr-20">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0",
                      `bg-gradient-to-r ${eventTypeColors[event.eventType as keyof typeof eventTypeColors]}`
                    )}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-extrabold text-gray-900 mb-1 truncate" style={{fontFamily: 'Poppins, sans-serif'}}>{event.title}</h3>
                      <div className="flex flex-col space-y-1 text-xs text-gray-600">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="font-medium" style={{fontFamily: 'Inter, sans-serif'}}>{format(new Date(event.eventDate), "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span className="font-medium" style={{fontFamily: 'Inter, sans-serif'}}>{event.eventTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {canEdit && isActive && (
                    <div className="flex space-x-1 absolute top-12 right-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                        onClick={() => {
                          setEditingEvent(event);
                          setCreateForm({
                            title: event.title,
                            description: event.description || "",
                            eventDate: event.eventDate,
                            eventTime: event.eventTime,
                            location: { address: event.location?.address || "" },
                            eventType: event.eventType,
                            images: event.images || []
                          });
                          setSelectedDate(new Date(event.eventDate));
                          setShowCreateDialog(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {event.location?.address && (
                  <div className="flex items-center space-x-2 text-xs text-gray-600 mb-3">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate" style={{fontFamily: 'Inter, sans-serif'}}>{event.location.address}</span>
                  </div>
                )}

                {event.description && (
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2" style={{fontFamily: 'Open Sans, sans-serif'}}>{event.description}</p>
                )}

                <div className="text-xs text-gray-500 mb-4" style={{fontFamily: 'Roboto, sans-serif'}}>
                  Hosted by <span className="font-semibold text-blue-600">{event.createdBy.firstName} {event.createdBy.lastName}</span>
                </div>

                {/* RSVP Section - Enhanced mobile design */}
                <div className="border-t border-blue-100 pt-4">
                  {isActive && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900 text-sm" style={{fontFamily: 'Poppins, sans-serif'}}>Will you attend?</h4>
                        <Badge 
                          variant={userRSVP === 'going' ? 'default' : userRSVP === 'maybe' ? 'secondary' : userRSVP === 'not_going' ? 'destructive' : 'outline'}
                          className="text-xs font-medium"
                        >
                          {userRSVP === 'going' ? '✓ Going' : userRSVP === 'maybe' ? '? Maybe' : userRSVP === 'not_going' ? '✗ Can\'t Go' : 'No Response'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={userRSVP === 'going' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleRSVP(event._id, 'going')}
                          className="flex items-center justify-center gap-1 text-xs font-semibold h-9 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-green-300"
                          style={{fontFamily: 'Inter, sans-serif'}}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Going
                        </Button>
                        <Button
                          variant={userRSVP === 'maybe' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleRSVP(event._id, 'maybe')}
                          className="flex items-center justify-center gap-1 text-xs font-semibold h-9 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 border-yellow-300"
                          style={{fontFamily: 'Inter, sans-serif'}}
                        >
                          <HelpCircle className="w-3 h-3" />
                          Maybe
                        </Button>
                        <Button
                          variant={userRSVP === 'not_going' ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={() => handleRSVP(event._id, 'not_going')}
                          className="flex items-center justify-center gap-1 text-xs font-semibold h-9 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border-red-300"
                          style={{fontFamily: 'Inter, sans-serif'}}
                        >
                          <XCircle className="w-3 h-3" />
                          Can't Go
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Simple Attendee Summary */}
                  <div className="space-y-3 mt-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 font-medium mb-2" style={{fontFamily: 'Inter, sans-serif'}}>
                        {counts.going} Going • {counts.maybe} Maybe • {counts.notGoing} Can't Go
                      </div>
                    </div>

                    {/* Simple Attendee Lists */}
                    {event.attendees.length > 0 && (
                      <div className="space-y-2">
                        {/* Going attendees */}
                        {event.attendees.filter(a => a.status === 'going').length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-700 mr-2" style={{fontFamily: 'Inter, sans-serif'}}>
                              Going:
                            </span>
                            <span className="text-xs text-gray-600" style={{fontFamily: 'Inter, sans-serif'}}>
                              {event.attendees
                                .filter(a => a.status === 'going')
                                .map(attendee => `${attendee.user.firstName} ${attendee.user.lastName}`)
                                .join(', ')}
                            </span>
                          </div>
                        )}
                        
                        {/* Maybe attendees */}
                        {event.attendees.filter(a => a.status === 'maybe').length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-700 mr-2" style={{fontFamily: 'Inter, sans-serif'}}>
                              Maybe:
                            </span>
                            <span className="text-xs text-gray-600" style={{fontFamily: 'Inter, sans-serif'}}>
                              {event.attendees
                                .filter(a => a.status === 'maybe')
                                .map(attendee => `${attendee.user.firstName} ${attendee.user.lastName}`)
                                .join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Not going attendees */}
                        {event.attendees.filter(a => a.status === 'not_going').length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-700 mr-2" style={{fontFamily: 'Inter, sans-serif'}}>
                              Can't Go:
                            </span>
                            <span className="text-xs text-gray-600" style={{fontFamily: 'Inter, sans-serif'}}>
                              {event.attendees
                                .filter(a => a.status === 'not_going')
                                .map(attendee => `${attendee.user.firstName} ${attendee.user.lastName}`)
                                .join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsManager;