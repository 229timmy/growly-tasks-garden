import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlantsService } from '@/lib/api/plants';
import { GrowsService } from '@/lib/api/grows';
import { Plant, PlantPhoto } from '@/types/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QueryErrorBoundary } from '@/components/ui/query-error-boundary';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { toast } from 'sonner';
import { 
  Loader2, 
  ArrowLeft, 
  Calendar, 
  Ruler, 
  Droplets, 
  Trash2, 
  Edit, 
  Upload,
  X,
  Camera
} from 'lucide-react';

const plantsService = new PlantsService();
const growsService = new GrowsService();

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  if (!id) {
    navigate('/plants');
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/plants')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Plants</span>
        </Button>
      </div>
      
      <QueryErrorBoundary>
        <PlantDetailContent 
          plantId={id} 
          onDelete={() => setDeleteDialogOpen(true)}
        />
      </QueryErrorBoundary>
      
      <DeletePlantDialog 
        plantId={id}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={() => navigate('/plants')}
      />
    </div>
  );
}

function PlantDetailContent({ 
  plantId, 
  onDelete 
}: { 
  plantId: string;
  onDelete: () => void;
}) {
  const navigate = useNavigate();
  const { data: plant, isLoading } = useQuery({
    queryKey: ['plant', plantId],
    queryFn: () => plantsService.getPlant(plantId),
  });
  
  const { data: grow } = useQuery({
    queryKey: ['grow', plant?.grow_id],
    queryFn: () => growsService.getGrow(plant!.grow_id),
    enabled: !!plant?.grow_id,
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!plant) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Plant not found</p>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate plant age in days
  const calculateAge = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{plant.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground">
              {plant.strain || 'Unknown Strain'}
            </span>
            <span className="text-muted-foreground">•</span>
            <Link 
              to={`/grows/${plant.grow_id}`}
              className="text-primary hover:underline"
            >
              {grow?.name || 'Loading grow...'}
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate(`/plants/${plantId}/edit`)}
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <Button 
            variant="destructive" 
            className="flex items-center gap-2"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Plant Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Age</span>
              </div>
              <span className="font-medium">{calculateAge(plant.created_at)} days</span>
            </div>
            
            {plant.height && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Height</span>
                </div>
                <span className="font-medium">{plant.height} cm</span>
              </div>
            )}
            
            {plant.last_watered && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Last Watered</span>
                </div>
                <span className="font-medium">{formatDate(plant.last_watered)}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Photos</span>
              </div>
              <span className="font-medium">{plant.photo_count || 0}</span>
            </div>
            
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">
                {plant.notes || 'No notes added yet.'}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryErrorBoundary>
              <PlantPhotos plantId={plantId} />
            </QueryErrorBoundary>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PlantPhotos({ plantId }: { plantId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  const { data: photos, isLoading } = useQuery({
    queryKey: ['plant-photos', plantId],
    queryFn: () => plantsService.getPlantPhotos(plantId),
  });
  
  const uploadMutation = useMutation({
    mutationFn: (file: File) => plantsService.uploadPlantPhoto(plantId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plant-photos', plantId] });
      queryClient.invalidateQueries({ queryKey: ['plant', plantId] });
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.invalidateQueries({ queryKey: ['grows'] });
      toast.success('Photo uploaded successfully');
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error('Failed to upload photo');
      setIsUploading(false);
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => plantsService.deletePlantPhoto(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plant-photos', plantId] });
      queryClient.invalidateQueries({ queryKey: ['plant', plantId] });
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.invalidateQueries({ queryKey: ['grows'] });
      toast.success('Photo deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete photo');
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    uploadMutation.mutate(file);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {photos && photos.length > 0 
            ? `${photos.length} photo${photos.length === 1 ? '' : 's'}`
            : 'No photos yet'}
        </p>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <Button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
          </Button>
        </div>
      </div>
      
      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.url}
                alt="Plant photo"
                className="w-full h-40 object-cover rounded-md"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteMutation.mutate(photo.id)}
                disabled={deleteMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-muted rounded-md">
          <Camera className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No photos yet</p>
          <Button
            variant="outline"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="mt-2"
          >
            Upload your first photo
          </Button>
        </div>
      )}
    </div>
  );
}

function DeletePlantDialog({ 
  plantId, 
  open, 
  onOpenChange,
  onDeleted
}: { 
  plantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: () => plantsService.deletePlant(plantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.invalidateQueries({ queryKey: ['grows'] });
      toast.success('Plant deleted successfully');
      onDeleted();
    },
    onError: (error) => {
      toast.error('Failed to delete plant');
    },
  });
  
  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };
  
  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Plant"
      description="Are you sure you want to delete this plant? This action cannot be undone and all associated photos will be permanently deleted."
      onConfirm={handleConfirmDelete}
    />
  );
} 