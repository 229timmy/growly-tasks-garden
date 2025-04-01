import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TasksService } from "@/lib/api/tasks";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const tasksService = new TasksService();

export default function NewTask() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: (data: any) => tasksService.addTask(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Task created successfully");
      navigate("/app/tasks");
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task. Please try again.");
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Task</h1>
        <p className="text-muted-foreground">
          Add a new task to track your grow activities
        </p>
      </div>
      
      <Card className="p-6">
        <TaskForm
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data);
          }}
          isSubmitting={createMutation.isPending}
        />
      </Card>
    </div>
  );
} 