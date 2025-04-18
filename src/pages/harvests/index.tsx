import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Search, Filter, Loader2, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HarvestRecordCard } from '@/components/harvest/HarvestRecordCard';
import { HarvestRecordDialog } from '@/components/harvest/HarvestRecordDialog';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { HarvestRecordsService } from '@/lib/api/harvest-records';
import { GrowsService } from '@/lib/api/grows';
import type { HarvestRecord } from '@/types/common';
import { exportToCSV, getExportFilename } from '@/lib/utils';

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

  // Handle export of harvest records
  const handleExport = () => {
    if (!harvestRecords?.length) return;

    try {
      const exportData = harvestRecords.map(record => ({
        grow_name: growNameMap[record.grow_id] || 'Unknown Grow',
        harvest_date: new Date(record.harvest_date).toLocaleDateString(),
        total_yield_grams: record.total_yield_grams || '',
        yield_per_plant: record.yield_per_plant || '',
        thc_percentage: record.thc_percentage || '',
        cbd_percentage: record.cbd_percentage || '',
        grow_duration_days: record.grow_duration_days || '',
        cure_time_days: record.cure_time_days || '',
        bud_density_rating: record.bud_density_rating || '',
        aroma_intensity_rating: record.aroma_intensity_rating || '',
        aroma_profile: record.aroma_profile ? record.aroma_profile.join(', ') : '',
        primary_color: record.primary_color || '',
        secondary_color: record.secondary_color || '',
        trichome_coverage_rating: record.trichome_coverage_rating || '',
        overall_quality_rating: record.overall_quality_rating || '',
        flavor_notes: record.flavor_notes || '',
        effect_notes: record.effect_notes || '',
        special_characteristics: record.special_characteristics || '',
        improvement_notes: record.improvement_notes || ''
      }));

      exportToCSV(exportData, getExportFilename('harvest_records'));
      toast.success('Harvest records exported successfully');
    } catch (error) {
      console.error('Error exporting harvest records:', error);
      toast.error('Failed to export harvest records');
    }
  };

  const isLoading = isLoadingRecords || isLoadingGrows;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Harvest Records</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!harvestRecords?.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Records
          </Button>
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