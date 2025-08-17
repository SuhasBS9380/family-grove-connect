import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Calendar, 
  Users, 
  MapPin, 
  Edit2, 
  Save, 
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService, User as UserType } from "@/services/authService";

interface ProfileProps {
  user: UserType | null;
  onUserUpdate: (user: UserType) => void;
}

function Profile({ user, onUserUpdate }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: "" as 'male' | 'female' | 'other' | ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || ""
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender === "" ? undefined : formData.gender as 'male' | 'female' | 'other'
      };

      const response = await authService.updateProfile(updateData);
      
      if (response.success && response.user) {
        onUserUpdate(response.user);
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || ""
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-full overflow-hidden">
      <Card className="border border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-white shadow-md">
        <CardHeader className="pb-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2 truncate">
              <User className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Profile</span>
            </CardTitle>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 flex-shrink-0"
              >
                <Edit2 className="w-4 h-4" />
                <span className="hidden xs:inline ml-1">Edit</span>
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-2"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4">
          {/* Profile Avatar Section */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Avatar className="w-16 h-16 border-2 border-blue-200">
                <AvatarImage src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                  {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1 truncate">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                  Member
                </Badge>
                {user.gender && (
                  <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                    {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" />
                  First Name
                </Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="border-blue-200 focus:border-blue-400 text-sm"
                    placeholder="Enter first name"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded-md border text-sm text-gray-900 break-words">
                    {user.firstName || "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" />
                  Last Name
                </Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="border-blue-200 focus:border-blue-400 text-sm"
                    placeholder="Enter last name"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded-md border text-sm text-gray-900 break-words">
                    {user.lastName || "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="border-blue-200 focus:border-blue-400 text-sm"
                    placeholder="Enter email address"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded-md border text-sm text-gray-900 break-all">
                    {user.email || "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </Label>
                {isEditing ? (
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className="border-blue-200 focus:border-blue-400 text-sm"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded-md border text-sm text-gray-900">
                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="gender" className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4" />
                  Gender
                </Label>
                {isEditing ? (
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => handleInputChange("gender", value)}
                  >
                    <SelectTrigger className="border-blue-200 focus:border-blue-400 text-sm">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 bg-gray-50 rounded-md border text-sm text-gray-900">
                    {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4" />
                  Member Since
                </Label>
                <div className="p-2 bg-gray-50 rounded-md border text-sm text-gray-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
