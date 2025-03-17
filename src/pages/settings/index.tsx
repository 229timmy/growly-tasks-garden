import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ProfilesService } from '@/lib/api/profiles';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { useUserTier } from '@/hooks/use-user-tier';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ProfileUpdate } from '@/types/common';

const profilesService = new ProfilesService();

// Store notification preferences in localStorage
const NOTIFICATION_PREFERENCES_KEY = 'notification_preferences';
const DEFAULT_NOTIFICATION_PREFERENCES = {
  tasks: true,
  environmental: true,
  growth: false,
};

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { tier } = useUserTier();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState(() => {
    const saved = localStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATION_PREFERENCES;
  });

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profilesService.getCurrentProfile(),
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: (data: ProfileUpdate) => 
      profilesService.updateProfile(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error('Update profile error:', error);
    },
  });
  
  // Upload avatar mutation
  const uploadAvatar = useMutation({
    mutationFn: (file: File) => 
      profilesService.uploadAvatar(user!.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Avatar updated successfully');
      setIsUploadingAvatar(false);
    },
    onError: (error) => {
      toast.error('Failed to upload avatar');
      console.error('Avatar upload error:', error);
      setIsUploadingAvatar(false);
    },
  });

  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: ProfileUpdate = {
      full_name: formData.get('fullName') as string,
      email: formData.get('email') as string,
    };
    await updateProfile.mutateAsync(data);
  };

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }
    
    setIsUploadingAvatar(true);
    uploadAvatar.mutate(file);
    
    // Reset the input
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };
  
  // Handle avatar button click
  const handleAvatarButtonClick = () => {
    avatarInputRef.current?.click();
  };

  // Handle notification preferences
  const handleNotificationChange = async (key: string, enabled: boolean) => {
    const newPreferences = {
      ...notificationPreferences,
      [key]: enabled,
    };
    setNotificationPreferences(newPreferences);
    localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(newPreferences));
    toast.success(`${key} notifications ${enabled ? 'enabled' : 'disabled'}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and avatar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input 
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      className="mb-2"
                      onClick={handleAvatarButtonClick}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Change Avatar'
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, GIF or PNG. Max size of 2MB.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      defaultValue={profile?.full_name || ''}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={profile?.email || ''}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about upcoming and overdue tasks.
                    </p>
                  </div>
                  <Switch
                    checked={notificationPreferences.tasks}
                    onCheckedChange={(checked) => handleNotificationChange('tasks', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Environmental Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get alerts when environmental conditions are outside optimal ranges.
                    </p>
                  </div>
                  <Switch
                    checked={notificationPreferences.environmental}
                    onCheckedChange={(checked) => handleNotificationChange('environmental', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Growth Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about significant growth milestones.
                    </p>
                  </div>
                  <Switch
                    checked={notificationPreferences.growth}
                    onCheckedChange={(checked) => handleNotificationChange('growth', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between dark and light mode.
                    </p>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">User Tier:</p>
                  <span className="text-sm capitalize">{tier}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 