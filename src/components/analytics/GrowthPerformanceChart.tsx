import { useState } from 'react';
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
import { cn } from '@/lib/utils';
import type { GrowthData } from '@/lib/api/growth-analytics';

interface GrowthPerformanceChartProps {
  data: GrowthData[];
  className?: string;
  minimal?: boolean;
}

export function GrowthPerformanceChart({ data, className, minimal = false }: GrowthPerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Filter data based on time range
  const getFilteredData = () => {
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
        return data;
    }

    return data.filter((item) => new Date(item.date) >= filterDate);
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

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Growth Performance</CardTitle>
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
      </CardHeader>
      <CardContent>
        {minimal ? (
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
                    stroke="#8b5cf6"
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
                    domain={[0, 5]}
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
                    stroke="#0ea5e9"
                    name="Health Score"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="leafCount"
                    stroke="#f59e0b"
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