import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlantsService } from '@/lib/api/plants';
import { CreatePlantDialog } from '@/components/plants/CreatePlantDialog';

const plantsService = new PlantsService();

export default function EditPlant() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [growId, setGrowId] = useState<string>('');
  
  // Fetch the plant to get its grow_id
  const { data: plant, isLoading } = useQuery({
    queryKey: ['plants', id],
    queryFn: () => plantsService.getPlant(id as string),
    enabled: !!id
  });

  // Set the growId when plant data is loaded
  useEffect(() => {
    if (plant) {
      setGrowId(plant.grow_id);
    }
  }, [plant]);

  // If loading is done and we don't have a plant, redirect to plants page
  useEffect(() => {
    if (!isLoading && !plant) {
      navigate('/app/plants');
    }
  }, [isLoading, plant, navigate]);

  if (isLoading || !growId) {
    return <div>Loading...</div>;
  }

  return (
    <CreatePlantDialog
      open={true}
      onOpenChange={(open) => {
        if (!open) navigate(`/app/plants/${id}`);
      }}
      growId={growId}
      plantId={id}
      isEditing={true}
    />
  );
} 