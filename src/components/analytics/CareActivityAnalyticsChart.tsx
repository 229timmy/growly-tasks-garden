import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface CareActivityStats {
  wateringCount: number;
  feedingCount: number;
  totalActivities: number;
  wateringEffectiveness: number;
  feedingEffectiveness: number;
  wateringSchedule: {
    date: string;
    count: number;
    effectiveness: number;
  }[];
  feedingSchedule: {
    date: string;
    count: number;
    effectiveness: number;
  }[];
}

interface CareActivityAnalyticsChartProps {
  data?: CareActivityStats;
  className?: string;
}

export function CareActivityAnalyticsChart({ data, className }: CareActivityAnalyticsChartProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('watering');

  if (!data) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-10">
          <p className="text-muted-foreground">No care activity data available</p>
        </CardContent>
      </Card>
    );
  }

  const renderWateringChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data.wateringSchedule}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => format(new Date(value), 'MMM d')}
        />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip
          labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
        />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="count"
          name="Watering Count"
          fill="#82ca9d"
          barSize={20}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="effectiveness"
          name="Effectiveness"
          stroke="#8884d8"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const renderFeedingChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data.feedingSchedule}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => format(new Date(value), 'MMM d')}
        />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip
          labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
        />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="count"
          name="Feeding Count"
          fill="#ffc658"
          barSize={20}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="effectiveness"
          name="Effectiveness"
          stroke="#ff7300"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Care Activity Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overall Effectiveness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium">Watering Effectiveness</p>
                <p className="text-2xl font-bold">{data.wateringEffectiveness.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">Feeding Effectiveness</p>
                <p className="text-2xl font-bold">{data.feedingEffectiveness.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium">Total Watering Activities</p>
                <p className="text-2xl font-bold">{data.wateringCount}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Feeding Activities</p>
                <p className="text-2xl font-bold">{data.feedingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="watering">Watering</TabsTrigger>
              <TabsTrigger value="feeding">Feeding</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="watering">
                {renderWateringChart()}
              </TabsContent>
              <TabsContent value="feeding">
                {renderFeedingChart()}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 