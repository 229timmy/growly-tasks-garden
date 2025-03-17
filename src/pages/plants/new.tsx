import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreatePlantDialog } from '@/components/plants/CreatePlantDialog';

export default function NewPlant() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const growId = searchParams.get('growId');

  if (!growId) {
    navigate('/app/plants');
    return null;
  }

  return (
    <CreatePlantDialog
      open={true}
      onOpenChange={(open) => {
        if (!open) navigate('/app/plants');
      }}
      growId={growId}
    />
  );
} 