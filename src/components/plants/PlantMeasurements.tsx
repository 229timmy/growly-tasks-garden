import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlantMeasurementsService } from '@/lib/api/plant-measurements';
import { PlantsService } from '@/lib/api/plants';
import { PlantMeasurement } from '@/types/common';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus } from 'lucide-react';
import { PlantMeasurementForm } from './PlantMeasurementForm';
import { NoPlantState } from './NoPlantState';

interface PlantMeasurementsProps {
  plantId: string;
}

export function PlantMeasurements({ plantId }: PlantMeasurementsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const measurementsService = new PlantMeasurementsService();
  const plantsService = new PlantsService();

  const { data: measurements, isLoading: measurementsLoading } = useQuery({
    queryKey: ['plant-measurements', plantId],
    queryFn: () => measurementsService.listMeasurements(plantId),
  });

  const { data: plant } = useQuery({
    queryKey: ['plant', plantId],
    queryFn: () => plantsService.getPlant(plantId),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['plant-measurements-stats', plantId],
    queryFn: () => measurementsService.getMeasurementStats(plantId),
  });

  if (measurementsLoading || statsLoading) {
    return <div>Loading measurements...</div>;
  }

  if (!measurements || measurements.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Plant Measurements</h3>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Measurement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Record Plant Measurement</DialogTitle>
                <DialogDescription>
                  Record measurements such as height, water amount, and nutrients for your plant.
                </DialogDescription>
              </DialogHeader>
              <PlantMeasurementForm
                plantId={plantId}
                growId={plant?.grow_id || ''}
                onSuccess={() => setShowAddForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="rounded-md border border-dashed p-6 text-center">
          <h3 className="text-lg font-medium">No measurements recorded</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Record your first measurement to start tracking your plant's growth.
          </p>
        </div>
      </div>
    );
  }

  const heightData = measurements
    ?.filter((m) => m.height != null)
    .map((m) => ({
      date: format(new Date(m.measured_at), 'MMM d'),
      height: m.height,
    }))
    .reverse();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Plant Measurements</h3>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Measurement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record Plant Measurement</DialogTitle>
              <DialogDescription>
                Record measurements such as height, water amount, and nutrients for your plant.
              </DialogDescription>
            </DialogHeader>
            <PlantMeasurementForm
              plantId={plantId}
              growId={plant?.grow_id || ''}
              onSuccess={() => setShowAddForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Measurements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMeasurements || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Height</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageHeight ? `${stats.averageHeight.toFixed(1)} cm` : 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.heightGrowthRate
                ? `${stats.heightGrowthRate.toFixed(1)} cm/day`
                : 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageHealthScore
                ? `${stats.averageHealthScore.toFixed(1)}/10`
                : 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Leaf Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageLeafCount
                ? Math.round(stats.averageLeafCount)
                : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {heightData && heightData.length > 0 && (
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Growth Chart</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={heightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis unit=" cm" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="height"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Measurement History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Height</TableHead>
                <TableHead>Health Score</TableHead>
                <TableHead>Leaf Count</TableHead>
                <TableHead>Growth Rate</TableHead>
                <TableHead>Water</TableHead>
                <TableHead>Nutrients</TableHead>
                <TableHead>pH</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {measurements?.map((measurement) => (
                <TableRow key={measurement.id}>
                  <TableCell>
                    {format(new Date(measurement.measured_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {measurement.height ? `${measurement.height} cm` : '-'}
                  </TableCell>
                  <TableCell>
                    {measurement.health_score ? `${measurement.health_score}/10` : '-'}
                  </TableCell>
                  <TableCell>
                    {measurement.leaf_count || '-'}
                  </TableCell>
                  <TableCell>
                    {measurement.growth_rate ? `${measurement.growth_rate.toFixed(1)} cm/day` : '-'}
                  </TableCell>
                  <TableCell>
                    {measurement.water_amount ? `${measurement.water_amount} ml` : '-'}
                  </TableCell>
                  <TableCell>
                    {measurement.nutrients_amount
                      ? `${measurement.nutrients_amount} ml ${
                          measurement.nutrients_type
                            ? `(${measurement.nutrients_type})`
                            : ''
                        }`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {measurement.ph_level ? measurement.ph_level.toFixed(1) : '-'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {measurement.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 