import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface HarvestData {
  date: string;
  totalYield: number;
  quality: number;
  thcPercentage?: number;
  budDensity?: number;
}

interface HarvestAnalyticsChartProps {
  data: HarvestData[];
  className?: string;
}

export function HarvestAnalyticsChart({ data, className }: HarvestAnalyticsChartProps) {
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
                {entry.name === 'Total Yield' ? 'g' : ''}
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
          <CardTitle>Harvest Analytics</CardTitle>
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
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="yield" className="space-y-4">
          <TabsList>
            <TabsTrigger value="yield">Yield</TabsTrigger>
            <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="yield" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
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
                  unit="g"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="totalYield"
                  fill="#22c55e"
                  name="Total Yield"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="quality" className="h-[300px]">
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
                <YAxis tick={{ fontSize: 12 }} tickMargin={10} domain={[0, 5]} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="quality"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name="Quality Rating"
                />
                <Line
                  type="monotone"
                  dataKey="budDensity"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name="Bud Density"
                  yAxisId="right"
                />
                <Line
                  type="monotone"
                  dataKey="thcPercentage"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name="THC %"
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 