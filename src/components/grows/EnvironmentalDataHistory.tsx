import { useState } from 'react';
import { format } from 'date-fns';
import { Thermometer, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { EnvironmentalData } from '@/lib/api/environmental';

interface EnvironmentalDataHistoryProps {
  data: EnvironmentalData[];
  targetTemp: {
    low: number;
    high: number;
  };
  targetHumidity: {
    low: number;
    high: number;
  };
  className?: string;
}

export function EnvironmentalDataHistory({
  data,
  targetTemp,
  targetHumidity,
  className,
}: EnvironmentalDataHistoryProps) {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const totalPages = Math.ceil(data.length / pageSize);
  
  // Sort data by timestamp in descending order (newest first)
  const sortedData = [...data].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  const paginatedData = sortedData.slice(page * pageSize, (page + 1) * pageSize);
  
  const getTemperatureStatus = (temp: number) => {
    if (temp < targetTemp.low) return 'cold';
    if (temp > targetTemp.high) return 'hot';
    return 'optimal';
  };
  
  const getHumidityStatus = (humidity: number) => {
    if (humidity < targetHumidity.low) return 'dry';
    if (humidity > targetHumidity.high) return 'humid';
    return 'optimal';
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'cold':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Low</Badge>;
      case 'hot':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">High</Badge>;
      case 'dry':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low</Badge>;
      case 'humid':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">High</Badge>;
      case 'optimal':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Optimal</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Environmental Data History</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No historical data available
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Thermometer className="h-4 w-4" />
                      Temperature
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Droplets className="h-4 w-4" />
                      Humidity
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>{item.temperature}°C</TableCell>
                    <TableCell>
                      {getStatusBadge(getTemperatureStatus(item.temperature))}
                    </TableCell>
                    <TableCell>{item.humidity}%</TableCell>
                    <TableCell>
                      {getStatusBadge(getHumidityStatus(item.humidity))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, data.length)} of {data.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 