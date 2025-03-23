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
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import type { ProfileUpdate } from '@/types/common';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { StripeService } from '@/lib/api/stripe';
import { supabase } from '@/lib/supabase';

const profilesService = new ProfilesService();
const stripeService = new StripeService();

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

  const handleUpgradeClick = async (planName: string) => {
    try {
      // Get the price ID for the selected plan
      const { data: planData } = await supabase
        .from('subscription_plans')
        .select('stripe_price_id')
        .eq('name', planName.toLowerCase())
        .single();

      if (!planData?.stripe_price_id) {
        toast.error('Invalid plan selected');
        return;
      }

      // Create checkout session
      const { url } = await stripeService.createCheckoutSession(
        user!.id,
        planData.stripe_price_id,
        window.location.href
      );

      // Redirect to checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout process');
    }
  };

  const handleManageBilling = async () => {
    try {
      // For users without an active subscription, redirect to upgrade flow
      if (tier === 'free') {
        await handleUpgradeClick('premium');
        return;
      }

      const { url } = await stripeService.createPortalSession(
        user!.id,
        window.location.href
      );

      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Error opening billing portal:', error);
      if (error?.message === 'No Stripe customer found') {
        // If no customer record exists, redirect to upgrade flow
        toast.info('Please start a subscription to access billing settings');
        await handleUpgradeClick('premium');
      } else {
        toast.error('Failed to open billing portal');
      }
    }
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
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
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
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Update your password and manage security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>
                View and manage your subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div>
                    <h3 className="text-xl font-semibold capitalize mb-1">{tier} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {tier === 'free' && 'Basic features for hobbyists and beginners'}
                      {tier === 'premium' && 'Advanced features for serious growers'}
                      {tier === 'enterprise' && 'Full features for professional operations'}
                    </p>
                  </div>
                  {tier === 'free' && (
                    <Button asChild onClick={() => handleUpgradeClick('premium')}>
                      <Link to="#">Upgrade Plan</Link>
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Your Plan Features:</h4>
                  <ul className="space-y-3">
                    {tier === 'free' && (
                      <>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          1 active grow
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          4 plants per grow
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Basic tracking
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Limited task management
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Standard measurements
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Community support
                        </li>
                      </>
                    )}
                    {tier === 'premium' && (
                      <>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          4 active grows
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          6 plants per grow
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Advanced tracking
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Full task management
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Batch measurements
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Environmental alerts
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Priority support
                        </li>
                      </>
                    )}
                    {tier === 'enterprise' && (
                      <>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          10 active grows
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          20 plants per grow
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Custom features
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          White labeling
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          API access
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Dedicated support
                        </li>
                        <li className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Advanced analytics
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {tier !== 'free' && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-2">Subscription Management</h4>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={handleManageBilling}>
                        Manage Billing
                      </Button>
                      {tier === 'premium' && (
                        <Button 
                          variant="outline" 
                          onClick={() => handleUpgradeClick('enterprise')}
                        >
                          Upgrade to Enterprise
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="text-destructive"
                        onClick={handleManageBilling}
                      >
                        Manage Subscription
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 