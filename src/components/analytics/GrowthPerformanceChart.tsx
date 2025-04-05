import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { GrowthData } from '@/lib/api/growth-analytics';

interface GrowthPerformanceChartProps {
  data: { [growId: string]: GrowthData[] };
  className?: string;
  minimal?: boolean;
}

export function GrowthPerformanceChart({ data, className, minimal = false }: GrowthPerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedGrowId, setSelectedGrowId] = useState<string>('');
  const [validGrowIds, setValidGrowIds] = useState<string[]>([]);
  const [dataIsValid, setDataIsValid] = useState(false);

  // Validate data and set initial grow
  useEffect(() => {
    // Log data for debugging
    console.log('Growth chart data:', data);
    
    // Check if data is an object
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      console.error('Invalid growth data format:', data);
      setDataIsValid(false);
      return;
    }
    
    // Get grow IDs from data
    const growIds = Object.keys(data);
    console.log('Available grow IDs:', growIds);
    
    setValidGrowIds(growIds);
    setDataIsValid(growIds.length > 0);
    
    // Select the first grow with data
    if (growIds.length > 0) {
      const firstGrowWithData = growIds.find(id => Array.isArray(data[id]) && data[id].length > 0);
      setSelectedGrowId(firstGrowWithData || growIds[0]);
    }
  }, [data]);

  // Get array of measurements for selected grow, with safety checks
  const getSelectedGrowData = () => {
    if (!dataIsValid || !selectedGrowId || !data[selectedGrowId]) {
      return [];
    }
    
    const growData = data[selectedGrowId];
    
    // Make sure we have a valid array
    if (!Array.isArray(growData)) {
      console.error('Selected grow data is not an array:', growData);
      return [];
    }
    
    return growData;
  };

  // Filter data based on time range
  const getFilteredData = () => {
    const selectedGrowData = getSelectedGrowData();
    
    if (selectedGrowData.length === 0) {
      return [];
    }
    
    const now = new Date();
    let filterDate = new Date();

    switch (timeRange) {
      case '7d':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        filterDate.setDate(now.getDate() - 90);
        break;
      default:
        return selectedGrowData;
    }

    return selectedGrowData.filter((item) => {
      if (!item.date) return false;
      return new Date(item.date) >= filterDate;
    });
  };

  const filteredData = getFilteredData();

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-3 rounded-lg shadow-md text-sm">
          <p className="font-medium mb-1">
            {new Date(label).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>
                {entry.name}: {entry.value.toFixed(1)}
                {entry.name === 'Height' ? 'cm' : entry.name === 'Growth Rate' ? 'cm/day' : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // If there's no data at all, display a message
  if (!dataIsValid) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle>Growth Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No growth data available - Please ensure plants are assigned to a grow and measurements are added.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Growth Performance</CardTitle>
          <div className="flex items-center gap-4">
            {!minimal && validGrowIds.length > 1 && (
              <Select value={selectedGrowId} onValueChange={setSelectedGrowId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select grow" />
                </SelectTrigger>
                <SelectContent>
                  {validGrowIds.map((growId) => {
                    const growData = data[growId] || [];
                    const growName = growData.length > 0 ? growData[0]?.growName : 'Unnamed Grow';
                    return (
                      <SelectItem key={growId} value={growId}>
                        {growName || `Grow ${growId}`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
            {!minimal && (
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={cn(
                    'px-2 py-1 text-sm rounded-md',
                    timeRange === '7d'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  7D
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={cn(
                    'px-2 py-1 text-sm rounded-md',
                    timeRange === '30d'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  30D
                </button>
                <button
                  onClick={() => setTimeRange('90d')}
                  className={cn(
                    'px-2 py-1 text-sm rounded-md',
                    timeRange === '90d'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  90D
                </button>
                <button
                  onClick={() => setTimeRange('all')}
                  className={cn(
                    'px-2 py-1 text-sm rounded-md',
                    timeRange === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  All
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No growth data available for the selected period
          </div>
        ) : minimal ? (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(tick) => {
                    const date = new Date(tick);
                    return date.toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'short',
                    });
                  }}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                  unit="cm"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="height"
                  stroke="#22c55e"
                  name="Height"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Tabs defaultValue="growth" className="space-y-4">
            <TabsList>
              <TabsTrigger value="growth">Growth Metrics</TabsTrigger>
              <TabsTrigger value="health">Plant Health</TabsTrigger>
            </TabsList>

            <TabsContent value="growth" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filteredData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(tick) => {
                      const date = new Date(tick);
                      return date.toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                      });
                    }}
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    unit="cm"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    unit="cm/day"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="height"
                    stroke="#22c55e"
                    name="Height"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="growthRate"
                    stroke="#3b82f6"
                    name="Growth Rate"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="health" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filteredData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(tick) => {
                      const date = new Date(tick);
                      return date.toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                      });
                    }}
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="healthScore"
                    stroke="#22c55e"
                    name="Health Score"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="leafCount"
                    stroke="#3b82f6"
                    name="Leaf Count"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
} 