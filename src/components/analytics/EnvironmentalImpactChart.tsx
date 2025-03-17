import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart
} from 'recharts';
import { format, subDays } from 'date-fns';
import type { EnvironmentalData, EnvironmentalStats, EnvironmentalImpact } from '@/lib/api/environmental-analytics';
import { cn } from '@/lib/utils';

interface EnvironmentalImpactChartProps {
  data: EnvironmentalData[];
  stats: EnvironmentalStats;
  impact: EnvironmentalImpact;
  className?: string;
  minimal?: boolean;
}

export function EnvironmentalImpactChart({
  data,
  stats,
  impact,
  className,
  minimal = false
}: EnvironmentalImpactChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState('temperature');

  const getFilteredData = () => {
    if (timeRange === 'all') return data;
    
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = subDays(new Date(), days);
    return data.filter(d => new Date(d.date) >= cutoff);
  };

  const filteredData = getFilteredData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="text-sm font-medium">
          {format(new Date(label), 'MMM d, yyyy h:mm a')}
        </div>
        {payload.map((item: any, index: number) => (
          <div key={index} className="text-xs">
            <span style={{ color: item.color }}>{item.name}: </span>
            {item.value.toFixed(2)} {item.unit}
          </div>
        ))}
      </div>
    );
  };

  const renderTemperatureChart = () => {
    const { temperature: tempRange } = impact.optimalRanges;
    const filteredData = getFilteredData();

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), 'MMM d')}
          />
          <YAxis yAxisId="temp" domain={[10, 40]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            yAxisId="temp"
            type="monotone"
            dataKey="temperature"
            fill="rgba(255, 170, 0, 0.1)"
            stroke="none"
            name="Optimal Range"
            data={filteredData.map(d => ({
              ...d,
              temperature: [tempRange.min, tempRange.max]
            }))}
          />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temperature"
            stroke="#ff9800"
            name="Temperature (°C)"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderHumidityChart = () => {
    const { humidity: humidityRange } = impact.optimalRanges;
    const filteredData = getFilteredData();

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), 'MMM d')}
          />
          <YAxis yAxisId="humidity" domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            yAxisId="humidity"
            type="monotone"
            dataKey="humidity"
            fill="rgba(3, 169, 244, 0.1)"
            stroke="none"
            name="Optimal Range"
            data={filteredData.map(d => ({
              ...d,
              humidity: [humidityRange.min, humidityRange.max]
            }))}
          />
          <Line
            yAxisId="humidity"
            type="monotone"
            dataKey="humidity"
            stroke="#03a9f4"
            name="Humidity (%)"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderAdvancedMetricsChart = () => {
    const filteredData = getFilteredData();

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), 'MMM d')}
          />
          <YAxis yAxisId="light" domain={[0, 'auto']} />
          <YAxis yAxisId="co2" orientation="right" domain={[0, 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="light"
            type="monotone"
            dataKey="lightIntensity"
            stroke="#ffd700"
            name="Light Intensity (lux)"
            dot={false}
          />
          <Line
            yAxisId="co2"
            type="monotone"
            dataKey="co2Level"
            stroke="#4caf50"
            name="CO2 Level (ppm)"
            dot={false}
          />
          {data.some(d => d.vpd !== undefined) && (
            <Line
              yAxisId="co2"
              type="monotone"
              dataKey="vpd"
              stroke="#9c27b0"
              name="VPD (kPa)"
              dot={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Environmental Impact</CardTitle>
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
              <ComposedChart
                data={getFilteredData()}
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
                  unit="°C"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#22c55e"
                  name="Temperature"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="humidity"
                  stroke="#0ea5e9"
                  name="Humidity"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="temperature">Temperature</TabsTrigger>
              <TabsTrigger value="humidity">Humidity</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Metrics</TabsTrigger>
            </TabsList>
            <TabsContent value="temperature" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium">
                      Average Temperature
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      {stats.averageTemperature.toFixed(1)}°C
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optimal: {impact.optimalRanges.temperature.min}°C - {impact.optimalRanges.temperature.max}°C
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium">
                      Temperature Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      {(impact.correlations.temperatureGrowth * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Correlation with growth rate
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium">
                      Stress Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      {stats.stressEvents}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Temperature outside optimal range
                    </p>
                  </CardContent>
                </Card>
              </div>
              {renderTemperatureChart()}
            </TabsContent>
            <TabsContent value="humidity" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium">
                      Average Humidity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      {stats.averageHumidity.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optimal: {impact.optimalRanges.humidity.min}% - {impact.optimalRanges.humidity.max}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium">
                      Humidity Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      {(impact.correlations.humidityGrowth * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Correlation with growth rate
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium">
                      Optimal Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      {stats.optimalConditionsPercentage.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Time in optimal range
                    </p>
                  </CardContent>
                </Card>
              </div>
              {renderHumidityChart()}
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {stats.averageLightIntensity && (
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium">
                        Light Intensity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        {stats.averageLightIntensity.toFixed(0)} lux
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Impact: {impact.correlations.lightGrowth ? 
                          `${(impact.correlations.lightGrowth * 100).toFixed(1)}%` : 
                          'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {stats.averageCO2 && (
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium">
                        CO2 Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        {stats.averageCO2.toFixed(0)} ppm
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Impact: {impact.correlations.co2Growth ? 
                          `${(impact.correlations.co2Growth * 100).toFixed(1)}%` : 
                          'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {stats.averageVPD && (
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium">
                        VPD
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        {stats.averageVPD.toFixed(2)} kPa
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Impact: {impact.correlations.vpdGrowth ? 
                          `${(impact.correlations.vpdGrowth * 100).toFixed(1)}%` : 
                          'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
              {renderAdvancedMetricsChart()}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
} 