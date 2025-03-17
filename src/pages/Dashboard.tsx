import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  LayoutDashboard, 
  Leaf, 
  Plus, 
  Sprout, 
  Thermometer, 
  Clock, 
  CheckSquare 
} from "lucide-react";
import GrowCard from "@/components/dashboard/GrowCard";
import { TaskItem } from "@/components/tasks/TaskItem";
import StatsCard from "@/components/dashboard/StatsCard";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";

// Sample data
const grows = [
  {
    id: "grow-1",
    name: "Northern Lights",
    stage: "vegetation",
    startDate: "2023-05-10",
    daysActive: 35,
    plantCount: 4,
    temperature: 23.5,
    humidity: 65,
    lastUpdated: "2023-06-14",
    progress: 40,
  },
  {
    id: "grow-2",
    name: "Blue Dream",
    stage: "seedling",
    startDate: "2023-06-01",
    daysActive: 14,
    plantCount: 3,
    temperature: 22.8,
    humidity: 70,
    lastUpdated: "2023-06-14",
    progress: 15,
  },
  {
    id: "grow-3",
    name: "White Widow",
    stage: "flowering",
    startDate: "2023-03-15",
    daysActive: 92,
    plantCount: 2,
    temperature: 24.2,
    humidity: 55,
    lastUpdated: "2023-06-14",
    progress: 75,
  },
];

const tasks = [
  {
    id: "task-1",
    title: "Water Northern Lights plants",
    dueDate: "2023-06-15",
    priority: "high",
    isCompleted: false,
    type: "water",
    relatedTo: {
      type: "grow" as const,
      name: "Northern Lights",
      id: "grow-1",
    },
  },
  {
    id: "task-2",
    title: "Mix nutrient solution",
    description: "Prepare feeding solution for Blue Dream",
    dueDate: "2023-06-16",
    priority: "medium",
    isCompleted: false,
    type: "feed",
    relatedTo: {
      type: "grow" as const,
      name: "Blue Dream",
      id: "grow-2",
    },
  },
  {
    id: "task-3",
    title: "Trim White Widow plants",
    dueDate: "2023-06-14",
    priority: "medium",
    isCompleted: true,
    type: "trim",
    relatedTo: {
      type: "grow" as const,
      name: "White Widow",
      id: "grow-3",
    },
  },
  {
    id: "task-4",
    title: "Check pH levels",
    dueDate: "2023-06-18",
    priority: "low",
    isCompleted: false,
    type: "other",
  },
];

// Sample chart data
const chartData = [
  {
    date: "2023-06-09",
    temperature: 23.1,
    humidity: 68,
    light: 75,
    ph: 6.2,
    growth: 5.1,
  },
  {
    date: "2023-06-10",
    temperature: 23.5,
    humidity: 65,
    light: 78,
    ph: 6.3,
    growth: 5.4,
  },
  {
    date: "2023-06-11",
    temperature: 24.2,
    humidity: 61,
    light: 80,
    ph: 6.4,
    growth: 5.9,
  },
  {
    date: "2023-06-12",
    temperature: 23.8,
    humidity: 63,
    light: 75,
    ph: 6.3,
    growth: 6.4,
  },
  {
    date: "2023-06-13",
    temperature: 22.9,
    humidity: 67,
    light: 72,
    ph: 6.2,
    growth: 6.9,
  },
  {
    date: "2023-06-14",
    temperature: 23.2,
    humidity: 65,
    light: 76,
    ph: 6.3,
    growth: 7.5,
  },
  {
    date: "2023-06-15",
    temperature: 23.5,
    humidity: 64,
    light: 77,
    ph: 6.4,
    growth: 8.0,
  },
];

