import React, { useState } from 'react';
import { 
  Leaf, 
  HelpCircle, 
  Book, 
  Sprout, 
  FileQuestion, 
  Wrench, 
  LayoutDashboard, 
  CheckSquare, 
  BarChart3,
  MessageSquare,
  Mail,
  ExternalLink,
  Search
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground max-w-2xl">
          Get help with using Grow Manager. Find answers to common questions, troubleshooting guides, 
          and learn how to get the most out of the application.
        </p>
      </div>
      
      {/* Search Section */}
      <div className="w-full max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for help topics..."
            className="pl-10 pr-4 py-6"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Quick Links Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/10 hover:bg-primary/10 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              New to Grow Manager? Learn the basics and set up your first grow.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border-secondary/10 hover:bg-secondary/10 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              FAQs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Find answers to common questions about plants, grows, and features.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/10 hover:bg-destructive/10 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Resolve common issues and get your setup working smoothly.
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="features" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="features">Features Guide</TabsTrigger>
          <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
        </TabsList>
        
        {/* Features Guide Content */}
        <TabsContent value="features" className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Features Guide</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dashboard Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  Dashboard
                </CardTitle>
                <CardDescription>Your grow monitoring central hub</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border border-border w-full overflow-hidden">
                  <img 
                    src="/dashboard.png" 
                    alt="Dashboard preview" 
                    className="w-full h-auto object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  The Dashboard provides a quick overview of all your active grows, upcoming tasks, and recent activities. 
                  Monitor environmental data, track plant health, and stay on top of your garden.
                </p>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>View all active grows at a glance</li>
                  <li>Track upcoming and overdue tasks</li>
                  <li>Monitor environmental conditions</li>
                  <li>See recent activity in your garden</li>
                </ul>
              </CardContent>
            </Card>

            {/* Grows Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-primary" />
                  Grows
                </CardTitle>
                <CardDescription>Track and manage your growing projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border border-border w-full overflow-hidden">
                  <img 
                    src="/grows.png" 
                    alt="Grows preview" 
                    className="w-full h-auto object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Create and manage your growing projects. Track progress through different growth stages, 
                  monitor environmental data, and keep all your plants organized.
                </p>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>Create custom grows with specific environmental targets</li>
                  <li>Track progress through seedling, vegetative, and flowering phases</li>
                  <li>Manage growing medium, nutrients, and strains</li>
                  <li>View detailed environmental data over time</li>
                </ul>
              </CardContent>
            </Card>

            {/* Tasks Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  Tasks
                </CardTitle>
                <CardDescription>Organize your grow maintenance schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border border-border w-full overflow-hidden">
                  <img 
                    src="/tasks.png" 
                    alt="Tasks preview" 
                    className="w-full h-auto object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Create and manage tasks to keep your garden maintenance on schedule. Set priorities, due dates, 
                  and track completion of watering, feeding, pruning, and more.
                </p>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>Create tasks with custom priorities and due dates</li>
                  <li>Organize tasks by grow or plant</li>
                  <li>Track completed vs. outstanding tasks</li>
                  <li>Get reminders for upcoming and overdue tasks</li>
                </ul>
              </CardContent>
            </Card>

            {/* Analytics Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Analytics
                </CardTitle>
                <CardDescription>Visualize growth data and trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border border-border w-full overflow-hidden">
                  <img 
                    src="/analytics.png" 
                    alt="Analytics preview" 
                    className="w-full h-auto object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Analyze your grow data to optimize your gardening conditions. Track environmental trends, 
                  plant growth rates, and historical performance data.
                </p>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>View interactive charts of temperature and humidity data</li>
                  <li>Track plant growth rates over time</li>
                  <li>Compare performance across different grows</li>
                  <li>Identify optimal growing conditions based on historical data</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* FAQ Content */}
        <TabsContent value="faq" className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Getting Started</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="starting-first-grow">
                  <AccordionTrigger>How do I start my first grow?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      To start your first grow:
                    </p>
                    <ol className="text-sm list-decimal pl-4 space-y-1">
                      <li>Navigate to the Grows page</li>
                      <li>Click the "Create Grow" button</li>
                      <li>Fill in details like name, description, growing medium, and environment</li>
                      <li>Add strains you'll be growing</li>
                      <li>Set target environmental conditions</li>
                      <li>Click "Create" to save your new grow</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="adding-plants">
                  <AccordionTrigger>How do I add plants to my grow?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      You can add plants to an existing grow in two ways:
                    </p>
                    <ol className="text-sm list-decimal pl-4 space-y-1">
                      <li>From the Grows detail page, click "Add Plant"</li>
                      <li>Or navigate to the Plants page, click "Add Plant", and select the grow</li>
                    </ol>
                    <p className="text-sm text-muted-foreground mt-2">
                      You'll need to provide a name and select a strain from the ones you've already 
                      added to the grow. You can also add optional details like initial height and notes.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tracking-progress">
                  <AccordionTrigger>How do I track my plants' progress?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Track progress by regularly adding measurements and photos:
                    </p>
                    <ul className="text-sm list-disc pl-4 space-y-1 mt-2">
                      <li>Navigate to a plant's detail page</li>
                      <li>Add height measurements and other data using the Measurements tab</li>
                      <li>Upload photos to visually document growth using the Photos tab</li>
                      <li>Add notes about plant health, treatments, or observations</li>
                      <li>View growth trends in the Analytics section</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <h3 className="text-xl font-medium mt-6">Account & Settings</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="change-profile">
                  <AccordionTrigger>How do I change my profile information?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      To update your profile:
                    </p>
                    <ol className="text-sm list-decimal pl-4 space-y-1 mt-2">
                      <li>Click on your avatar in the top right corner</li>
                      <li>Select "Settings" from the dropdown menu</li>
                      <li>In the Profile tab, modify your information</li>
                      <li>Click "Save changes" to update your profile</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="notifications">
                  <AccordionTrigger>How do I manage notifications?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Manage notifications in Settings:
                    </p>
                    <ol className="text-sm list-decimal pl-4 space-y-1 mt-2">
                      <li>Go to the Settings page</li>
                      <li>Select the "Notifications" tab</li>
                      <li>Toggle each notification type on or off</li>
                      <li>Your preferences are saved automatically</li>
                    </ol>
                    <p className="text-sm text-muted-foreground mt-2">
                      You can enable/disable notifications for task reminders, environmental alerts, 
                      and growth updates.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Features & Functionality</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="environmental-data">
                  <AccordionTrigger>How do I record environmental data?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Environmental data can be recorded from a grow's detail page:
                    </p>
                    <ol className="text-sm list-decimal pl-4 space-y-1 mt-2">
                      <li>Navigate to the specific grow</li>
                      <li>Click on the "Environmental" tab</li>
                      <li>Click "Add Data" to record temperature, humidity, etc.</li>
                      <li>You can view trends in charts on the same page</li>
                    </ol>
                    <p className="text-sm text-muted-foreground mt-2">
                      <Badge variant="outline" className="mr-1">Premium</Badge>
                      Premium accounts can connect sensors for automatic data logging.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="batch-care-activities">
                  <AccordionTrigger>How do I record care activities for multiple plants at once?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      The batch care activity feature allows you to record the same care activity for multiple plants simultaneously:
                    </p>
                    <ol className="text-sm list-decimal pl-4 space-y-1 mt-2">
                      <li>Navigate to a grow's detail page</li>
                      <li>Click the "Batch Care Activities" button</li>
                      <li>Select the plants you want to include using the checkboxes (or use "Select All")</li>
                      <li>Choose the activity type (watering, feeding, top dressing, or other)</li>
                      <li>Fill in the details like amount, unit, and product name</li>
                      <li>Add any notes if needed</li>
                      <li>Click "Record for X Plants" to save the activity for all selected plants</li>
                    </ol>
                    <p className="text-sm text-muted-foreground mt-2">
                      <Badge variant="outline" className="mr-1">Pro</Badge>
                      This feature is available for Pro tier and above users.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tasks-management">
                  <AccordionTrigger>How do I manage recurring tasks?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Create recurring tasks for regular maintenance:
                    </p>
                    <ol className="text-sm list-decimal pl-4 space-y-1 mt-2">
                      <li>Go to the Tasks page</li>
                      <li>Click "New Task"</li>
                      <li>Fill in the task details</li>
                      <li>Enable the "Repeating" option</li>
                      <li>Select frequency (daily, weekly, etc.)</li>
                      <li>Save the task</li>
                    </ol>
                    <p className="text-sm text-muted-foreground mt-2">
                      When you mark a recurring task complete, a new instance will automatically
                      be created for the next occurrence.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="photo-documentation">
                  <AccordionTrigger>How do I track plant growth with photos?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Document your plants' development with photos:
                    </p>
                    <ol className="text-sm list-decimal pl-4 space-y-1 mt-2">
                      <li>Go to a plant's detail page</li>
                      <li>Select the "Photos" tab</li>
                      <li>Click "Upload Photo"</li>
                      <li>Select an image from your device</li>
                    </ol>
                    <p className="text-sm text-muted-foreground mt-2">
                      Photos are organized chronologically, allowing you to see your plant's
                      progression over time. You can view them as a timeline or slideshow.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <h3 className="text-xl font-medium mt-6">Troubleshooting</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="data-not-saving">
                  <AccordionTrigger>My data isn't saving correctly</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      If you're experiencing issues with data not saving:
                    </p>
                    <ul className="text-sm list-disc pl-4 space-y-1 mt-2">
                      <li>Check your internet connection</li>
                      <li>Try refreshing the page</li>
                      <li>Log out and log back in</li>
                      <li>Clear your browser cache</li>
                      <li>Try using a different browser</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      If problems persist, please contact support with details about what
                      you were trying to save and any error messages you saw.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="photos-upload">
                  <AccordionTrigger>I can't upload photos</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      If you're having trouble uploading photos:
                    </p>
                    <ul className="text-sm list-disc pl-4 space-y-1 mt-2">
                      <li>Ensure the image is under 5MB in size</li>
                      <li>Verify it's in a supported format (JPG, PNG, GIF)</li>
                      <li>Check your internet connection</li>
                      <li>Try using a different browser</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      If you're still unable to upload photos, try compressing the image
                      to a smaller file size before uploading.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </TabsContent>
        
        {/* Contact Support Content */}
        <TabsContent value="contact" className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Contact Support</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Chat Support
                </CardTitle>
                <CardDescription>Get help via live chat</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Our support team is available via live chat during business hours:
                </p>
                <p className="text-sm">
                  <strong>Hours:</strong> Monday - Friday, 9am - 5pm PST
                </p>
                <Button className="w-full">Start Chat</Button>
                <p className="text-xs text-muted-foreground">
                  <Badge variant="outline" className="mr-1">Premium</Badge>
                  Premium users receive priority support and extended hours.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email Support
                </CardTitle>
                <CardDescription>Send us a message</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  For non-urgent issues or detailed questions, send us an email:
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> support@growmanager.com
                </p>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24-48 business hours.
                </p>
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-medium mb-4">Community Resources</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Leaf className="h-4 w-4 mr-2 text-green-500" />
                    Growing Guides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Detailed guides for growing different plants and strains.
                  </p>
                  <Button variant="link" className="h-8 p-0 mt-2" asChild>
                    <a href="#" className="flex items-center">
                      View Guides
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                    Community Forum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Connect with other growers and share experiences.
                  </p>
                  <Button variant="link" className="h-8 p-0 mt-2" asChild>
                    <a href="#" className="flex items-center">
                      Join Discussion
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Book className="h-4 w-4 mr-2 text-amber-500" />
                    Knowledge Base
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Extensive library of articles, tutorials, and resources.
                  </p>
                  <Button variant="link" className="h-8 p-0 mt-2" asChild>
                    <a href="#" className="flex items-center">
                      Browse Articles
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 