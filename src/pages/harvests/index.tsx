import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HarvestRecordCard } from '@/components/harvest/HarvestRecordCard';
import { HarvestRecordDialog } from '@/components/harvest/HarvestRecordDialog';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { HarvestRecordsService } from '@/lib/api/harvest-records';
import { GrowsService } from '@/lib/api/grows';
import type { HarvestRecord } from '@/types/common';

const harvestRecordsService = new HarvestRecordsService();
const growsService = new GrowsService();

export default function Harvests() {
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch harvest records
  const { data: harvestRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ['harvest-records'],
    queryFn: () => harvestRecordsService.listHarvestRecords(),
  });

  // Fetch grows to get names
  const { data: grows, isLoading: isLoadingGrows } = useQuery({
    queryKey: ['grows'],
    queryFn: () => growsService.listGrows(),
  });

  // Create a map of grow IDs to grow names
  const growNameMap = grows?.reduce((acc, grow) => {
    acc[grow.id] = grow.name;
    return acc;
  }, {} as Record<string, string>) || {};

  // Filter harvest records based on search
  const filteredRecords = harvestRecords?.filter((record) => {
    const growName = growNameMap[record.grow_id] || '';
    return growName.toLowerCase().includes(search.toLowerCase());
  });

  // Handle record deletion
  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;

    try {
      await harvestRecordsService.deleteHarvestRecord(recordToDelete);
      queryClient.invalidateQueries({ queryKey: ['harvest-records'] });
      toast.success('Harvest record deleted successfully');
    } catch (error) {
      console.error('Error deleting harvest record:', error);
      toast.error('Failed to delete harvest record');
    } finally {
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  // Open delete dialog for a record
  const openDeleteDialog = (recordId: string) => {
    setRecordToDelete(recordId);
    setDeleteDialogOpen(true);
  };

  const isLoading = isLoadingRecords || isLoadingGrows;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Harvest Records</h1>
        <HarvestRecordDialog
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['harvest-records'] })}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Harvest Record
            </Button>
          }
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search harvest records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !harvestRecords?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>No Harvest Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You haven't recorded any harvests yet. Record your first harvest to start tracking your results.
            </p>
            <div className="mt-4">
              <HarvestRecordDialog
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['harvest-records'] })}
                trigger={<Button>Record First Harvest</Button>}
              />
            </div>
          </CardContent>
        </Card>
      ) : filteredRecords?.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Matching Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No harvest records match your search criteria. Try adjusting your search.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecords?.map((record) => (
            <HarvestRecordCard
              key={record.id}
              record={record}
              growName={growNameMap[record.grow_id] || 'Unknown Grow'}
              onEdit={() => queryClient.invalidateQueries({ queryKey: ['harvest-records'] })}
              onDelete={() => openDeleteDialog(record.id)}
            />
          ))}
        </div>
      )}

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Harvest Record"
        description="Are you sure you want to delete this harvest record? This action cannot be undone."
        onConfirm={handleDeleteRecord}
      />
    </div>
  );
} 