const Dashboard = () => {
  const [taskList, setTaskList] = useState(tasks);
  
  const handleToggleTask = (id: string, completed: boolean) => {
    setTaskList(
      taskList.map((task) =>
        task.id === id ? { ...task, isCompleted: completed } : task
      )
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your grows and tasks.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Active Grows"
          value={grows.length}
          description="3 of 3 grows used"
          icon={<Sprout className="h-5 w-5 text-grow-600" />}
          change={{
            value: 33,
            trend: "up",
            text: "vs last month",
          }}
          className="animate-fade-in"
        />
        <StatsCard
          title="Total Plants"
          value={grows.reduce((acc, grow) => acc + grow.plantCount, 0)}
          description="Across all grows"
          icon={<Leaf className="h-5 w-5 text-grow-600" />}
          change={{
            value: 12,
            trend: "up",
            text: "vs last month",
          }}
          className="animate-fade-in"
        />
        <StatsCard
          title="Avg. Temperature"
          value={`${(
            grows.reduce((acc, grow) => acc + grow.temperature, 0) / grows.length
          ).toFixed(1)}°C`}
          description="Last 24 hours"
          icon={<Thermometer className="h-5 w-5 text-grow-600" />}
          change={{
            value: 1.2,
            trend: "up",
            text: "vs yesterday",
          }}
          className="animate-fade-in"
        />
        <StatsCard
          title="Active Tasks"
          value={taskList.filter((task) => !task.isCompleted).length}
          description={`${taskList.filter((task) => task.isCompleted).length} completed`}
          icon={<CheckSquare className="h-5 w-5 text-grow-600" />}
          change={{
            value: 25,
            trend: "down",
            text: "vs last week",
          }}
          className="animate-fade-in"
        />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Your Grows</CardTitle>
              <CardDescription>
                Manage and monitor your active grows
              </CardDescription>
            </div>
            <Button asChild>
              <Link to="/grows/new">
                <Plus className="mr-2 h-4 w-4" />
                New Grow
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pb-1">
            <div className="space-y-4">
              {grows.map((grow) => (
                <GrowCard
                  key={grow.id}
                  id={grow.id}
                  name={grow.name}
                  stage={grow.stage as any}
                  startDate={grow.startDate}
                  daysActive={grow.daysActive}
                  plantCount={grow.plantCount}
                  temperature={grow.temperature}
                  humidity={grow.humidity}
                  lastUpdated={grow.lastUpdated}
                  progress={grow.progress}
                />
              ))}
              
              {grows.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Sprout className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No grows yet</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mb-4">
                    Start tracking your plants by creating your first grow
                  </p>
                  <Button asChild>
                    <Link to="/grows/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Grow
                    </Link>
                  </Button>
                </div>
              )}
              
              {grows.length > 0 && (
                <div className="pt-2 pb-4">
                  <Button variant="ghost" asChild className="w-full">
                    <Link to="/grows">View All Grows</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                Your upcoming and recent tasks
              </CardDescription>
            </div>
            <Button asChild>
              <Link to="/tasks/new">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {taskList
                .sort((a, b) => {
                  // Sort by completion status first
                  if (a.isCompleted !== b.isCompleted) {
                    return a.isCompleted ? 1 : -1;
                  }
                  
                  // Then sort by due date
                  return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                })
                .slice(0, 4)
                .map((task) => (
                  <TaskItem
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    dueDate={task.dueDate}
                    priority={task.priority as any}
                    isCompleted={task.isCompleted}
                    type={task.type as any}
                    relatedTo={task.relatedTo}
                    onToggle={handleToggleTask}
                  />
                ))}
              
              {taskList.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No tasks yet</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mb-4">
                    Stay organized by creating tasks for your grows
                  </p>
                  <Button asChild>
                    <Link to="/tasks/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Task
                    </Link>
                  </Button>
                </div>
              )}
              
              {taskList.length > 0 && (
                <div className="pt-2">
                  <Button variant="ghost" asChild className="w-full">
                    <Link to="/tasks">View All Tasks</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6 animate-fade-in">
        <AnalyticsChart 
          title="Grow Analytics" 
          data={chartData} 
        />
      </div>
      
      <div className="animate-fade-in">
        <Card className="bg-grow-50 border-grow-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <div className="flex-shrink-0">
                <Activity className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-semibold mb-1">Upgrade to Pro</h3>
                <p className="text-muted-foreground">
                  Get access to advanced features, more grows, and detailed analytics
                </p>
              </div>
              <Button className="px-8" size="lg">
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
