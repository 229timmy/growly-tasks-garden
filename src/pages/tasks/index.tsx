import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { TasksService } from "@/lib/api/tasks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TaskItem } from "@/components/tasks/TaskItem";
import { Plus, Loader2, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const tasksService = new TasksService();

type FilterState = {
  completed?: boolean;
  priority?: "low" | "medium" | "high";
};

export default function Tasks() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<FilterState>({});
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => tasksService.listTasks(filters),
  });

  const { data: taskStats } = useQuery({
    queryKey: ["tasks", "stats"],
    queryFn: () => tasksService.getTaskStats(),
  });

  const clearCompletedMutation = useMutation({
    mutationFn: () => tasksService.deleteCompletedTasks(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Completed tasks cleared");
    },
    onError: (error) => {
      console.error("Failed to clear tasks:", error);
      toast.error("Failed to clear tasks. Please try again.");
    },
  });

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      await tasksService.toggleTaskCompletion(id);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(completed ? "Task completed!" : "Task uncompleted");
    } catch (error) {
      console.error("Failed to toggle task:", error);
      toast.error("Failed to update task. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your grow-related tasks
          </p>
        </div>
        <div className="flex gap-2">
          {taskStats?.completed > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear completed tasks?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all completed tasks. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => clearCompletedMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {clearCompletedMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button asChild>
            <Link to="/app/tasks/new">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total</span>
              <span className="font-medium">{taskStats?.total || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Completed</span>
              <span className="font-medium">{taskStats?.completed || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Upcoming</span>
              <span className="font-medium">{taskStats?.upcoming || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Overdue</span>
              <span className="font-medium text-destructive">
                {taskStats?.overdue || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:col-span-3">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Select
                value={filters.completed?.toString() || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    completed: value === "all" ? undefined : value === "true",
                  }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="false">Incomplete</SelectItem>
                  <SelectItem value="true">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    priority: value === "all" ? undefined : value as "low" | "medium" | "high",
                  }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : !tasks?.length ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tasks found</p>
                <Button asChild className="mt-4">
                  <Link to="/app/tasks/new">Create Task</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description || undefined}
                    dueDate={task.due_date}
                    priority={task.priority}
                    isCompleted={task.completed}
                    onToggle={handleToggleTask}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 